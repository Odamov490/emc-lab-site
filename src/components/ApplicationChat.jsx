// src/components/ApplicationChat.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";

export default function ApplicationChat({ me }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  const listRef = useRef(null);
  const bottomRef = useRef(null);

  // === Firestore real-time ===
  useEffect(() => {
    if (!me?.id) return;

    const q = query(
      collection(db, "chatMessages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(
      q,
      async (snap) => {
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setMessages(list);

        // Unread count (faqat boshqa hodimlardan kelgan, siz ko‘rmagan xabarlar)
        const myId = me.id;
        const unread = list.filter(
          (m) =>
            m.fromId !== myId &&
            !(m.seenBy || []).includes(myId)
        ).length;
        setUnreadCount(unread);

        // Ko‘rinayotgan xabarlarni "seenBy" ga yozib qo‘yish
        // Juda ko‘p update bo‘lmasligi uchun oddiy (lekin yetarli) variant
        const toMark = list.filter(
          (m) =>
            m.fromId !== myId &&
            !(m.seenBy || []).includes(myId)
        );

        toMark.forEach((m) => {
          try {
            updateDoc(doc(db, "chatMessages", m.id), {
              seenBy: arrayUnion(myId),
            }).catch(() => {});
          } catch {
            // jim o'tamiz
          }
        });

        // Agar autoScroll yoqilgan bo‘lsa, pastga tushamiz
        if (autoScroll && bottomRef.current) {
          setTimeout(() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 50);
        }
      },
      (err) => {
        console.error(err);
        setError("Chatni yuklashda xatolik. Sahifani yangilab ko‘ring.");
      }
    );

    return () => unsub();
  }, [me?.id, autoScroll]);

  const handleSend = async (e) => {
    e.preventDefault();
    setError("");

    const trimmed = text.trim();
    if (!trimmed) return;

    if (!me?.id) {
      setError("Profil aniqlanmadi (me.id yo‘q). Login sahifasini tekshiring.");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "chatMessages"), {
        text: trimmed,
        fromId: me.id,
        fromName: me.fullname || me.username || "Noma’lum",
        fromPhoto: me.photoUrl || "",
        createdAt: serverTimestamp(),
        seenBy: [me.id], // o'zingiz avtomatik ko‘rgansiz
      });
      setText("");
      // yuborganingizdan keyin avtomatik pastga tushish
      setAutoScroll(true);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
      setError("Xabar yuborishda xato. Keyinroq urinib ko‘ring.");
    } finally {
      setSending(false);
    }
  };

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    const isNearBottom = distanceFromBottom < 80;
    setAutoScroll(isNearBottom);

    if (isNearBottom) {
      setUnreadCount(0);
    }
  };

  const formatTime = (ts) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date();
      return d.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const getDateKey = (ts) => {
    try {
      const d = ts?.toDate ? ts.toDate() : new Date();
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.date - 1);
      const sameDay = (a, b) =>
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate();

      if (sameDay(d, today)) return "Bugun";
      if (sameDay(d, yesterday)) return "Kecha";
      return d.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  // Oxirgi o‘zingiz yozgan xabar
  const lastMyMessageId = useMemo(() => {
    const mine = messages.filter((m) => m.fromId === me?.id);
    if (!mine.length) return null;
    return mine[mine.length - 1].id;
  }, [messages, me?.id]);

  const isLastMyMessageSeen = useMemo(() => {
    if (!lastMyMessageId) return false;
    const msg = messages.find((m) => m.id === lastMyMessageId);
    if (!msg) return false;
    // Agar kamida 2 ta user ko‘rgan bo‘lsa (siz + yana kimdir)
    const seenBy = msg.seenBy || [];
    return seenBy.length > 1;
  }, [messages, lastMyMessageId]);

  // Sana bo‘yicha guruhlab ko‘rsatish uchun tayyorlangan massiv
  const renderedMessages = useMemo(() => {
    const out = [];
    let lastDateKey = "";

    messages.forEach((m) => {
      const dk = getDateKey(m.createdAt);
      if (dk && dk !== lastDateKey) {
        lastDateKey = dk;
        out.push({
          type: "date-divider",
          id: `date-${dk}`,
          label: dk,
        });
      }
      out.push({
        type: "message",
        ...m,
      });
    });

    return out;
  }, [messages]);

  return (
    <div className="flex flex-col h-[70vh] max-h-[70vh]">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-black/10 mb-3">
        <div>
          <div className="font-semibold text-sm">Ichki chat (beta)</div>
          <div className="text-xs text-gray-500">
            Hamma hodimlar uchun umumiy suhbat
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Onlayn (real-time)</span>
        </div>
      </div>

      {/* Xabarlar ro'yxati */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto space-y-2 pr-1"
        onScroll={handleScroll}
      >
        {renderedMessages.length === 0 && (
          <div className="h-full flex items-center justify-center text-xs text-gray-400">
            Hozircha xabarlar yo‘q. Birinchi bo‘lib siz yozing 🙂
          </div>
        )}

        {renderedMessages.map((item) => {
          if (item.type === "date-divider") {
            return (
              <div
                key={item.id}
                className="flex items-center my-2 text-[11px] text-gray-500"
              >
                <div className="flex-1 h-px bg-gray-200" />
                <span className="px-3">{item.label}</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
            );
          }

          const isMe = item.fromId === me?.id;
          const seenBy = item.seenBy || [];
          const isSeen = isMe && item.id === lastMyMessageId && isLastMyMessageSeen;

          return (
            <div
              key={item.id}
              className={`flex mb-1 ${
                isMe ? "justify-end" : "justify-start"
              }`}
            >
              {!isMe && (
                <div className="mr-2 mt-auto">
                  {item.fromPhoto ? (
                    <img
                      src={item.fromPhoto}
                      alt={item.fromName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-gray-200 grid place-items-center text-[10px] text-gray-600">
                      {item.fromName?.[0] || "?"}
                    </div>
                  )}
                </div>
              )}

              <div
                className={`max-w-[70%] rounded-2xl px-3 py-2 text-xs shadow-sm ${
                  isMe
                    ? "bg-sky-600 text-white rounded-br-sm"
                    : "bg-white text-gray-800 rounded-bl-sm border border-black/5"
                }`}
              >
                {!isMe && (
                  <div className="text-[10px] font-semibold mb-0.5 opacity-80">
                    {item.fromName}
                  </div>
                )}
                <div className="whitespace-pre-wrap break-words">
                  {item.text}
                </div>
                <div
                  className={`mt-1 flex items-center gap-1 text-[10px] ${
                    isMe ? "text-sky-100/80" : "text-gray-400"
                  }`}
                >
                  <span>{formatTime(item.createdAt)}</span>
                  {isSeen && (
                    <span className="flex items-center gap-0.5">
                      <span>•</span>
                      <span>O‘qildi</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      {/* Yangi xabarlar tugmasi (agar pastga tushmagan bo'lsangiz) */}
      {unreadCount > 0 && !autoScroll && (
        <div className="flex justify-center mt-2">
          <button
            onClick={() => {
              if (bottomRef.current) {
                bottomRef.current.scrollIntoView({ behavior: "smooth" });
              }
              setAutoScroll(true);
              setUnreadCount(0);
            }}
            className="px-3 py-1.5 text-[11px] rounded-full bg-sky-600 text-white shadow hover:opacity-90"
          >
            {unreadCount} ta yangi xabar ⬇
          </button>
        </div>
      )}

      {/* Xabar yuborish formasi */}
      <form onSubmit={handleSend} className="mt-3 pt-2 border-t border-black/10">
        {error && (
          <div className="mb-2 text-[11px] text-red-600">{error}</div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Xabar yozing..."
            className="flex-1 resize-none rounded-2xl border px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/60"
          />
          <button
            type="submit"
            disabled={sending || !text.trim()}
            className="rounded-2xl bg-sky-600 text-white px-4 py-2 text-xs font-medium hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </div>
      </form>
    </div>
  );
}
