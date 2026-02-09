import os
import json
import asyncio
from datetime import datetime
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]
SESSION = os.environ["TG_SESSION"]
CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy")

OUT_FILE = "public/news.json"
MEDIA_DIR = "public/news_media"
LIMIT = 50  # ko‘proq olamiz, keyin guruhlab LIMIT ta post qoldiramiz

def fmt_date(dt):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")

def safe_title(text: str) -> str:
    if not text:
        return "Yangilik"
    return text.strip().split("\n")[0][:120] or "Yangilik"

async def main():
    os.makedirs("public", exist_ok=True)
    os.makedirs(MEDIA_DIR, exist_ok=True)

    # grouped_id -> album item
    grouped = {}
    singles = []

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(channel, limit=LIMIT):
            # text (caption) ba’zan faqat 1-rasmda bo‘ladi
            text = (msg.message or "").strip()

            # album id (None bo‘lsa oddiy post)
            gid = getattr(msg, "grouped_id", None)

            # rasm(lar)ni yuklab olish
            photos = []
            if msg.photo:
                # har bir rasmga unique nom beramiz
                file_name = f"{msg.id}.jpg"
                out_path = os.path.join(MEDIA_DIR, file_name)

                # oldin yuklangan bo‘lsa qayta yuklamaymiz
                if not os.path.exists(out_path):
                    try:
                        await client.download_media(msg, file=out_path)
                    except Exception:
                        # download xato bo‘lsa o‘tkazib yuboramiz
                        pass

                if os.path.exists(out_path):
                    photos.append(f"/news_media/{file_name}")

            # album bo‘lsa - bitta itemga yig‘amiz
            if gid:
                if gid not in grouped:
                    grouped[gid] = {
                        "tg_id": msg.id,          # keyin eng kattasini qo'yamiz
                        "grouped_id": gid,
                        "date": fmt_date(msg.date),
                        "title": safe_title(text),
                        "text": text,
                        "url": f"https://t.me/{CHANNEL}/{msg.id}",
                        "photos": [],
                    }

                g = grouped[gid]

                # album ichida eng yangi msg.id katta bo‘ladi
                if msg.id > g["tg_id"]:
                    g["tg_id"] = msg.id
                    g["url"] = f"https://t.me/{CHANNEL}/{msg.id}"
                    g["date"] = fmt_date(msg.date) or g["date"]

                # caption matnni bo‘sh bo‘lsa keyin to‘ldiramiz
                if (not g["text"]) and text:
                    g["text"] = text
                    g["title"] = safe_title(text)

                # fotos qo‘shamiz
                if photos:
                    g["photos"].extend(photos)

            else:
                # oddiy post
                item = {
                    "tg_id": msg.id,
                    "date": fmt_date(msg.date),
                    "title": safe_title(text),
                    "text": text,
                    "url": f"https://t.me/{CHANNEL}/{msg.id}",
                    "photos": photos,  # 0 yoki 1 bo‘lishi mumkin
                }
                # faqat text bo‘lgan postlar ham qoladi
                if item["text"] or item["photos"]:
                    singles.append(item)

    # albumlar + singles
    items = list(grouped.values()) + singles

    # photos bo‘lmasa [] bo‘lsin
    for it in items:
        it["photos"] = it.get("photos") or []

    # eng yangi yuqorida
    items.sort(key=lambda x: x["tg_id"], reverse=True)

    # LIMIT ta post qoldiramiz
    items = items[:30]

    with open(OUT_FILE, "w", encoding="utf-8") as f:
        json.dump(
            {
                "ok": True,
                "updated_at": datetime.utcnow().isoformat() + "Z",
                "items": items,
            },
            f,
            ensure_ascii=False,
            indent=2,
        )

if __name__ == "__main__":
    asyncio.run(main())
