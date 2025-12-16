import React from "react";
import { Link } from "react-router-dom";

const T = {
  uz: {
    topTag: "QR hujjatlar tizimi",
    title: "emclab.uz orqali QR kod bilan fayllarni ochish tizimi",
    lead:
      "Ushbu tizim QR kod orqali ochiladigan hujjat va fayllarni uzoq muddat barqaror saqlash hamda ularni markazlashtirilgan tarzda boshqarish uchun yaratilgan.",
    goalTitle: "Tizimning maqsadi",
    goalText:
      "QR kodlarga lazer orqali doimiy tushirilgan havolalarni o‘zgartirmasdan turib, hujjatlarning amaldagi (yangilangan) versiyasini ochishni ta’minlash.",
    whyTitle: "Nega aynan emclab.uz orqali?",
    whyText:
      "Lazer bilan tushirilgan QR kodni keyinchalik almashtirib bo‘lmaydi. Shu sababli QR kod Google Drive linkiga emas, emclab.uz’dagi maxsus manzilga yo‘naltiriladi.",
    flowTitle: "Qanday ishlaydi?",
    step1: "1) QR kod skaner qilinadi → emclab.uz’dagi maxsus sahifa ochiladi.",
    step2: "2) Sahifa identifikator (ID) orqali tegishli hujjatni topadi.",
    step3: "3) Foydalanuvchi Google Drive’dagi amaldagi faylga avtomatik yo‘naltiriladi.",
    updateTitle: "Hujjat yangilansa nima bo‘ladi?",
    updateText:
      "Google Drive’dagi fayl yangilansa yoki almashtirilsa ham QR kodni qayta yaratish shart emas. Faqat emclab.uz tizimidagi bog‘lanish yangilanadi, QR kod esa o‘z kuchini saqlab qoladi.",
    benefitsTitle: "Afzalliklari",
    b1: "QR kodlar o‘zgarmas va doimiy bo‘lib qoladi",
    b2: "Hujjatlarni yangilash xavfsiz va boshqariladigan bo‘ladi",
    b3: "Lazer QR kodlarni qayta ishlab chiqish kerak bo‘lmaydi",
    b4: "Hujjatlar bilan ishlash tartibli va ishonchli bo‘ladi",
    schemeTitle: "Sxema",
    box1Title: "QR kod (lazer)",
    box1Text: "O‘zgarmas identifikator",
    box2Title: "emclab.uz /qr/ID",
    box2Text: "Markaziy bog‘lovchi manzil",
    box3Title: "Google Drive fayl",
    box3Text: "Amaldagi versiya ochiladi",
    note:
      "Eslatma: Ushbu sahifa texnik tavsif bo‘lib, tizim ishlash tamoyilini tushuntiradi.",
    back: "Bosh sahifaga qaytish"
  },
  ru: {
    topTag: "Система QR-документов",
    title: "Система открытия файлов по QR-коду через emclab.uz",
    lead:
      "Система предназначена для долгосрочного стабильного доступа к документам по QR-коду и централизованного управления файлами.",
    goalTitle: "Цель системы",
    goalText:
      "Обеспечить открытие актуальной (обновлённой) версии документа без изменения QR-кода, нанесённого лазером.",
    whyTitle: "Почему через emclab.uz?",
    whyText:
      "QR-код, нанесённый лазером, нельзя заменить. Поэтому QR ведёт не на прямую ссылку Google Drive, а на специальный адрес emclab.uz.",
    flowTitle: "Как это работает?",
    step1: "1) Сканирование QR → открывается специальная страница emclab.uz.",
    step2: "2) Страница по идентификатору (ID) определяет нужный документ.",
    step3: "3) Пользователь автоматически перенаправляется на актуальный файл в Google Drive.",
    updateTitle: "Если документ обновился",
    updateText:
      "Если файл в Google Drive обновился или был заменён, QR-код менять не нужно. Обновляется только привязка в системе emclab.uz, QR остаётся рабочим.",
    benefitsTitle: "Преимущества",
    b1: "QR-коды остаются неизменными и постоянными",
    b2: "Обновление документов становится безопасным и управляемым",
    b3: "Не требуется переделывать лазерные QR-коды",
    b4: "Работа с документами становится упорядоченной и надёжной",
    schemeTitle: "Схема",
    box1Title: "QR-код (лазер)",
    box1Text: "Неизменный идентификатор",
    box2Title: "emclab.uz /qr/ID",
    box2Text: "Центральная ссылка",
    box3Title: "Файл Google Drive",
    box3Text: "Открывается актуальная версия",
    note:
      "Примечание: это техническое описание, объясняющее принцип работы системы.",
    back: "На главную"
  }
};

