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

  // DOCX’ni Office Online viewer’da ochish
  const getViewerUrl = (relativePath) => {
    if (typeof window === "undefined") return relativePath;
    const absolute = `${window.location.origin}${relativePath}`;
    const encoded = encodeURIComponent(absolute);
    return `https://view.officeapps.live.com/op/view.aspx?src=${encoded}`;
  };

  return (
    <div className="min-h-screen bg-[#f5f8ff]">
      <div className="max-w-6xl mx-auto px-4 pb-16 pt-10 md:pt-14">
        {/* Sarlavha bosh sahifadagi “Xizmatlar” uslubida */}
        <header className="mb-8 md:mb-10">
          <p className="text-sm font-medium text-sky-600 mb-1">
            {isUz ? "Xizmatlar va sinovlar" : "Услуги и испытания"}
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-2">
            {isUz ? "Sinov dasturlari" : "Программы испытаний"}
          </h1>
          <p className="text-slate-600 max-w-2xl text-sm md:text-base">
            {isUz
              ? "IEC/CISPR talablari asosida to‘liq EMC dasturi. Quyidagi hujjatlarni onlayn ko‘rishingiz yoki Word formatida yuklab olishingiz mumkin."
              : "Полный комплекс EMC-испытаний в соответствии с IEC/CISPR. Ниже вы можете открыть программы испытаний онлайн или скачать их в формате Word."}
          </p>
        </header>

        {/* Kartalar — “Xizmatlar” bo‘limiga o‘xshash gradient kartalar */}
        <div className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <article
              key={p.id}
              className="relative rounded-[26px] bg-gradient-to-br from-[#006fba] to-[#0099d6] text-white px-6 py-5 shadow-[0_14px_35px_rgba(0,0,0,0.22)] flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-base md:text-lg font-semibold leading-snug">
                    {isUz ? p.uzTitle : p.ruTitle}
                  </h2>
                  <p className="mt-2 text-xs text-sky-100/95">
                    {isUz
                      ? "Format: DOCX · Til: rus/ingliz"
                      : "Формат: DOCX · Язык: рус/англ."}
                  </p>
                </div>

                <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-sky-700 shadow">
                  ISO/IEC 17025
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 mt-1">
                <div className="flex flex-col text-[11px] text-sky-100/90">
                  <span>
                    {isUz ? "Sinov turi:" : "Вид испытаний:"} EMC
                  </span>
                  <span>
                    {isUz ? "Hujjat turi:" : "Тип документа:"} Word (DOCX)
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {/* Onlayn ko‘rish */}
                  <a
                    href={getViewerUrl(p.file)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center rounded-full bg-white text-sky-700 text-xs md:text-sm font-semibold px-3.5 py-1.5 hover:bg-slate-50 hover:-translate-y-0.5 transition transform"
                  >
                    {isUz ? "Onlayn ko‘rish" : "Открыть онлайн"}
                  </a>

                  {/* Yuklab olish */}
                  <a
                    href={p.file}
                    download
                    className="inline-flex items-center justify-center rounded-full border border-white/80 text-xs md:text-sm font-semibold px-3.5 py-1.5 text-white hover:bg-white/10 hover:-translate-y-0.5 transition transform"
                  >
                    {isUz ? "Yuklab olish" : "Скачать"}
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
