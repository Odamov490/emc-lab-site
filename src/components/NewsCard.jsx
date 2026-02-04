import React, { useMemo, useState } from "react";

function formatDate(d) {
  if (!d) return "";
  try {
    // d = "2026-02-04" yoki ISO bo‘lishi mumkin
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString();
  } catch {
    return String(d);
  }
}

function stripLinks(text = "") {
  // pastdagi "➡️ Telegram | Web-sayt | ..." kabi qatorlarni yengillashtirish
  return text
    .replace(/➡️[\s\S]*$/m, "") // oxiridagi promo qatorlarni olib tashlaydi
    .trim();
}

export default function NewsCard({ item }) {
  const [open, setOpen] = useState(false);

  const dateStr = useMemo(() => formatDate(item?.date), [item?.date]);

  const title = (item?.title || "").trim();
  const textFull = stripLinks(item?.text || "");
  const textShort =
    textFull.length > 180 ? textFull.slice(0, 180).trim() + "…" : textFull;

  const photo = item?.photo || null;
  const tgUrl = item?.url || item?.link || null;

  return (
    <article className="rounded-[26px] overflow-hidden shadow-sm border border-black/5 bg-gradient-to-br from-[#0a7bb6] to-[#0a6aa0] text-white">
      {/* TOP: image */}
      {photo ? (
        <div className="w-full aspect-[16/10] bg-black/15">
          <img
            src={photo}
            alt={title || "News"}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="w-full aspect-[16/10] bg-white/10" />
      )}

      {/* CONTENT */}
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs text-white/80">{dateStr}</div>

          {/* Badge (xuddi standart badge kabi) */}
          <div className="shrink-0 px-3 py-1 rounded-full bg-white text-[#0a6aa0] text-[11px] font-semibold">
            Telegram
          </div>
        </div>

        <h3 className="font-semibold leading-snug text-[15px] md:text-[16px]">
          {title || "Yangilik"}
        </h3>

        <p className="text-sm text-white/90 leading-relaxed">
          {open ? textFull : textShort}
        </p>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-full bg-white text-[#0a6aa0] px-4 py-2 text-sm font-semibold hover:bg-white/95 active:scale-[0.99]"
          >
            {open ? "Yopish" : "Batafsil"}
          </button>

          {tgUrl ? (
            <a
              className="text-sm underline text-white/90 hover:text-white"
              href={tgUrl}
              target="_blank"
              rel="noreferrer"
            >
              Telegram’da ochish →
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
