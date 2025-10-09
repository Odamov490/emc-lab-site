// src/pages/EMCLabUltra.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { initTheme, applyTheme } from "../utils/theme";

/********************* NAV ITEMS *********************/
const NAV = [
  { href: "#about", label: { uz: "Biz haqimizda", ru: "О нас" } },
  { href: "#services", label: { uz: "Xizmatlar", ru: "Услуги" } },
  { href: "#equipment", label: { uz: "Jihozlar", ru: "Оборудование" } },
  { href: "#gallery", label: { uz: "Galereya", ru: "Галерея" } },
  { href: "#team", label: { uz: "Jamoa", ru: "Команда" } },
  { href: "#contact", label: { uz: "Bog‘lanish", ru: "Контакты" } },
];

/********************* DEMO DATA *********************/
const TESTS = [
  { code: "O’zMSt IEC 61000.4.2-2023", title: "ESD — elektrostatik razryad", note: "Immunitet", icon: "⚡" },
  { code: "O‘z MSt IEC 61000-4-4:2023", title: "EFT/Burst — tez o‘tuvchi impulslar", note: "Immunitet", icon: "💥" },
  { code: "Oʻz MSt IEC 61000-4-5:2023", title: "Surge — kuchlanish sakrashi", note: "Immunitet", icon: "🌩️" },
];

const EQUIPMENT = [
  { name: "R&S ESW8", desc: "EMI qabul qilgich", images: ["/lab/esw8/1.jpg", "/lab/esw8/2.jpg"] },
  { name: "Ametek NX5", desc: "EFT/Surge/ESD generator", images: ["/lab/nx5/1.png", "/lab/nx5/2.png"] },
  { name: "R&S ESR3", desc: "EMI qabul qilgich", images: ["/lab/esr3/1.jpg", "/lab/esr3/2.jpg"] },
  { name: "Ametek DITO", desc: "ESD quroli", images: ["/lab/dito/1.png", "/lab/dito/2.png"] },
];

const STAFF = [
  { name: "Xakimov Aziz", role: "Laboratoriya rahbari", img: "/staff/1.png" },
  { name: "Odamov G‘ulomjon", role: "Bosh mutaxassis", img: "/staff/4.jpg" },
  { name: "Reimbayev Xushnud", role: "1-toifali mutaxassis", img: "/staff/5.png" },
  { name: "Sobirov Doston", role: "Texnik xodim", img: "/staff/9.png" },
];

const GALLERY = [
  "/gallery/1.jpg",
  "/gallery/2.jpg",
  "/gallery/3.jpg",
  "/gallery/4.jpg",
];

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
];

/********************* DETAILS *********************/
const TEST_DETAILS = {
  default: {
    uz: "Ushbu sinov bo‘yicha batafsil texnik ma’lumotlar mijoz qurilmasiga mos holda shakllantiriladi.",
    ru: "Подробные параметры испытаний формируются индивидуально под изделие клиента.",
  },
};
const EQUIPMENT_DETAILS = {
  default: {
    uz: "Jihozning asosiy ko‘rsatkichlari va qo‘llanilishi.",
    ru: "Ключевые характеристики и область применения.",
  },
};
const EQUIPMENT_CERTS = {
  "R&S ESW8": "/certs/esw8.pdf",
  "Ametek NX5": "/certs/nx5.pdf",
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
          <h2 id={`${id}-title`} className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
          {subtitle && <p className="mt-2 text-base text-gray-600 dark:text-gray-300 max-w-2xl">{subtitle}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}
function Card({ children, className = "" }) {
  return <div className={`rounded-3xl border border-black/10 bg-white/70 dark:bg-white/10 backdrop-blur shadow-sm ${className}`}>{children}</div>;
}

/********************* LIGHTBOX *********************/
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
      <button className="absolute top-4 right-4 rounded-full bg-white/90 px-3 py-1 text-sm shadow hover:bg-white" onClick={onClose}>✕</button>
      <button className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow" onClick={onPrev}>‹</button>
      <div className="w-full max-w-5xl px-2">
        <img src={images[index]} alt="" className="w-full max-h-[82vh] object-contain rounded-xl shadow-2xl" />
      </div>
      <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow" onClick={onNext}>›</button>
    </div>
  );
}

