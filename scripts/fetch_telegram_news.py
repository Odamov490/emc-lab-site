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
LIMIT = 30

def fmt_date(dt):
    if not dt:
        return None
    return dt.strftime("%Y-%m-%d")

async def main():
    items = []

    async with TelegramClient(StringSession(SESSION), API_ID, API_HASH) as client:
        channel = await client.get_entity(CHANNEL)

        async for msg in client.iter_messages(channel, limit=LIMIT):
            if not msg.message:
                continue

            title = msg.message.strip().split("\n")[0][:120]
            text = msg.message.strip()

            items.append({
                "tg_id": msg.id,
                "date": fmt_date(msg.date),
                "title": title or "Yangilik",
                "text": text,
                "url": f"https://t.me/{CHANNEL}/{msg.id}",
                "photo": None
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
