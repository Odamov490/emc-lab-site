import React from "react";

const programs = [
  {
    id: "esd",
    uzTitle: "ESD (elektrostatik razryad) sinov dasturi",
    ruTitle: "Программа испытаний ESD (электростатический разряд)",
    file: "/public/sinov-dasturlari/esd-test-program.docx"
  },
  {
    id: "surge",
    uzTitle: "Surge (kuchlanish sakrashi) sinov dasturi",
    ruTitle: "Программа испытаний Surge",
    file: "/public/sinov-dasturlari/surge-test-program.docx"
  },
  {
    id: "rf-immunity",
    uzTitle: "RF immunitet sinov dasturi",
    ruTitle: "Программа испытаний на радиочастотную помехоустойчивость",
    file: "/public/sinov-dasturlari/rf-immunity-program.docx"
  },
  {
    id: "flicker",
    uzTitle: "Flicker sinov dasturi",
    ruTitle: "Программа испытаний Flicker",
    file: "/public/sinov-dasturlari/flicker-test-program.docx"
  }
  // xohlasangiz bu yerga yana qo‘shimcha dasturlar qo‘sha olasiz
];

export default function SinovDasturlari({ lang = "uz" }) {
  const isUz = lang === "uz";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Sarlavha qismi */}
        <header className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-sky-400 mb-2">
            {isUz ? "Hujjatlar" : "Документы"}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold mb-3">
            {isUz ? "Sinov dasturlari" : "Программы испытаний"}
          </h1>
          <p className="text-slate-300 max-w-2xl">
            {isUz
              ? "Quyida EMC laboratoriyasida qo‘llaniladigan asosiy sinov dasturlari keltirilgan. Ularni ko‘rib chiqishingiz yoki Word formatida yuklab olishingiz mumkin."
              : "Ниже приведены основные программы испытаний, используемые в лаборатории ЭМС. Вы можете просмотреть их онлайн или скачать в формате Word."}
          </p>
        </header>

        {/* Ro'yxat */}
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <article
              key={p.id}
              className="rounded-2xl border border-white/5 bg-slate-900/60 p-5 shadow-lg shadow-black/30 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold mb-2">
                  {isUz ? p.uzTitle : p.ruTitle}
                </h2>
                <p className="text-xs text-slate-400 mb-4">
                  DOCX • {isUz ? "Word hujjat" : "Документ Word"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Ko‘rish */}
                <a
                  href={p.file}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-sky-500 px-3 py-1.5 text-sm font-medium hover:bg-sky-400 hover:-translate-y-0.5 transition transform"
                >
                  {isUz ? "Onlayn ko‘rish" : "Открыть"}
                </a>

                {/* Yuklab olish */}
                <a
                  href={p.file}
                  download
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 px-3 py-1.5 text-sm font-medium hover:border-sky-400 hover:text-sky-300 hover:-translate-y-0.5 transition transform"
                >
                  {isUz ? "Yuklab olish" : "Скачать"}
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
