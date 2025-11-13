// src/components/ApplicationChat.jsx
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";

/**
 * ApplicationChat
 * - Global chat (kelajakda appId bilan arizaga bog'lash mumkin)
 *   hozircha: conversationId = appId || "global"
 *
 * Qo'shilgan imkoniyatlar:
 * 1) Arizaga bog'lashga tayyor (appId prop orqali)
 * 2) Reply xabar
 * 4) Audio (voice message)
 * 5) Lokatsiya yuborish
 * 6) Typing indikator
 * 7) Presence (online / lastSeen)
 * 8) Mini-thread (reply ko'rinishi)
 * 10) Browser notification
 * 11) Emoji picker
 * 12) Kengaytirilgan qidiruv / filter
 * 13) Yulduz (favorites)
 * 14) Pinned xabarlar
 * 17) Stickerlar (oddiy variant)
 * 18) Anti-spam / Xavfsiz text
 * 19) Scroll optimizatsiya (scroll to bottom tugmasi)
 */

const PAGE_LIMIT = 200;

// Oddiy emoji va sticker to'plamlari
const EMOJIS = ["😀","😂","😍","🥰","😎","👍","🔥","🙏","👏","😅","✅","❗"];
const STICKERS = [
  {
    id: "st1",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdGRwdXFraXFyNnBydXF1bnZha2V2ZGh4OGdqYnE3MGp5YzRjM2Q5OSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3oEjI6SIIHBdRxXI40/giphy.gif",
    label: "OK",
  },
  {
    id: "st2",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdnFiNnl3c3hrdXhtb2xqZXR0NmQ4NmhsbG1tNHVza2tnZmdmd3ZrNCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/l0MYC0LajbaPoEADu/giphy.gif",
    label: "Clap",
  },
  {
    id: "st3",
    url: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXYzbnFlazJvajM2Ymt2cDByc2VzajZlNTZweTdkM2g2d2J6b25qeiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/26gssIytJvy1b1THO/giphy.gif",
    label: "Fire",
  },
];

function formatTime(ts) {
  try {
    if (!ts) return "-";
    if (ts.toDate) return ts.toDate().toLocaleString();
    return "-";
  } catch {
    return "-";
  }
}

function sanitizeText(text) {
  // Juda oddiy sanitizatsiya. React baribir HTML ni escape qiladi
  // faqat boshida/oxirida bo'shliqlarni tozalab qo'yamiz
  return (text || "").toString().trim();
}

