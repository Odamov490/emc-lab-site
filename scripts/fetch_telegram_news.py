import os
import json
import requests
from datetime import datetime
from collections import defaultdict

BOT_TOKEN = os.environ.get("TG_BOT_TOKEN")
CHANNEL = os.environ.get("TG_CHANNEL")

BASE_URL = f"https://api.telegram.org/bot{BOT_TOKEN}"
MEDIA_DIR = "public/news_media"
NEWS_JSON = "public/news.json"

os.makedirs(MEDIA_DIR, exist_ok=True)


def tg(method, params=None):
    r = requests.get(f"{BASE_URL}/{method}", params=params, timeout=30)
    r.raise_for_status()
    return r.json()["result"]


def download_file(file_id, filename):
    file = tg("getFile", {"file_id": file_id})
    path = file["file_path"]
    url = f"https://api.telegram.org/file/bot{BOT_TOKEN}/{path}"

    r = requests.get(url, timeout=60)
    r.raise_for_status()

    with open(filename, "wb") as f:
        f.write(r.content)


def load_existing():
    if not os.path.exists(NEWS_JSON):
        return []

    with open(NEWS_JSON, "r", encoding="utf-8") as f:
        data = json.load(f)

    if isinstance(data, dict) and "items" in data:
        return data["items"]

    return []


def main():
    updates = tg("getUpdates", {"limit": 100})
    posts_by_group = defaultdict(list)

    for upd in updates:
        msg = upd.get("channel_post")
        if not msg:
            continue

        if msg.get("chat", {}).get("username") != CHANNEL:
            continue

        group = msg.get("media_group_id") or msg["message_id"]
        posts_by_group[group].append(msg)

    existing = load_existing()
    by_id = {item["tg_id"]: item for item in existing}

    new_items = []

    for group_id, msgs in posts_by_group.items():
        msgs.sort(key=lambda x: x["message_id"])
        first = msgs[0]

        tg_id = group_id
        date = datetime.fromtimestamp(first["date"]).strftime("%Y-%m-%d")

        text = ""
        title = ""

        for m in msgs:
            if m.get("text"):
                text = m["text"]
                title = m["text"].split("\n")[0].strip()
                break

        photos = []

        for m in msgs:
            if "photo" in m:
                photo = m["photo"][-1]
                file_id = photo["file_id"]
                fname = f"{MEDIA_DIR}/{tg_id}_{len(photos)}.jpg"
                download_file(file_id, fname)
                photos.append("/" + fname.replace("\\", "/"))

        item = {
            "tg_id": tg_id,
            "date": date,
            "title": title,
            "text": text,
            "url": f"https://t.me/{CHANNEL}/{first['message_id']}",
            "photo": photos[0] if photos else None,
            "photos": photos
        }

        by_id[tg_id] = item

    final_items = sorted(by_id.values(), key=lambda x: x["date"], reverse=True)

    out = {
        "ok": True,
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "items": final_items
    }

    with open(NEWS_JSON, "w", encoding="utf-8") as f:
        json.dump(out, f, ensure_ascii=False, indent=2)

    print(f"✅ {len(final_items)} ta yangilik saqlandi")


if __name__ == "__main__":
    main()
