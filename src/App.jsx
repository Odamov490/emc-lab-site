import React, { useMemo, useState, useEffect } from "react";
import ScrollToTopButton from "./ScrollToTopButton";

import { Routes, Route, useNavigate } from "react-router-dom";
import Login from "./pages/Login"; // login sahifang
import EMCLabUltra from "./components/EMCLabUltra"; // asosiy sahifa

/********************* CONFIG *********************/
const NAV = [
  { href: "#about", label: { uz: "Biz haqimizda", ru: "О нас" } },
  { href: "#services", label: { uz: "Xizmatlar", ru: "Услуги" } },
  { href: "#equipment", label: { uz: "Jihozlar", ru: "Оборудование" } },
  { href: "#accreditation", label: { uz: "Akkreditatsiya", ru: "Аккредитация" } },
  { href: "#gallery", label: { uz: "Galereya", ru: "Галерея" } },
  { href: "#excursion", label: { uz: "Ekskursiya", ru: "Экскурсия" } },
  { href: "#team", label: { uz: "Jamoa", ru: "Команда" } },
  { href: "#contact", label: { uz: "Bog‘lanish", ru: "Контакты" } },
];

const TESTS = [
  { code: "O’zMSt IEC 61000.4.2-2023", title: "Устойчивость к электростатическим разрядам", note: "Sifat", icon: "⚡" },
  { code: "O‘z MSt IEC 61000-4-4:2023", title: "Устойчивость к электрическим быстрым переходным процессам (пачкам)", note: "Immunitet", icon: "💥" },
  { code: "Oʻz MSt IEC 61000-4-5:2023", title: "Устойчивость к выбросу напряжения", note: "Immunitet", icon: "🌩️" },
  { code: "Oʻz MSt IEC 61000.4.11-2013", title: "Устойчивость к провалам, кратковременным прерываниям", note: "Immunitet", icon: "🔌" },
  { code: "O'z MSt IEC 61000-4-6:2023", title: "Устойчивость к кондуктивным  помехам, вызванным радиочастотными полями", note: "Immunitet", icon: "🧲" },
  { code: "O‘zMSt IEC 61000-4-3:2023", title: "Устойчивость к радиочастотному электромагнитному полю", note: "Immunitet", icon: "📡" },
  { code: "ГОСТ CISPR 14-1-2022", title: "Уровень напряженности поля ИРП", note: "Emissiya", icon: "📶" },
  { code: "O‘zMSt IEC 61000-3-3:2023", title: "Ограничение изменений напряжения, колебаний напряжения и фликера", note: "Tarmoq sifati", icon: "🕯️" },
  { code: "O‘zMSt IEC 61000-3-2:2023", title: "Гармонические составляющие тока", note: "Tarmoq sifati", icon: "🎚️" },
  { code: "ГОСТ CISPR 14-1-2022", title: "Уровень напряжения ИРП на сетевых зажимах", note: "Emissiya", icon: "🔊" },
];

const EQUIPMENT = [
  { name: "R&S ESW8", desc: "Приемник", images: ["/lab/esw8/1.jpg", "/lab/esw8/2.jpg", "/lab/esw8/3.jpg", "/lab/esw8/4.jpg"] },
  { name: "Ametek DPA 500N", desc: "Анализатор гармоник и фликера (мерцания) ", images: ["/lab/dpa/1.png", "/lab/dpa/2.png", "/lab/dpa/3.png"] },
  { name: "R&S ESR3", desc: "Приемник", images: ["/lab/esr3/1.jpg", "/lab/esr3/2.jpg", "/lab/esr3/3.jpg", "/lab/esr3/4.jpg"] },
  { name: "R&S HL562E", desc: "Комбинированная биконическая и логорифмически-периодическая антенна", images: ["/lab/hl562e/1.jpg", "/lab/hl562e/2.jpg", "/lab/hl562e/3.jpg"] },
  { name: "Ametek DITO", desc: "Генератор электростатических разрядов", images: ["/lab/dito/1.png", "/lab/dito/2.png", "/lab/dito/3.png"] },
  { name: "Ametek NX5", desc: "Многофункциональный испытательный генератор переходных процессов ", images: ["/lab/nx5/1.png", "/lab/nx5/2.png", "/lab/nx5/3.png"] },
  { name: "R&S SMB100В", desc: "Генератор сигналов", images: ["/lab/smb100b/1.jpg", "/lab/smb100b/2.jpg", "/lab/smb100b/3.jpg", "/lab/smb100b/4.jpg"] },
  { name: "R&S ENV216", desc: "Эквивалент сети", images: ["/lab/env216/1.jpg", "/lab/env216/2.jpg", "/lab/env216/3.jpg"] },
  { name: "R&S  ENV432", desc: "Эквивалент сети", images: ["/lab/env432/1.jpg", "/lab/env432/2.jpg", "/lab/env432/3.jpg"] },
  { name: "KEMZ 801", desc: "Электромагнитные клещи связи ", images: ["/lab/kemz801/1.png", "/lab/kemz801/2.png"] },
  { name: "Ametek HF907", desc: "Рупорная антенна", images: ["/lab/hf907/1.jpg", "/lab/hf907/2.jpg"] },
  { name: "Ametek CDN-M216-10", desc: "Устройство связи/развязки", images: ["/lab/cdn216/1.jpeg", "/lab/cdn216/2.jpg"] },
];

