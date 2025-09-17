import React, { useState } from "react";

// EMC Lab – Premium UI (React + Tailwind only)
// No extra deps. All images use royalty-free placeholders; swap later.

const tests = [
  { code: "IEC 61000-4-2", title: "Elektrostatik razryad (ESD)", note: "Immunitet", icon: "⚡" },
  { code: "IEC 61000-4-4", title: "Tez o‘tuvchi jarayonlar (EFT/B)", note: "Immunitet", icon: "💥" },
  { code: "IEC 61000-4-5", title: "Kuchlanish impulslari (Surge)", note: "Immunitet", icon: "🌩️" },
  { code: "IEC 61000-4-11", title: "Kuchlanish pasayishi va uzilish", note: "Immunitet", icon: "🔌" },
  { code: "IEC 61000-4-6", title: "O‘tkazuvchan RF shovqinlar", note: "Immunitet", icon: "🧲" },
  { code: "IEC 61000-4-3", title: "Nurlanuvchi RF maydon", note: "Immunitet", icon: "📡" },
  { code: "CISPR 14-1", title: "Nurlanuvchi emissiya", note: "Emissiya", icon: "📶" },
  { code: "IEC 61000-3-3", title: "Flicker / tebranish", note: "Tarmoq sifati", icon: "🕯️" },
  { code: "IEC 61000-3-2", title: "Garmonik tarkib", note: "Tarmoq sifati", icon: "🎚️" },
  { code: "CISPR 14-1", title: "IRP (conducted)", note: "Emissiya", icon: "🔊" },
];

