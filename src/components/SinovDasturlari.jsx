import React, { useState } from "react";

const programs = [
  {
    id: "esd",
    standard: "O‘z MST IEC 61000-4-2:2023",
    uzTitle: "ESD (elektrostatik razryad) sinov dasturi",
    ruTitle: "Программа испытаний ESD (электростатический разряд)",
    uzType: "Immunitet sinovi",
    ruType: "Испытание на помехоустойчивость",
    file: "/sinov-dasturlari/esd-test-program.docx"
  },
  {
    id: "surge",
    standard: "O‘z MST IEC 61000-4-5:2023",
    uzTitle: "Surge (kuchlanish sakrashi) sinov dasturi",
    ruTitle: "Программа испытаний Surge (импульс перенапряжения)",
    uzType: "Immunitet sinovi",
    ruType: "Испытание на помехоустойчивость",
    file: "/sinov-dasturlari/surge-test-program.docx"
  },
  {
    id: "rf-immunity",
    standard: "O‘z MST IEC 61000-4-3:2023",
    uzTitle: "RF elektromagnit maydonga immunitet sinov dasturi",
    ruTitle: "Программа испытаний на устойчивость к РЧ электромагнитному полю",
    uzType: "Immunitet sinovi",
    ruType: "Испытание на помехоустойчивость",
    file: "/sinov-dasturlari/rf-immunity-program.docx"
  },
  {
    id: "flicker",
    standard: "O‘z MST IEC 61000-3-3:2023",
    uzTitle: "Flicker (yorug‘lik miltillashi) sinov dasturi",
    ruTitle: "Программа испытаний Flicker (колебания напряжения)",
    uzType: "Emissiya sinovi",
    ruType: "Испытание по эмиссии",
    file: "/sinov-dasturlari/flicker-test-program.docx"
  }
];

// Sahifa uchun matnlar
const text = {
  section: {
    uz: "Xizmatlar va sinovlar",
    ru: "Услуги и испытания"
  },
  header: {
    uz: "Sinov dasturlari",
    ru: "Программы испытаний"
  },
  subtitle: {
    uz: "IEC/CISPR talablari asosida to‘liq EMC dasturi",
    ru: "Полный комплекс EMC-испытаний по требованиям IEC/CISPR"
  },
  desc: {
    uz: "Quyida EMC laboratoriyasida qo‘llaniladigan asosiy sinov dasturlari ro‘yxati keltirilgan. Hujjatlarni onlayn ko‘rishingiz yoki Word (DOCX) formatida yuklab olishingiz mumkin.",
    ru: "Ниже приведён перечень основных программ EMC-испытаний лаборатории. Вы можете открыть документы онлайн или скачать их в формате Word (DOCX)."
  },
  badgeDoc: {
    uz: "Word hujjat (DOCX)",
    ru: "Документ Word (DOCX)"
  },
  badgeAccr: {
    uz: "ISO/IEC 17025 akkreditatsiya doirasida",
    ru: "В рамках аккредитации ISO/IEC 17025"
  },
  viewOnline: {
    uz: "Onlayn ko‘rish",
    ru: "Открыть онлайн"
  },
  download: {
    uz: "Yuklab olish",
    ru: "Скачать"
  },
  testType: {
    uz: "Sinov turi:",
    ru: "Тип испытаний:"
  },
  standard: {
    uz: "Standart:",
    ru: "Стандарт:"
  }
};