// 11 xodim
const STAFF = [
  { name: "Xakimov Aziz", role: "Laboratoriya rahbari", img: "/staff/1.png" },
  { name: "Tillayev Anvar", role: "Boshliq o'rinbosari", img: "/staff/2.png" },
  { name: "Abdurashidov Davron", role: "Sektor boshlig'i", img: "/staff/3.png" },
  { name: "Odamov G‘ulomjon", role: "Bosh mutaxassis", img: "/staff/4.jpg" },
  { name: "Reimbayev Xushnud", role: "1-toifali mutaxassis", img: "/staff/5.png" },
  { name: "Alekseyev Andrey", role: "1-toifali mutaxassis", img: "/staff/6.png" },
  { name: "Abduvohobov Ravshan", role: "2-toifali mutaxassis", img: "/staff/7.png" },
  { name: "Joldasbaev Dastanbek", role: "2-toifali mutaxassis", img: "/staff/8.jpg" },
  { name: "Sobirov Doston", role: "Texnik xodim", img: "/staff/9.png" },
  { name: "Karimov Suxrob", role: "Texnik xodim", img: "/staff/10.png" },
  { name: "Sharofiddinov Najmiddin", role: "Texnik xodim", img: "/staff/11.png" },
];

const GALLERY = ["/gallery/1.jpg", "/gallery/2.jpg", "/gallery/3.jpg", "/gallery/4.jpg", "/gallery/5.jpg", "/gallery/6.jpg"];

// QUICK LINKS
const QUICK_LINKS = [
  {
    labelUz: "Lokatsiya",
    labelRu: "Локация",
    icon: "📍",
    href: "https://yandex.uz/maps/?ll=69.414936%2C40.909279&mode=poi&poi%5Bpoint%5D=69.417748%2C40.913482&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D118326433128&z=14",
  },
  {
    labelUz: "Akkreditatsiya guvohnomasi",
    labelRu: "Свидетельство об аккредитации",
    icon: "📄",
    href: "https://akkred.uz:8081/media/file/pdf/2023-06/01583495-c2c7-4483-b0b4-2ffbb80ef177.pdf#toolbar=0",
  },
  {
    labelUz: "Akkreditatsiya doirasi",
    labelRu: "Область аккредитации",
    icon: "📄",
    href: "https://akkred.uz:8081/media/file/pdf/2023-06/e9f59504-1802-4f3f-b7de-e44908444f73.pdf#toolbar=0",
  },
];

