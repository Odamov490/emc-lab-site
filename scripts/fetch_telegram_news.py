import os
import json
from datetime import datetime
from pathlib import Path
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]
SESSION = os.environ["TG_SESSION"]
CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy")

OUT_FILE = "public/news.json"
MEDIA_DIR = Path("public/news_media")
LIMIT = 30

def fmt_date(dt):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")

def safe_text(s: str) -> str:
    return (s or "").strip()

async def download_first_photo(client: TelegramClient, msg, channel_username: str):
    """
    Returns web path like: /news_media/uztestrasmiy_7653.jpg  or None
    Handles:
      - single photo
      - album (grouped_id): downloads first media message in that group
    """
    MEDIA_DIR.mkdir(parents=True, exist_ok=True)

    # album bo'lsa: shu grouped_id bo'yicha eng birinchi media postni topamiz
    target = msg
    if getattr(msg, "grouped_id", None):
        # grouped_id bo'yicha oxirgi 20ta ichidan qidiramiz (yetarli bo'ladi)
        async for m in client.iter_messages(msg.peer_id, limit=25):
            if getattr(m, "grouped_id", None) == msg.grouped_id and (m.photo or m.document):
                target = m
                break

    if not (target.photo or target.document):
        return None

    filename = f"{channel_username}_{msg.id}.jpg"
    file_path = MEDIA_DIR / filename

    # telethon o'zi formatni topib beradi, lekin biz .jpg nom beramiz
    try:
        await client.download_media(target, file=str(file_path))
        if file_path.exists() and file_path.stat().st_size > 0:
            return f"/news_media/{filename}"
    except Exception:
        return None

    return None

async def main():
    items = []

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(channel, limit=LIMIT):
            text = safe_text(msg.message or "")
            if not text and not (msg.photo or msg.document):
                continue

            title = text.split("\n")[0][:120] if text else "Yangilik"
            photo_url = await download_first_photo(client, msg, CHANNEL)

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title or "Yangilik",
                "text": text,
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photo": photo_url
            })

    items.sort(key=lambda x: x["tg_id"], reverse=True)

    os.makedirs("public", exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {
                "ok": True,
                "updated_at": datetime.utcnow().isoformat() + "Z",
                "items": items
            },
            f,
            ensure_ascii=False,
            indent=2
        )

if __name__ == "__main__":
    import asyncio
    asyncio.run(main())