export default function SinovDasturlari() {
  // 🔥 Tilni sahifa ichida boshqaramiz
  const [lang, setLang] = useState("uz");
  const isUz = lang === "uz";
  const t = text;

  // DOCX’ni Office Online orqali ochish
  const getViewerUrl = (relativePath) => {
    if (typeof window === "undefined") return relativePath;
    const absolute = `${window.location.origin}${relativePath}`;
    const encoded = encodeURIComponent(absolute);
    return `https://view.officeapps.live.com/op/view.aspx?src=${encoded}`;
  };

  return (
    <div className="min-h-screen bg-[#f3f7ff]">
      <div className="max-w-6xl mx-auto px-4 pb-16 pt-10 md:pt-14">
        {/* Yuqori blok – bosh sahifadagi uslubga yaqin */}
        <section className="mb-10 md:mb-12">
          <div className="flex items-center justify-between gap-4 mb-2">
            <p className="text-sm font-medium text-sky-600">
              {isUz ? t.section.uz : t.section.ru}
            </p>

            {/* 📴 UZ / RU til tanlash tugmalari */}
            <div className="inline-flex items-center rounded-full bg-white shadow border border-slate-200 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setLang("uz")}
                className={
                  "px-3 py-1.5 font-semibold transition " +
                  (isUz
                    ? "bg-sky-600 text-white"
                    : "bg-transparent text-slate-600 hover:bg-slate-100")
                }
              >
                UZ
              </button>
              <button
                type="button"
                onClick={() => setLang("ru")}
                className={
                  "px-3 py-1.5 font-semibold transition " +
                  (!isUz
                    ? "bg-sky-600 text-white"
                    : "bg-transparent text-slate-600 hover:bg-slate-100")
                }
              >
                RU
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-4 mt-1">
            <div>
              <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-1">
                {isUz ? t.header.uz : t.header.ru}
              </h1>
              <p className="text-sm md:text-base text-slate-700 mb-2">
                {isUz ? t.subtitle.uz : t.subtitle.ru}
              </p>
              <p className="text-sm md:text-[15px] text-slate-600 max-w-2xl">
                {isUz ? t.desc.uz : t.desc.ru}
              </p>
            </div>

            <div className="flex flex-col items-end gap-2 text-xs">
              <span className="px-3 py-1 rounded-full bg-white shadow border border-sky-100 text-sky-700 font-medium">
                {isUz ? t.badgeAccr.uz : t.badgeAccr.ru}
              </span>
              <span className="px-3 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700">
                {isUz ? t.badgeDoc.uz : t.badgeDoc.ru}
              </span>
            </div>
          </div>
        </section>

        {/* Sinov dasturi kartalari */}
        <section className="grid gap-6 md:grid-cols-2">
          {programs.map((p) => (
            <article
              key={p.id}
              className="relative overflow-hidden rounded-[26px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.14)] border border-slate-100"
            >
              {/* yuqori gradient chiziq */}
              <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />

              <div className="p-6 pt-5 flex flex-col gap-4">
                {/* Sarlavha + standart */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
                      {isUz ? p.uzTitle : p.ruTitle}
                    </h2>
                    <p className="mt-2 text-[11px] uppercase tracking-wide text-slate-500">
                      {isUz ? t.standard.uz : t.standard.ru}{" "}
                      <span className="font-semibold text-slate-700">
                        {p.standard}
                      </span>
                    </p>
                  </div>

                  <div className="shrink-0 flex flex-col items-end text-[11px] text-slate-500">
                    <span className="inline-flex items-center justify-center rounded-full bg-sky-50 px-3 py-1 text-sky-700 font-medium">
                      EMC
                    </span>
                  </div>
                </div>

                {/* Pastki qism: ma’lumot + tugmalar */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col text-[12px] text-slate-600">
                    <span>
                      {isUz ? t.testType.uz : t.testType.ru}{" "}
                      <span className="font-medium text-slate-800">
                        {isUz ? p.uzType : p.ruType}
                      </span>
                    </span>
                    <span>
                      DOCX · {isUz ? "Rus / ingliz tili" : "Русский / английский"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {/* Onlayn ko‘rish */}
                    <a
                      href={getViewerUrl(p.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded-full bg-sky-600 text-white text-xs md:text-sm font-semibold px-3.5 py-1.5 hover:bg-sky-500 hover:-translate-y-0.5 active:translate-y-0 transition transform"
                    >
                      {isUz ? t.viewOnline.uz : t.viewOnline.ru}
                    </a>

                    {/* Yuklab olish */}
                    <a
                      href={p.file}
                      download
                      className="inline-flex items-center justify-center rounded-full border border-slate-300 text-xs md:text-sm font-semibold px-3.5 py-1.5 text-slate-800 bg-slate-50 hover:bg-white hover:border-sky-400 hover:text-sky-700 hover:-translate-y-0.5 active:translate-y-0 transition transform"
                    >
                      {isUz ? t.download.uz : t.download.ru}
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
