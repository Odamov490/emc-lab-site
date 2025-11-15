import React, { useState } from "react";

export default function AIChat() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Salom! Men AI yordamchingman. Nima haqida gaplashamiz?" }
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map(m => `${m.role}: ${m.text}`)
        })
      });

      const data = await res.json();

      if (data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", text: "Xatolik yuz berdi." }]);
      }

    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", text: "Server bilan aloqa xatosi!" }]);
    }

    setLoading(false);
  };

  return (
    <div className="space-y-3">
      <div className="h-[400px] overflow-y-auto bg-white border rounded-xl p-4">
        {messages.map((m, i) => (
          <div key={i} className={`mb-2 ${m.role === "user" ? "text-right" : "text-left"}`}>
            <div
              className={`inline-block px-3 py-2 rounded-xl ${
                m.role === "user"
                  ? "bg-sky-500 text-white"
                  : "bg-gray-200 text-gray-900"
              }`}
            >
              {m.text}
            </div>
          </div>
        ))}

        {loading && (
          <div className="text-left">
            <div className="inline-block px-3 py-2 rounded-xl bg-gray-200 text-gray-700">
              Yozmoqda...
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 border rounded-xl px-3 py-2"
          placeholder="Savolingizni yozing..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-sky-600 text-white rounded-xl"
        >
          Yuborish
        </button>
      </div>
    </div>
  );
}
