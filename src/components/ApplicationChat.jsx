// src/components/ApplicationChat.jsx
import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

export default function ApplicationChat({ me }) {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const bottomRef = useRef(null);

  // === Real-time xabarlarni olish ===
  useEffect(() => {
    const q = query(
      collection(db, "globalMessages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));

      // Har safar yangi xabar kelganda pastga tushish
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 50);
    });

    return () => unsub();
  }, []);

  // === Xabar yuborish ===
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !me) return;

    try {
      await addDoc(collection(db, "globalMessages"), {
        text: text.trim(),
        byUser: me.fullname,
        byUserId: me.id,
        photoUrl: me.photoUrl || "",
        createdAt: serverTimestamp(),
      });
      setText("");
    } catch (err) {
      console.error(err);
      alert("Xabar yuborishda xato");
    }
  };

  return (
    <div className="h-[420px] flex flex-col text-sm">

      {/* Title */}
      <div className="text-xs text-gray-500 mb-2">
        Barcha hodimlar uchun umumiy chat
      </div>

      {/* Messages box */}
      <div className="flex-1 min-h-0 border rounded-xl p-2 bg-white/70 overflow-y-auto space-y-2">
        {messages.length === 0 && (
          <div className="text-gray-400 text-xs">
            Hozircha xabar yo‘q. Birinchi bo‘lib yozing 🙂
          </div>
        )}

        {messages.map((m) => {
          const mine = m.byUserId === me.id;
          return (
            <div
              key={m.id}
              className={`flex ${mine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3 py-1.5 shadow text-xs ${
                  mine
                    ? "bg-sky-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-900 rounded-bl-sm"
                }`}
              >
                {!mine && (
                  <div className="font-semibold text-[11px] mb-0.5">
                    {m.byUser}
                  </div>
                )}
                <div>{m.text}</div>
                <div className="text-[9px] text-gray-400 mt-1">
                  {m.createdAt?.toDate
                    ? m.createdAt.toDate().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-xl border px-3 py-2 text-sm"
          placeholder="Xabar yozing..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm hover:opacity-90"
        >
          Yuborish
        </button>
      </form>
    </div>
  );
}