/********************* MODALS *********************/
function TestDetailsModal({ open, onClose, test, lang = "uz" }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open || !test) return null;
  const details = TEST_DETAILS[test.code]?.[lang] || TEST_DETAILS.default[lang];
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-black/10 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-black/10 dark:border-white/10">
          <div className="text-2xl">{test.icon}</div>
          <div className="flex-1 min-w-0">
            <div className="text-lg sm:text-xl font-semibold leading-tight">{test.title}</div>
            <div className="mt-1"><span className="inline-flex items-center rounded-full bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200 px-3 py-1 text-[11px] sm:text-xs">{test.code}</span></div>
          </div>
          <button onClick={onClose} className="ml-2 rounded-full bg-white/70 dark:bg-white/10 border border-black/10 px-3 py-1 text-sm shadow hover:opacity-80">✕</button>
        </div>
        <div className="p-4 sm:p-6 text-sm sm:text-[15px] leading-6 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">{details}</div>
        <div className="p-4 sm:p-5 border-t border-black/10 dark:border-white/10 flex items-center justify-end">
          <button onClick={onClose} className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5">{lang === "uz" ? "Yopish" : "Закрыть"}</button>
        </div>
      </div>
    </div>
  );
}

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
  const details = (EQUIPMENT_DETAILS[equipment.name] && EQUIPMENT_DETAILS[equipment.name][lang]) || EQUIPMENT_DETAILS.default[lang];
  const certPath = EQUIPMENT_CERTS[equipment.name];
  const isPdf = certPath?.toLowerCase().endsWith(".pdf");

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3" onClick={onClose}>
      <div className="w-full max-w-3xl max-h-[85vh] overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-black/10 dark:border-white/10" onClick={(e) => e.stopPropagation()}>
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
          <button onClick={onClose} className="rounded-full bg-white/70 dark:bg-white/10 border border-black/10 px-3 py-1 text-sm shadow hover:opacity-80">✕</button>
        </div>

        <div className="overflow-y-auto max-h-[calc(85vh-6.5rem)]">
          {showCert && certPath ? (
            <div className="p-0">
              {isPdf ? (
                <iframe src={certPath + "#toolbar=0&view=fitH"} title="Calibration certificate" className="w-full h-[70vh] border-0" />
              ) : (
                <img src={certPath} alt="Calibration certificate" className="w-full max-h-[70vh] object-contain" />
              )}
              <div className="p-3 sm:p-4 flex items-center justify-end gap-3 border-t border-black/10 dark:border-white/10">
                <a href={certPath} target="_blank" rel="noopener noreferrer" className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5">
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
          <button onClick={onClose} className="rounded-xl border border-black/10 px-3 py-2 text-sm hover:bg-black/5">
            {lang === "uz" ? "Yopish" : "Закрыть"}
          </button>
        </div>
      </div>
    </div>
  );
}

