import React, { useState } from "react";

const tests = [
  { code: "IEC 61000-4-2", title: "Elektrostatik razryad (ESD)", note: "Immunitet sinovi" },
  { code: "IEC 61000-4-4", title: "Tez o‘tuvchi jarayonlar (EFT/B)", note: "Immunitet sinovi" },
  { code: "IEC 61000-4-5", title: "Kuchlanish impulslari (Surge)", note: "Immunitet sinovi" },
  { code: "IEC 61000-4-11", title: "Kuchlanish pasayishi va uzilishi", note: "Immunitet sinovi" },
  { code: "IEC 61000-4-6", title: "O‘tkazuvchan RF shovqinlar", note: "Immunitet sinovi" },
  { code: "IEC 61000-4-3", title: "Nurlanuvchi RF maydon", note: "Immunitet sinovi" },
  { code: "CISPR 14-1", title: "Nurlanuvchi emissiya (dBµV/m)", note: "Emissiya sinovi" },
  { code: "IEC 61000-3-3", title: "Flicker va kuchlanish tebranishi", note: "Tarmoq sifati" },
  { code: "IEC 61000-3-2", title: "Garmonik tarkibiy qismlar", note: "Tarmoq sifati" },
  { code: "CISPR 14-1", title: "IRP kuchlanishi (Line conducted)", note: "Emissiya sinovi" },
];

const equipment = [
  { name: "R&S ESW8", desc: "EMI qabul qilgich / Receiver" },
  { name: "R&S ESR3", desc: "EMI qabul qilgich / Receiver" },
  { name: "Schaffner NX5", desc: "Universal ESD/EFT/Surge generator" },
  { name: "Teseq DITO", desc: "EFT/B generator" },
  { name: "SMB100B", desc: "RF signal generator" },
  { name: "HL562E", desc: "Bikonik + Log-Periodic antennasi" },
  { name: "ENV216", desc: "LISN / Ekvivalent tarmoq" },
  { name: "CDN M216-10", desc: "Coupling/Decoupling tarmog‘i" },
];

function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium">
      {children}
    </span>
  );
}

