import React, { useEffect, useMemo, useState } from "react";

function formatDate(d) {
  if (!d) return "";
  try {
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return String(d);
    return dt.toLocaleDateString();
  } catch {
    return String(d);
  }
}

function stripLinks(text = "") {
  return text.replace(/➡️[\s\S]*$/m, "").trim();
}

export default function NewsCard({ item }) {
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const dateStr = useMemo(() => formatDate(item?.date), [item?.date]);

  const title = (item?.title || "").trim();
  const textFull = stripLinks(item?.text || "");
  const textShort =
    textFull.length > 180 ? textFull.slice(0, 180).trim() + "…" : textFull;

  const tgUrl = item?.url || item?.link || null;

  // ✅ Album support: item.photos (array) yoki item.photo (string)
  const photos = useMemo(() => {
    const arr = Array.isArray(item?.photos) ? item.photos.filter(Boolean) : [];
    if (arr.length) return arr;
    return item?.photo ? [item.photo] : [];
  }, [item?.photos, item?.photo]);

  const hasPhotos = photos.length > 0;

  // idx ni limitdan chiqib ketmasin
  useEffect(() => {
    if (!hasPhotos) return;
    if (idx > photos.length - 1) setIdx(0);
  }, [hasPhotos, photos.length, idx]);

  const prev = () => setIdx((v) => (v - 1 + photos.length) % photos.length);
  const next = () => setIdx((v) => (v + 1) % photos.length);

  // klaviatura bilan (optional, yoqimli)
  useEffect(() => {
    if (!hasPhotos) return;
    const onKey = (e) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPhotos, photos.length]);

  return (
    <article className="rounded-[26px] overflow-hidden shadow-sm border border-black/5 bg-gradient-to-br from-[#0a7bb6] to-[#0a6aa0] text-white">
      {/* TOP: image / slider */}
      {hasPhotos ? (
        <div className="relative w-full aspect-[16/10] bg-black/15 overflow-hidden">
          {/* current image */}
          <img
            src={photos[idx]}
            alt={title || "News"}
            className="w-full h-full object-cover"
            loading="lazy"
          />

          {/* left/right buttons only if album */}
          {photos.length > 1 ? (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Prev"
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/45 backdrop-blur flex items-center justify-center"
              >
                ‹
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Next"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/35 hover:bg-black/45 backdrop-blur flex items-center justify-center"
              >
                ›
              </button>

              {/* dots */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/25 backdrop-blur px-2 py-1 rounded-full">
                {photos.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIdx(i)}
                    aria-label={`Photo ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition ${
                      i === idx ? "bg-white" : "bg-white/45 hover:bg-white/70"
                    }`}
                  />
                ))}
              </div>

              {/* counter */}
              <div className="absolute top-3 left-3 text-[11px] px-2 py-1 rounded-full bg-black/30 backdrop-blur">
                {idx + 1}/{photos.length}
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className="w-full aspect-[16/10] bg-white/10" />
      )}

      {/* CONTENT */}
      <div className="p-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="text-xs text-white/80">{dateStr}</div>

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
