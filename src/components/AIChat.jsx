// src/components/AIChat.jsx
import React, { useState } from "react";

export default function AIChat({ me }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: "assistant",
      text: "Salom! Men AI yordamchingman. Nima haqida gaplashamiz?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // 1) User xabarini qo‘shamiz
    const userMsg = {
      id: Date.now(),
      from: "user",
      text,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Oxirgi 6 ta tarixni serverga yuboramiz (ixtiyoriy)
      const history = messages
        .filter((m) => m.from === "user" || m.from === "assistant")
        .slice(-6)
        .map((m) => ({
          role: m.from === "user" ? "user" : "assistant",
          text: m.text,
        }));

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: text,
          history,
        }),
      });

      if (!res.ok) {
        throw new Error("Server error");
      }

      const data = await res.json();
      const replyText =
        data.reply || "Javobni olishda xatolik bo‘ldi. Keyinroq urinib ko‘ring.";

      const aiMsg = {
        id: Date.now() + 1,
        from: "assistant",
        text: replyText,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg = {
        id: Date.now() + 2,
        from: "assistant",
        text: "Xatolik yuz berdi. Keyinroq yana urinib ko‘ring.",
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[500px] bg-white rounded-2xl border border-black/10 overflow-hidden">
      {/* HEADER */}
      <div className="h-14 border-b border-black/10 px-4 flex items-center justify-between bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white text-xs font-semibold grid place-items-center shadow">
            {me?.fullname?.[0] || "🤖"}
          </div>
          <div>
            <div className="text-sm font-semibold">AI Assistant</div>
            <div className="text-[11px] text-gray-500 truncate max-w-[260px]">
              EMC Lab bo‘yicha savollaringizni yozing.
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2 bg-slate-50/60">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex ${
              m.from === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-3 py-2 rounded-2xl text-sm ${
                m.from === "user"
                  ? "bg-sky-500 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-900 rounded-bl-sm"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-xs text-gray-500 px-1">Yuklanmoqda...</div>
        )}
      </div>

      {/* INPUT */}
      <div className="border-t border-black/10 p-3 bg-white">
        <div className="flex items-center gap-2">
          <textarea
            className="flex-1 resize-none rounded-2xl border border-black/10 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-sky-400 min-h-[40px] max-h-[90px]"
            placeholder="Savolingizni yozing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="rounded-2xl bg-sky-500 text-white px-4 py-2 text-sm font-medium hover:bg-sky-600 disabled:opacity-60"
          >
            {loading ? "Yuborilmoqda..." : "Yuborish"}
          </button>
        </div>
      </div>
    </div>
  );
}
