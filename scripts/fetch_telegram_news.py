import os
import json
from datetime import datetime
from telethon import TelegramClient
from telethon.sessions import StringSession

# .env ni lokalda o‘qish (GitHub Actions’da ham zarar qilmaydi)
try:
    from dotenv import load_dotenv
    load_dotenv()
except Exception:
    pass

def require_env(name: str) -> str:
    v = os.environ.get(name)
    if not v:
        raise RuntimeError(f"Missing env var: {name}. Set it or put it into scripts/.env")
    return v

API_ID = int(require_env("TG_API_ID"))
API_HASH = require_env("TG_API_HASH")
SESSION = require_env("TG_SESSION")
CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy")

OUT_FILE = os.path.join("public", "news.json")
MEDIA_DIR = os.path.join("public", "news_media")
LIMIT = int(os.environ.get("TG_LIMIT", "30"))

def fmt_date(dt):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")

async def main():
    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    os.makedirs(MEDIA_DIR, exist_ok=True)

    items = []

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        entity = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(entity, limit=LIMIT):
            if not msg.message:
                continue

            text = msg.message.strip()
            title = text.split("\n")[0][:120] if text else "Yangilik"

            photo_path = None

            # 1) Oddiy rasm (photo)
            # 2) Album (grouped_id) bo‘lsa ham — msg ichida photo bo‘lganlari keladi
            #    (Telethon iter_messages albomdagi har bir postni alohida qaytaradi)
            if msg.photo:
                fname = f"{msg.id}.jpg"
                out = os.path.join(MEDIA_DIR, fname)
                try:
                    await client.download_media(msg, file=out)
                    # saytda ochilishi uchun public ichidagi yo‘l
                    photo_path = f"/news_media/{fname}"
                except Exception:
                    photo_path = None

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title or "Yangilik",
                "text": text,
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photo": photo_path,
                # albom uchun keyinchalik kerak bo‘lsa:
                "grouped_id": msg.grouped_id
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
