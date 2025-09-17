import React, { useMemo, useState } from "react";

/********************* CONFIG *********************/
const NAV = [
  { href: "#services", label: { uz: "Xizmatlar", ru: "Услуги" } },
  { href: "#equipment", label: { uz: "Jihozlar", ru: "Оборудование" } },
  { href: "#team", label: { uz: "Jamoa", ru: "Команда" } },
  { href: "#accreditation", label: { uz: "Akkreditatsiya", ru: "Аккредитация" } },
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
  { name: "R&S ESW8", desc: "EMI qabul qilgich / Receiver", img: "/lab/receiver.jpg" },
  { name: "R&S ESR3", desc: "EMI qabul qilgich / Receiver", img: "/lab/receiver2.jpg" },
  { name: "Schaffner NX5", desc: "ESD/EFT/Surge generator", img: "/lab/nx5.jpg" },
  { name: "CDN M216-10", desc: "Coupling/Decoupling tarmog‘i", img: "/lab/cdn.jpg" },
];

// 11 xodim (rasmlarni public/staff/ ichiga joylang)
const STAFF = [
  { name: "Xakimov Aziz", role: "Laboratoriya rahbari", img: "/staff/1.jpg" },
  { name: "Tillayev Anvar", role: "Boshliq o'rinbosari", img: "/staff/2.jpg" },
  { name: "Abdurashidov Davron", role: "Sektor boshlig'i", img: "/staff/3.jpg" },
  { name: "Odamov G‘ulomjon", role: "Bosh mutaxassis", img: "/staff/4.jpg" },
  { name: "Reimbayev Xushnud", role: "1-toifali mutaxassis", img: "/staff/5.jpg" },
  { name: "Alekseyev Andrey", role: "1-toifali mutaxassis", img: "/staff/6.jpg" },
  { name: "Abduvohobov Ravshan", role: "2-toifali mutaxassis", img: "/staff/7.jpg" },
  { name: "Joldasbaev Dastanbek", role: "2-toifali mutaxassis", img: "/staff/8.jpg" },
  { name: "Sobirov Doston", role: "Texnik xodim", img: "/staff/9.jpg" },
  { name: "Karimov Suxrob", role: "Texnik xodim", img: "/staff/10.jpg" },
  { name: "Sharofiddinov Najmiddin", role: "Texnik xodim", img: "/staff/11.jpg" },
];

const GALLERY = [
  "/gallery/1.jpg",
  "/gallery/2.jpg",
  "/gallery/3.jpg",
  "/gallery/4.jpg",
  "/gallery/5.jpg",
  "/gallery/6.jpg",
];

// QUICK LINKS – kontakt bo‘limining o‘ng panelida kartalar ko‘rinishida chiqadi
const QUICK_LINKS = [
  {
    labelUz: "Lokatsiya",
    labelRu: "Локация",
    icon: "📍",
    href:
      "https://yandex.uz/maps/?ll=69.414936%2C40.909279&mode=poi&poi%5Bpoint%5D=69.417748%2C40.913482&poi%5Buri%5D=ymapsbm1%3A%2F%2Forg%3Foid%3D118326433128&z=14",
  },
  {
    labelUz: "Akkreditatsiya guvohnomasi",
    labelRu: "Свидетельство об аккредитации",
    icon: "📄",
    href:
      "https://akkred.uz:8081/media/file/pdf/2023-06/01583495-c2c7-4483-b0b4-2ffbb80ef177.pdf#toolbar=0",
  },
  {
    labelUz: "Akkreditatsiya doirasi",
    labelRu: "Область аккредитации",
    icon: "📄",
    href:
      "https://akkred.uz:8081/media/file/pdf/2023-06/e9f59504-1802-4f3f-b7de-e44908444f73.pdf#toolbar=0",
  },
];


const [sending, setSending] = useState(false);

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
    <section id={id} className={`py-16 sm:py-24 ${bleed ? "px-0" : ""}`} aria-labelledby={`${id}-title`}>
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

