import React, { useMemo, useState } from "react";

function formatDateUZ(dateStr) {
  if (!dateStr) return "";
  // dateStr: "2026-02-04"
  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;
  return `${d}.${m}.${y}`;
}

function clampText(text, max = 220) {
  const t = (text || "").trim();
  if (t.length <= max) return t;
  return t.slice(0, max).trimEnd() + "…";
}

export default function NewsCard({ item }) {
  const [imgOk, setImgOk] = useState(true);

  const dateLabel = useMemo(() => formatDateUZ(item?.date), [item?.date]);

  return (
    <article className="rounded-[28px] overflow-hidden border border-black/10 shadow-sm bg-[#0B77A6]">
      {/* Image area */}
      <div className="relative w-full aspect-[16/10] bg-white/10">
        {item?.photo && imgOk ? (
          <img
            src={item.photo}
            alt={item?.title || "news"}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={() => setImgOk(false)}
          />
        ) : (
          <div className="absolute inset-0 bg-white/10" />
        )}

        {/* Top pills */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          {dateLabel ? (
            <span className="text-xs px-3 py-1 rounded-full bg-white/15 text-white">
              {dateLabel}
            </span>
          ) : null}
        </div>

        <div className="absolute right-4 top-4">
          {item?.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3 py-1 rounded-full bg-white text-[#0B77A6] font-medium"
            >
              Telegram
            </a>
          ) : null}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 text-white">
        <h3 className="font-semibold leading-snug text-[15px] md:text-[16px]">
          {item?.title || "Yangilik"}
        </h3>

        {item?.text ? (
          <p className="mt-3 text-sm leading-relaxed text-white/90">
            {clampText(item.text, 260)}
          </p>
        ) : null}

        <div className="mt-5 flex items-center gap-3">
          <button
            type="button"
            className="px-5 py-2 rounded-full bg-white text-[#0B77A6] text-sm font-semibold"
            onClick={() => {
              // oddiy: "Batafsil" bosilganda telegramga ochadi
              if (item?.url) window.open(item.url, "_blank", "noreferrer");
            }}
          >
            Batafsil
          </button>

          {item?.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm underline underline-offset-4 text-white/90 hover:text-white"
            >
              Telegram’da ochish →
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