function Section({ id, title, subtitle, children }) {
  return (
    <section id={id} className="py-16 sm:py-20" aria-labelledby={`${id}-title`}>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h2 id={`${id}-title`} className="text-2xl sm:text-3xl font-semibold tracking-tight">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-sm sm:text-base text-gray-600">
              {subtitle}
            </p>
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

function FooterItem({ title, children }) {
  return (
    <div>
      <h4 className="text-sm font-semibold mb-3">{title}</h4>
      <div className="space-y-2 text-sm text-gray-600">{children}</div>
    </div>
  );
}

export default function EMCWebsite() {
  const [lang, setLang] = useState("uz");
  const t = (uz, ru) => (lang === "uz" ? uz : ru);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Top bar */}
      <div className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Badge>O’ZAK.SL.0309</Badge>
            <Badge>ISO/IEC 17025</Badge>
            <Badge>ILAC – G8</Badge>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setLang("uz")} className={`hover:underline ${lang==="uz"?"font-semibold":""}`}>UZ</button>
            <span className="text-gray-400">|</span>
            <button onClick={() => setLang("ru")} className={`hover:underline ${lang==="ru"?"font-semibold":""}`}>РУ</button>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/90 border-b">
        <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gray-900" aria-hidden />
            <span className="font-semibold">EMC Lab</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="#services">{t("Xizmatlar", "Услуги")}</NavLink>
            <NavLink href="#equipment">{t("Jihozlar", "Оборудование")}</NavLink>
            <NavLink href="#accreditation">{t("Akkreditatsiya", "Аккредитация")}</NavLink>
            <NavLink href="#pricing">{t("Narxlar", "Цены")}</NavLink>
            <NavLink href="#contact">{t("Bog‘lanish", "Контакты")}</NavLink>
          </nav>
          <a
            href="#contact"
            className="rounded-xl border bg-gray-900 text-white px-3 py-1.5 text-sm hover:opacity-90"
          >
            {t("Sinovga buyurtma", "Заявка на испытания")}
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-3xl sm:text-5xl font-semibold leading-tight">
                {t(
                  "Elektromagnit moslashuvchanlik sinovlari",
                  "Испытания по электромагнитной совместимости"
                )}
              </h1>
              <p className="mt-4 text-gray-600 text-base sm:text-lg max-w-xl">
                {t(
                  "Maishiy va sanoat qurilmalari uchun ESD, EFT/B, Surge, RF immunitet, Flicker, Garmonik va emissiya o‘lchovlari.",
                  "ESD, EFT/B, Surge, RF иммунитет, мерцание, гармоники и измерения излучаемых/проводимых помех для бытового и промышленного оборудования."
                )}
              </p>
              <div className="mt-6 flex items-center gap-3">
                <a href="#services" className="rounded-xl border px-4 py-2 text-sm font-medium hover:opacity-80">
                  {t("Xizmatlarni ko‘rish", "Смотреть услуги")}
                </a>
                <a href="#contact" className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                  {t("Tizimga ariza qoldirish", "Оставить заявку")}
                </a>
              </div>
              <div className="mt-6 flex flex-wrap gap-2 text-xs text-gray-600">
                <Badge>O‘z MSt / IEC 61000</Badge>
                <Badge>CISPR</Badge>
                <Badge>UzTR.389-010:2016</Badge>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] w-full rounded-2xl border shadow-sm grid place-items-center">
                <div className="text-center p-6">
                  <div className="text-7xl">⚡</div>
                  <p className="mt-2 text-sm text-gray-600">{t("Laboratoriya fotosurati yoki banner joyi","Фото лаборатории или баннер")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <Section
        id="services"
        title={t("Xizmatlar va sinovlar","Услуги и испытания")}
        subtitle={t(
          "IEC/CISPR talablari asosida to‘liq EMC sinov dasturi",
          "Полный перечень EMC-испытаний по IEC/CISPR"
        )}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((tst, i) => (
            <div key={i} className="rounded-2xl border p-5 hover:shadow-sm transition">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{tst.title}</h3>
                <Badge>{tst.code}</Badge>
              </div>
              <p className="mt-2 text-sm text-gray-600">{tst.note}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                <span>🔧</span>
                <span>{t("Metodika laboratoriya reglamentiga muvofiq","Методика согласно регламенту лаборатории")}</span>
              </div>
              <a href="#contact" className="mt-4 inline-block text-sm font-medium underline">
                {t("Buyurtma berish","Заказать")}
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* Equipment */}
      <Section
        id="equipment"
        title={t("Jihozlar","Оборудование")}
        subtitle={t("Asosiy o‘lchash va sinov kompleksi","Основной комплекс измерений и испытаний")}
      >
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {equipment.map((eq, i) => (
            <div key={i} className="rounded-2xl border p-5 hover:shadow-sm transition">
              <div className="text-lg font-semibold">{eq.name}</div>
              <div className="mt-1 text-sm text-gray-600">{eq.desc}</div>
              <div className="mt-4 aspect-video rounded-xl border grid place-items-center text-3xl">📡</div>
            </div>
          ))}
        </div>
      </Section>

      {/* Accreditation */}
      <Section id="accreditation" title={t("Akkreditatsiya va doira","Аккредитация и область")}
        subtitle={t("O’ZAK.SL.0309, ISO/IEC 17025 – akkreditatsiya doirasiga muvofiq","O’ZAK.SL.0309, ISO/IEC 17025 – в соответствии с областью аккредитации")}
      >
        <div className="rounded-2xl border p-6 grid md:grid-cols-2 gap-6">
          <div>
            <ul className="list-disc ml-5 space-y-2 text-sm text-gray-700">
              <li>{t("Sinov bayonnomalarini onlayn berish va QR-kod bilan tasdiqlash","Выдача протоколов онлайн, подтверждение по QR-коду")}</li>
              <li>{t("TRIS portali orqali ariza va holat monitoringi","Заявка и мониторинг статуса через портал TRIS")}</li>
              <li>{t("Namunalarni qabul qilish va saqlash reglamenti","Регламент отбора и хранения образцов")}</li>
              <li>{t("ILAC-G8 bo‘yicha noaniqlik va qabul qilish qoidalari","Правила неопределенности и приемки по ILAC-G8")}</li>
            </ul>
          </div>
          <div className="space-y-3 text-sm text-gray-700">
            <div className="rounded-xl border p-4">
              <div className="text-sm font-semibold">{t("Yuridik nomi","Юридическое наименование")}</div>
              <div className="text-gray-600">“O‘zbekiston ilmiy-sinov va sifat nazorati markazi” DM qoshidagi SLM</div>
            </div>
            <div className="rounded-xl border p-4">
              <div className="text-sm font-semibold">{t("Manzil","Адрес")}</div>
              <div className="text-gray-600">Toshkent vil., Piskent t., Lola-ariq MFY, O‘zbekiston ko‘chasi, 174-uy</div>
            </div>
          </div>
        </div>
      </Section>

      {/* Pricing */}
      <Section id="pricing" title={t("Narxlar","Цены")}
        subtitle={t("Sinov turiga va namunaga qarab hisoblab chiqiladi","Зависит от вида испытаний и образцов")}
      >
        <div className="grid md:grid-cols-3 gap-5">
          {["Basic", "Standard", "Premium"].map((tier, i) => (
            <div key={i} className="rounded-2xl border p-6">
              <div className="text-sm uppercase tracking-wide text-gray-500">{tier}</div>
              <div className="mt-2 text-3xl font-semibold">$ -</div>
              <ul className="mt-4 space-y-2 text-sm text-gray-600">
                <li>• {t("1–2 sinov turidan boshlab","От 1–2 видов испытаний")}</li>
                <li>• {t("QR-kodli protokol","Протокол с QR-кодом")}</li>
                <li>• {t("Xulosa va tavsiyalar","Заключение и рекомендации")}</li>
              </ul>
              <a href="#contact" className="mt-5 inline-block rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                {t("Kalkulyatsiya so‘rash","Запросить расчет")}
              </a>
            </div>
          ))}
        </div>
      </Section>

      {/* Contact */}
      <Section id="contact" title={t("Bog‘lanish","Контакты")} subtitle={t("Ariza qoldiring – 1 ish kuni ichida javob","Оставьте заявку – ответ в течение 1 рабочего дня")}> 
        <div className="grid md:grid-cols-2 gap-8">
          <form onSubmit={(e)=>{e.preventDefault(); alert(t("Rahmat! Arizangiz qabul qilindi.", "Спасибо! Ваша заявка принята."));}} className="rounded-2xl border p-6 space-y-4">
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
            <button className="rounded-xl bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90">{t("Yuborish","Отправить")}</button>
          </form>
          <div className="space-y-5">
            <div className="rounded-2xl border p-6">
              <div className="text-sm font-semibold">{t("Manzil","Адрес")}</div>
              <div className="text-gray-600 text-sm">Toshkent vil., Piskent t., Lola-ariq MFY, O‘zbekiston ko‘chasi, 174-uy</div>
              <div className="mt-3 text-sm"><span className="font-medium">Telegram:</span> @EMM_Rasmiy</div>
              <div className="text-sm"><span className="font-medium">Email:</span> info@emc-lab.uz</div>
              <div className="text-sm"><span className="font-medium">Tel:</span> +998 (90) 000-00-00</div>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="text-sm font-semibold">{t("Ish vaqti","График работы")}</div>
              <ul className="mt-2 text-sm text-gray-600 space-y-1">
                <li>{t("Du–Ju: 09:00–18:00","Пн–Пт: 09:00–18:00")}</li>
                <li>{t("Sh: 10:00–16:00","Сб: 10:00–16:00")}</li>
                <li>{t("Yak: dam olish","Вс: выходной")}</li>
              </ul>
            </div>
            <div className="rounded-2xl border p-6">
              <div className="text-sm font-semibold">{t("Hujjatlar","Документы")}</div>
              <ul className="mt-2 text-sm text-gray-600 list-disc ml-5 space-y-1">
                <li>{t("Akkreditatsiya guvohnomasi (PDF)","Свидетельство об аккредитации (PDF)")}</li>
                <li>{t("Akkreditatsiya doirasi (PDF)","Область аккредитации (PDF)")}</li>
                <li>{t("Namuna qabul qilish reglamenti (PDF)","Регламент приема образцов (PDF)")}</li>
              </ul>
            </div>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-4 gap-8">
          <FooterItem title={t("Laboratoriya","Лаборатория")}> 
            <div>{t("EMC laboratoriyasi – O‘z MSt/IEC/CISPR bo‘yicha sinovlar","Лаборатория EMC – испытания по O‘z MSt/IEC/CISPR")}</div>
          </FooterItem>
          <FooterItem title={t("Navigatsiya","Навигация")}> 
            <div><a href="#services" className="hover:underline">{t("Xizmatlar","Услуги")}</a></div>
            <div><a href="#equipment" className="hover:underline">{t("Jihozlar","Оборудование")}</a></div>
            <div><a href="#contact" className="hover:underline">{t("Bog‘lanish","Контакты")}</a></div>
          </FooterItem>
          <FooterItem title="Legal"> 
            <div>© {new Date().getFullYear()} EMC Lab</div>
            <div>{t("Maxfiylik siyosati","Политика конфиденциальности")}</div>
          </FooterItem>
          <FooterItem title={t("Manzil","Адрес")}> 
            <div>Toshkent vil., Piskent t.</div>
            <div>O‘zbekiston ko‘chasi, 174-uy</div>
          </FooterItem>
        </div>
      </footer>
    </div>
  );
}
