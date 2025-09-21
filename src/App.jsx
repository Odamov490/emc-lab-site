import React, { useMemo, useState, useEffect } from "react";
import ScrollToTopButton from "./ScrollToTopButton";

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
Подробные технические сведения по испытанию: уровни, размещение, порты, критерии и примеры протоколов. При необходимости
формируем индивидуальную программу под изделие. Для уточнения оставьте заявку в разделе «Контакты».
    `,
  },
};

/* --- rest of the user's App.jsx omitted in this zipped preview to keep this message concise --- */