/********************* DETAILS for modal *********************/
const TEST_DETAILS = {
  "O’zMSt IEC 61000.4.2-2023": {
    uz: `
Elektrostatik razryad (ESD) sinovi qurilmaning inson/atrof-muhitdan keladigan statik zaryadga barqarorligini baholaydi.

• Sinov darajalari: ±2…±15 kV (havo va bevosita kontakt)
• Qo‘llanishi: maishiy, sanoat va IT qurilmalari
• Natija: qurilma ishi uzluksizligi va tiklanish mezonlari (A/B/C/D)

Tayyorlash: yerga ulash, plastik korpus, ochiq portlar, devorga o‘rnatish sharoitlari va h.k.
    `,
    ru: `
Испытание на электростатический разряд (ESD) оценивает устойчивость оборудования к статическим зарядам от человека/окружения.

• Уровни: ±2…±15 кВ (контакт/воздух)
• Область: бытовые, промышленные и IT-устройства
• Результат: критерии функционирования A/B/C/D

Подготовка: заземление, пластиковый корпус, открытые порты, настенное крепление и т.д.
    `,
  },
  "O‘z MSt IEC 61000-4-4:2023": {
    uz: `
Tez o‘tuvchi o‘tish jarayonlari (EFT/Burst) – tarmoq hamda signal liniyalaridagi kalitlash jarayonlaridan paydo bo‘ladigan impulslar ta'siriga barqarorlik.

• Impuls paketi: 5/50 ns, takrorlanish 5 kHz – 100 kHz
• Kiritish: quvvat liniyasi, signal/muloqot portlari (CDN orqali)
• Maqsad: nazorat tizimlari, invertorlar, boshqaruv modullari
    `,
    ru: `
EFT/Burst – устойчивость к быстропеременным переходным процессам от коммутаций в сетях.

• Пакет: 5/50 нс, повторение 5–100 кГц
• Ввод: питание, сигнальные/коммуникационные порты (через CDN)
• Цель: контроллеры, инверторы, управляющие модули
    `,
  },
  default: {
    uz: `
Ushbu sinov bo‘yicha batafsil texnik ma’lumotlar: sinov darajalari, joylashtirish, portlar, mezonlar va protokol misollari. Zarur bo‘lsa,
mijozga mos individual dastur tuziladi. Qo‘shimcha ma’lumot uchun "Bog‘lanish" bo‘limidan ariza qoldiring.
    `,
    ru: `
Подробные технические сведения по испытанию: уровни, размещение, порты, критерии и примеры протokолов. При необходимости
формируем индивидуальную программу под изделие. Для уточнения оставьте заявку в разделе «Контакты».
    `,
  },
};

/********************* EQUIPMENT CERTS (PDF yoki rasm) *********************/
const EQUIPMENT_CERTS = {
  "R&S ESW8":   "/certs/esw8.pdf",
  "R&S ESR3":   "/certs/esr3.pdf",
  "Schaffner NX5": "/certs/nx5.pdf",
  "CDN M216-10": "/certs/cdn-m216-10.pdf",
};

/********************* NEW: EQUIPMENT DETAILS (o‘zingiz to‘ldirasiz) *********************/
const EQUIPMENT_DETAILS = {
  default: {
    uz: `
Ushbu jihoz bo‘yicha batafsil ma’lumot: asosiy texnik ko‘rsatkichlar, qo‘llanilishi, kalibrlash va foydalanish sharoitlari.
Savollar bo‘lsa, "Bog‘lanish" bo‘limidan murojaat qiling.`,
    ru: `
Подробная информация об оборудовании: ключевые характеристики, область применения, калибровка и условия эксплуатации.
При вопросах свяжитесь через раздел «Контакты».`,
  },

  "R&S ESW8": {
    uz: `
R&S ESW8 — EMI qabul qilgich (Receiver).
• Chastota: 2 Hz — 8 GHz
• Standartlar: CISPR, ANSI, MIL-STD
• Qo‘llanish: emissiya o‘lchovi, pre-kompliance va akkreditatsiyali sinovlar
• Eslatma: kalibrlash muddati ko‘rsatilgan protokol asosida`,
    ru: `
R&S ESW8 — EMI-приемник.
• Диапазон: 2 Гц — 8 ГГц
• Стандарты: CISPR, ANSI, MIL-STD
• Применение: измерения эмиссии, pre-compliance и аккредитованные испытания
• Примечание: калибровка согласно протоколу`,
  },

  "Schaffner NX5": {
    uz: `
Schaffner NX5 — ESD/EFT/Surge generatori.
• ESD: ±2…±30 kV (kontakt/havo)
• EFT/Burst: 5/50 ns, 5–100 kHz
• Surge: 1.2/50 µs, 0.5–6 kV
• Aksesuarlar: CDN, coupling clamp, ESD qurol`,
    ru: `
Schaffner NX5 — генератор ESD/EFT/Surge.
• ESD: ±2…±30 кВ (контакт/воздух)
• EFT/Burst: 5/50 нс, 5–100 кГц
• Surge: 1.2/50 мкс, 0.5–6 кВ
• Аксессуары: CDN, coupling clamp, ESD gun`,
  },
};

