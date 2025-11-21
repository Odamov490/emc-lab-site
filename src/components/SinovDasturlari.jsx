import React from "react";

const programs = [
  {
    id: "esd",
    uzTitle: "ESD (elektrostatik razryad) sinov dasturi",
    ruTitle: "Программа испытаний ESD (электростатический разряд)",
    file: "/sinov-dasturlari/esd-test-program.docx"
  },
  {
    id: "surge",
    uzTitle: "Surge (kuchlanish sakrashi) sinov dasturi",
    ruTitle: "Программа испытаний Surge",
    file: "/sinov-dasturlari/surge-test-program.docx"
  },
  {
    id: "rf-immunity",
    uzTitle: "RF immunitet sinov dasturi",
    ruTitle: "Программа испытаний на радиочастотную помехоустойчивость",
    file: "/sinov-dasturlari/rf-immunity-program.docx"
  },
  {
    id: "flicker",
    uzTitle: "Flicker sinov dasturi",
    ruTitle: "Программа испытаний Flicker",
    file: "/sinov-dasturlari/flicker-test-program.docx"
  }
];

export default function SinovDasturlari({ lang = "uz" }) {
  const isUz = lang === "uz";

  // DOCX’ni Office Online viewer’da ochish uchun to‘liq URL yasaymiz
  const getViewerUrl = (relativePath) => {
    if (typeof window === "undefined") return relativePath; // SSR uchun guard
    const absolute = `${window.location.origin}${relativePath}`;
    const encoded = encodeURIComponent(absolute);
    return `https://view.officeapps.live.com/op/view.aspx?src=${encoded}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        {/* Yuqori panel / breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-400/80 mb-2">
              {isUz ? "EMC laboratoriyasi" : "Лаборатория ЭМС"}
            </p>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {isUz ? "Sinov dasturlari" : "Программы испытаний"}
            </h1>
            <p className="mt-3 text-sm md:text-base text-slate-300 max-w-xl">
              {isUz
                ? "EMC laboratoriyasida qo‘llaniladigan sinov dasturlari ro‘yxati. Hujjatlarni onlayn ko‘rish yoki Word formatida yuklab olishingiz mumkin."
                : "Список программ испытаний, используемых в лаборатории ЭМС. Вы можете открыть документы онлайн или скачать их в формате Word."}
            </p>
          </div>

          <div className="hidden md:flex flex-col items-end text-xs text-slate-400">
            <span className="px-3 py-1 rounded-full border border-slate-700/70 bg-slate-900/70">
              DOCX · ISO/IEC 17025
            </span>
          </div>
        </div>

        {/* Kartalar grid’i */}
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <article
              key={p.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-900/70 backdrop-blur shadow-[0_18px_40px_rgba(0,0,0,0.45)]"
            >
              {/* gradient chiziq */}
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-sky-400 via-cyan-300 to-sky-500 opacity-80" />

              <div className="p-5 pb-4 flex flex-col gap-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-400/40">
                    <span className="text-xs font-semibold text-sky-300">
                      DOC
                    </span>
                  </div>

                  <div>
                    <h2 className="text-base md:text-lg font-semibold leading-snug group-hover:text-sky-200 transition-colors">
                      {isUz ? p.uzTitle : p.ruTitle}
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      {isUz
                        ? "Format: DOCX · Til: rus/ingliz kombinatsiyasi"
                        : "Формат: DOCX · Язык: рус/англ. комбинация"}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/70">
                      EMC
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800/80 border border-slate-700/70">
                      {isUz ? "Sinov dasturi" : "Программа испытаний"}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    {/* Onlayn ko‘rish – Office viewer */}
                    <a
                      href={getViewerUrl(p.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-xs md:text-sm font-medium text-slate-950 hover:bg-sky-400 hover:-translate-y-0.5 active:translate-y-0 transition transform"
                    >
                      {isUz ? "Onlayn ko‘rish" : "Открыть онлайн"}
                    </a>

                    {/* To‘g‘ridan-to‘g‘ri yuklab olish */}
                    <a
                      href={p.file}
                      download
                      className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 px-3 py-1.5 text-xs md:text-sm font-medium text-slate-100 hover:border-sky-400 hover:text-sky-200 hover:-translate-y-0.5 active:translate-y-0 transition transform"
                    >
                      {isUz ? "Yuklab olish" : "Скачать"}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
