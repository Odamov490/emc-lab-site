import os
import json
import asyncio
from datetime import datetime
from telethon import TelegramClient
from telethon.sessions import StringSession
from openai import OpenAI

# ===== ENV =====
API_ID = int(os.environ["TG_API_ID"])
API_HASH = os.environ["TG_API_HASH"]
SESSION = os.environ["TG_SESSION"]
CHANNEL = os.environ.get("TG_CHANNEL", "uztestrasmiy")
OPENAI_KEY = os.environ["OPENAI_API_KEY"]

OUT_JSON = "public/news.json"
MEDIA_DIR = "public/news_media"
LIMIT = 20

client_ai = OpenAI(api_key=OPENAI_KEY)

# ===== HELPERS =====
def fmt_date(dt):
    return dt.strftime("%Y-%m-%d") if dt else None

def translate_uz_to_ru(text: str) -> str:
    if not text.strip():
        return ""

    resp = client_ai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a professional translator. Translate Uzbek to Russian accurately, formally, without adding anything."
            },
            {
                "role": "user",
                "content": text
            }
        ],
        temperature=0.2
    )
    return resp.choices[0].message.content.strip()

# ===== MAIN =====
async def main():
    os.makedirs(MEDIA_DIR, exist_ok=True)
    items = []

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as tg:
        channel = await tg.get_entity(CHANNEL)

        async for msg in tg.iter_messages(channel, limit=LIMIT):
            if not msg.message:
                continue

            text_uz = msg.message.strip()
            title_uz = text_uz.split("\n")[0][:120]

            print(f"🔄 Translating post {msg.id}")

            title_ru = translate_uz_to_ru(title_uz)
            text_ru = translate_uz_to_ru(text_uz)

            photos = []
            if msg.photo:
                file_path = f"{MEDIA_DIR}/{msg.id}_1.jpg"
                await msg.download_media(file_path)
                photos.append("/news_media/" + os.path.basename(file_path))

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": {
                    "uz": title_uz,
                    "ru": title_ru
                },
                "text": {
                    "uz": text_uz,
                    "ru": text_ru
                },
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photos": photos
            })

    items.sort(key=lambda x: x["tg_id"], reverse=True)

    with open(OUT_JSON, "w", encoding="utf-8") as f:
        json.dump({
            "ok": True,
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "items": items
        }, f, ensure_ascii=False, indent=2)

    print("✅ news.json updated with RU translation")

if __name__ == "__main__":
    asyncio.run(main())
