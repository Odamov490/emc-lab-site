// src/components/ApplicationChat.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db } from "../firebase";

const storage = getStorage(); // default app uchun

// Yordamchi: vaqtni chiroyli formatlash
function formatTime(ts) {
  try {
    if (!ts) return "";
    const d = ts.toDate ? ts.toDate() : ts;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// Yordamchi: fayl turini aniqlash
function detectType(file) {
  if (!file || !file.type) return "file";
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return "file";
}

export default function ApplicationChat({ me, roomId = "global" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // pinned banner
  const [showPinned, setShowPinned] = useState(true);

  // audio recording
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const recordIntervalRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const bottomRef = useRef(null);

  // === Real-time xabarlar ===
  useEffect(() => {
    const q = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc"),
      limit(300)
    );

    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(list);
      // scroll to bottom
      setTimeout(() => {
        if (bottomRef.current) {
          bottomRef.current.scrollIntoView({ behavior: "smooth" });
        }
      }, 50);
    });

    return () => unsub();
  }, []);

  // === Text yuborish ===
  const sendText = async (e) => {
    e?.preventDefault();
    if (!me) return;
    const text = input.trim();
    if (!text) return;

    setSending(true);
    try {
      await addDoc(collection(db, "messages"), {
        roomId,
        type: "text",
        text,
        createdAt: serverTimestamp(),
        userId: me.id,
        userName: me.fullname || me.username || "Noma’lum",
        userPhoto: me.photoUrl || "",
      });
      setInput("");
    } catch (err) {
      console.error(err);
      alert("Xabar yuborishda xato bo‘ldi");
    } finally {
      setSending(false);
    }
  };

  // === Fayl yuborish (rasm, video, pdf va h.k.) ===
  const handleFilePick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !me) return;
    setUploading(true);

    try {
      const path = `chatUploads/${roomId}/${me.id}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);

      const msgType = detectType(file);

      await addDoc(collection(db, "messages"), {
        roomId,
        type: msgType,
        fileUrl: url,
        fileName: file.name,
        fileType: file.type,
        createdAt: serverTimestamp(),
        userId: me.id,
        userName: me.fullname || me.username || "Noma’lum",
        userPhoto: me.photoUrl || "",
      });
    } catch (err) {
      console.error(err);
      alert("Fayl yuborishda xato bo‘ldi");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  // === Audio (ovoza) yozish ===
  const startRecording = async () => {
    if (recording) {
      // to‘xtatamiz
      mediaRecorderRef.current?.stop();
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Sizning brauzeringiz audio yozishni qo‘llamaydi.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      audioChunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mr.onstop = async () => {
        // recording timer to‘xtatish
        clearInterval(recordIntervalRef.current);
        setRecordSeconds(0);
        setRecording(false);

        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        if (blob.size === 0) return;

        try {
          setUploading(true);
          const path = `chatUploads/${roomId}/${me.id}/audio_${Date.now()}.webm`;
          const storageRef = ref(storage, path);
          await uploadBytes(storageRef, blob);
          const url = await getDownloadURL(storageRef);

          await addDoc(collection(db, "messages"), {
            roomId,
            type: "audio",
            fileUrl: url,
            fileName: `audio_${new Date().toLocaleString()}.webm`,
            fileType: "audio/webm",
            createdAt: serverTimestamp(),
            userId: me.id,
            userName: me.fullname || me.username || "Noma’lum",
            userPhoto: me.photoUrl || "",
          });
        } catch (err) {
          console.error(err);
          alert("Audio yuborishda xato bo‘ldi");
        } finally {
          setUploading(false);
        }

        // stream’ni to‘xtatish
        stream.getTracks().forEach((t) => t.stop());
      };

      // start
      mr.start();
      setRecording(true);
      setRecordSeconds(0);
      recordIntervalRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Mikrofonga ruxsat berilmadi yoki xato yuz berdi.");
    }
  };

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // === UI: bitta xabar bubbleni chizish ===
  const renderMessage = (m) => {
    const isMe = m.userId === me?.id;
    const base =
      "relative max-w-[70%] rounded-2xl px-3 py-2 text-sm shadow-sm";

    let bubbleClass = isMe
      ? "bg-sky-600 text-white rounded-br-sm"
      : "bg-white text-gray-900 rounded-bl-sm border border-black/5";
    const alignClass = isMe ? "justify-end" : "justify-start";

    return (
      <div key={m.id} className={`flex gap-2 mb-2 ${alignClass}`}>
        {!isMe && (
          <div className="mt-5 h-7 w-7 shrink-0 rounded-full bg-gray-200 overflow-hidden">
            {m.userPhoto ? (
              <img
                src={m.userPhoto}
                alt=""
                className="h-7 w-7 object-cover"
              />
            ) : (
              <div className="h-full w-full grid place-items-center text-[10px]">
                👤
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col items-start">
          <div className="text-[10px] text-gray-500 mb-0.5 px-1">
            {isMe ? "Siz" : m.userName || "Noma’lum"}
          </div>

          <div className={`${base} ${bubbleClass}`}>
            {/* matn / media / audio */}
            {m.type === "text" && <div className="whitespace-pre-wrap">{m.text}</div>}

            {m.type === "image" && m.fileUrl && (
              <div className="space-y-1">
                <img
                  src={m.fileUrl}
                  alt={m.fileName || ""}
                  className="max-h-64 rounded-xl object-cover"
                />
                {m.fileName && (
                  <div className="text-[10px] opacity-80 break-all">
                    {m.fileName}
                  </div>
                )}
              </div>
            )}

            {m.type === "video" && m.fileUrl && (
              <div className="space-y-1">
                <video
                  controls
                  src={m.fileUrl}
                  className="max-h-64 rounded-xl"
                />
                {m.fileName && (
                  <div className="text-[10px] opacity-80 break-all">
                    {m.fileName}
                  </div>
                )}
              </div>
            )}

            {m.type === "audio" && m.fileUrl && (
              <div className="space-y-1">
                <audio controls src={m.fileUrl} className="w-52" />
                {m.fileName && (
                  <div className="text-[10px] opacity-80 break-all">
                    {m.fileName}
                  </div>
                )}
              </div>
            )}

            {m.type === "file" && m.fileUrl && (
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs underline break-all"
              >
                📎 {m.fileName || "Faylni ochish"}
              </a>
            )}

            <div
              className={`mt-1 text-[10px] ${
                isMe ? "text-sky-100/80" : "text-gray-400"
              } text-right`}
            >
              {formatTime(m.createdAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[520px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-black/10 pb-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400 grid place-items-center text-white text-lg">
            💬
          </div>
          <div>
            <div className="text-sm font-semibold">Ichki chat (Messenger)</div>
            <div className="text-[11px] text-gray-500">
              Hodimlar o‘rtasida tezkor yozishmalar
            </div>
          </div>
        </div>
        <div className="text-[11px] text-gray-400">
          Global xona: <span className="font-mono">{roomId}</span>
        </div>
      </div>

      {/* Pinned banner */}
      {showPinned && (
        <div className="mb-2 flex items-start justify-between rounded-xl bg-sky-50 border border-sky-100 px-3 py-2 text-[11px] text-sky-900">
          <div className="pr-2">
            <div className="font-semibold mb-0.5">📌 Pinned xabar</div>
            <div>
              Bu chat faqat laboratoriya ichki ishchi yozishmalari uchun.
              Maxfiy ma’lumotlarni tashqariga ulashmang. Qoidalar buzilganda
              ogohlantirish berilishi mumkin.
            </div>
          </div>
          <button
            onClick={() => setShowPinned(false)}
            className="ml-2 text-xs text-sky-700 hover:text-sky-900"
            title="Yopish"
          >
            ✕
          </button>
        </div>
      )}

      {/* Xabarlar ro‘yxati */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {messages.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Hozircha xabar yo‘q. Birinchi bo‘lib yozib ko‘ring 🙂
          </div>
        )}
        {messages.map(renderMessage)}
        <div ref={bottomRef} />
      </div>

      {/* Pastki panel: input + tugmalar */}
      <form onSubmit={sendText} className="mt-2 pt-2 border-t border-black/10">
        {/* Audio recording indikator */}
        {recording && (
          <div className="mb-2 flex items-center gap-2 text-[11px] text-red-600">
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
            <span>Yozilmoqda... {formatSeconds(recordSeconds)}</span>
            <button
              type="button"
              onClick={startRecording}
              className="ml-auto rounded-full border border-red-500 px-2 py-[2px] text-[11px] text-red-600 hover:bg-red-50"
            >
              To‘xtatish
            </button>
          </div>
        )}

        <div className="flex items-end gap-2">
          <button
            type="button"
            onClick={handleFilePick}
            className="h-9 w-9 shrink-0 rounded-full border border-black/10 grid place-items-center text-lg hover:bg-black/5"
            title="Media / fayl yuborish"
          >
            📎
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,audio/*,application/pdf"
          />

          <textarea
            className="flex-1 max-h-24 min-h-[36px] rounded-2xl border border-black/15 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none"
            placeholder="Xabar yozing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendText();
              }
            }}
          />

          <button
            type="button"
            onClick={startRecording}
            className={`h-9 w-9 shrink-0 rounded-full grid place-items-center text-lg border ${
              recording
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-black/10 hover:bg-black/5"
            }`}
            title="Ovozli xabar"
          >
            🎙️
          </button>

          <button
            type="submit"
            disabled={sending || (!input.trim() && !uploading)}
            className="h-9 px-4 shrink-0 rounded-full bg-sky-600 text-white text-sm font-medium hover:bg-sky-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {sending ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </div>

        {uploading && (
          <div className="mt-1 text-[11px] text-gray-500">
            Fayl yuborilmoqda...
          </div>
        )}
      </form>
    </div>
  );
}
