from telethon import TelegramClient
from telethon.sessions import StringSession

API_ID = 2931889   # shu yerga o'zingiznikini yozing
API_HASH = "a75ff0d5ee9374f43750a92027e96389"  # shu yerga o'zingiznikini yozing

with TelegramClient(StringSession(), API_ID, API_HASH) as client:
    print("\n✅ TG_SESSION (StringSession) tayyor:\n")
    print(client.session.save())
    print("\n---\nUni GitHub Secrets -> TG_SESSION ga qo'ying.\n")
