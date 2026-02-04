import React from "react";

export default function NewsCard({ item }) {
  return (
    <article className="rounded-2xl border overflow-hidden bg-white/50">
      {item.photo ? (
        <div className="w-full aspect-[16/10] bg-black/5">
          <img
            src={item.photo}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="p-4 space-y-2">
        <div className="text-xs opacity-60">
          {item.date ? new Date(item.date).toLocaleString() : ""}
        </div>

        {item.text ? (
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {item.text}
          </div>
        ) : null}

        {item.link ? (
          <a
            className="text-sm underline opacity-80 hover:opacity-100"
            href={item.link}
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
