import React from "react";

export default function NewsCard({ item }) {
  const link = item.link || item.url; // ✅ telegram link
  return (
    <article className="rounded-2xl border overflow-hidden bg-white/60 hover:shadow transition">
      {/* RASM */}
      {item.photo ? (
        <div className="w-full aspect-[16/10] bg-black/5">
          <img
            src={item.photo}
            alt={item.title || "Yangilik rasmi"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="p-4 space-y-3">
        {/* SANA */}
        {item.date ? (
          <div className="text-xs opacity-60">
            {new Date(item.date).toLocaleDateString("uz-UZ")}
          </div>
        ) : null}

        {/* SARLAVHA */}
        {item.title ? (
          <h3 className="font-semibold leading-snug">
            {item.title}
          </h3>
        ) : null}

        {/* MATN */}
        {item.text ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap line-clamp-5">
            {item.text}
          </div>
        ) : null}

        {/* TELEGRAM LINK */}
        {link ? (
          <a
            className="inline-block text-sm underline opacity-80 hover:opacity-100"
            href={link}
            target="_blank"
            rel="noreferrer"
          >
            Telegram’da ochish →
          </a>
        ) : null}
      </div>
    </article>
  );
}
