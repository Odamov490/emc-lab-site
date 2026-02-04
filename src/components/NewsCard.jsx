// src/components/NewsCard.jsx
import React, { useMemo } from "react";

function formatDate(dateStr) {
  if (!dateStr) return "";
  try {
    // dateStr: "2026-02-04"
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("uz-UZ", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function NewsCard({ item }) {
  const dateText = useMemo(() => formatDate(item?.date), [item?.date]);

  const title = (item?.title || "").trim();
  const text = (item?.text || "").trim();
  const url = item?.url || item?.link || "";
  const photo = item?.photo || null;

  return (
    <article className="group rounded-2xl border bg-white overflow-hidden shadow-sm transition hover:shadow-lg hover:-translate-y-0.5">
      {/* Photo */}
      {photo ? (
        <div className="relative w-full aspect-[16/10] bg-black/5 overflow-hidden">
          <img
            src={photo}
            alt={title || "news"}
            className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.03]"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0" />
          {dateText ? (
            <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-full bg-white/90 backdrop-blur border border-white/60">
              {dateText}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-black/[0.04] to-black/[0.08]">
          {dateText ? (
            <div className="absolute left-3 top-3 text-xs px-2 py-1 rounded-full bg-white/90 backdrop-blur border border-white/60">
              {dateText}
            </div>
          ) : null}
        </div>
      )}

      {/* Body */}
      <div className="p-4">
        {title ? (
          <h3 className="font-semibold leading-snug text-[15px] line-clamp-2">
            {title}
          </h3>
        ) : null}

        {text ? (
          <p className="mt-2 text-sm text-black/70 leading-relaxed line-clamp-4 whitespace-pre-wrap">
            {text}
          </p>
        ) : null}

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-xs text-black/45">
            {item?.tg_id ? `#${item.tg_id}` : ""}
          </div>

          {url ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-xl border bg-white hover:bg-black/5 transition"
            >
              Telegram’da ochish <span aria-hidden>→</span>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