const equipment = [
  { name: "R&S ESW8", desc: "EMI qabul qilgich / Receiver", img: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?q=80&w=1200&auto=format&fit=crop" },
  { name: "R&S ESR3", desc: "EMI qabul qilgich / Receiver", img: "https://images.unsplash.com/photo-1581091012184-7c54b00b2b91?q=80&w=1200&auto=format&fit=crop" },
  { name: "Schaffner NX5", desc: "ESD/EFT/Surge generator", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" },
  { name: "CDN M216-10", desc: "Coupling/Decoupling tarmog‘i", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop" },
];

const gallery = [
  "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1605901309584-818e25960a8b?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1581094483507-48c1af3b6c54?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1585079542156-2755d9c8c69f?q=80&w=1400&auto=format&fit=crop",
];

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-black/10 bg-white/70 px-3 py-1 text-xs font-medium shadow-sm backdrop-blur">
      {children}
    </span>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="py-16 sm:py-20" aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10">
          <h2 id={`${id}-title`} className="text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-base text-gray-600 dark:text-gray-300 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

function NavLink({ href, children }) {
  return (
    <a href={href} className="text-sm font-medium hover:opacity-80">
      {children}
    </a>
  );
}

export default function EMCLabPremium() {
  const [lang, setLang] = useState("uz");
  const [dark, setDark] = useState(false);
  const t = (uz, ru) => (lang === "uz" ? uz : ru);

  return (
    <div className={dark ? "dark" : ""}>
      <div className="min-h-screen bg-gradient-to-b from-white to-sky-50 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
        {/* Top bar */}
        <div className="border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Badge>O’ZAK.SL.0309</Badge>
              <Badge>ISO/IEC 17025</Badge>
              <Badge>ILAC – G8</Badge>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setLang("uz")} className={`hover:underline ${lang==="uz"?"font-semibold":""}`}>UZ</button>
              <span className="text-gray-400">|</span>
              <button onClick={() => setLang("ru")} className={`hover:underline ${lang==="ru"?"font-semibold":""}`}>РУ</button>
              <span className="mx-1"/>
              <button onClick={() => setDark(d=>!d)} className="rounded-lg border px-2 py-1 text-[11px] hover:opacity-80">
                {dark ? t("Yorug‘ rejim","Светлая тема") : t("Qorong‘i rejim","Тёмная тема")}
              </button>
            </div>
          </div>
        </div>

        {/* Header */}
        <header className="sticky top-0 z-40 border-b border-black/10 dark:border-white/10 bg-white/70 dark:bg-black/30 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 ring-2 ring-white/60" aria-hidden />
              <span className="font-semibold">EMC Lab</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <NavLink href="#services">{t("Xizmatlar","Услуги")}</NavLink>
              <NavLink href="#equipment">{t("Jihozlar","Оборудование")}</NavLink>
              <NavLink href="#accreditation">{t("Akkreditatsiya","Аккредитация")}</NavLink>
              <NavLink href="#gallery">{t("Galereya","Галерея")}</NavLink>
              <NavLink href="#contact">{t("Bog‘lanish","Контакты")}</NavLink>
            </nav>
            <a href="#contact" className="rounded-2xl border border-black/10 bg-gray-900 text-white px-3 py-1.5 text-sm hover:-translate-y-0.5 transition will-change-transform">
              {t("Sinovga buyurtma","Заявка на испытания")}
            </a>
          </div>
        </header>

        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 opacity-40 dark:opacity-30" aria-hidden>
            <img src="https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1800&auto=format&fit=crop" alt="lab" className="h-full w-full object-cover"/>
            <div className="absolute inset-0 bg-gradient-to-br from-white via-white/70 to-transparent dark:from-slate-950 dark:via-slate-900/60"/>
          </div>
          <div className="mx-auto max-w-7xl px-4 py-16 sm:py-24">
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400">{t("Sertifikatlangan sinovlar","Сертифицированные испытания")}</p>
                <h1 className="mt-2 text-4xl sm:text-6xl font-semibold leading-tight">
                  {t("Elektromagnit moslashuvchanlik sinovlari","Испытания по электромагнитной совместимости")}
                </h1>
                <p className="mt-4 text-gray-700 dark:text-gray-300 text-base sm:text-lg max-w-xl">
                  {t("Maishiy va sanoat qurilmalari uchun ESD, EFT/B, Surge, RF immunitet, Flicker, Garmonik va emissiya o‘lchovlari.","ESD, EFT/B, Surge, RF иммунитет, мерцание, гармоники и измерения излучаемых/проводимых помех.")}
                </p>
                <div className="mt-6 flex items-center gap-3">
                  <a href="#services" className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium hover:opacity-90 backdrop-blur">
                    {t("Xizmatlarni ko‘rish","Смотреть услуги")}
                  </a>
                  <a href="#contact" className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium shadow hover:shadow-md">
                    {t("Tizimga ariza qoldirish","Оставить заявку")}
                  </a>
                </div>
                <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-300">
                  <Badge>O‘z MSt / IEC 61000</Badge>
                  <Badge>CISPR</Badge>
                  <Badge>UzTR.389-010:2016</Badge>
                </div>
                <div className="mt-8 grid grid-cols-3 gap-6 text-center">
                  {[{v:"1200+",l:t("o‘lchov","измерений")},{v:"98%",l:t("qoniqish","удовл.")},{v:"24h",l:t("javob","ответ")}]?.map((s,i)=> (
                    <div key={i} className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-4 shadow-sm">
                      <div className="text-2xl font-semibold">{s.v}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{s.l}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-[4/3] w-full rounded-3xl border border-black/10 bg-white/70 backdrop-blur shadow-xl overflow-hidden ring-1 ring-black/5">
                  <img src="https://images.unsplash.com/photo-1508385082359-f38ae991e8f2?q=80&w=1600&auto=format&fit=crop" alt="anechoic" className="h-full w-full object-cover"/>
                </div>
                <div className="absolute -bottom-6 -right-6 hidden sm:block">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white px-5 py-3 shadow-lg">
                    <div className="text-xs">ISO/IEC 17025</div>
                    <div className="text-sm font-semibold">{t("Akkreditatsiya","Аккредитация")}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services */}
        <Section id="services" title={t("Xizmatlar va sinovlar","Услуги и испытания")} subtitle={t("IEC/CISPR talablari asosida to‘liq EMC dasturi","Полный перечень EMC-испытаний по IEC/CISPR")}> 
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.map((tst, i) => (
              <div key={i} className="group rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold flex items-center gap-2"><span className="text-xl">{tst.icon}</span>{tst.title}</h3>
                  <Badge>{tst.code}</Badge>
                </div>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{tst.note}</p>
                <a href="#contact" className="mt-4 inline-block text-sm font-medium underline decoration-sky-500 group-hover:decoration-2">
                  {t("Buyurtma berish","Заказать")}
                </a>
              </div>
            ))}
          </div>
        </Section>

        {/* Equipment */}
        <Section id="equipment" title={t("Jihozlar","Оборудование")} subtitle={t("Asosiy o‘lchash va sinov kompleksi","Основной комплекс измерений и испытаний")}> 
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipment.map((eq, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-black/10 bg-white/70 backdrop-blur shadow-sm hover:shadow-md transition">
                <div className="aspect-video w-full">
                  <img src={eq.img} alt={eq.name} className="h-full w-full object-cover"/>
                </div>
                <div className="p-5">
                  <div className="text-lg font-semibold">{eq.name}</div>
                  <div className="mt-1 text-sm text-gray-600 dark:text-gray-300">{eq.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Accreditation ribbon */}
        <div className="mx-auto max-w-7xl px-4">
          <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-sm/5 opacity-90">{t("Akkreditatsiya va doira","Аккредитация и область")}</div>
                <div className="text-xl font-semibold">O’ZAK.SL.0309 • ISO/IEC 17025</div>
              </div>
              <a href="#contact" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium hover:bg-white/20">{t("Hujjatlarni so‘rash","Запросить документы")}</a>
            </div>
          </div>
        </div>

        {/* Gallery */}
        <Section id="gallery" title={t("Galereya","Галерея")} subtitle={t("Laboratoriya, jihozlar va sinov jarayonlaridan suratlar","Фото лаборатории, оборудования и процесса испытаний")}> 
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {gallery.map((src, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-black/10 shadow-sm">
                <img src={src} alt="lab photo" className="h-56 w-full object-cover hover:scale-105 transition-transform"/>
              </div>
            ))}
          </div>
        </Section>

        {/* Pricing */}
        <Section id="pricing" title={t("Narxlar","Цены")} subtitle={t("Sinov turiga va namunaga qarab individual hisob-kitob","Индивидуальный расчет по типу испытаний и образцу")}> 
          <div className="grid md:grid-cols-3 gap-6">
            {["Basic","Standard","Premium"].map((tier,i)=> (
              <div key={i} className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-6 shadow-sm hover:shadow-md">
                <div className="text-sm uppercase tracking-wide text-gray-500">{tier}</div>
                <div className="mt-2 text-3xl font-semibold">$ —</div>
                <ul className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>• {t("1–2 sinov turidan boshlab","От 1–2 видов испытаний")}</li>
                  <li>• {t("QR-kodli protokol","Протокол с QR-кодом")}</li>
                  <li>• {t("Xulosa va tavsiyalar","Заключение и рекомендации")}</li>
                </ul>
                <a href="#contact" className="mt-5 inline-block rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">{t("Kalkulyatsiya so‘rash","Запросить расчет")}</a>
              </div>
            ))}
          </div>
        </Section>

        {/* Contact */}
        <Section id="contact" title={t("Bog‘lanish","Контакты")} subtitle={t("Ariza qoldiring – 1 ish kuni ichida javob","Оставьте заявку – ответ в течение 1 рабочего дня")}> 
          <div className="grid md:grid-cols-2 gap-8">
            <form onSubmit={(e)=>{e.preventDefault(); alert(t("Rahmat! Arizangiz qabul qilindi.", "Спасибо! Ваша заявка принята."));}} className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-6 space-y-4 shadow-sm">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{t("Ism","Имя")}</label>
                  <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder={t("Ismingiz","Ваше имя")} required/>
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="name@example.com" required/>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">{t("Telefon","Телефон")}</label>
                <input className="mt-1 w-full rounded-xl border px-3 py-2" placeholder="+998 __ ___ __ __"/>
              </div>
              <div>
                <label className="text-sm font-medium">{t("Qiziqtirgan sinov(lar)","Интересующие испытания")}</label>
                <select className="mt-1 w-full rounded-xl border px-3 py-2">
                  {tests.map((tst,i)=>(<option key={i}>{`${tst.code} – ${tst.title}`}</option>))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">{t("Xabar","Сообщение")}</label>
                <textarea className="mt-1 w-full rounded-xl border px-3 py-2 h-28" placeholder={t("Namuna turi, kuchlanish, port(lar), sinov darajalari...","Тип образца, напряжение, порты, уровни испытаний...")}></textarea>
              </div>
              <button className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90">{t("Yuborish","Отправить")}</button>
            </form>
            <div className="space-y-5">
              <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-6 shadow-sm">
                <div className="text-sm font-semibold">{t("Manzil","Адрес")}</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm">Toshkent vil., Piskent t., Lola-ariq MFY, O‘zbekiston ko‘chasi, 174-uy</div>
                <div className="mt-3 text-sm"><span className="font-medium">Telegram:</span> @EMM_Rasmiy</div>
                <div className="text-sm"><span className="font-medium">Email:</span> info@emc-lab.uz</div>
                <div className="text-sm"><span className="font-medium">Tel:</span> +998 (90) 000-00-00</div>
              </div>
              <div className="rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-6 shadow-sm">
                <div className="text-sm font-semibold">{t("Ish vaqti","График работы")}</div>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>{t("Du–Ju: 09:00–18:00","Пн–Пт: 09:00–18:00")}</li>
                  <li>{t("Sh: 10:00–16:00","Сб: 10:00–16:00")}</li>
                  <li>{t("Yak: dam olish","Вс: выходной")}</li>
                </ul>
              </div>
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="border-t border-black/10 dark:border-white/10">
          <div className="mx-auto max-w-7xl px-4 py-10 grid md:grid-cols-4 gap-8">
            <div className="space-y-2">
              <div className="text-lg font-semibold">EMC Lab</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{t("O‘z MSt/IEC/CISPR bo‘yicha sinovlar","Испытания по O‘z MSt/IEC/CISPR")}</div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">{t("Navigatsiya","Навигация")}</div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <a href="#services" className="hover:underline">{t("Xizmatlar","Услуги")}</a>
                <div/>
                <a href="#equipment" className="hover:underline">{t("Jihozlar","Оборудование")}</a>
                <div/>
                <a href="#contact" className="hover:underline">{t("Bog‘lanish","Контакты")}</a>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">Legal</div>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <div>© {new Date().getFullYear()} EMC Lab</div>
                <div>{t("Maxfiylik siyosati","Политика конфиденциальности")}</div>
              </div>
            </div>
            <div>
              <div className="text-sm font-semibold mb-3">{t("Manzil","Адрес")}</div>
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
