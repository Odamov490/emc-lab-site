// src/components/Ai-chat.jsx
import React, { useEffect, useRef, useState } from "react";

function IaChat({ me }) {
  const [messages, setMessages] = useState([
    {
      id: "sys-1",
      role: "assistant",
      author: "EMC Lab AI",
      content:
        "Salom! Men EMC Lab AI yordamchisiman. GOST / IEC standartlar, EMC sinovlari, arizalar va tarjimalar bo‘yicha savollaringni bu yerga yozishing mumkin 🙂",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // pastga scroll
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: "u-" + Date.now(),
      role: "user",
      author: me?.fullname || "Siz",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // faqat user/assistant xabarlarini APIga uzatamiz
      const history = messages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map((m) => ({
          role: m.role,
          content: m.content,
        }))
        .concat({ role: "user", content: text });

      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok) {
        throw new Error("AI server javobi xato");
      }

      const data = await res.json();
      const reply = data.reply;

      const aiMsg = {
        id: "a-" + Date.now(),
        role: "assistant",
        author: "EMC Lab AI",
        content: reply?.content || "Javobni olib bo‘lmadi.",
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("AI error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-" + Date.now(),
          role: "assistant",
          author: "EMC Lab AI",
          content:
            "Uzr, hozir AI server bilan bog‘lanishda xato bo‘ldi. Birozdan so‘ng yana urinib ko‘ring.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (!me) {
    return (
      <div className="mt-4 h-[320px] rounded-3xl border border-black/10 bg-slate-50/60 grid place-items-center text-xs text-gray-500">
        AI yordamchidan foydalanish uchun avval tizimga kiring.
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-3xl border border-black/10 bg-gradient-to-br from-slate-50 via-white to-sky-50 shadow-md flex flex-col h-[400px]">
      {/* HEADER */}
      <div className="h-11 px-4 border-b border-black/10 bg-white/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-full bg-gradient-to-br from-sky-500 to-indigo-500 text-white text-xs grid place-items-center">
            🤖
          </div>
          <div className="text-xs">
            <div className="font-semibold">EMC Lab AI yordamchi</div>
            <div className="text-[10px] text-gray-500">
              Standartlar, sinovlar, tarjima va hujjatlar bo‘yicha savollar
            </div>
          </div>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex ${
                isUser ? "justify-end" : "justify-start"
              } text-xs`}
            >
              <div
                className={
                  "max-w-[80%] rounded-2xl px-3 py-2 shadow-sm " +
                  (isUser
                    ? "bg-sky-500 text-white rounded-br-sm"
                    : "bg-white text-gray-900 border border-black/5 rounded-bl-sm")
                }
              >
                <div className="text-[10px] font-semibold mb-0.5 opacity-80">
                  {m.author || (isUser ? "Siz" : "AI")}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="border-t border-black/10 bg-white/85 px-4 py-2">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="AI yordamchidan nimani so‘ramoqchisiz?"
            className="flex-1 max-h-32 rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
          <button
            type="button"
            onClick={send}
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-xs font-medium text-white shadow hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Yozilmoqda..." : "Yuborish"}
            <span>➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default IaChat;
