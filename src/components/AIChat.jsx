// src/components/ai-chat.jsx
import React, { useState, useRef, useEffect } from "react";

export default function AIChat({ me, lang = "uz" }) {
  const [messages, setMessages] = useState([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        lang === "uz"
          ? "Salom! Men EMC Lab AI assistentiman. Har xil savollaringizni yozishingiz mumkin 🙂"
          : "Здравствуйте! Я AI-ассистент EMC Lab. Можете задавать любые вопросы 🙂",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const t = lang === "uz"
    ? {
        title: "AI Assistant",
        placeholder: "Savolingizni yozing...",
        send: "Yuborish",
        thinking: "AI javob tayyorlamoqda...",
        error:
          "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko‘ring yoki konfiguratsiyani tekshiring.",
      }
    : {
        title: "AI-ассистент",
        placeholder: "Напишите ваш вопрос...",
        send: "Отправить",
        thinking: "AI формирует ответ...",
        error:
          "Произошла ошибка. Попробуйте ещё раз позже или проверьте конфигурацию.",
      };

  // Avtomatik scroll pastga
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, loading]);

  const callOpenAI = async (history) => {
    // ⚠️ BU YERGA O‘ZINGNING API KEY’INGNI QO‘YASAN
    const apiKey = "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";

    const body = {
      model: "gpt-4o-mini", // arzon va tez model
      messages: history.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    };

    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error("OpenAI error status:", res.status);
      const text = await res.text();
      console.error("OpenAI error body:", text);
      throw new Error("OpenAI error");
    }

    const data = await res.json();
    const answer = data.choices?.[0]?.message?.content || "";
    return answer;
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const history = [...messages, userMsg];
      const answer = await callOpenAI(history);

      const aiMsg = {
        id: Date.now().toString() + "-ai",
        role: "assistant",
        content: answer,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString() + "-err",
          role: "assistant",
          content: t.error,
        },
      ]);
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
    <div className="h-[500px] rounded-3xl border border-black/10 bg-gradient-to-br from-slate-50 via-white to-sky-50 shadow-lg flex flex-col text-sm overflow-hidden">
      {/* HEADER */}
      <div className="h-12 border-b border-black/10 bg-white/80 backdrop-blur px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white grid place-items-center text-lg">
            🤖
          </div>
          <div>
            <div className="text-sm font-semibold">{t.title}</div>
            <div className="text-[11px] text-gray-500">
              {lang === "uz"
                ? "ChatGPT kuchidagi ichki AI yordamchi"
                : "Внутренний AI на базе ChatGPT"}
            </div>
          </div>
        </div>
      </div>

      {/* CHAT BODY */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((m) => {
          const isUser = m.role === "user";
          const align = isUser ? "items-end" : "items-start";
          const bubble =
            "rounded-2xl px-3 py-2 max-w-[80%] text-xs shadow-sm " +
            (isUser
              ? "bg-sky-500 text-white rounded-br-sm"
              : "bg-white text-gray-900 border border-black/5 rounded-bl-sm");

          return (
            <div key={m.id} className={`flex flex-col ${align}`}>
              <div className={bubble}>
                <div className="font-semibold text-[11px] mb-0.5">
                  {isUser
                    ? me?.fullname || (lang === "uz" ? "Siz" : "Вы")
                    : "AI Assistant"}
                </div>
                <div className="whitespace-pre-wrap">{m.content}</div>
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-400 animate-pulse" />
            {t.thinking}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-black/10 bg-white/85 backdrop-blur px-4 py-2">
        <div className="flex items-end gap-2">
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.placeholder}
            className="flex-1 max-h-32 rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-sky-400"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-xs font-medium text-white shadow hover:opacity-90 disabled:opacity-50"
          >
            {t.send}
            <span>➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}