/********************* EQUIPMENT CARD *********************/
let _openEquipFromChild = null;
let _btnLabelGetter = null;
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
function EquipmentCard({ eq, onOpenLightbox }) {
  const [idx, setIdx] = useState(0);
  const imgs = Array.isArray(eq.images) && eq.images.length ? eq.images : (eq.img ? [eq.img] : []);
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
            <button type="button" onClick={prev} className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow" aria-label="Previous">‹</button>
            <button type="button" onClick={next} className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 hover:bg-white p-2 shadow" aria-label="Next">›</button>
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
              <img src={src} alt="" className="h-full w-full object-cover" onError={(e)=>{ e.currentTarget.src="/placeholder-equipment.jpg"; }}/>
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

/********************* PAGE *********************/
export default function EMCLabUltra() {
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
  const prevLb = () => setLbIndex((p) => (p - 1 + lbImages.length) % lbImages.length);
  const nextLb = () => setLbIndex((p) => (p + 1) % lbImages.length);

  // Test modal
  const [openTestModal, setOpenTestModal] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const openTest = (t) => { setSelectedTest(t); setOpenTestModal(true); };
  const closeTest = () => setOpenTestModal(false);

  // Equipment modal
  const [openEquipModal, setOpenEquipModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const openEquip = (e) => { setSelectedEquip(e); setOpenEquipModal(true); };
  const closeEquip = () => setOpenEquipModal(false);

  // expose to small child button
  _openEquipFromChild = openEquip;
  _btnLabelGetter = () => (lang === "uz" ? "Batafsil" : "Подробнее");

  // Theme init
  useEffect(() => {
    const initial = initTheme();
    setDark(initial);
  }, []);
  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    applyTheme(next);
  };

  // progress bar
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

  // scrollspy
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

  // hash anchor
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // deco blobs
  const blobs = useMemo(
    () => [
      { class: "bg-gradient-to-tr from-sky-500 to-cyan-400", size: "h-[42rem] w-[42rem]", blur: "blur-3xl", pos: "-top-40 -left-20" },
      { class: "bg-gradient-to-br from-indigo-400 to-sky-400", size: "h-[32rem] w-[32rem]", blur: "blur-3xl", pos: "top-20 -right-16" },
    ],
    []
  );

  return (
    <div className={dark ? "dark" : ""}>
      {/* global styles */}
      <style>
        {`html{scroll-behavior:smooth} ::-webkit-scrollbar{width:10px;height:10px} ::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:8px} ::-webkit-scrollbar-track{background:transparent}`}
      </style>

      {/* progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
        <div className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-[width] duration-150" style={{ width: `${scrollProgress}%` }} aria-hidden />
      </div>

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 selection:bg-sky-200/50">
        {/* TOP BAR */}
        <div className="border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge>O’ZAK.SL.0309</Badge>
              <Badge>ISO/IEC 17025</Badge>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setLang("uz")} className={`hover:underline ${lang === "uz" ? "font-semibold" : ""}`}>UZ</button>
              <span className="text-gray-400">|</span>
              <button onClick={() => setLang("ru")} className={`hover:underline ${lang === "ru" ? "font-semibold" : ""}`}>РУ</button>
              <span className="mx-1" />
              <button
                onClick={toggleTheme}
                className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${dark ? "bg-gray-700" : "bg-yellow-400"}`}
                aria-label={dark ? "Yorug‘ rejim" : "Qorong‘i rejim"}
                title={dark ? (lang==="uz" ? "Yorug‘ rejim" : "Светлая тема") : (lang==="uz" ? "Qorong‘i rejim" : "Тёмная тема")}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transform transition-transform duration-300 flex items-center justify-center ${
                    dark ? "translate-x-7" : "translate-x-0"
                  }`}
                >
                  <span className={dark ? "text-gray-800" : "text-yellow-500"}>{dark ? "🌙" : "☀️"}</span>
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* NAV */}
        <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-slate-50/90 dark:bg-slate-800/50 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <a
              href="#top"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
              className="flex items_center gap-3"
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

            <div className="flex items-center gap-2">
              <a
                href="#contact"
                className="rounded-2xl border border-black/10 bg-gray-900 text-white px-3 py-1.5 text-sm hover:-translate-y-0.5 transition will-change-transform"
              >
                {lang==="uz" ? "Sinovga buyurtma" : "Заявка на испытания"}
              </a>
              <button
                onClick={() => navigate("/login")}
                className="ml-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-md hover:shadow-lg hover:scale-105 transform transition duration-200"
              >
                {lang === "uz" ? "Kirish" : "Вход"}
              </button>
            </div>
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden" id="top">
          <div className="absolute inset-0 -z-10" aria-hidden>
            {blobs.map((b, i) => (
              <div key={i} className={`pointer-events-none absolute ${b.pos} ${b.size} ${b.blur} opacity-40 dark:opacity-30 rounded-full ${b.class}`} />
            ))}
          </div>

          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
            <div className="grid md:grid-cols-2 gap-10 sm:gap-12 items-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">
                  {lang==="uz" ? "Sertifikatlangan sinovlar" : "Сертифицированные испытания"}
                </p>
                <h1 className="mt-2 text-3xl sm:text-5xl md:text-6xl font-semibold tracking-tight">
                  {lang==="uz" ? "Elektromagnit moslashuvchanlik" : "Электромагнитная совместимость"}
                </h1>
                <p className="mt-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg max-w-xl">
                  {lang==="uz"
                    ? "ESD, EFT/B, Surge, RF immunitet, Flicker, Garmonik va emissiya o‘lchovlari. ISO/IEC 17025 akkreditatsiya doirasida."
                    : "ESD, EFT/B, Surge, RF иммунитет, мерцание, гармоники и измерения помех. В рамках аккредитации ISO/IEC 17025."}
                </p>
                <div className="mt-6 flex flex-col xs:flex-row sm:flex-row items-start sm:items-center gap-3">
                  <a href="#services" className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium hover:opacity-90 backdrop-blur">
                    {lang==="uz" ? "Xizmatlarni ko‘rish" : "Смотреть услуги"}
                  </a>
                  <a href="#contact" className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium shadow hover:shadow-md">
                    {lang==="uz" ? "Ariza qoldirish" : "Оставить заявку"}
                  </a>
                </div>
              </div>

              <div className="relative">
                <Card className="aspect_[4/3] overflow-hidden shadow-xl ring-1 ring-black/5">
                  <img src="/hero/anechoic.jpg" alt="anechoic" className="h-full w-full object-cover md:scale-105" />
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <Section
          id="about"
          title={lang==="uz" ? "Biz haqimizda" : "О нас"}
          subtitle={lang==="uz"
            ? "ISO/IEC 17025 doirasida akkreditatsiyadan o‘tgan EMC laboratoriyasi (O’ZAK.SL.0309). 2021-yildan buyon EMC sinovlari."
            : "EMC-лаборатория, аккредитованная по ISO/IEC 17025 (О’ЗАК.SL.0309). С 2021 года выполняем EMC-испытания."}
        >
          <div className="rounded-3xl bg-gradient-to-r from-sky-700 to-cyan-600 text-white shadow-lg p-6 sm:p-8 space-y-6">
            <p className="opacity-95">
              {lang==="uz"
                ? "Qurilmalaringizning emissiya va immunitet ko‘rsatkichlarini IEC/CISPR talablariga muvofiq tekshiramiz."
                : "Проверяем уровни эмиссии и устойчивости по IEC/CISPR для ваших устройств."}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-white/10"><div className="font-semibold">{lang==="uz" ? "Afzalliklar" : "Преимущества"}</div><div className="text-sm opacity-90">ISO/IEC 17025 • Xalqaro dasturlar</div></Card>
              <Card className="p-4 bg-white/10"><div className="font-semibold">{lang==="uz" ? "Nima tekshiramiz" : "Что проверяем"}</div><div className="text-sm opacity-90">Emissiya • Immunitet</div></Card>
              <Card className="p-4 bg-white/10"><div className="font-semibold">{lang==="uz" ? "Natija" : "Результат"}</div><div className="text-sm opacity-90">Protokol va xulosa</div></Card>
            </div>
          </div>
        </Section>

        {/* SERVICES */}
        <Section id="services" title={lang === "uz" ? "Xizmatlar va sinovlar" : "Услуги и испытания"} subtitle={lang === "uz" ? "IEC/CISPR talablari asosida to‘liq EMC dasturi" : "Полный перечень EMC-испытаний по IEC/CISPR"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {TESTS.map((t, i) => (
              <Card key={i} className="p-6 hover:shadow-lg transition bg-gradient-to-r from-sky-700 to-cyan-600 text-white">
                <div className="flex items-start gap-2">
                  <div className="text-xl">{t.icon}</div>
                  <div className="flex-1">
                    <div className="font-semibold">{t.title}</div>
                    <div className="text-white/90 text-sm">{t.note}</div>
                    <div className="mt-2 inline-flex items-center rounded-full bg-white text-gray-900 px-3 py-1 text-xs shadow">{t.code}</div>
                  </div>
                </div>
                <div className="mt-4">
                  <button onClick={() => openTest(t)} className="rounded-xl bg-white text-gray-900 px-3 py-1.5 text-sm font-medium shadow hover:opacity-90">
                    {lang === "uz" ? "Batafsil" : "Подробнее"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* EQUIPMENT */}
        <Section id="equipment" title={lang==="uz" ? "Jihozlar" : "Оборудование"} subtitle={lang==="uz" ? "Asosiy o‘lchash va sinov kompleksi" : "Основной комплекс измерений и испытаний"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {EQUIPMENT.map((eq, i) => (
              <EquipmentCard key={i} eq={eq} onOpenLightbox={openLightbox} />
            ))}
          </div>
        </Section>

        {/* GALLERY */}
        <Section id="gallery" title={lang==="uz" ? "Galereya" : "Галерея"} subtitle={lang==="uz" ? "Laboratoriya, jihozlar va sinov jarayonlaridan suratlar" : "Фото лаборатории, оборудования и процесса испытаний"} bleed>
          <div className="px-4 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {GALLERY.map((src, i) => (
              <Card key={i}>
                <img
                  src={src}
                  alt="lab photo"
                  className="w-full h-auto aspect_[4/3] object-cover hover:scale-[1.02] transition-transform rounded-3xl cursor-zoom-in"
                  onClick={() => openLightbox(GALLERY, i)}
                />
              </Card>
            ))}
          </div>
        </Section>

        {/* TEAM */}
        <Section id="team" title={lang==="uz" ? "Bizning jamoa" : "Наша команда"} subtitle={lang==="uz" ? "Tajriba va mas'uliyat" : "Опыт и ответственность"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STAFF.map((p, i) => (
              <Card key={i} className="p-5 text-center">
                <img src={p.img} alt={p.name} className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full object-cover border" onError={(e)=>{ e.currentTarget.src="/placeholder-avatar.jpg"; }} />
                <div className="mt-3 text-lg font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{p.role}</div>
              </Card>
            ))}
          </div>
        </Section>

        {/* CONTACT */}
        <Section
          id="contact"
          title={lang==="uz" ? "Bog‘lanish" : "Контакты"}
          subtitle={lang==="uz" ? "Ariza qoldiring – 1 ish kuni ichida javob" : "Оставьте заявку – ответ в течение 1 рабочего дня"}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-6 space-y-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = {
                    name: fd.get("name"),
                    email: fd.get("email"),
                    phone: fd.get("phone"),
                    message: fd.get("message"),
                  };
                  try {
                    setSending(true);
                    const resp = await fetch("/api/contact", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload),
                    });
                    setSending(false);
                    if (resp.ok) {
                      alert(lang==="uz" ? "Rahmat! Arizangiz qabul qilindi." : "Спасибо! Ваша заявка принята.");
                      e.currentTarget.reset();
                    } else {
                      alert(lang==="uz" ? "Uzr, yuborishda xatolik bo‘ldi." : "Ошибка при отправке.");
                    }
                  } catch {
                    setSending(false);
                    alert(lang==="uz" ? "Tarmoq xatosi. Keyinroq urinib ko‘ring." : "Сетевая ошибка. Попробуйте позже.");
                  }
                }}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{lang==="uz" ? "Ism" : "Имя"}</label>
                    <input name="name" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder={lang==="uz" ? "Ismingiz" : "Ваше имя"} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input name="email" type="email" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="name@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{lang==="uz" ? "Telefon" : "Телефон"}</label>
                  <input name="phone" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="+998 __ ___ __ __" />
                </div>
                <div>
                  <label className="text-sm font-medium">{lang==="uz" ? "Xabar" : "Сообщение"}</label>
                  <textarea name="message" className="mt-1 w-full rounded-xl border px-3 py-2 h-28" placeholder={lang==="uz" ? "Savolingizni yozing..." : "Напишите ваш вопрос..."}></textarea>
                </div>
                <button disabled={sending} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                  {sending ? (lang==="uz" ? "Yuborilmoqda..." : "Отправляется...") : (lang==="uz" ? "Yuborish" : "Отправить")}
                </button>
              </form>
            </Card>

            <div className="space-y-5">
              <Card className="p-6">
                <div className="text-sm font-semibold">{lang==="uz" ? "Manzil" : "Адрес"}</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm">Toshkent vil., Piskent t., O‘zbekiston ko‘chasi, 174-uy</div>
                <div className="mt-3 text-sm"><span className="font-medium">Telegram:</span> @EMM_Rasmiy</div>
                <div className="text-sm"><span className="font-medium">Email:</span> info@emc-lab.uz</div>
                <div className="text-sm"><span className="font-medium">Tel:</span> +998 (90) 000-00-00</div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold">{lang==="uz" ? "Hujjatlar va lokatsiya" : "Документы и локация"}</div>
                <div className="mt-3 space-y-3">
                  {QUICK_LINKS.map((item, i) => (
                    <a key={i} href={item.href} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 backdrop-blur px-4 py-3 text-sm hover:shadow">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span>{lang==="uz" ? item.labelUz : item.labelRu}</span>
                      </div>
                      <span className="text-xs opacity-60">↗</span>
                    </a>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </Section>

        {/* FOOTER */}
        <footer className="bg-gradient-to-r from-sky-700 to-cyan-600">
          <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8 text-white">
            <div className="space-y-2">
              <div className="text-lg font-semibold">EMC Lab</div>
              <div className="text-sm opacity-80">{lang==="uz" ? "O‘z MSt/IEC/CISPR bo‘yicha sinovlar" : "Испытания по O‘z MSt/IEC/CISPR"}</div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">{lang==="uz" ? "Navigatsiya" : "Навигация"}</div>
              <div className="space-y-2 text-sm">
                {NAV.map((n) => (
                  <div key={n.href}>
                    <a href={n.href} className={`hover:text-cyan-300 transition-colors ${active === n.href.replace('#','') ? 'font-semibold underline' : ''}`}>
                      {lang==="uz" ? n.label.uz : n.label.ru}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Legal</div>
              <div className="space-y-2 text-sm">
                <div>© {new Date().getFullYear()} EMC Lab</div>
                <div className="hover:text-cyan-300 transition-colors cursor-pointer">{lang==="uz" ? "Maxfiylik siyosati" : "Политика конфиденциальности"}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">{lang==="uz" ? "Manzil" : "Адрес"}</div>
              <div className="space-y-1 text-sm opacity-80">
                <div>Toshkent vil., Piskent t.</div>
                <div>O‘zbekiston ko‘chasi, 174-uy</div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* LIGHTBOX */}
      <Lightbox open={lbOpen} images={lbImages} index={lbIndex} onClose={closeLightbox} onPrev={prevLb} onNext={nextLb} />

      {/* MODALS */}
      <TestDetailsModal open={openTestModal} onClose={closeTest} test={selectedTest} lang={lang} />
      <EquipmentDetailsModal open={openEquipModal} onClose={closeEquip} equipment={selectedEquip} lang={lang} />
    </div>
  );
}
