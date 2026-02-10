import os
import json
import asyncio
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from telethon import TelegramClient
from telethon.tl.types import Message

from openai import OpenAI

# -------- Paths --------
ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "public"
NEWS_JSON = PUBLIC / "news.json"
MEDIA_DIR = PUBLIC / "news_media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)

# Load local .env if exists (for running on Windows)
load_dotenv(Path(__file__).parent / ".env")


def require_env(name: str) -> str:
    v = os.getenv(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}. Set it or put it into scripts/.env")
    return v


TG_API_ID = int(require_env("TG_API_ID"))
TG_API_HASH = require_env("TG_API_HASH")
TG_SESSION = require_env("TG_SESSION")  # session string OR path-like name
TG_CHANNEL = require_env("TG_CHANNEL")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

client_openai = OpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")


def safe_text(s: str) -> str:
    return (s or "").strip()


def load_existing():
    if NEWS_JSON.exists():
        try:
            data = json.loads(NEWS_JSON.read_text(encoding="utf-8"))
            if isinstance(data, dict) and isinstance(data.get("items"), list):
                return data
        except Exception:
            pass
    return {"ok": True, "updated_at": now_iso(), "items": []}


def write_json(data):
    data["ok"] = True
    data["updated_at"] = now_iso()
    NEWS_JSON.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def photo_public_path(filename: str) -> str:
    # Website uses /news_media/xxx.jpg
    return f"/news_media/{filename}"


def translate_to_ru(title_uz: str, text_uz: str):
    """
    Returns (title_ru, text_ru). If no OPENAI_API_KEY -> returns empty strings.
    Uses caching by skipping if already present in existing json.
    """
    if not client_openai:
        return "", ""

    title_uz = safe_text(title_uz)
    text_uz = safe_text(text_uz)

    if not title_uz and not text_uz:
        return "", ""

    # Short system prompt: formal news style
    prompt = f"""Translate Uzbek text to Russian.
Rules:
- Keep meaning, names, numbers, dates exactly.
- Keep paragraphs and line breaks.
- Do NOT add new information.
- Output JSON with keys: title_ru, text_ru.

Uzbek title:
{title_uz}

Uzbek text:
{text_uz}
"""

    resp = client_openai.responses.create(
        model="gpt-4.1-mini",
        input=prompt,
        temperature=0.2,
    )

    # Try to parse JSON from the model output
    out = resp.output_text.strip()
    try:
        j = json.loads(out)
        return safe_text(j.get("title_ru")), safe_text(j.get("text_ru"))
    except Exception:
        # fallback: return raw text in text_ru, keep title empty
        return "", out


async def download_photo(tg_client: TelegramClient, msg: Message, filename: str) -> str:
    """
    Downloads message media to public/news_media/filename and returns public url path.
    """
    out_path = MEDIA_DIR / filename
    if out_path.exists() and out_path.stat().st_size > 0:
        return photo_public_path(filename)

    await tg_client.download_media(msg, file=str(out_path))
    if out_path.exists() and out_path.stat().st_size > 0:
        return photo_public_path(filename)
    return ""


async def main():
    existing = load_existing()
    items = existing.get("items", [])

    # Build quick index: tg_id -> item
    by_tg = {}
    for it in items:
        tg_id = it.get("tg_id")
        if tg_id is not None:
            by_tg[str(tg_id)] = it

    # Telethon client
    tg_client = TelegramClient(TG_SESSION, TG_API_ID, TG_API_HASH)
    await tg_client.start()

    # Fetch latest messages
    # limit you can tune
    msgs = await tg_client.get_messages(TG_CHANNEL, limit=50)

    # Group albums by grouped_id
    groups = {}
    singles = []

    for m in msgs:
        if not m:
            continue
        if getattr(m, "grouped_id", None):
            groups.setdefault(m.grouped_id, []).append(m)
        else:
            singles.append([m])

    # Each album group becomes one "batch"
    batches = list(groups.values()) + singles

    new_items = []

    for batch in batches:
        # Sort by message id asc for stable ordering
        batch = sorted(batch, key=lambda x: x.id)

        # Choose main message for text/title/date/url
        main_msg = None
        for m in batch:
            if safe_text(getattr(m, "message", "")):
                main_msg = m
                break
        if main_msg is None:
            main_msg = batch[0]

        tg_id = int(main_msg.id)
        tg_url = f"https://t.me/{TG_CHANNEL}/{tg_id}"

        dt = getattr(main_msg, "date", None)
        if dt:
            date_str = dt.date().isoformat()
        else:
            date_str = ""

        full_text = safe_text(getattr(main_msg, "message", ""))
        # Title = first non-empty line, fallback "Yangilik"
        title = "Yangilik"
        if full_text:
            first_line = full_text.splitlines()[0].strip()
            if first_line:
                title = first_line
        # Keep full text as "text"
        text = full_text

        # Photos list
        photos = []
        for m in batch:
            if m.photo or m.document:
                # Use tg message id as file id for uniqueness
                filename = f"{m.id}.jpg"
                p = await download_photo(tg_client, m, filename)
                if p:
                    photos.append(p)

        # If no media, photos stays empty
        item = {
            "tg_id": tg_id,
            "date": date_str,
            "title": title,
            "text": text,
            "url": tg_url,
            "photos": photos,
        }

        # Backward compatibility: if exactly 1 photo, also keep "photo"
        if len(photos) == 1:
            item["photo"] = photos[0]

        # --- Translation caching ---
        old = by_tg.get(str(tg_id))
        if old:
            # keep old translations if already exist
            if old.get("title_ru"):
                item["title_ru"] = old.get("title_ru")
            if old.get("text_ru"):
                item["text_ru"] = old.get("text_ru")

        # If not translated yet and we have OpenAI key -> translate
        if client_openai:
            if not item.get("title_ru") and not item.get("text_ru"):
                t_ru, x_ru = translate_to_ru(item["title"], item["text"])
                if t_ru:
                    item["title_ru"] = t_ru
                if x_ru:
                    item["text_ru"] = x_ru

        new_items.append(item)

    # Sort by date desc then tg_id desc
    def sort_key(it):
        return (it.get("date", ""), int(it.get("tg_id", 0)))

    new_items = sorted(new_items, key=sort_key, reverse=True)

    data = {
        "ok": True,
        "updated_at": now_iso(),
        "items": new_items,
    }

    write_json(data)
    await tg_client.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
