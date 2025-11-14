// src/components/AIChat.jsx
import React, { useEffect, useRef, useState } from "react";

/**
 * AIChat – EMC Lab uchun AI yordamchi (demo versiya)
 *
 * Hozircha backendga ulanmagan, javoblarni o‘zi generatsiya qiladi.
 * Keyin aynan shu yerga server (ChatGPT API) ni ulab qo‘yamiz.
 *
 * props:
 *  - me: { fullname, photoUrl, role }  (Login.jsx dan uzatiladi)
 */
export default function AIChat({ me }) {
  const [messages, setMessages] = useState(() => [
    {
      id: 1,
      role: "assistant",
      text:
        "Assalomu alaykum! Men EMC Lab uchun AI yordamchiman.\n" +
        "Savollaringizni yozing. Hozircha demo rejimda ishlayman, keyinroq haqiqiy ChatGPT ga ulanaman.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const listRef = useRef(null);

  /** Xabar o‘zgarganda pastga scroll */
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  /** 🧠 Demo javob generator – keyin bu yerga API chaqirishni qo‘yamiz */
  const getDemoAnswer = (prompt) => {
    const p = prompt.toLowerCase().trim();
    if (!p) {
      return "Nimadir yozsangiz, sizga yordam berishga harakat qilaman 🙂";
    }

    if (p.includes("salom") || p.includes("assalom")) {
      return "Va alaykum assalom! Bugun sizga qanday yordam beray?";
    }

    if (p.includes("emc") || p.includes("elektromagnit")) {
      return (
        "EMC (Electromagnetic Compatibility) haqida qisqacha:\n" +
        "• Qurilma boshqa qurilmalarga halaqit bermasligi kerak.\n" +
        "• O‘zi ham tashqi elektromagnit shovqinlardan normal ishlashi kerak.\n" +
        "• Buning uchun CISPR va IEC 61000-4-x standartlari bo‘yicha sinovlar qilinadi.\n\n" +
        "Keyinroq bu joyga aniq standartlar bo‘yicha haqiqiy ChatGPT javoblarini ulashimiz mumkin."
      );
    }

    if (p.includes("standart") || p.includes("cispr") || p.includes("iec")) {
      return (
        "Standartlar bo‘yicha umumiy ma’lumot:\n" +
        "• CISPR 14-1 – maishiy qurilmalar uchun shovqin emissiyasi.\n" +
        "• IEC 61000-4-2 – ESD sinov usuli.\n" +
        "• IEC 61000-4-4 – EFT/Burst.\n" +
        "• IEC 61000-4-5 – Surge.\n\n" +
        "Agar xohlasangiz, keyingi bosqichda aniq raqam va limitlar bo‘yicha ham batafsil ma’lumot beradigan API ulashimiz mumkin."
      );
    }

    if (p.includes("ingliz") || p.includes("ielts")) {
      return (
        "Ingliz tili / IELTS bo‘yicha ham yordam bera olaman:\n" +
        "• Sizga misol esse, speaking savollar, tarjimalar yozib bera olaman.\n" +
        "Hozircha demo – ammo struktura tayyor, keyin buni alohida AI o‘qituvchi rejimiga aylantirish mumkin."
      );
    }

    return (
      `Siz yozdingiz:\n“${prompt}”\n\n` +
      "Hozircha bu demo chat. Keyingi bosqichda bu joyga backend (ChatGPT API) ni ulab, " +
      "real vaqt rejimida ancha aqlli javoblar qaytaradigan qilamiz."
    );
  };

  /** Xabar yuborish */
  const handleSend = () => {
    const text = input.trim();
    if (!text || sending) return;

    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const userMsg = {
      id: Date.now(),
      role: "user",
      text,
      time,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    // Demo javob – biroz kechiktiramiz (typing effekti uchun)
    setTimeout(() => {
      const answerText = getDemoAnswer(text);
      const aiMsg = {
        id: Date.now() + 1,
        role: "assistant",
        text: answerText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setSending(false);
    }, 700);
  };

  /** Enter → yuborish, Shift+Enter → yangi qator */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const title = "AI Assistant (demo)";
  const subtitle = "Keyinroq bu yerga haqiqiy ChatGPT backendini ulaymiz";

  if (!me) {
    return (
      <div className="h-[420px] grid place-items-center text-sm text-gray-500">
        Avval tizimga kiring, keyin AI yordamchidan foydalanishingiz mumkin.
      </div>
    );
  }

  return (
    <div className="h-[520px] rounded-3xl border border-black/10 bg-gradient-to-br from-sky-50 via-white to-indigo-50 shadow-lg overflow-hidden flex flex-col text-sm">
      {/* HEADER */}
      <div className="h-14 border-b border-black/10 px-4 flex items-center justify-between bg-white/80 backdrop-blur">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 text-white text-xs font-semibold grid place-items-center shadow">
            🤖
          </div>
          <div>
            <div className="text-sm font-semibold">{title}</div>
            <div className="text-[11px] text-gray-500 truncate max-w-[260px]">
              {subtitle}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-gray-500 text-right hidden sm:block">
            <div className="font-semibold text-gray-700">
              {me.fullname || "Foydalanuvchi"}
            </div>
            <div>{me.role || "user"}</div>
          </div>
          <div className="h-8 w-8 rounded-full bg-black/5 overflow-hidden grid place-items-center">
            {me.photoUrl ? (
              <img src={me.photoUrl} alt="" className="h-8 w-8 object-cover" />
            ) : (
              <span className="text-xs">{me.fullname?.[0] || "👤"}</span>
            )}
          </div>
        </div>
      </div>

      {/* MESSAGES LIST */}
      <div
        ref={listRef}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-thin scrollbar-thumb-sky-200 scrollbar-track-transparent"
      >
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const align = isUser ? "items-end" : "items-start";
          const bubbleBg = isUser
            ? "bg-sky-600 text-white rounded-br-sm"
            : "bg-white text-gray-900 rounded-bl-sm";

          return (
            <div key={msg.id} className={`flex flex-col ${align}`}>
              <div className="flex items-end gap-2 max-w-[80%]">
                {!isUser && (
                  <div className="h-7 w-7 rounded-full bg-black/5 grid place-items-center">
                    <span className="text-xs">🤖</span>
                  </div>
                )}
                <div
                  className={
                    "rounded-2xl px-3 py-2 shadow-sm border border-black/5 text-xs " +
                    bubbleBg
                  }
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="font-semibold text-[11px]">
                      {isUser ? me.fullname || "Siz" : "AI yordamchi"}
                    </div>
                    <div className="text-[9px] opacity-80">{msg.time}</div>
                  </div>
                  <div className="whitespace-pre-wrap text-[13px]">
                    {msg.text}
                  </div>
                </div>
                {isUser && (
                  <div className="h-7 w-7 rounded-full bg-black/5 overflow-hidden grid place-items-center">
                    {me.photoUrl ? (
                      <img
                        src={me.photoUrl}
                        alt=""
                        className="h-7 w-7 object-cover"
                      />
                    ) : (
                      <span className="text-[11px]">
                        {me.fullname?.[0] || "👤"}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* INPUT AREA */}
      <div className="border-t border-black/10 bg-white/85 backdrop-blur px-4 py-2">
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <textarea
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Savolingizni yozing (Enter – yuborish, Shift+Enter – yangi qator)..."
              className="w-full max-h-32 rounded-2xl border border-black/10 bg-white/80 px-3 py-2 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
          </div>
          <button
            type="button"
            onClick={handleSend}
            disabled={sending || !input.trim()}
            className="inline-flex items-center gap-1 rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 px-4 py-2 text-xs font-medium text-white shadow hover:opacity-90 disabled:opacity-50"
          >
            {sending ? "Kutib turing..." : "Yuborish"}
            <span>➤</span>
          </button>
        </div>
      </div>
    </div>
  );
}