export default function ApplicationChat({ me, appId }) {
  const conversationId = appId || "global";

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all"); 
  // all | mine | media | audio | pinned | starred

  const [showEmoji, setShowEmoji] = useState(false);
  const [showStickers, setShowStickers] = useState(false);

  const [typingUsers, setTypingUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // typing flag
  const typingTimeoutRef = useRef(null);

  // scroll
  const listRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // anti spam
  const lastSendRef = useRef(0);

  // audio
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // browser notification permission
  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Presence: lastSeen + approx online
  useEffect(() => {
    if (!me) return;
    const presenceRef = doc(db, "presence", me.id);
    const updatePresence = async () => {
      try {
        await setDoc(
          presenceRef,
          {
            fullname: me.fullname || me.username || "User",
            photoUrl: me.photoUrl || "",
            lastSeen: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.error("presence update error", e);
      }
    };
    updatePresence();
    const interval = setInterval(updatePresence, 30_000); // 30s
    return () => clearInterval(interval);
  }, [me]);

  // Listen presence of all
  useEffect(() => {
    const colRef = collection(db, "presence");
    const unsub = onSnapshot(colRef, (snap) => {
      const nowSec = Date.now() / 1000;
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((u) => {
          const ls = u.lastSeen?.seconds || 0;
          return nowSec - ls < 90; // oxirgi 1.5 daqiqada bo'lganlar online
        });
      setOnlineUsers(list);
    });
    return () => unsub();
  }, []);

  // Typing: set my typing on text change
  useEffect(() => {
    if (!me) return;
    const typingDocId = `${conversationId}_${me.id}`;
    const typingRef = doc(db, "typing", typingDocId);

    const setTyping = async (isTyping) => {
      try {
        await setDoc(
          typingRef,
          {
            userId: me.id,
            fullname: me.fullname || me.username,
            conversationId,
            typing: isTyping,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (e) {
        console.error("typing update error", e);
      }
    };

    // text o'zgarganda: typing true, 2s dan keyin false
    if (text.trim()) {
      setTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 2000);
    } else {
      setTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setTyping(false);
    };
  }, [text, me, conversationId]);

  // Listen typing of others
  useEffect(() => {
    const colRef = collection(db, "typing");
    const qTyping = query(
      colRef,
      where("conversationId", "==", conversationId),
      where("typing", "==", true)
    );
    const unsub = onSnapshot(qTyping, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((t) => t.userId !== me?.id);
      setTypingUsers(list);
    });
    return () => unsub();
  }, [conversationId, me?.id]);

  // Subscribe chat messages
  useEffect(() => {
    setLoading(true);
    const colRef = collection(db, "conversations", conversationId, "messages");
    const qMsg = query(colRef, orderBy("createdAt", "asc")); // eski → yangi
    const unsub = onSnapshot(qMsg, (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setMessages(list);
      setLoading(false);

      // browser notification
      if (typeof document !== "undefined" && typeof window !== "undefined") {
        if ("Notification" in window && Notification.permission === "granted") {
          const newMessages = list.filter(
            (m) =>
              m.createdAt &&
              m.createdAt.seconds >
                Math.floor(Date.now() / 1000) - 5 && // oxirgi 5 soniya
              m.fromId !== me?.id
          );
          if (
            newMessages.length > 0 &&
            document.visibilityState === "hidden"
          ) {
            const last = newMessages[newMessages.length - 1];
            try {
              new Notification(last.fromName || "Yangi xabar", {
                body: last.text || "[media]",
              });
            } catch {}
          }
        }
      }

      // scroll
      if (autoScroll) {
        scrollToBottom();
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, autoScroll]);

  const scrollToBottom = () => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  };

  const handleScroll = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setAutoScroll(nearBottom);
  };

  const filteredMessages = useMemo(() => {
    let list = [...messages];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => {
        const base =
          `${m.text || ""} ${m.fromName || ""} ${
            m.fileName || ""
          }`.toLowerCase();
        return base.includes(q);
      });
    }

    if (filterMode === "mine") {
      list = list.filter((m) => m.fromId === me?.id);
    } else if (filterMode === "media") {
      list = list.filter((m) =>
        ["image", "file", "sticker"].includes(m.type)
      );
    } else if (filterMode === "audio") {
      list = list.filter((m) => m.type === "audio");
    } else if (filterMode === "pinned") {
      list = list.filter((m) => m.pinned);
    } else if (filterMode === "starred") {
      list = list.filter((m) =>
        Array.isArray(m.starredBy) ? m.starredBy.includes(me?.id) : false
      );
    }

    return list;
  }, [messages, search, filterMode, me?.id]);

  const sendMessage = async (extra = {}) => {
    if (!me) return;
    const now = Date.now();
    if (now - lastSendRef.current < 500) {
      alert("Juda tez yozayapsiz, biroz kuting 🙂");
      return;
    }

    const clean = sanitizeText(text);
    if (!clean && !extra.force && !extra.type) return;

    setSending(true);
    try {
      const colRef = collection(
        db,
        "conversations",
        conversationId,
        "messages"
      );
      const body = {
        text: clean || "",
        fromId: me.id,
        fromName: me.fullname || me.username,
        fromPhoto: me.photoUrl || "",
        createdAt: serverTimestamp(),
        type: extra.type || (clean ? "text" : "system"),
        replyTo: replyTo
          ? {
              id: replyTo.id,
              text: replyTo.text || replyTo.fileName || "",
              fromName: replyTo.fromName,
            }
          : null,
        starredBy: [],
        pinned: false,
        ...extra.data,
      };
      await addDoc(colRef, body);
      setText("");
      setReplyTo(null);
      lastSendRef.current = now;
      setShowEmoji(false);
      setShowStickers(false);
    } catch (e) {
      console.error(e);
      alert("Xabar yuborishda xato!");
    } finally {
      setSending(false);
    }
  };

  const handleSendClick = () => {
    sendMessage();
  };

  const handleFileChange = async (e) => {
    if (!me) return;
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    for (const file of files) {
      try {
        const extPath = `chatFiles/${conversationId}/${Date.now()}_${file.name}`;
        const storageRef = ref(storage, extPath);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        const isImage = file.type.startsWith("image/");
        await sendMessage({
          type: isImage ? "image" : "file",
          data: {
            fileUrl: url,
            fileName: file.name,
            fileType: file.type,
          },
          force: true,
        });
      } catch (e) {
        console.error("file upload error", e);
        alert("Fayl yuborishda xato");
      }
    }
    e.target.value = "";
  };

  const handleSendLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolokatsiya qo‘llab-quvvatlanmaydi");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await sendMessage({
          type: "location",
          data: {
            location: { lat: latitude, lng: longitude },
          },
          force: true,
        });
      },
      () => {
        alert("Joylashuvni olishda xato");
      }
    );
  };

  // Audio recording
  const toggleRecording = async () => {
    if (isRecording) {
      // stop
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    // start
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;
        try {
          const path = `chatAudio/${conversationId}/${Date.now()}.webm`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);
          await sendMessage({
            type: "audio",
            data: {
              audioUrl: url,
            },
            force: true,
          });
        } catch (e) {
          console.error("audio upload error", e);
          alert("Audio yuborishda xato");
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (e) {
      console.error("record error", e);
      alert("Mikrofonga kirishda xatolik");
    }
  };

  const toggleStar = async (msg) => {
    if (!me) return;
    try {
      const docRef = doc(
        db,
        "conversations",
        conversationId,
        "messages",
        msg.id
      );
      const current = Array.isArray(msg.starredBy) ? msg.starredBy : [];
      const has = current.includes(me.id);
      const next = has
        ? current.filter((x) => x !== me.id)
        : [...current, me.id];
      await updateDoc(docRef, { starredBy: next });
    } catch (e) {
      console.error("star error", e);
    }
  };

  const togglePin = async (msg) => {
    try {
      const docRef = doc(
        db,
        "conversations",
        conversationId,
        "messages",
        msg.id
      );
      await updateDoc(docRef, { pinned: !msg.pinned });
    } catch (e) {
      console.error("pin error", e);
    }
  };

  const sendSticker = async (s) => {
    await sendMessage({
      type: "sticker",
      data: {
        stickerUrl: s.url,
        stickerId: s.id,
      },
      force: true,
    });
  };

  const pinnedMessages = useMemo(
    () => messages.filter((m) => m.pinned),
    [messages]
  );

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <div className="font-semibold text-sm">
            Chat {appId ? `— Ariza: ${appId}` : "— Umumiy"}
          </div>
          <div className="text-xs text-gray-500">
            Online:{" "}
            {onlineUsers.length
              ? onlineUsers.map((u) => u.fullname || u.id).join(", ")
              : "hech kim yo‘q"}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <input
            className="text-xs rounded-xl border px-2 py-1"
            placeholder="Qidiruv..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="text-xs rounded-xl border px-2 py-1"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
          >
            <option value="all">Barchasi</option>
            <option value="mine">Faqat meniki</option>
            <option value="media">Rasm/Fayl/Stiker</option>
            <option value="audio">Audio</option>
            <option value="pinned">Pinned</option>
            <option value="starred">Yulduzlangan</option>
          </select>
        </div>
      </div>

      {/* PINNED BAR */}
      {pinnedMessages.length > 0 && (
        <div className="mb-2 max-h-20 overflow-y-auto border rounded-xl px-2 py-1 bg-yellow-50 text-xs">
          <div className="font-semibold mb-1">📌 Muhim xabarlar:</div>
          {pinnedMessages.map((m) => (
            <div key={m.id} className="mb-1">
              <span className="font-medium">{m.fromName}: </span>
              <span>{m.text || m.fileName || "[media]"}</span>
            </div>
          ))}
        </div>
      )}

      {/* MESSAGES LIST */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto border rounded-2xl p-3 bg-white/70 mb-2"
        onScroll={handleScroll}
      >
        {loading && (
          <div className="text-xs text-gray-500 text-center">
            Yuklanmoqda...
          </div>
        )}
        {!loading && filteredMessages.length === 0 && (
          <div className="text-xs text-gray-400 text-center">
            Hozircha xabar yo‘q
          </div>
        )}
        {filteredMessages.map((m) => {
          const isMe = m.fromId === me?.id;
          return (
            <div
              key={m.id}
              className={`mb-2 flex ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                  isMe
                    ? "bg-sky-100 text-gray-900"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                {/* Pinned / Star / Reply header */}
                <div className="flex items-center justify-between mb-1 gap-2">
                  <div className="font-semibold flex items-center gap-1">
                    {m.pinned && <span>📌</span>}
                    <span>{m.fromName}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      className={`text-[10px] ${
                        m.starredBy?.includes(me?.id)
                          ? "text-yellow-500"
                          : "text-gray-400"
                      }`}
                      onClick={() => toggleStar(m)}
                    >
                      ⭐
                    </button>
                    <button
                      className="text-[10px] text-gray-400"
                      onClick={() => togglePin(m)}
                    >
                      📌
                    </button>
                    <button
                      className="text-[10px] text-gray-400"
                      onClick={() => setReplyTo(m)}
                    >
                      ↩
                    </button>
                  </div>
                </div>

                {/* Reply preview */}
                {m.replyTo && (
                  <div className="mb-1 border-l-2 border-gray-300 pl-2 text-[10px] text-gray-600 truncate">
                    Javob:{" "}
                    <span className="font-medium">
                      {m.replyTo.fromName}
                    </span>{" "}
                    — {m.replyTo.text}
                  </div>
                )}

                {/* CONTENT */}
                {m.type === "text" && (
                  <div className="whitespace-pre-wrap break-words">
                    {m.text}
                  </div>
                )}

                {m.type === "image" && (
                  <div>
                    {m.text && (
                      <div className="mb-1">{m.text}</div>
                    )}
                    <img
                      src={m.fileUrl}
                      alt={m.fileName || ""}
                      className="max-h-48 rounded-xl mt-1"
                    />
                  </div>
                )}

                {m.type === "file" && (
                  <div>
                    {m.text && (
                      <div className="mb-1">{m.text}</div>
                    )}
                    <a
                      href={m.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-sky-700 break-all"
                    >
                      📎 {m.fileName || "Fayl"}
                    </a>
                  </div>
                )}

                {m.type === "audio" && m.audioUrl && (
                  <div className="mt-1">
                    <audio controls src={m.audioUrl} />
                  </div>
                )}

                {m.type === "location" && m.location && (
                  <div className="mt-1">
                    <div>📍 Joylashuv yuborildi</div>
                    <a
                      href={`https://www.google.com/maps?q=${m.location.lat},${m.location.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sky-700 underline"
                    >
                      Xaritada ko‘rish
                    </a>
                  </div>
                )}

                {m.type === "sticker" && m.stickerUrl && (
                  <div className="mt-1">
                    <img
                      src={m.stickerUrl}
                      alt="sticker"
                      className="max-h-32 rounded-lg"
                    />
                  </div>
                )}

                {/* fallback */}
                {!m.type && m.text && (
                  <div className="whitespace-pre-wrap break-words">
                    {m.text}
                  </div>
                )}

                <div className="text-[10px] text-gray-500 mt-1 text-right">
                  {formatTime(m.createdAt)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="text-[11px] text-gray-500 mb-1">
          {typingUsers
            .map((t) => t.fullname || "Kimdir")
            .join(", ")}{" "}
          yozmoqda...
        </div>
      )}

      {/* Reply bar */}
      {replyTo && (
        <div className="mb-1 text-[11px] bg-gray-100 rounded-xl px-2 py-1 flex justify-between items-center">
          <div className="truncate">
            Javob:{" "}
            <span className="font-semibold">
              {replyTo.fromName}
            </span>{" "}
            — {replyTo.text || replyTo.fileName || "[media]"}
          </div>
          <button
            className="text-gray-500 text-[11px] ml-2"
            onClick={() => setReplyTo(null)}
          >
            ✕
          </button>
        </div>
      )}

      {/* INPUT AREA */}
      <div className="border rounded-2xl px-2 py-2 bg-white/80">
        <div className="flex items-center gap-1 mb-1">
          <button
            className="text-lg"
            type="button"
            onClick={() => {
              setShowEmoji((v) => !v);
              setShowStickers(false);
            }}
          >
            😊
          </button>
          <button
            className="text-lg"
            type="button"
            onClick={() => {
              setShowStickers((v) => !v);
              setShowEmoji(false);
            }}
          >
            🧩
          </button>
          <label className="text-lg cursor-pointer">
            📎
            <input
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
          <button
            className={`text-lg ${
              isRecording ? "text-red-600" : ""
            }`}
            type="button"
            onClick={toggleRecording}
          >
            🎤
          </button>
          <button
            className="text-lg"
            type="button"
            onClick={handleSendLocation}
          >
            📍
          </button>

          <div className="ml-auto text-[11px] text-gray-500">
            {onlineUsers.length
              ? `${onlineUsers.length} online`
              : ""}
          </div>
        </div>

        {showEmoji && (
          <div className="mb-1 flex flex-wrap gap-1 text-xl">
            {EMOJIS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setText((t) => t + e)}
              >
                {e}
              </button>
            ))}
          </div>
        )}

        {showStickers && (
          <div className="mb-1 flex gap-2 overflow-x-auto py-1">
            {STICKERS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => sendSticker(s)}
                className="border rounded-xl p-1 bg-white hover:bg-gray-50"
              >
                <img
                  src={s.url}
                  alt={s.label}
                  className="h-16 w-16 object-cover rounded-lg"
                />
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2">
          <textarea
            className="flex-1 border rounded-xl px-3 py-2 text-sm resize-none max-h-24"
            rows={1}
            placeholder="Xabar yozing..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendClick();
              }
            }}
          />
          <button
            className="rounded-xl bg-sky-600 text-white px-3 py-2 text-sm hover:opacity-90 disabled:opacity-60"
            disabled={sending}
            type="button"
            onClick={handleSendClick}
          >
            Yuborish
          </button>
        </div>

        {!autoScroll && (
          <div className="mt-1 flex justify-end">
            <button
              className="text-[11px] text-sky-600 underline"
              type="button"
              onClick={() => {
                setAutoScroll(true);
                scrollToBottom();
              }}
            >
              Pastga tushish ⬇
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
