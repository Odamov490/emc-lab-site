import React, { useMemo, useState, useEffect } from "react";

function formatDate(d) {
  if (!d) return "";
  const dt = new Date(d);
  return Number.isNaN(dt.getTime()) ? String(d) : dt.toLocaleDateString();
}

function stripLinks(text = "") {
  return text.replace(/➡️[\s\S]*$/m, "").trim();
}

export default function NewsCard({ item }) {
  const [open, setOpen] = useState(false); // matn batafsil
  const [imgOpen, setImgOpen] = useState(false); // lightbox
  const [idx, setIdx] = useState(0); // slider index

  const dateStr = useMemo(() => formatDate(item?.date), [item?.date]);
  const title = (item?.title || "Yangilik").trim();
  const textFull = stripLinks(item?.text || "");
  const textShort =
    textFull.length > 180 ? textFull.slice(0, 180).trim() + "…" : textFull;

  // backward compatible: eski item.photo bo‘lsa ham ishlasin
  const photos = useMemo(() => {
    const arr = Array.isArray(item?.photos) ? item.photos : [];
    if (arr.length) return arr;
    if (item?.photo) return [item.photo];
    return [];
  }, [item]);

  const tgUrl = item?.url || item?.link || null;

  const hasPhotos = photos.length > 0;
  const current = hasPhotos ? photos[idx] : null;

  const prev = () => setIdx((v) => (v - 1 + photos.length) % photos.length);
  const next = () => setIdx((v) => (v + 1) % photos.length);

  // Lightbox: ESC yopish, ← → bilan yurish
  useEffect(() => {
    if (!imgOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setImgOpen(false);
      if (photos.length > 1 && (e.key === "ArrowLeft")) prev();
      if (photos.length > 1 && (e.key === "ArrowRight")) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imgOpen, photos.length]);

  return (
    <>
      <article className="rounded-[26px] overflow-hidden shadow-sm border border-black/5 bg-gradient-to-br from-[#0a7bb6] to-[#0a6aa0] text-white">
        {/* IMAGE / SLIDER */}
        <div className="relative w-full aspect-[16/10] bg-black/15">
          {hasPhotos ? (
            <>
              <button
                type="button"
                onClick={() => setImgOpen(true)}
                className="absolute inset-0"
                aria-label="Rasmni kattalashtirib ko‘rish"
              />
              <img
                src={current}
                alt={title}
                className="w-full h-full object-cover select-none"
                loading="lazy"
                draggable={false}
              />

              {/* count badge */}
              {photos.length > 1 ? (
                <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-black/55 text-white text-xs">
                  {idx + 1}/{photos.length}
                </div>
              ) : null}

              {/* arrows */}
              {photos.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); prev(); }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center"
                    aria-label="Oldingi rasm"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); next(); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/55 flex items-center justify-center"
                    aria-label="Keyingi rasm"
                  >
                    ›
                  </button>

                  {/* dots */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 bg-black/35 rounded-full px-3 py-1">
                    {photos.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setIdx(i); }}
                        className={`w-2 h-2 rounded-full ${i === idx ? "bg-white" : "bg-white/40"}`}
                        aria-label={`Rasm ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : null}
            </>
          ) : (
            <div className="w-full h-full bg-white/10" />
          )}
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="text-xs text-white/80">{dateStr}</div>
            <div className="shrink-0 px-3 py-1 rounded-full bg-white text-[#0a6aa0] text-[11px] font-semibold">
              Telegram
            </div>
          </div>

          <h3 className="font-semibold leading-snug text-[15px] md:text-[16px]">
            {title}
          </h3>

          {textFull ? (
            <p className="text-sm text-white/90 leading-relaxed">
              {open ? textFull : textShort}
            </p>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            {textFull ? (
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="inline-flex items-center justify-center rounded-full bg-white text-[#0a6aa0] px-4 py-2 text-sm font-semibold hover:bg-white/95 active:scale-[0.99]"
              >
                {open ? "Yopish" : "Batafsil"}
              </button>
            ) : (
              <div className="h-10" />
            )}

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

      {/* LIGHTBOX MODAL */}
      {imgOpen && hasPhotos ? (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4"
          onClick={() => setImgOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={current}
              alt={title}
              className="w-full max-h-[85vh] object-contain rounded-2xl bg-black"
              draggable={false}
            />

            {/* close */}
            <button
              type="button"
              onClick={() => setImgOpen(false)}
              className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-black font-bold shadow flex items-center justify-center"
              aria-label="Yopish"
            >
              ×
            </button>

            {/* arrows */}
            {photos.length > 1 ? (
              <>
                <button
                  type="button"
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-xl"
                  aria-label="Oldingi rasm"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-xl"
                  aria-label="Keyingi rasm"
                >
                  ›
                </button>

                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 text-white text-sm">
                  {idx + 1}/{photos.length}
                </div>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
