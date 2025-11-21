import React, { useState } from "react";

const programs = [
  {
    id: "maishiy",
    standard: "O‘z MST IEC 61000-6-1/3",
    uzTitle: "Maishiy elektr jihozlari uchun EMC sinov dasturi*",
    ruTitle: "Программа EMC-испытаний для бытовой электротехники*",
    uzType: "Kompleks EMC sinovi",
    ruType: "Комплексные EMC-испытания",
    file: "/sinov-dasturlari/maishiy-texnika-emc-sinov-dasturi.docx",

    // 🔥 ISTISNOLAR
    noteUz:
      "*Ushbu dasturga quyidagi mahsulotlar kirmaydi: Avtotransport vositalari uchun mo‘ljallangan elektr jihozlari, traktorlar va qishloq xo‘jaligi texnikasi, elektr pogruzchiklar, dizel pogruzchiklar, stasionar holatda sinovdan o‘tadigan maxsus qurilmalar.",

    noteRu:
      "*В данную программу не входят: электрооборудование автотранспортных средств, тракторов и сельхозтехники, электропогрузчики, дизельные погрузчики, специализированное стационарное оборудование."
  },

  const programs = [
  // --------------------------
  // 1. Maishiy va umumiy texnika
  // --------------------------
  {
    id: "maishiy",
    standard: "O‘z MST IEC 61000-6-1/3",
    uzTitle: "Maishiy elektr jihozlari uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний для бытовой электротехники",
    uzType: "Kompleks EMC sinovi",
    ruType: "Комплексные EMC-испытания",
    file: "/sinov-dasturlari/maishiy-texnika-emc-sinov-dasturi.docx"
  },

  {
    id: "it-equipment",
    standard: "O‘z MST IEC 61000-6-1/3",
    uzTitle: "Axborot-texnik qurilmalar (IT/office) uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний для информационно-технического (IT/офисного) оборудования",
    uzType: "Kompleks EMC sinovi",
    ruType: "Комплексные EMC-испытания",
    file: "/sinov-dasturlari/axborot-texnik-qurilmalar-emc-sinov-dasturi.docx"
  },

  {
    id: "microwave",
    standard: "O‘z MST IEC 60335-2-25",
    uzTitle: "Mikroto‘lqinli pechlar uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний для микроволновых печей",
    uzType: "Kompleks EMC sinovi",
    ruType: "Комплексные EMC-испытания",
    file: "/sinov-dasturlari/mikrotolqinli-pech-emc-sinov-dasturi.docx"
  },

  {
    id: "svarka",
    standard: "O‘z MST IEC 60974-10",
    uzTitle: "Payvandlash uskunalari (svarkalar) uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний для сварочного оборудования",
    uzType: "Kompleks EMC sinovi",
    ruType: "Комплексные EMC-испытания",
    file: "/sinov-dasturlari/svarka-emc-sinov-dasturi.docx"
  },

  {
    id: "lamps",
    standard: "O‘z MST IEC 55015",
    uzTitle: "Yoritish moslamalari (lampalar) uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний для осветительных устройств (ламп)",
    uzType: "Emissiya sinovi",
    ruType: "Испытание по эмиссии",
    file: "/sinov-dasturlari/lampalar-emc-sinov-dasturi.docx"
  },

  // --------------------------
  // 2. Maxsus texnika va transport
  // --------------------------
  {
    id: "transport",
    standard: "O‘z DST ISO 7637-2",
    uzTitle: "Avtotransport vositalari uchun elektr jihozlarining EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний электрооборудования автотранспортных средств",
    uzType: "Avtomobil EMC sinovi",
    ruType: "Автомобильные EMC-испытания",
    file: "/sinov-dasturlari/avtotransport-elektr-jihozlari-emc.docx"
  },

  {
    id: "tractor",
    standard: "O‘z DST ISO 14982",
    uzTitle: "Traktorlar va qishloq xo‘jaligi texnikasi uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний электрооборудования тракторов и сельхозтехники",
    uzType: "Qishloq xo‘jaligi texnikasi EMC sinovi",
    ruType: "EMC-испытания сельхозтехники",
    file: "/sinov-dasturlari/traktor-qx-texnika-emc.docx"
  },

  {
    id: "forklift-electric",
    standard: "IEC 61000-6-2 / 6-4",
    uzTitle: "Pogruzchiklar (elektrda ishlaydigan) uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний электропогрузчиков",
    uzType: "Sanoat EMC sinovi",
    ruType: "Промышленные EMC-испытания",
    file: "/sinov-dasturlari/elektr-pogruzchik-emc.docx"
  },

  {
    id: "forklift-diesel",
    standard: "IEC 61000-6-2 / 6-4",
    uzTitle: "Pogruzchiklar (dizel yoqilg‘isida ishlaydigan) uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний дизельных погрузчиков",
    uzType: "Sanoat EMC sinovi",
    ruType: "Промышленные EMC-испытания",
    file: "/sinov-dasturlari/dizel-pogruzchik-emc.docx"
  },

  {
    id: "stationary",
    standard: "IEC 61000-6-2 / 6-4",
    uzTitle: "O‘rnatilgan (stasionar) holatda sinovdan o‘tadigan maxsus qurilmalar uchun EMC sinov dasturi",
    ruTitle: "Программа EMC-испытаний стационарного специализированного оборудования",
    uzType: "Stasionar EMC sinovi",
    ruType: "Стационарные EMC-испытания",
    file: "/sinov-dasturlari/stasionar-qurilma-emc.docx"
  }
];


const text = {
  section: {
    uz: "Sinov dasturlari",
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
  }
};

export default function SinovDasturlari() {
  const [lang, setLang] = useState("uz");
  const isUz = lang === "uz";
  const t = text;

  const getViewerUrl = (relativePath) => {
    if (typeof window === "undefined") return relativePath;
    const absolute = `${window.location.origin}${relativePath}`;
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      absolute
    )}`;
  };

  return (
    <div className="nature-bg min-h-screen relative overflow-hidden">
      {/* Qushlar */}
      <div className="birds-layer" aria-hidden="true">
        <img src="/img/bird.png" alt="" className="bird-img bird-img-1" />
        <img src="/img/bird.png" alt="" className="bird-img bird-img-2" />
      </div>

      <div className="relative z-[2]">
        <div className="max-w-6xl mx-auto px-4 pb-16 pt-10 md:pt-14">
          {/* Yuqori blok */}
          <section className="mb-10 md:mb-12">
            <div className="flex items-center justify-between mb-3 gap-4">
              <p className="text-sm font-medium text-white drop-shadow">
                {isUz ? t.section.uz : t.section.ru}
              </p>

              <div className="inline-flex bg-white/80 shadow border border-slate-200 rounded-full text-xs overflow-hidden">
                <button
                  onClick={() => setLang("uz")}
                  className={
                    "px-3 py-1.5 font-bold " +
                    (isUz
                      ? "bg-sky-600 text-white"
                      : "text-slate-700 hover:bg-slate-100")
                  }
                >
                  UZ
                </button>
                <button
                  onClick={() => setLang("ru")}
                  className={
                    "px-3 py-1.5 font-bold " +
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

            <p className="text-sm md:text-[15px] text-slate-100 max-w-2xl drop-shadow">
              {isUz ? t.desc.uz : t.desc.ru}
            </p>
          </section>

          {/* Kartalar */}
          <section className="grid gap-6 md:grid-cols-2">
            {programs.map((p) => (
              <article
                key={p.id}
                className="relative overflow-hidden rounded-[26px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.4)] border border-slate-100"
              >
                <div className="h-[3px] bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-500" />

                <div className="p-6 flex flex-col gap-4">
                  {/* Sarlavha */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base md:text-lg font-semibold text-slate-900 leading-snug">
                        {isUz ? p.uzTitle : p.ruTitle}
                      </h2>
                    </div>

                    <span className="inline-flex items-center justify-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                      EMC
                    </span>
                  </div>

                  {/* 🔥 Faqat MAISHIY uchun istisno chiqarish */}
                  {p.noteUz && (
                    <div className="text-[11px] bg-slate-100 text-slate-600 border border-slate-200 rounded-lg p-2">
                      {isUz ? p.noteUz : p.noteRu}
                    </div>
                  )}

                  {/* Tugmalar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div />

                    <div className="flex flex-wrap gap-2">
                      <a
                        href={getViewerUrl(p.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center rounded-full bg-sky-600 text-white text-xs md:text-sm font-semibold px-3.5 py-1.5 hover:bg-sky-500 transition"
                      >
                        {isUz ? t.viewOnline.uz : t.viewOnline.ru}
                      </a>

                      <a
                        href={p.file}
                        download
                        className="inline-flex items-center justify-center rounded-full border border-slate-300 text-xs md:text-sm font-semibold px-3.5 py-1.5 text-slate-800 bg-slate-50 hover:bg-white hover:border-sky-400 hover:text-sky-700 transition"
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