/********************* PAGE *********************/
export default function EMCLabUltra() {
  const [lang, setLang] = useState("uz");
  const [dark, setDark] = useState(false);
  const t = (uz, ru) => (lang === "uz" ? uz : ru);

  // Parallax-like blobs (dekor)
  const blobs = useMemo(
    () => [
      { class: "bg-gradient-to-tr from-sky-500 to-cyan-400", size: "h-[42rem] w-[42rem]", blur: "blur-3xl", pos: "-top-40 -left-20" },
      { class: "bg-gradient-to-br from-indigo-400 to-sky-400", size: "h-[32rem] w-[32rem]", blur: "blur-3xl", pos: "top-20 -right-16" },
    ],
    []
  );

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 selection:bg-sky-200/50">
        {/* TOP BAR */}
        <div className="border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge>O’ZAK.SL.0309</Badge>
              <Badge>ISO/IEC 17025</Badge>
              <Badge>ILAC – G8</Badge>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => setLang("uz")} className={`hover:underline ${lang === "uz" ? "font-semibold" : ""}`}>
                UZ
              </button>
              <span className="text-gray-400">|</span>
              <button onClick={() => setLang("ru")} className={`hover:underline ${lang === "ru" ? "font-semibold" : ""}`}>
                РУ
              </button>
              <span className="mx-1" />
              <button onClick={() => setDark((d) => !d)} className="rounded-lg border px-2 py-1 text-[11px] hover:opacity-80">
                {dark ? t("Yorug‘", "Светлая") : t("Qorong‘i", "Тёмная")}
              </button>
            </div>
          </div>
        </div>

        {/* NAV */}
        <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 ring-2 ring-white/60" aria-hidden />
              <span className="font-semibold">EMC Lab</span>
            </div>
            <nav className="hidden md:flex items-center gap-7">
              {NAV.map((n) => (
                <a key={n.href} href={n.href} className="text-sm font-medium hover:opacity-80">
                  {t(n.label.uz, n.label.ru)}
                </a>
              ))}
            </nav>
            <a href="#contact" className="rounded-2xl border border-black/10 bg-gray-900 text-white px-3 py-1.5 text-sm hover:-translate-y-0.5 transition will-change-transform">
              {t("Sinovga buyurtma", "Заявка на испытания")}
            </a>
          </div>
        </header>

        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10" aria-hidden>
            {blobs.map((b, i) => (
              <div key={i} className={`pointer-events-none absolute ${b.pos} ${b.size} ${b.blur} opacity-40 dark:opacity-30 rounded-full ${b.class}`} />
            ))}
          </div>
          <div className="mx-auto max-w-7xl px-4 py-20 sm:py-28">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">{t("Sertifikatlangan sinovlar", "Сертифицированные испытания")}</p>
                <h1 className="mt-2 text-5xl sm:text-6xl font-semibold tracking-tight">{t("Elektromagnit moslashuvchanlik", "Электромагнитная совместимость")}</h1>
                <p className="mt-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg max-w-xl">
                  {t(
                    "ESD, EFT/B, Surge, RF immunitet, Flicker, Garmonik va emissiya o‘lchovlari. ISO/IEC 17025 akkreditatsiya doirasida.",
                    "ESD, EFT/B, Surge, RF иммунитет, мерцание, гармоники и измерения помех. В рамках аккредитации ISO/IEC 17025."
                  )}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <a href="#services" className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium hover:opacity-90 backdrop-blur">
                    {t("Xizmatlarni ko‘rish", "Смотреть услуги")}
                  </a>
                  <a href="#contact" className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium shadow hover:shadow-md">
                    {t("Ariza qoldirish", "Оставить заявку")}
                  </a>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                  {[{ v: "1200+", l: t("o‘lchov", "измерений") }, { v: "98%", l: t("qoniqish", "удовл.") }, { v: "24h", l: t("javob", "ответ") }].map((s, i) => (
                    <Card key={i} className="p-4">
                      <div className="text-2xl font-semibold">{s.v}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{s.l}</div>
                    </Card>
                  ))}
                </div>
              </div>
              <div className="relative">
                <Card className="aspect-[4/3] overflow-hidden shadow-xl ring-1 ring-black/5">
                  <img src="/hero/anechoic.jpg" alt="anechoic" className="h-full w-full object-cover scale-105" />
                </Card>
                <div className="absolute -bottom-6 -right-6 hidden sm:block">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white px-5 py-3 shadow-lg">
                    <div className="text-xs">ISO/IEC 17025</div>
                    <div className="text-sm font-semibold">{t("Akkreditatsiya", "Аккредитация")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES */}
        <Section id="services" title={t("Xizmatlar va sinovlar", "Услуги и испытания")} subtitle={t("IEC/CISPR talablari asosida to‘liq EMC dasturi", "Полный перечень EMC-испытаний по IEC/CISPR")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTS.map((tst, i) => (
              <Card key={i} className="group p-6 hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold flex items-center gap-2">
                    <span className="text-xl">{tst.icon}</span>
                    {tst.title}
                  </h3>
                  <Badge>{tst.code}</Badge>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300">{tst.note}</p>
                <a href="#contact" className="mt-4 inline-block text-sm font-medium underline decoration-sky-500 group-hover:decoration-2">
                  {t("Buyurtma berish", "Заказать")}
                </a>
              </Card>
            ))}
          </div>
        </Section>

        {/* EQUIPMENT */}
        <Section id="equipment" title={t("Jihozlar", "Оборудование")} subtitle={t("Asosiy o‘lchash va sinov kompleksi", "Основной комплекс измерений и испытаний")}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {EQUIPMENT.map((eq, i) => (
              <Card key={i} className="overflow-hidden hover:shadow-md transition">
                <div className="aspect-video w-full">
                  <img src={eq.img} alt={eq.name} className="h-full w-full object-cover" />
                </div>
                <div className="p-5">
                  <div className="text-lg font-semibold">{eq.name}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{eq.desc}</div>
                </div>
              </Card>
            ))}
          </div>
        </Section>

        {/* ACCREDITATION CTA */}
        <div id="accreditation" className="mx-auto max-w-7xl px-4">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-sm/5 opacity-90">{t("Akkreditatsiya va doira", "Аккредитация и область")}</div>
                <div className="text-xl font-semibold">O’ZAK.SL.0309 • ISO/IEC 17025</div>
              </div>
              {/* Endi tugma kontakt bo‘limiga olib boradi, u yerda Quick Links kartalari bor */}
              <a href="#contact" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/20">
                {t("Hujjatlarni ko‘rish", "Просмотреть документы")}
              </a>
            </div>
          </div>
        </div>

        {/* GALLERY */}
        <Section id="gallery" title={t("Galereya", "Галерея")} subtitle={t("Laboratoriya, jihozlar va sinov jarayonlaridan suratlar", "Фото лаборатории, оборудования и процесса испытаний")} bleed>
          <div className="px-4 max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY.map((src, i) => (
              <Card key={i}>
                <img src={src} alt="lab photo" className="h-56 w-full object-cover hover:scale-105 transition-transform rounded-3xl" />
              </Card>
            ))}
          </div>
        </Section>

        {/* TEAM */}
        <Section id="team" title={t("Bizning jamoa", "Наша команда")} subtitle={t("11 nafar tajribali mutaxassis", "11 опытных специалистов")}>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {STAFF.map((p, i) => (
              <Card key={i} className="p-5 text-center">
                <img src={p.img} alt={p.name} className="w-24 h-24 mx-auto rounded-full object-cover border" />
                <div className="mt-3 text-lg font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{p.role}</div>
              </Card>
            ))}
          </div>
        </Section>

        {/* PRICING */}
        <Section id="pricing" title={t("Narxlar", "Цены")} subtitle={t("Individual kalkulyatsiya", "Индивидуальный расчет")}>
          <div className="grid md:grid-cols-3 gap-6">
            {["Basic", "Standard", "Premium"].map((tier, i) => (
              <Card key={i} className="p-6 hover:shadow-md">
                <div className="text-sm uppercase tracking-wide text-gray-500">{tier}</div>
                <div className="mt-2 text-3xl font-semibold">$ —</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• {t("1–2 sinov turidan boshlab", "От 1–2 видов испытаний")}</li>
                  <li>• {t("QR-kodli protokol", "Протокол с QR-кодом")}</li>
                  <li>• {t("Xulosa va tavsiyalar", "Заключение и рекомендации")}</li>
                </ul>
                <a href="#contact" className="mt-5 inline-block rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                  {t("Kalkulyatsiya so‘rash", "Запросить расчет")}
                </a>
              </Card>
            ))}
          </div>
        </Section>

        {/* CONTACT */}
        <Section
          id="contact"
          title={t("Bog‘lanish", "Контакты")}
          subtitle={t("Ariza qoldiring – 1 ish kuni ichida javob", "Оставьте заявку – ответ в течение 1 рабочего дня")}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chap — forma */}
            <Card className="p-6 space-y-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  alert(t("Rahmat! Arizangiz qabul qilindi.", "Спасибо! Ваша заявка принята."));
                }}
                className="space-y-4"
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">{t("Ism", "Имя")}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder={t("Ismingiz", "Ваше имя")} required />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Email</label>
                    <input type="email" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="name@example.com" required />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">{t("Telefon", "Телефон")}</label>
                  <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="+998 __ ___ __ __" />
                </div>
                <div>
                  <label className="text-sm font-medium">{t("Qiziqtirgan sinov(lar)", "Интересующие испытания")}</label>
                  <select className="mt-1 w-full rounded-xl border px-3 py-2">
                    {TESTS.map((tst, i) => (
                      <option key={i}>{`${tst.code} – ${tst.title}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{t("Xabar", "Сообщение")}</label>
                  <textarea
                    className="mt-1 w-full rounded-xl border px-3 py-2 h-28"
                    placeholder={t("Namuna turi, kuchlanish, port(lar), sinov darajalari...", "Тип образца, напряжение, порты, уровни испытаний...")}
                  ></textarea>
                </div>
                <button className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                  {t("Yuborish", "Отправить")}
                </button>
              </form>
            </Card>

            {/* O‘ng — ma’lumotlar + QUICK LINKS kartalari */}
            <div className="space-y-5">
              <Card className="p-6">
                <div className="text-sm font-semibold">{t("Manzil", "Адрес")}</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm">Toshkent vil., Piskent t., Lola-ariq MFY, O‘zbekiston ko‘chasi, 174-uy</div>
                <div className="mt-3 text-sm">
                  <span className="font-medium">Telegram:</span> @EMM_Rasmiy
                </div>
                <div className="text-sm">
                  <span className="font-medium">Email:</span> info@emc-lab.uz
                </div>
                <div className="text-sm">
                  <span className="font-medium">Tel:</span> +998 (90) 000-00-00
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold">{t("Ish vaqti", "График работы")}</div>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>{t("Du–Ju: 09:00–18:00", "Пн–Пт: 09:00–18:00")}</li>
                  <li>{t("Sh: 10:00–16:00", "Сб: 10:00–16:00")}</li>
                  <li>{t("Yak: dam olish", "Вс: выходной")}</li>
                </ul>
              </Card>

              {/* QUICK LINKS – kartalar */}
              <Card className="p-4">
                <div className="text-sm font-semibold mb-3">{t("Hujjatlar va lokatsiya", "Документы и локация")}</div>
                <div className="space-y-3">
                  {QUICK_LINKS.map((item, i) => (
                    <a
                      key={i}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-xl border border-black/10 bg-white/70 backdrop-blur px-4 py-3 text-sm hover:shadow"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.icon}</span>
                        <span>{t(item.labelUz, item.labelRu)}</span>
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
        <footer className="border-t border-black/10 dark:border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-lg font-semibold">EMC Lab</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t("O‘z MSt/IEC/CISPR bo‘yicha sinovlar", "Испытания по O‘z MSt/IEC/CISPR")}</div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">{t("Navigatsiya", "Навигация")}</div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                {NAV.map((n) => (
                  <div key={n.href}>
                    <a href={n.href} className="hover:underline">
                      {t(n.label.uz, n.label.ru)}
                    </a>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Legal</div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div>© {new Date().getFullYear()} EMC Lab</div>
                <div>{t("Maxfiylik siyosati", "Политика конфиденциальности")}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">{t("Manzil", "Адрес")}</div>
              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                <div>Toshkent vil., Piskent t.</div>
                <div>O‘zbekiston ko‘chasi, 174-uy</div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
