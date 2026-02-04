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
MEDIA_DIR = "public/news_media"   # rasm shu yerga tushadi
LIMIT = 30

def fmt_date(dt):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")

async def main():
    items = []
    os.makedirs("public", exist_ok=True)
    os.makedirs(MEDIA_DIR, exist_ok=True)

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(channel, limit=LIMIT):
            # text bo'lmasa ham rasm bo'lishi mumkin — shuning uchun o'tkazib yubormaymiz
            text = (msg.message or "").strip()

            # title: birinchi qatordan
            title = (text.split("\n")[0].strip() if text else "Yangilik")[:120]

            photo_url = None
            if msg.photo:
                # fayl nomini tg_id asosida beramiz (barqaror)
                # telethon kengaytmani o'zi topib beradi (.jpg/.png/.webp)
                filename_base = f"tg_{CHANNEL}_{msg.id}"
                saved_path = await client.download_media(
                    msg,
                    file=os.path.join(MEDIA_DIR, filename_base)
                )
                if saved_path:
                    # Windows path -> URLga moslashtiramiz
                    saved_path = saved_path.replace("\\", "/")
                    # public/... dan keyingi qismi saytga URL bo'ladi
                    # masalan: public/news_media/tg_xxx_123.jpg => /news_media/tg_xxx_123.jpg
                    if saved_path.startswith("public/"):
                        photo_url = "/" + saved_path[len("public/"):]
                    else:
                        # ehtiyot uchun
                        photo_url = "/news_media/" + os.path.basename(saved_path)

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title or "Yangilik",
                "text": text or None,
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photo": photo_url
            })

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