export default function QrTizimi({ lang = "uz" }) {
  const isUz = lang === "uz";
  const t = isUz ? T.uz : T.ru;

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background (bosh sahifa bilan uyg'un) */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-slate-950/95 to-slate-950" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 pt-10 pb-16">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300/90">
              {t.topTag}
            </p>
            <h1 className="text-2xl md:text-4xl font-semibold text-white mt-2">
              {t.title}
            </h1>
            <p className="text-slate-200/90 max-w-3xl mt-3">
              {t.lead}
            </p>
          </div>

          <Link
            to="/"
            className="rounded-2xl border border-white/15 bg-white/10 text-white px-4 py-2 text-sm hover:bg-white/15 transition"
          >
            ← {t.back}
          </Link>
        </div>

        {/* Content cards */}
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <h2 className="text-lg font-semibold mb-2">{t.goalTitle}</h2>
            <p className="text-slate-100/90">{t.goalText}</p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 text-white shadow-[0_18px_50px_rgba(0,0,0,0.35)]">
            <h2 className="text-lg font-semibold mb-2">{t.whyTitle}</h2>
            <p className="text-slate-100/90">{t.whyText}</p>
          </div>
        </div>

        {/* Flow + Update */}
        <div className="grid gap-6 md:grid-cols-2 mt-6">
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-3">{t.flowTitle}</h2>
            <ul className="space-y-2 text-slate-100/90">
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400 shrink-0" />
                <span>{t.step1}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-cyan-300 shrink-0" />
                <span>{t.step2}</span>
              </li>
              <li className="flex gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-200 shrink-0" />
                <span>{t.step3}</span>
              </li>
            </ul>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 text-white">
            <h2 className="text-lg font-semibold mb-2">{t.updateTitle}</h2>
            <p className="text-slate-100/90">{t.updateText}</p>
          </div>
        </div>

        {/* Benefits */}
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6 text-white mt-6">
          <h2 className="text-lg font-semibold mb-3">{t.benefitsTitle}</h2>
          <div className="grid gap-3 md:grid-cols-2 text-slate-100/90">
            <div className="flex gap-2"><span className="mt-1.5 h-2 w-2 rounded-full bg-sky-400" />{t.b1}</div>
            <div className="flex gap-2"><span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-300" />{t.b2}</div>
            <div className="flex gap-2"><span className="mt-1.5 h-2 w-2 rounded-full bg-sky-200" />{t.b3}</div>
            <div className="flex gap-2"><span className="mt-1.5 h-2 w-2 rounded-full bg-cyan-200" />{t.b4}</div>
          </div>
        </div>

        {/* Infographic / Scheme */}
        <div className="mt-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-xl font-semibold text-white">{t.schemeTitle}</h2>
            <span className="text-xs text-slate-200/80">{t.note}</span>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-6">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-white">
                <p className="text-xs text-sky-300/90 uppercase tracking-wide">
                  {t.box1Title}
                </p>
                <p className="mt-2 font-semibold">{t.box1Text}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-white">
                <p className="text-xs text-cyan-300/90 uppercase tracking-wide">
                  {t.box2Title}
                </p>
                <p className="mt-2 font-semibold">{t.box2Text}</p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-5 text-white">
                <p className="text-xs text-sky-200/90 uppercase tracking-wide">
                  {t.box3Title}
                </p>
                <p className="mt-2 font-semibold">{t.box3Text}</p>
              </div>
            </div>

            {/* arrows */}
            <div className="hidden md:flex items-center justify-center gap-6 mt-4 text-white/70">
              <span className="text-2xl">QR →</span>
              <span className="text-2xl">Redirect →</span>
              <span className="text-2xl">Open</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
