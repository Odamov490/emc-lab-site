import os
import json
import asyncio
from datetime import datetime
from pathlib import Path

from telethon import TelegramClient
from telethon.sessions import StringSession


# -------- CONFIG ----------
LIMIT = int(os.environ.get("TG_LIMIT", "30"))
OUT_JSON = Path("public/news.json")
MEDIA_DIR = Path("public/news_media")  # images will be saved here
MEDIA_DIR.mkdir(parents=True, exist_ok=True)


def require_env(name: str) -> str:
    v = os.environ.get(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}. Set it in GitHub Secrets or locally.")
    return v


def iso_utc_now():
    return datetime.utcnow().isoformat() + "Z"


def fmt_date(dt):
    if not dt:
        return None
    # keep ISO date only (YYYY-MM-DD)
    return dt.strftime("%Y-%m-%d")


def safe_write_json(path: Path, data: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    tmp.replace(path)


async def download_photo(client: TelegramClient, msg, base_name: str) -> str | None:
    """
    Downloads a single photo to /public/news_media and returns web path like '/news_media/xxx.jpg'
    """
    try:
        file_path = MEDIA_DIR / f"{base_name}.jpg"
        await client.download_media(msg, file=str(file_path))
        if file_path.exists() and file_path.stat().st_size > 0:
            return f"/news_media/{file_path.name}"
    except Exception:
        pass
    return None


async def main():
    API_ID = int(require_env("TG_API_ID"))
    API_HASH = require_env("TG_API_HASH")
    SESSION = require_env("TG_SESSION")
    CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy").strip().lstrip("@")

    items = []

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        entity = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(entity, limit=LIMIT):
            # skip empty service messages
            if not (msg.message or msg.media):
                continue

            text = (msg.message or "").strip()
            title = (text.split("\n")[0].strip() if text else "").strip()
            if not title:
                title = "Yangilik"

            tg_url = f"https://t.me/{CHANNEL}/{msg.id}"

            # ---- MEDIA (single photo / album) ----
            photo = None
            photos = []

            # Album: grouped_id bor bo‘lsa, shu albomdagi barcha rasmlarni olib ketamiz
            if getattr(msg, "grouped_id", None):
                grouped_id = msg.grouped_id
                group_msgs = await client.get_messages(entity, limit=30)
                group_msgs = [m for m in group_msgs if getattr(m, "grouped_id", None) == grouped_id]

                # tartib: eskidan yangiga (galereyada chiroyli)
                group_msgs.sort(key=lambda m: m.id)

                for i, m in enumerate(group_msgs):
                    if m.photo:
                        p = await download_photo(client, m, f"{grouped_id}_{i}")
                        if p:
                            photos.append(p)

                if photos:
                    photo = photos[0]  # birinchi rasm (preview uchun)

            else:
                # oddiy bitta rasm
                if msg.photo:
                    p = await download_photo(client, msg, str(msg.id))
                    if p:
                        photo = p
                        photos = [p]

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title[:140],
                "text": text,
                "url": tg_url,
                "photo": photo,
                "photos": photos,  # ALBUM uchun massiv
            })

    # newest first
    items.sort(key=lambda x: x["tg_id"], reverse=True)

    payload = {
        "ok": True,
        "updated_at": iso_utc_now(),
        "items": items
    }

    safe_write_json(OUT_JSON, payload)
    print(f"OK: saved {len(items)} items -> {OUT_JSON}")


if __name__ == "__main__":
    asyncio.run(main())
