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

  // DOCX’ni Office Online orqali ochish
  const getViewerUrl = (relativePath) => {
    if (typeof window === "undefined") return relativePath;
    const absolute = `${window.location.origin}${relativePath}`;
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      absolute
    )}`;
  };

  return (
    <div className="nature-bg min-h-screen relative overflow-hidden">
      {/* Real qush rasmlari – fon ustida uchadi */}
      <div className="birds-layer" aria-hidden="true">
        {/* bitta yoki ikkita qush yetarli, hozir ikkitasi */}
        <img src="/img/bird.jpg" alt="" className="bird-img bird-img-1" />
        <img src="/img/bird.jpg" alt="" className="bird-img bird-img-2" />
      </div>

      {/* Kontent */}
      <div className="relative z-[2]">
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-10 md:pt-14">
          {/* Yuqori blok */}
          <section className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-3 gap-4">
              <p className="text-sm font-medium text-white drop-shadow">
                {isUz ? t.section.uz : t.section.ru}
              </p>

              {/* UZ / RU tugmalari */}
              <div className="inline-flex bg-white/80 shadow border border-slate-200 rounded-full text-xs overflow-hidden">
                <button
                  type="button"
                  onClick={() => setLang("uz")}
                  className={
                    "px-3 py-1.5 font-bold transition " +
                    (isUz ? "bg-sky-600 text-white" : "text-slate-700 hover:bg-slate-100")
                  }
                >
                  UZ
                </button>
                <button
                  type="button"
                  onClick={() => setLang("ru")}
                  className={
                    "px-3 py-1.5 font-bold transition " +
                    (!isUz
                      ? "bg-sky-600 text-white"
                      : "text-slate-700 hover:bg-slate-100")
                  }
                >
                  RU
                </button>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-semibold text-white drop-shadow mb-2">
              {isUz ? t.header.uz : t.header.ru}
            </h1>

            <p className="text-sm md:text-base text-sky-100 drop-shadow mb-2">
              {isUz ? t.subtitle.uz : t.subtitle.ru}
            </p>

            <p className="text-sm md:text-[15px] text-slate-100 max-w-2xl drop-shadow">
              {isUz ? t.desc.uz : t.desc.ru}
            </p>
          </section>

          {/* Kartalar */}
          <section className="grid gap-6 md:grid-cols-2">
            {programs.map((p) => (
              <article
                key={p.id}
                className="relative overflow-hidden rounded-[26px] bg-white/92 backdrop-blur-xl shadow-[0_16px_40px_rgba(15,23,42,0.4)] border border-slate-100"
              >
                <div className="h-[3px] bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />

                <div className="p-6 flex flex-col gap-4">
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

                    <span className="inline-flex items-center justify-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                      EMC
                    </span>
                  </div>

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
                      <a
                        href={getViewerUrl(p.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-sky-600 text-white text-xs md:text-sm font-semibold px-3.5 py-1.5 hover:bg-sky-500 hover:-translate-y-0.5 active:translate-y-0 transition transform"
                      >
                        {isUz ? t.viewOnline.uz : t.viewOnline.ru}
                      </a>

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
    </div>
  );
}