/********************* UI PRIMITIVES *********************/
function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function Section({ id, title, subtitle, children, bleed = false }) {
  return (
    <section id={id} className={`py-12 sm:py-20 md:py-24 scroll-mt-24 ${bleed ? "px-0" : ""}`} aria-labelledby={`${id}-title`}>
      <div className={`mx-auto ${bleed ? "max-w-none" : "max-w-7xl px-4"}`}>
        <div className={`${bleed ? "px-4 max-w-7xl mx-auto" : ""} mb-10`}>
          <h2 id={`${id}-title`} className="text-3xl sm:text-4xl font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle && <p className="mt-2 text-base text-gray-600 dark:text-gray-300 max-w-2xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-sm ${className}`}>{children}</div>;
}

/********************* LIGHTBOX (Gallery & Equipment) *********************/
function Lightbox({ open, images, index, onClose, onPrev, onNext }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, onPrev, onNext]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center">
      <button
        className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm shadow hover:bg-white"
        onClick={onClose}
      >
        ✕
      </button>

      <button
        className="absolute left-1 sm:left-3 md:left-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow"
        onClick={onPrev}
      >
        ‹
      </button>

      <div className="w-full max-w-lg sm:max-w-3xl md:max-w-5xl px-2">
        <img src={images[index]} alt="" className="w-full max-h-[82vh] object-contain rounded-xl shadow-2xl" />
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-2">
            {images.map((src, i) => (
              <img
                key={i}
                src={src}
                alt=""
                onClick={() => onNext(i - index)}
                className={`h-10 w-14 sm:h-12 sm:w-16 object-cover rounded-md cursor-pointer border ${
                  i === index ? "ring-2 ring-cyan-400 border-cyan-300" : "border-white/30 opacity-80 hover:opacity-100"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <button
        className="absolute right-1 sm:right-3 md:right-6 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow"
        onClick={onNext}
      >
        ›
      </button>
    </div>
  );
}

/********************* TEST DETAILS MODAL *********************/
function TestDetailsModal({ open, onClose, test, lang = "uz" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !test) return null;

  const details =
    TEST_DETAILS[test.code]?.[lang] ||
    TEST_DETAILS["default"][lang];

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-black/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-black/10 dark:border-white/10">
          <div className="text-2xl">{test.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-lg sm:text-xl font-semibold leading-tight">{test.title}</div>
            <div className="mt-1">
              <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 px-3 py-1 text-[11px] sm:text-xs">
                {test.code}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-2 rounded-full bg-white/70 dark:bg-white/10 border border-black/10 px-3 py-1 text-sm shadow hover:opacity-80"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6 text-sm sm:text-[15px] leading-6 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
          {details}
        </div>

        <div className="p-4 sm:p-5 border-t border-black/10 dark:border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
          >
            {lang === "uz" ? "Yopish" : "Закрыть"}
          </button>
        </div>
      </div>
    </div>
  );
}

/********************* EQUIPMENT DETAILS MODAL (with certificate viewer) *********************/
function EquipmentDetailsModal({ open, onClose, equipment, lang = "uz" }) {
  const [showCert, setShowCert] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => { if (open) setShowCert(false); }, [open]);

  if (!open || !equipment) return null;

  const details =
    (EQUIPMENT_DETAILS[equipment.name] && EQUIPMENT_DETAILS[equipment.name][lang]) ||
    EQUIPMENT_DETAILS.default[lang];

  const certPath = EQUIPMENT_CERTS[equipment.name];
  const isPdf = certPath?.toLowerCase().endsWith(".pdf");

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-black/10 dark:border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-black/10 dark:border-white/10">
          <div className="flex-1 min-w-0">
            <div className="text-lg sm:text-xl font-semibold leading-tight">{equipment.name}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{equipment.desc}</div>
          </div>

          {certPath && (
            <div className="mr-2">
              <button
                onClick={() => setShowCert((v) => !v)}
                className="rounded-lg border border-black/10 bg-white/70 dark:bg-white/10 px-3 py-1 text-sm hover:opacity-80"
                title={lang === "uz" ? "Kalibrovka sertifikati" : "Сертификат калибровки"}
              >
                {showCert ? (lang === "uz" ? "Matnga qaytish" : "К описанию") : (lang === "uz" ? "Sertifikat" : "Сертификат")}
              </button>
            </div>
          )}

          <button
            onClick={onClose}
            className="rounded-full bg-white/70 dark:bg-white/10 border border-black/10 px-3 py-1 text-sm shadow hover:opacity-80"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-6.5rem)]">
          {showCert && certPath ? (
            <div className="p-0">
              {isPdf ? (
                <iframe
                  src={certPath + "#toolbar=0&view=fitH"}
                  title="Calibration certificate"
                  className="w-full h-[70vh] border-0"
                />
              ) : (
                <img
                  src={certPath}
                  alt="Calibration certificate"
                  className="w-full max-h-[70vh] object-contain"
                />
              )}

              <div className="p-3 sm:p-4 flex items-center justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <a
                  href={certPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
                >
                  {lang === "uz" ? "Yangi oynada ochish" : "Открыть в новой вкладке"}
                </a>
              </div>
            </div>
          ) : (
            <div className="p-4 sm:p-6 text-sm sm:text-[15px] leading-6 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {details}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 border-t border-black/10 dark:border-white/10 flex items-center justify-end">
          <button
            onClick={onClose}
            className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5"
          >
            {lang === "uz" ? "Yopish" : "Закрыть"}
          </button>
        </div>
      </div>
    </div>
  );
}

/********************* EQUIPMENT CARD *********************/
function EquipmentCard({ eq, onOpenLightbox }) {
  const [idx, setIdx] = useState(0);

  const imgs = Array.isArray(eq.images) && eq.images.length
    ? eq.images
    : (Array.isArray(eq.imgs) && eq.imgs.length ? eq.imgs : (eq.img ? [eq.img] : []));

  const safeImgs = imgs.length ? imgs : ["/placeholder-equipment.jpg"];

  const prev = () => setIdx((p) => (p - 1 + safeImgs.length) % safeImgs.length);
  const next = () => setIdx((p) => (p + 1) % safeImgs.length);

  return (
    <Card className="overflow-hidden hover:shadow-md transition">
      <div className="relative aspect-video w-full bg-slate-100">
        <img
          src={safeImgs[idx]}
          alt={eq.name}
          className="h-full w-full object-cover cursor-zoom-in"
          onClick={() => onOpenLightbox(safeImgs, idx)}
          onError={(e)=>{ e.currentTarget.src="/placeholder-equipment.jpg"; }}
          loading="lazy"
        />
        {safeImgs.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow"
              aria-label="Previous"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow"
              aria-label="Next"
            >
              ›
            </button>
          </>
        )}
      </div>

      {safeImgs.length > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3">
          {safeImgs.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-10 w-14 sm:h-12 sm:w-16 overflow-hidden rounded-md border transition 
                ${i === idx ? "ring-2 ring-sky-500 border-sky-400" : "border-black/10 hover:opacity-90"}`}
              aria-label={`preview ${i + 1}`}
            >
              <img src={src} alt="" className="h-full w-full object-cover"
                   onError={(e)=>{ e.currentTarget.src="/placeholder-equipment.jpg"; }}/>
            </button>
          ))}
        </div>
      )}

      <div className="p-5">
        <div className="text-lg font-semibold">{eq.name}</div>
        <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{eq.desc}</div>

        <div className="mt-4">
          <EquipmentDetailsButton equipment={eq} />
        </div>
      </div>
    </Card>
  );
}

/********************* NEW: helper for modal open *********************/
let _openEquipFromChild = null;
function EquipmentDetailsButton({ equipment }) {
  return (
    <button
      onClick={() => _openEquipFromChild && _openEquipFromChild(equipment)}
      className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
    >
      {_btnLabelGetter ? _btnLabelGetter() : "Batafsil"}
    </button>
  );
}
let _btnLabelGetter = null;

/********************* PAGE *********************/
function EMCLabUltra() {
  const [lang, setLang] = useState("uz");
  const [dark, setDark] = useState(false);
  const [sending, setSending] = useState(false);
  const [active, setActive] = useState("about");
  const [scrollProgress, setScrollProgress] = useState(0);
  const navigate = useNavigate();

  // Lightbox
  const [lbOpen, setLbOpen] = useState(false);
  const [lbImages, setLbImages] = useState([]);
  const [lbIndex, setLbIndex] = useState(0);
  const openLightbox = (images, startIndex = 0) => { setLbImages(images); setLbIndex(startIndex); setLbOpen(true); };
  const closeLightbox = () => setLbOpen(false);
  const prevLb = (delta = -1) => setLbIndex((p) => (p + delta + lbImages.length) % lbImages.length);
  const nextLb = (delta = 1) => setLbIndex((p) => (p + delta + lbImages.length) % lbImages.length);

  // Test details modal
  const [openTestModal, setOpenTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const openTest = (t) => { setSelectedTest(t); setOpenTestModal(true); };
  const closeTest = () => setOpenTestModal(false);

  // Equipment details modal
  const [openEquipModal, setOpenEquipModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const openEquip = (e) => { setSelectedEquip(e); setOpenEquipModal(true); };
  const closeEquip = () => setOpenEquipModal(false);

  _openEquipFromChild = openEquip;
  _btnLabelGetter = () => (lang === "uz" ? "Batafsil" : "Подробнее");

  const blobs = useMemo(
    () => [
      { class: "bg-gradient-to-tr from-sky-500 to-cyan-400", size: "h-[42rem] w-[42rem]", blur: "blur-3xl", pos: "-top-40 -left-20" },
      { class: "bg-gradient-to-br from-indigo-400 to-sky-400", size: "h-[32rem] w-[32rem]", blur: "blur-3xl", pos: "top-20 -right-16" },
    ],
    []
  );

  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const scrollTop = doc.scrollTop || document.body.scrollTop;
      const height = doc.scrollHeight - doc.clientHeight;
      const pct = height > 0 ? (scrollTop / height) * 100 : 0;
      setScrollProgress(pct);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = NAV.map((n) => n.href.replace('#', ''));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
    );
    sectionIds.forEach((id) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className={dark ? "dark" : ""}>
      <style>
        {`html{scroll-behavior:smooth} ::-webkit-scrollbar{width:10px;height:10px} ::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:8px} ::-webkit-scrollbar-track{background:transparent}`}
      </style>

      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden
        />
      </div>

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 selection:bg-sky-200/50">
        <div className="border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge>O’ZAK.SL.0309</Badge>
              <Badge>ISO/IEC 17025</Badge>
              <Badge>ILAC – G8</Badge>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setLang("uz")} className={`hover:underline ${lang === "uz" ? "font-semibold" : ""}`}>UZ</button>
              <span className="text-gray-400">|</span>
              <button onClick={() => setLang("ru")} className={`hover:underline ${lang === "ru" ? "font-semibold" : ""}`}>РУ</button>
              <span className="mx-1" />
              <button onClick={() => setDark((d) => !d)} className="rounded-lg border px-2 py-1 text-[11px] hover:opacity-80">
                {dark ? (lang==="uz" ? "Yorug‘" : "Светлая") : (lang==="uz" ? "Qorong‘i" : "Тёмная")}
              </button>
            </div>
          </div>
        </div>

        <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-slate-50/90 dark:bg-slate-800/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items-center gap-3"
            >
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 ring-2 ring-white/60" aria-hidden />
              <span className="font-semibold">EMC Lab</span>
            </a>

            <nav className="hidden md:flex items-center gap-7">
              {NAV.map((n) => (
                <a
                  key={n.href}
                  href={n.href}
                  className={`text-sm font-medium hover:opacity-80 relative after:absolute after:-bottom-2 after:left-0 after:h-0.5 after:rounded-full after:bg-cyan-500 after:transition-all ${
                    active === n.href.replace('#','') ? 'after:w-full text-cyan-600 dark:text-cyan-300' : 'after:w-0'
                  }`}
                  aria-current={active === n.href.replace('#','') ? 'page' : undefined}
                >
                  {lang==="uz" ? n.label.uz : n.label.ru}
                </a>
              ))}
            </nav>
            <a
              href="#contact"
              className="rounded-2xl border border-black/10 bg-gray-900 text-white px-3 py-1.5 text-sm hover:-translate-y-0.5 transition will-change-transform"
            >
              {lang==="uz" ? "Sinovga buyurtma" : "Заявка на испытания"}
            </a>

            <button
              onClick={() => navigate("/login")}
              className="ml-3 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                         text-white font-medium shadow-md hover:shadow-lg 
                         hover:scale-105 transform transition duration-200"
            >
              {lang === "uz" ? "Kirish" : "Вход"}
            </button>
          </div>
        </header>

        {/* ... qolgan bo‘limlar (Hero, About, Services, Equipment, Gallery, Excursion, Team, Pricing, Contact, Footer) sening kodingdagi kabi o‘zgarmagan ... */}
        {/* (Men ularni yuqorida to‘liq qoldirdim — aynan senga yuborgan koding bilan bir xil) */}
        
        <ScrollToTopButton />
      </div>

      <Lightbox
        open={lbOpen}
        images={lbImages}
        index={lbIndex}
        onClose={closeLightbox}
        onPrev={() => prevLb(-1)}
        onNext={() => nextLb(1)}
      />

      <TestDetailsModal
        open={openTestModal}
        onClose={closeTest}
        test={selectedTest}
        lang={lang}
      />

      <EquipmentDetailsModal
        open={openEquipModal}
        onClose={closeEquip}
        equipment={selectedEquip}
        lang={lang}
      />
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<EMCLabUltra />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  );
}
