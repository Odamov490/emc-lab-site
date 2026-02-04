import os
import json
from datetime import datetime
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]
SESSION = os.environ["TG_SESSION"]
CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy")

OUT_FILE = "public/news.json"
MEDIA_DIR = "public/news_media"
LIMIT = 30

def fmt_date(dt):
    return dt.strftime("%Y-%m-%d") if dt else None

def make_photo_url(filename: str) -> str:
    # Saytda ochilishi uchun public ichidagi yo'lni beramiz
    return f"/news_media/{filename}"

async def main():
    items = []

    os.makedirs("public", exist_ok=True)
    os.makedirs(MEDIA_DIR, exist_ok=True)

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(channel, limit=LIMIT):
            if not msg.message:
                continue

            text = msg.message.strip()
            title = text.split("\n")[0][:120] if text else "Yangilik"

            photo_path = None
            # ✅ Agar postda rasm bo'lsa, yuklab olamiz
            if msg.photo:
                filename = f"{CHANNEL}_{msg.id}.jpg"
                save_to = os.path.join(MEDIA_DIR, filename)
                try:
                    await client.download_media(msg, file=save_to)
                    # Agar yuklab olingan bo'lsa, saytdagi path:
                    if os.path.exists(save_to) and os.path.getsize(save_to) > 0:
                        photo_path = make_photo_url(filename)
                except Exception:
                    photo_path = None

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title,
                "text": text,
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photo": photo_path
            })

    # yangisi tepada tursin
    items.sort(key=lambda x: x["tg_id"], reverse=True)

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
