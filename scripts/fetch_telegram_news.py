import os
import json
from datetime import datetime
from pathlib import Path
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]
SESSION = os.environ["TG_SESSION"]
CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy").lstrip("@")

OUT_FILE = "public/news.json"
MEDIA_DIR = Path("public/news_media")
LIMIT = 30

def fmt_date(dt):
    return dt.strftime("%Y-%m-%d") if dt else None

def safe_text(s: str) -> str:
    return (s or "").strip()

async def pick_album_first_media(client: TelegramClient, msg):
    """Agar album bo'lsa (grouped_id), shu albomdagi birinchi media xabarni topadi."""
    gid = getattr(msg, "grouped_id", None)
    if not gid:
        return msg

    # Albom ichida media bo'lgan birinchi xabarni topamiz
    async for m in client.iter_messages(msg.peer_id, limit=50):
        if getattr(m, "grouped_id", None) == gid and (m.photo or m.document):
            return m
    return msg

async def download_first_photo(client: TelegramClient, msg, channel_username: str):
    """
    Telethon saqlagan fayl pathini oladi, keyin public/news_media ga ko'chiradi.
    Return: "/news_media/xxx.ext" yoki None
    """
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)

    target = await pick_album_first_media(client, msg)
    if not (target.photo or target.document):
        return None

    # Telethon o'zi ext bilan saqlasin (temp)
    tmp_dir = Path(".tmp_media")
    tmp_dir.mkdir(parents=True, exist_ok=True)

    try:
        saved_path = await client.download_media(target, file=str(tmp_dir))
        if not saved_path:
            return None

        saved_path = Path(saved_path)
        if not saved_path.exists() or saved_path.stat().st_size == 0:
            return None

        ext = saved_path.suffix.lower() or ".jpg"
        final_name = f"{channel_username}_{msg.id}{ext}"
        final_path = MEDIA_DIR / final_name

        # ko'chirish
        saved_path.replace(final_path)

        # tmp papkani tozalash (bo'sh qolsa)
        try:
            if saved_path.parent.exists():
                for p in saved_path.parent.glob("*"):
                    pass
        except:
            pass

        return f"/news_media/{final_name}"
    except Exception:
        return None

async def main():
    items = []

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(channel, limit=LIMIT):
            text = safe_text(msg.message or "")

            # faqat text bo'lmasa-yu, media bo'lsa ham olamiz
            if not text and not (msg.photo or msg.document):
                continue

            title = text.split("\n")[0][:120] if text else "Yangilik"
            photo_url = await download_first_photo(client, msg, CHANNEL)

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title,
                "text": text,
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photo": photo_url
            })

    items.sort(key=lambda x: x["tg_id"], reverse=True)

    os.makedirs("public", exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {"ok": True, "updated_at": datetime.utcnow().isoformat() + "Z", "items": items},
            f,
            ensure_ascii=False,
            indent=2
        )

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
