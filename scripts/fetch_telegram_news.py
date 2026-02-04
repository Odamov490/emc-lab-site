import os
import json
import re
from datetime import datetime
from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]
SESSION = os.environ["TG_SESSION"]
CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy")

OUT_FILE = "public/news.json"
MEDIA_DIR = "public/news_media"

# Nechta post ko'rsatamiz
LIMIT = 30

# Albomlarni to'g'ri yig'ish uchun biroz ko'proq o'qiymiz
FETCH_LIMIT = 120


def fmt_date(dt):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")


def safe_title(s: str, max_len=120):
    s = (s or "").strip()
    s = re.sub(r"\s+", " ", s)
    return s[:max_len] if s else "Yangilik"


def web_path_from_local(local_path: str):
    # "public/news_media/xxx.jpg" -> "/news_media/xxx.jpg"
    local_path = local_path.replace("\\", "/")
    if local_path.startswith("public/"):
        return "/" + local_path[len("public/") :]
    return "/" + local_path


async def main():
    os.makedirs("public", exist_ok=True)
    os.makedirs(MEDIA_DIR, exist_ok=True)

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        # 1) Xabarlarni guruhlab olamiz (album: grouped_id)
        groups = {}  # key -> list[msg]
        async for msg in client.iter_messages(channel, limit=FETCH_LIMIT):
            key = msg.grouped_id or msg.id
            groups.setdefault(key, []).append(msg)

        # 2) Har bir guruhdan 1 ta post yasaymiz
        items = []
        for key, msgs in groups.items():
            # Caption/text bor postni topamiz (albomda caption faqat bittasida bo'ladi)
            caption_msg = None
            for m in msgs:
                if m.message and m.message.strip():
                    caption_msg = m
                    break
            if not caption_msg:
                continue

            text = caption_msg.message.strip()
            title = safe_title(text.split("\n")[0])

            # Rasm/top media bo'lgan xabarni topamiz (albumda birinchisi odatda photo bo'ladi)
            media_msg = None
            for m in msgs:
                if m.photo:
                    media_msg = m
                    break

            photo_url = None
            if media_msg:
                # bir xil nomda qayta-qayta yozilishi uchun key dan foydalanamiz
                # Telethon o'zi extension qo'yadi (.jpg/.png)
                out_base = os.path.join(MEDIA_DIR, str(key))
                local = await client.download_media(media_msg, file=out_base)
                if local:
                    photo_url = web_path_from_local(local)

            items.append(
                {
                    "tg_id": int(key),  # album bo'lsa grouped_id
                    "date": fmt_date(caption_msg.date),
                    "title": title,
                    "text": text,
                    "url": f"https://t.me/{CHANNEL}/{caption_msg.id}",
                    "photo": photo_url,  # "/news_media/....jpg" yoki None
                }
            )

        # 3) Eng yangi LIMIT ta post
        items.sort(key=lambda x: x["tg_id"], reverse=True)
        items = items[:LIMIT]

        # 4) Eski rasm fayllarni tozalash (o'sib ketmasin)
        keep = set()
        for it in items:
            if it.get("photo"):
                keep.add(it["photo"].split("/")[-1])  # filename

        try:
            for fn in os.listdir(MEDIA_DIR):
                if fn not in keep:
                    p = os.path.join(MEDIA_DIR, fn)
                    if os.path.isfile(p):
                        os.remove(p)
        except Exception:
            pass

        payload = {
            "ok": True,
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "items": items,
        }

        with open(OUT_FILE, "w", encoding="utf-8") as f:
            json.dump(payload, f, ensure_ascii=False, indent=2)


if __name__ == "__main__":
    import asyncio

    asyncio.run(main())
