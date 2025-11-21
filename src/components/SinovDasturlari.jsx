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
  const [lang, setLang] = useState("uz");
  const isUz = lang === "uz";
  const t = text;

  const getViewerUrl = (relativePath) => {
    const absolute = `${window.location.origin}${relativePath}`;
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      absolute
    )}`;
  };

  return (
    <div className="nature-bg min-h-screen relative overflow-hidden">
      <div className="birds-layer">
        <div className="bird bird--1" />
        <div className="bird bird--2" />
        <div className="bird bird--3" />
      </div>

      <div className="relative z-[2]">
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-10 md:pt-14">

          {/* UZ / RU */}
          <section className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-white drop-shadow">
                {isUz ? t.section.uz : t.section.ru}
              </p>

              <div className="inline-flex bg-white/80 shadow border border-slate-200 rounded-full text-xs overflow-hidden">
                <button
                  onClick={() => setLang("uz")}
                  className={`px-3 py-1.5 font-bold ${
                    isUz ? "bg-sky-600 text-white" : "text-slate-700"
                  }`}
                >
                  UZ
                </button>
                <button
                  onClick={() => setLang("ru")}
                  className={`px-3 py-1.5 font-bold ${
                    !isUz ? "bg-sky-600 text-white" : "text-slate-700"
                  }`}
                >
                  RU
                </button>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow mb-2">
              {isUz ? t.header.uz : t.header.ru}
            </h1>

            <p className="text-sky-100 md:text-base drop-shadow mb-2">
              {isUz ? t.subtitle.uz : t.subtitle.ru}
            </p>

            <p className="text-slate-100 max-w-2xl drop-shadow">
              {isUz ? t.desc.uz : t.desc.ru}
            </p>
          </section>

          {/* Cards */}
          <section className="grid gap-6 md:grid-cols-2">
            {programs.map((p) => (
              <article
                key={p.id}
                className="bg-white/90 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl overflow-hidden"
              >
                <div className="h-[3px] bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />

                <div className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {isUz ? p.uzTitle : p.ruTitle}
                  </h2>

                  <p className="mt-2 text-xs uppercase text-slate-500 tracking-wide">
                    {isUz ? t.standard.uz : t.standard.ru}{" "}
                    <span className="font-bold text-slate-700">{p.standard}</span>
                  </p>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-slate-700">
                      {isUz ? t.testType.uz : t.testType.ru}{" "}
                      <span className="font-semibold text-slate-900">
                        {isUz ? p.uzType : p.ruType}
                      </span>
                    </div>

                    <span className="bg-sky-50 text-sky-700 px-3 py-1 rounded-full text-[11px] font-semibold">
                      EMC
                    </span>
                  </div>

                  <div className="flex gap-2 mt-5">
                    <a
                      href={getViewerUrl(p.file)}
                      target="_blank"
                      className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full transition"
                    >
                      {isUz ? t.viewOnline.uz : t.viewOnline.ru}
                    </a>

                    <a
                      href={p.file}
                      download
                      className="border border-slate-300 hover:border-sky-400 text-slate-800 text-xs font-semibold px-4 py-1.5 rounded-full transition"
                    >
                      {isUz ? t.download.uz : t.download.ru}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </section>
        </div>
      </div>
    </div>
  );
}
