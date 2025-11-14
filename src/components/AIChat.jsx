// src/components/AIChat.jsx
import React, { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Salom! Men AI yordamchingman. Nima haqida gaplashamiz?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text) return;

    const newMessages = [
      ...messages,
      { role: "user", content: text }
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");

      const reply = data.reply || "Javobni olishda xatolik bo‘ldi.";
      setMessages([
        ...newMessages,
        { role: "assistant", content: reply }
      ]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Kechirasiz, hozir javob bera olmadim. Keyinroq urinib ko‘ring." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-[400px] rounded-3xl border border-black/10 bg-white/80 shadow flex flex-col text-sm">
      <div className="px-4 py-2 border-b border-black/10 flex items-center justify-between">
        <div className="font-semibold text-sm">AI Assistant</div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={
              "flex " +
              (m.role === "user" ? "justify-end" : "justify-start")
            }
          >
            <div
              className={
                "max-w-[80%] rounded-2xl px-3 py-2 text-xs " +
                (m.role === "user"
                  ? "bg-sky-500 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-900 rounded-bl-sm")
              }
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-[11px] text-gray-500">Yozmoqda...</div>
        )}
      </div>

      <div className="border-t border-black/10 px-4 py-2 flex items-end gap-2 bg-white/80">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Savolingizni yozing..."
          className="flex-1 rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-xs font-medium text-white shadow disabled:opacity-50"
        >
          Yuborish
        </button>
      </div>
    </div>
  );
}
