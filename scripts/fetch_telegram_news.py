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
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")

def safe_ext(msg):
    # msg.file.ext ko‘pincha ".jpg", ".png" bo‘ladi
    try:
        ext = msg.file.ext
        if ext and ext.startswith(".") and len(ext) <= 6:
            return ext
    except Exception:
        pass
    return ".jpg"

async def main():
    items = []
    seen_group = set()

    os.makedirs("public", exist_ok=True)
    os.makedirs(MEDIA_DIR, exist_ok=True)

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(channel, limit=LIMIT):
            # Album bo‘lsa, bir xil grouped_id ko‘p keladi — dublikatni o‘tkazamiz
            if msg.grouped_id:
                if msg.grouped_id in seen_group:
                    continue
                seen_group.add(msg.grouped_id)

            text = (msg.message or "").strip()

            # Agar umuman text ham media ham bo‘lmasa — o‘tkazamiz
            if not text and not msg.media:
                continue

            title = (text.split("\n")[0][:120] if text else "Yangilik")

            photo_url = None
            # Agar rasm/video fayl bo‘lsa, download qilib public ichiga saqlaymiz
            if msg.media:
                # rasm bo‘lsa msg.photo bo‘ladi, ba’zan boshqa media ham bo‘lishi mumkin
                if msg.photo:
                    ext = safe_ext(msg)
                    file_name = f"{msg.id}{ext}"
                    out_path = os.path.join(MEDIA_DIR, file_name)

                    try:
                        saved = await client.download_media(msg, file=out_path)
                        if saved:
                            # sayt ichida ochiladigan yo‘l
                            photo_url = f"/news_media/{file_name}"
                    except Exception:
                        photo_url = None

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title or "Yangilik",
                "text": text,
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photo": photo_url
            })

    items.sort(key=lambda x: x["tg_id"], reverse=True)

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
