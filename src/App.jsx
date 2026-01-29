import React, { useMemo, useState, useEffect } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import SinovDasturlari from "./components/SinovDasturlari";
import Login from "./pages/Login"; // login sahifang
 // asosiy sahifa
 import { Routes, Route, useNavigate } from "react-router-dom";
 import QrTizimi from "./components/QrTizimi";

/********************* CONFIG *********************/
const NAV = [
  { href: "#about", label: { uz: "Biz haqimizda", ru: "О нас" } },
  { href: "#services", label: { uz: "Xizmatlar", ru: "Услуги" } },
  { href: "#equipment", label: { uz: "Jihozlar", ru: "Оборудование" } },
  { href: "#accreditation", label: { uz: "Akkreditatsiya", ru: "Аккредитация" } },
  { href: "#gallery", label: { uz: "Galereya", ru: "Галерея" } },
  { href: "#excursion", label: { uz: "Ekskursiya", ru: "Экскурсия" } },
  { href: "#team", label: { uz: "Jamoa", ru: "Команда" } },
  { href: "#pricing", label: { uz: "Narxlar", ru: "Цены" } },
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
  { name: "Suxanov Alijan", role: "1-toifali mutaxassis", img: "/staff/12.png" },
  { name: "Abduvohobov Ravshan", role: "2-toifali mutaxassis", img: "/staff/7.png" },
  { name: "Joldasbaev Dastanbek", role: "2-toifali mutaxassis", img: "/staff/8.jpg" },
  { name: "Sobirov Doston", role: "Texnik xodim", img: "/staff/9.png" },
  { name: "Karimov Suxrob", role: "Texnik xodim", img: "/staff/10.png" },
  { name: "Sharofiddinov Najmiddin", role: "Texnik xodim", img: "/staff/11.png" },
 
];


const PRICING_CARDS = [
  {
    key: "home",
    titleUz: "Maishiy va axborot-texnik qurilmalar",
  titleRu: "Бытовые и информационно-технические устройства",
    priceUz: "670 000 so‘m",
    subUz: "QQS bilan 750 400 so‘m",
    priceRu: "670 000 сум",
    subRu: "с НДС 750 400 сум",
      image: "/images/1.png",
    featuresUz: [
       "Televizorlar, radiopriyomniklar, media pleerlar",
    "Muzlatgich, konditsioner, kir yuvish mashinalari",
    "Oshxona texnikalari (mikroto‘lqinli pech, blender, changyutkich va h.k.)",
    "Audio/video apparatlar (DVD, kuchaytirgich, akustik tizimlar)",
    "IT qurilmalar: printer, kompyuter, router, smartfon, planshet",
    "Lampalar va yoritish bloklari (LED, elektron ballastlar)",
    ],
    featuresRu: [
       "Телевизоры, радиоприёмники, медиаплееры",
    "Холодильники, кондиционеры, стиральные машины",
    "Кухонная техника (микроволновки, блендеры, пылесосы и др.)",
    "Аудио/видео аппаратура (DVD, усилители, акустические системы)",
    "ИТ-устройства: принтеры, компьютеры, роутеры, смартфоны, планшеты",
    "Лампы и осветительные блоки (LED, электронные балласты)",
    ],
      noteUz: "💡 Narx faqat bitta mahsulot uchun amal qiladi.",
  noteRu: "💡 Цена указана за одно изделие.",
  },
  {
    key: "auto",
    titleUz: "Transport vositalari",
    titleRu: "Транспортные средства",
   priceUz: "1 340 000 so‘m",
    subUz: "QQS bilan 1 500 800 so‘m",
    priceRu: "1 340 000  сум",
    subRu: "с НДС 1 500 800 сум",
     image: "/images/2.png",
    featuresUz: [
       "Engil avtomobillar (M1 — yo‘lovchi, N1 — yengil yuk tashuvchi toifalari)",
    "Yuk avtomobillari (N2, N3 — og‘ir yuk mashinalari)",
    "Avtobuslar (M2, M3 — yo‘lovchi tashuvchi)",
    "Motosikllar va skuterlar (Shahar va yo‘l uchun motosikllar, Elektr skuterlar va mopedlar, Uch g‘ildirakli transport vositalari (trike))",
    "Avtopogruzchiklar (yuk ortishga mo‘ljallangan texnikalar)",
    ],
    featuresRu: [
      "Легковые автомобили (M1 — пассажирские, N1 — лёгкие грузовые категории)",
    "Грузовые автомобили (N2, N3 — тяжёлые грузовики)",
    "Автобусы (M2, M3 — пассажирские)",
    "Мотоциклы и скутеры (городские и дорожные мотоциклы, электроскутеры и мопеды, трёхколёсные транспортные средства (трайки))",
    "Автопогрузчики (техника для погрузки и транспортировки грузов)",
    ],
      noteUz: "💡 Narx faqat bitta mahsulot uchun amal qiladi.",
  noteRu: "💡 Цена указана за одно изделие.",
  },
  {
    key: "agro",
    titleUz: "Qishloq xo‘jalik texnikalari",
    titleRu: "С/х техника",
   priceUz: "4 020 000 so‘m",
    subUz: "QQS bilan 4 502 400 so‘m",
    priceRu: "4 020 000 сум",
    subRu: "с НДС 4 502 400 сум",
    image: "/images/3.png",
    featuresUz: [
     "G‘ildirakli traktorlar (T1–T5 toifalari)",
    "Mini-traktorlar (fermer xo‘jaliklari uchun)",
    "Maxsus maqsadli traktorlar (o‘rmon, tog‘, issiqxona uchun)",
    "Kombaynlar (Don, kartoshka, sabzavot va poliz mahsulotlari)",
    "Paxta terish mashinalari",
    ],
    featuresRu: [
       "Колёсные тракторы (категории T1–T5)",
    "Мини-тракторы (для фермерских хозяйств)",
    "Тракторы специального назначения (лес, горы, теплицы)",
     "Комбайны (зерно, картофель, овощи и бахчевые культуры)",
    "Хлопкоуборочные машины",
    ],
      noteUz: "💡 Narx faqat bitta mahsulot uchun amal qiladi.",
  noteRu: "💡 Цена указана за одно изделие.",
  },
{
  key: "cool",
  titleUz: "Ilmiy tadqiqot sinovlari",
  titleRu: "Научные испытания",
  priceUz: "15 075 000 so‘m",
  subUz: "QQS bilan 16 884 000 so‘m",
  priceRu: "15 075 000 сум",
  subRu: "с НДС 16 884 000 сум",
  image: "/images/4.png",

  // kartadagi punktlar
  featuresUz: [
    "Yangi mahsulotlarning tajriba nusxalari",
    "Bozorga chiqishdan oldingi sinov namunalari",
    "Kengaytirilgan sinov dasturlari (kompleks rejimlar)",
    "Normativdan tashqari maxsus o‘lchovlar (masalan, yuqori chastota yoki kuchlanishli)",
    "Ilmiy loyihalar doirasidagi prototiplar",
  ],
  featuresRu: [
     "Экспериментальные образцы новых изделий",
    "Образцы для предпродажных испытаний",
    "Расширенные программы испытаний (комплексные режимы)",
    "Вненормативные специальные измерения (напр., высокие частоты/напряжения)",
    "Прототипы в рамках научных проектов",
  ],
    noteUz: "💡 Narx faqat bitta mahsulot uchun amal qiladi.",
  noteRu: "💡 Цена указана за одно изделие.",
}

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
🔹 Bu sinov nima?

Elektrostatik razryad (ESD) — bu inson tanasida yoki atrof-muhitda to‘plangan statik elektr zaryadining birdaniga qurilmaga o‘tib ketishidir.

Oddiy misollar:

Qishda eshik tutqichiga tekkanda “tok urishi”

Qurilmani qo‘l bilan ushlaganda chiqadigan chaqnash

Plastik buyumlar ishqalanishidan hosil bo‘ladigan zaryad

ESD sinovi qurilma shunday holatlarda ishlashda davom etadimi yoki yo‘qmi, shuni tekshiradi.

🔹 Nima uchun bu sinov kerak?

Real hayotda qurilmalar:

odamlar tomonidan ushlanadi

ulab-ajratiladi

plastik, metall, gilamli xonalarda ishlaydi

quruq havoda statik zaryad yig‘iladi

Agar qurilma ESD ga chidamsiz bo‘lsa:

osilib qoladi

qayta yuklanadi

ma’lumot yo‘qoladi

butunlay ishdan chiqishi mumkin

👉 Shu sababli ESD sinovi xavfsizlik, ishonchlilik va sertifikatlash uchun majburiy.

🔹 Sinov qanday o‘tkaziladi?

ESD sinovi maxsus ESD generatori yordamida bajariladi. Qurilmaga nazorat ostida sun’iy statik zarba beriladi.

1️⃣ Kontakt razryad (Contact discharge)

Zaryad to‘g‘ridan-to‘g‘ri metall qismga beriladi

Odatda ±2, ±4, ±6, ±8 kV

Eng og‘ir va qat’iy sinov turi

Metall korpusli yoki ochiq kontaktli qurilmalar uchun

2️⃣ Havo orqali razryad (Air discharge)

Zaryad qurilmaga yaqinlashtirib beriladi

±2…±15 kV gacha

Plastik korpusli qurilmalar uchun

Real hayotga eng yaqin sharoit

🔹 Qaysi joylarga zarba beriladi?

Sinov faqat bitta nuqtaga emas, balki:

tugmalar

portlar (USB, LAN, HDMI va h.k.)

displey atrofi

korpus chetlari

foydalanuvchi tez-tez tegadigan joylar

bo‘yicha o‘tkaziladi.

🔹 Sinov darajalari nimani anglatadi?
Daraja	Ma’nosi
±2 kV	Eng past, ofis sharoiti
±4 kV	O‘rtacha foydalanish
±8 kV	Og‘ir sharoit
±15 kV	Juda og‘ir, sanoat muhiti

Qurilmaning qaysi darajagacha bardosh berishi — uning klassini ko‘rsatadi.

🔹 Natijalar (A / B / C / D) nimani bildiradi?
Mezon	Izoh
A	Qurilma normal ishlaydi, hech qanday ta’sir yo‘q
B	Vaqtinchalik buzilish bo‘ladi, lekin o‘zi tiklanadi
C	Ishlash buziladi, operator aralashuvi kerak
D	Qurilma ishdan chiqadi (qabul qilinmaydi)

👉 Sertifikatlashda odatda A yoki B qabul qilinadi.

🔹 Sinovga tayyorlash nima uchun muhim?

Noto‘g‘ri tayyorlangan qurilma noto‘g‘ri natija beradi.

Tayyorlashda:

yerga ulash (grounding)

ochiq portlar holati

devorga yoki stolga o‘rnatish

kabel uzunliklari

plastik/metall yuzalar

aniq standart bo‘yicha sozlanadi.

🔹 Xulosa (oddiy qilib)

ESD sinovi shuni ko‘rsatadi:

“Bu qurilma odamlar ishlatadigan real sharoitda ishonchli ishlaydimi yoki yo‘qmi?”

    `,
    ru: `
🔹 Что такое электростатический разряд (ESD)?

Электростатический разряд (ESD) — это внезапный перенос накопленного статического электрического заряда от человека или окружающей среды к электронному устройству.

Простые примеры из жизни:

«Удар током» при касании дверной ручки зимой

Разряд при прикосновении к устройству руками

Статический заряд, возникающий из-за трения пластика, одежды или ковров

ESD-испытание проверяет, сможет ли устройство продолжать нормально работать в таких условиях.

🔹 Зачем необходимо ESD-испытание?

В реальных условиях эксплуатации устройства:

постоянно трогают руками

подключают и отключают кабели

используют в помещениях с сухим воздухом

эксплуатируют рядом с пластиковыми и металлическими поверхностями

Если устройство неустойчиво к ESD, возможны:

зависания

самопроизвольные перезагрузки

потеря данных

полный выход из строя

👉 Поэтому ESD-испытание является обязательным для безопасности, надежности и сертификации.

🔹 Как проводится испытание?

Испытание выполняется с помощью специального генератора электростатических разрядов, который подает контролируемые искусственные разряды на устройство.

1️⃣ Контактный разряд (Contact discharge)

Разряд подается непосредственно на металлическую часть устройства

Типичные уровни: ±2, ±4, ±6, ±8 кВ

Самый строгий и тяжелый вид испытаний

Применяется для устройств с металлическим корпусом или открытыми контактами

2️⃣ Воздушный разряд (Air discharge)

Разряд подается через воздух при приближении электрода

Диапазон: ±2…±15 кВ

Используется для пластиковых корпусов

Максимально приближен к реальным условиям эксплуатации

🔹 В какие точки подается разряд?

Испытания проводятся не в одной точке, а по всей поверхности, включая:

кнопки управления

разъемы (USB, LAN, HDMI и др.)

область вокруг дисплея

края корпуса

зоны, к которым пользователь прикасается чаще всего

🔹 Что означают уровни испытаний?
Уровень	Значение
±2 кВ	Минимальный уровень, офисные условия
±4 кВ	Обычные условия эксплуатации
±8 кВ	Тяжелые условия
±15 кВ	Очень тяжелые, промышленные условия

Максимальный выдерживаемый уровень показывает класс устойчивости устройства.

🔹 Критерии оценки результатов (A / B / C / D)
Критерий	Описание
A	Устройство работает нормально, без нарушений
B	Временное нарушение, устройство самовосстанавливается
C	Нарушение работы, требуется вмешательство оператора
D	Устройство выходит из строя (не допускается)

👉 Для сертификации обычно допускаются A и B.

🔹 Почему важна правильная подготовка к испытанию?

Неправильная подготовка может привести к некорректным результатам.

При подготовке учитываются:

заземление

состояние открытых портов

установка на столе или крепление на стене

длина и тип кабелей

материалы корпуса (пластик / металл)

Все параметры настраиваются строго по стандарту.

🔹 Краткий вывод

ESD-испытание отвечает на главный вопрос:

«Сможет ли устройство надежно работать в реальных условиях, когда к нему прикасаются люди?»

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




/********************* EQUIPMENT CERTS (PDF yoki rasm) *********************/
const EQUIPMENT_CERTS = {
  "R&S ESW8":   "/certs/esw8.pdf",
  "R&S ESR3":   "/certs/esr3.pdf",
  "Schaffner NX5": "/certs/nx5.pdf",
  "CDN M216-10": "/certs/cdn-m216-10.pdf",
  // kerak bo‘lsa yana qo‘shing:
  // "Jihoz 5": "/certs/jihoz5.jpg",
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

        {/* Pastki panel — faqat Yopish */}
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

  // modal har safar ochilganda sertifikat oynasini yopib qo'yamiz
  useEffect(() => { if (open) setShowCert(false); }, [open]);

  if (!open || !equipment) return null;

  const details =
    (EQUIPMENT_DETAILS[equipment.name] && EQUIPMENT_DETAILS[equipment.name][lang]) ||
    EQUIPMENT_DETAILS.default[lang];

  const certPath = EQUIPMENT_CERTS[equipment.name];               // <— shu yerda bog‘lanadi
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
        {/* HEADER */}
        <div className="flex items-start gap-3 p-4 sm:p-5 border-b border-black/10 dark:border-white/10">
          <div className="flex-1 min-w-0">
            <div className="text-lg sm:text-xl font-semibold leading-tight">{equipment.name}</div>
            <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{equipment.desc}</div>
          </div>

          {/* SERTIFIKAT TUGMASI (agar xaritada bor bo‘lsa) */}
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

        {/* BODY */}
        <div className="overflow-y-auto max-h-[calc(85vh-6.5rem)]">
          {/* Agar sertifikat ko‘rish yoqilgan bo‘lsa — preview */}
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

              {/* Pastda ochish/yuklab olish havolasi */}
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
            // Oddiy matnli tavsif
            <div className="p-4 sm:p-6 text-sm sm:text-[15px] leading-6 text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
              {details}
            </div>
          )}
        </div>

        {/* FOOTER — Yopish */}
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


/********************* EQUIPMENT CARD (multi image + thumbs) *********************/
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

        {/* NEW: Batafsil tugma */}
        <div className="mt-4">
          <EquipmentDetailsButton equipment={eq} />
        </div>
      </div>
    </Card>
  );
}

/********************* NEW: Small helper to open equipment modal via context *********************/
/* Bu kichik komponent parentdagi ochish funksiyasiga ulanishi uchun context-ga tayyor emas.
   Shuning uchun uni pastda EMCLabUltra ichida override qilamiz. */
let _openEquipFromChild = null;
function EquipmentDetailsButton({ equipment }) {
  return (
    <button
      onClick={() => _openEquipFromChild && _openEquipFromChild(equipment)}
      className="rounded-xl border border-black/10 px-3 py-1.5 text-sm font-medium hover:bg-black/5"
    >
      {/* Tilda avtomatik qaytadi (EMCLabUltra ichida sozlaymiz) */}
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

  // NEW: Equipment details modal
  const [openEquipModal, setOpenEquipModal] = useState(false);
  const [selectedEquip, setSelectedEquip] = useState(null);
  const openEquip = (e) => { setSelectedEquip(e); setOpenEquipModal(true); };
  const closeEquip = () => setOpenEquipModal(false);

  // Child helper-larga handler va label beramiz
  _openEquipFromChild = openEquip;
  _btnLabelGetter = () => (lang === "uz" ? "Batafsil" : "Подробнее");

  // dekor blobs
  const blobs = useMemo(
    () => [
      { class: "bg-gradient-to-tr from-sky-500 to-cyan-400", size: "h-[42rem] w-[42rem]", blur: "blur-3xl", pos: "-top-40 -left-20" },
      { class: "bg-gradient-to-br from-indigo-400 to-sky-400", size: "h-[32rem] w-[32rem]", blur: "blur-3xl", pos: "top-20 -right-16" },
    ],
    []
  );


  

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

  // hash anchor smooth align
  useEffect(() => {
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  return (
    <div className={dark ? "dark" : ""}>
      {/* Global smooth scroll + scrollbar */}
      <style>
        {`html{scroll-behavior:smooth} ::-webkit-scrollbar{width:10px;height:10px} ::-webkit-scrollbar-thumb{background:#94a3b8;border-radius:8px} ::-webkit-scrollbar-track{background:transparent}`}
      </style>

      {/* Top scroll progress bar */}
      <div className="fixed top-0 left-0 right-0 z-[60] h-1 bg-transparent">
        <div
          className="h-full bg-gradient-to-r from-sky-500 to-cyan-400 transition-[width] duration-150"
          style={{ width: `${scrollProgress}%` }}
          aria-hidden
        />
      </div>

      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-gray-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100 selection:bg-sky-200/50">
        {/* TOP BAR */}
        <div className="border-b border-black/10 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
             <Badge>O‘zbekiston ilmiy-sinov va sifat nazorati markazi (UzTest) davlat muassasasi</Badge>
              {/*  <Badge>ISO/IEC 17025</Badge>
              <Badge>ILAC – G8</Badge> */}
            </div>
            
            <div className="flex items-center gap-3">
              <button onClick={() => setLang("uz")} className={`hover:underline ${lang === "uz" ? "font-semibold" : ""}`}>UZ</button>
              <span className="text-gray-400">|</span>
              <button onClick={() => setLang("ru")} className={`hover:underline ${lang === "ru" ? "font-semibold" : ""}`}>РУ</button>
              <span className="mx-1" />
      
                 <a
  href="/qr-tizimi"
  className="
    group relative inline-flex items-center gap-2
    rounded-2xl
    bg-gradient-to-r from-sky-600 via-sky-700 to-blue-700
    text-white px-4 py-2 text-sm font-semibold
    shadow-md shadow-sky-900/30
    transition-all duration-300
    hover:-translate-y-0.5 hover:shadow-lg hover:shadow-sky-900/40
    will-change-transform
  "
>
  {/* QR icon */}
  <svg
    className="h-4 w-4 opacity-90 group-hover:opacity-100 transition"
    fill="currentColor"
    viewBox="0 0 24 24"
  >
    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm10-2h2v2h-2v-2zm-2 2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-4h2v6h-2v-6z" />
  </svg>

  <span>
    {lang === "uz" ? "QR tizimi" : "QR система"}
  </span>
</a>



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
           <a
  href="/sinov-dasturlari"
  className="rounded-2xl border border-black/10 bg-gray-900 text-white px-3 py-1.5 text-sm hover:-translate-y-0.5 transition will-change-transform"
>
  {lang==="uz" ? "Sinov dasturlari" : "Программы испытаний"}
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
                    ? "ESD, EFT/B, Surge, RF immunitet, Flicker, Garmonik va emissiya o‘lchovlari. Oʼz DSt ISO/IEC 17025:2019 akkreditatsiya doirasida."
                    : "ESD, EFT/B, Surge, RF иммунитет, мерцание, гармоники и измерения помех. В рамках аккредитации Oʼz DSt ISO/IEC 17025:2019."}
                </p>
                <div className="mt-6 flex flex-col xs:flex-row sm:flex-row items-start sm:items-center gap-3">
                  <a href="#services" className="rounded-xl border border-black/10 bg-white/70 px-4 py-2 text-sm font-medium hover:opacity-90 backdrop-blur">
                    {lang==="uz" ? "Xizmatlarni ko‘rish" : "Смотреть услуги"}
                  </a>
                  <a href="#contact" className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium shadow hover:shadow-md">
                    {lang==="uz" ? "Ariza qoldirish" : "Оставить заявку"}
                  </a>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-6 text-center">
                  {[{ v: "1200+", l: lang==="uz" ? "o‘lchov" : "измерений" },
                    { v: "98%",  l: lang==="uz" ? "qoniqish" : "удовл." },
                    { v: "24h",  l: lang==="uz" ? "javob" : "ответ" }].map((s, i) => (
                    <Card key={i} className="p-4">
                      <div className="text-xl sm:text-2xl font-semibold">{s.v}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300">{s.l}</div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="relative">
                <Card className="aspect_[4/3] overflow-hidden shadow-xl ring-1 ring-black/5">
                  <img src="/hero/anechoic.jpg" alt="anechoic" className="h-full w-full object-cover md:scale-105" />
                </Card>
                <div className="absolute -bottom-6 -right-6 hidden sm:block">
                  <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-white px-5 py-3 shadow-lg">
                    <div className="text-xs">Oʼz DSt ISO/IEC 17025:2019</div>
                    <div className="text-sm font-semibold">{lang==="uz" ? "Akkreditatsiya" : "Аккредитация"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <Section
          id="about"
          title={lang==="uz" ? "Biz haqimizda" : "О нас"}
          subtitle={lang==="uz"
            ? "Oʼz DSt ISO/IEC 17025:2019 doirasida akkreditatsiyadan o‘tgan EMC laboratoriyasi (O’ZAK.SL.0309). 2021-yildan buyon elektromagnit moslashuvchanlik sinovlarini o‘tkazamiz."
            : "EMC-лаборатория, аккредитованная по Oʼz DSt ISO/IEC 17025:2019 (О’ЗАК.SL.0309). С 2021 года проводим испытания на электромагнитную совместимость."
          }
        >
          <div className="rounded-3xl bg-gradient-to-r from-sky-700 to-cyan-600 text-white shadow-lg p-6 sm:p-8 space-y-6">
            <div className="space-y-3">
              <h3 className="text-xl font-semibold">
                {lang==="uz" ? "EMC sinovlari — Elektromagnit moslashuvchanlik" : "EMC-испытания — Электромагнитная совместимость"}
              </h3>
              <p className="opacity-95">
                {lang==="uz"
                  ? "Elektr qurilma yoki komponentni bozorga chiqarishdan avval, u boshqa qurilmalar bilan muvofiq ishlashi shart. Bunga elektromagnit moslashuvchanlik (EMC) deyiladi. Bizning laboratoriya qurilmalaringizning emissiya va immunitet ko‘rsatkichlarini IEC/CISPR talablariga muvofiq tekshiradi — natijada mahsulotlar milliy va xalqaro standartlarga hamda EMC direktivasiga mos keladi."
                  : "Перед выводом электрического изделия или компонента на рынок необходимо убедиться, что оно не мешает работе других устройств и устойчиво к помехам. Это и есть электромагнитная совместимость (EMC). Наша лаборатория проверяет эмиссию и иммунитет по требованиям IEC/CISPR — чтобы продукция соответствовала национальным и международным стандартам и EMC-директиве."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-2xl p-4">
                <h4 className="font-semibold mb-1">{lang==="uz" ? "Afzalliklar" : "Преимущества"}</h4>
                <ul className="list-disc list-inside text-sm/6 opacity-95 space-y-1">
                  <li>{lang==="uz" ? "Elektr mahsulotini bozorda sotish uchun majburiy talablar bajariladi." : "Выполнение обязательных требований для вывода продукции на рынок."}</li>
                  <li>{lang==="uz" ? "Xalqaro bozorga kirish imkoniyati kengayadi." : "Доступ к международным рынкам."}</li>
                  <li>{lang==="uz" ? "Qurilmalar xavfsiz va ishonchli ishlashi ta’minlanadi." : "Гарантируется безопасная и надежная работа устройств."}</li>
                </ul>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <h4 className="font-semibold mb-1">{lang==="uz" ? "Biz nima qilamiz" : "Что мы проверяем"}</h4>
                <p className="text-sm opacity-95">
                  {lang==="uz"
                    ? "Har qanday elektr qurilma va komponent uchun EMC sinovlari: emissiya (chiqish) va immunitet (barqarorlik) darajalari o‘lchanadi hamda EMC direktivalari talablari bilan taqqoslanadi."
                    : "Проводим EMC-испытания практически для любых электрических устройств и компонентов: измеряем уровни эмиссии и устойчивости к помехам и сопоставляем с требованиями EMC-директив."}
                </p>
              </div>

              <div className="bg-white/10 rounded-2xl p-4">
                <h4 className="font-semibold mb-1">{lang==="uz" ? "Natijalar" : "Результат"}</h4>
                <p className="text-sm opacity-95">
                  {lang==="uz"
                    ? "Mahsulotlaringiz elektromagnit shovqinlarga bardoshliligi va chiqish darajalari me’yordan pastligi bo‘yicha hujjatli tasdiqqa ega bo‘ladi."
                    : "Вы получаете подтверждение устойчивости к помехам и того, что уровни излучения вашей продукции ниже установленных норм."}
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">{lang==="uz" ? "Qo‘llaniladigan qurilmalar" : "Области применения"}</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                {[
                  lang==="uz" ? "Aqlli qurilmalar (smart devices)" : "Умные устройства (smart devices)",
                  lang==="uz" ? "Mobil/wireless mahsulotlar" : "Портативные и беспроводные изделия",
                  lang==="uz" ? "Sanoat, ilmiy va tibbiyot qurilmalari" : "Промышленные, научные и медицинские приборы",
                  lang==="uz" ? "O‘lchov va laboratoriya jihozlari" : "Измерительное и лабораторное оборудование",
                  lang==="uz" ? "Elektr komponentlar (kalit, dimmer va b.)" : "Электрокомпоненты (выключатели, диммеры и др.)",
                  lang==="uz" ? "Quvvat manbalari, elektronika (UPS, PV-invertor)" : "Источники питания, электроника (ИБП, PV-инверторы)",
                  lang==="uz" ? "Maishiy texnika" : "Бытовая техника",
                  lang==="uz" ? "Elektr asboblar" : "Электроинструмент",
                  lang==="uz" ? "Elektr o‘yinchoqlar" : "Электронные игрушки",
                  lang==="uz" ? "Yoritish mahsulotlari" : "Светотехника",
                  lang==="uz" ? "Iste’molchi elektronika" : "Потребительская электроника",
                  lang==="uz" ? "IT va ofis uskunalari" : "IT и офисное оборудование",
                  lang==="uz" ? "Audio-video qurilmalar" : "Аудио-видео аппаратура",
                  lang==="uz" ? "Telekommunikatsiya qurilmalari" : "Телекоммуникационное оборудование",
                ].map((item, i) => (
                  <div key={i} className="bg-white/10 rounded-xl px-3 py-2">{item}</div>
                ))}
              </div>
            </div>

            <div className="text-xs opacity-80">
              {lang==="uz"
                ? "Izoh: metodlar va sinov usullari (IEC/CISPR) hamda jihozlar ro‘yxati amaldagi tartib bo‘yicha qo‘llanadi."
                : "Примечание: методики и процедуры испытаний (IEC/CISPR), а также перечень оборудования применяются в действующей редакции."}
            </div>
          </div>
        </Section>

        {/* SERVICES */}
        <Section
          id="services"
          title={lang === "uz" ? "Xizmatlar va sinovlar" : "Услуги и испытания"}
          subtitle={
            lang === "uz"
              ? "IEC/CISPR talablari asosida to‘liq EMC dasturi"
              : "Полный перечень EMC-испытаний по IEC/CISPR"
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {TESTS.map((tst, i) => (
              <Card
                key={i}
                className="p-6 hover:shadow-lg transition bg-gradient-to-r from-sky-700 to-cyan-600 text-white"
              >
                {/* Sarlavha + Badge qismi */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                  <h3 className="flex-1 min-w-0 text-base font-semibold flex items-start gap-2 drop-shadow leading-tight">
                    <span className="text-xl leading-none">{tst.icon}</span>
                    <span className="break-words">{tst.title}</span>
                  </h3>

                  <span
                    className="
                      mt-1 sm:mt-0 self-start sm:self-auto
                      inline-flex items-center rounded-full px-3 py-1 bg-white text-gray-900 shadow-md
                      text-[11px] sm:text-xs
                      whitespace-nowrap truncate
                      max-w-full sm:max-w_[45%] md:max-w_[55%] lg:max-w_[60%]
                    "
                  >
                    {tst.code}
                  </span>
                </div>

                {/* Note */}
                <p className="mt-3 text-sm text-white/90 drop-shadow">{tst.note}</p>

                {/* Faqat “Batafsil” tugmasi */}
                <div className="mt-4">
                  <button
                    onClick={() => openTest(tst)}
                    className="rounded-xl bg-white text-gray-900 px-3 py-1.5 text-sm font-medium shadow hover:opacity-90"
                  >
                    {lang === "uz" ? "Batafsil" : "Подробнее"}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </Section>



        

        {/* EQUIPMENT */}
        <Section id="equipment" title={lang==="uz" ? "Jihozlar" : "Оборудование"} subtitle={lang==="uz" ? "Asosiy o‘lchash va sinov kompleksi" : "Основной комплекс измерений и испытаний"}>
          <div className="grid grid_cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {EQUIPMENT.map((eq, i) => (
              <EquipmentCard key={i} eq={eq} onOpenLightbox={openLightbox} />
            ))}
          </div>
        </Section>

        {/* ACCREDITATION CTA */}
        <div id="accreditation" className="mx-auto max-w-7xl px-4 scroll-mt-24">
          <div className="rounded-3xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white p-6 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-sm/5 opacity-90">{lang==="uz" ? "Akkreditatsiya va doira" : "Аккредитация и область"}</div>
                <div className="text-xl font-semibold">O’ZAK.SL.0309 • Oʼz DSt ISO/IEC 17025:2019 </div>
              </div>
              <a href="#contact" className="rounded-xl bg-white/15 px-4 py-2 text-sm font-medium hover:bg_white/20">
                {lang==="uz" ? "Hujjatlarni ko‘rish" : "Просмотреть документы"}
              </a>
            </div>
          </div>
        </div>

        {/* GALLERY */}
    
<Section
  id="gallery"
  title={lang==="uz" ? "Galereya" : "Галерея"}
  subtitle={lang==="uz" ? "Laboratoriya, jihozlar va sinov jarayonlaridan suratlar" : "Фото лаборатории, оборудования и процесса испытаний"}
  bleed
>
  <div className="px-4 max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
    {GALLERY.map((src, i) => (
      <div key={i} className="rounded-3xl overflow-hidden bg-slate-100 shadow-sm">
        {/* Fiks holat: hammasi 4:3 */}
        <div className="w-full aspect-[4/3]">
          <img
            src={src}
            alt="lab photo"
            loading="lazy"
            onClick={() => openLightbox(GALLERY, i)}
            className="w-full h-full object-cover cursor-zoom-in"
            onError={(e)=>{ e.currentTarget.src="/placeholder-gallery.jpg"; }}
          />
        </div>
      </div>
    ))}
  </div>
</Section>


        {/* EXCURSION / VIRTUAL TOUR */}
        <Section
          id="excursion"
          title={lang === "uz" ? "Ekskursiya" : "Экскурсия"}
          subtitle={
            lang === "uz"
              ? "Laboratoriyamiz bo‘ylab 360° virtual sayohat qiling"
              : "Совершите 360° виртуальную экскурсию по нашей лаборатории"
          }
        >
          <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-lg">
            <iframe
              src="https://www.google.com/maps/embed?pb=!4v1700000000000!6m8!1m7!1sCAoSLEFGMVFpcE9Sdl9lYl9QeS1zN0pPSldCdmRkM1lDa0x4U3pNa2RjNEF4QlBF!2m2!1d41.311151!2d69.279737!3f0!4f0!5f0.7820865974627469"
              title="Google Street View"
              className="absolute inset-0 w-full h-full border-0"
              allowFullScreen
              loading="lazy"
            ></iframe>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 max-w-3xl">
            {lang === "uz"
              ? "Hozircha demo 360° panorama joylashtirildi. Tez orada o‘z laboratoriyamizni suratga olib, havolani almashtiramiz."
              : "Сейчас вставлена демо 360° панорама. Скоро снимем нашу лабораторию и заменим ссылку."}
          </p>
        </Section>

        {/* TEAM */}
        <Section id="team" title={lang==="uz" ? "Bizning jamoa" : "Наша команда"} subtitle={lang==="uz" ? "11 nafar tajribali mutaxassis" : "11 опытных специалистов"}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {STAFF.map((p, i) => (
              <Card key={i} className="p-5 text-center">
                <img src={p.img} alt={p.name} className="w-28 h-28 sm:w-32 sm:h-32 mx-auto rounded-full object-cover border" onError={(e)=>{ e.currentTarget.src="/placeholder-avatar.jpg"; }} />
                <div className="mt-3 text-lg font-semibold">{p.name}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">{p.role}</div>
              </Card>
            ))}
          </div>
        </Section>

   {/* PRICING */}
<Section
  id="pricing"
  title={lang === "uz" ? "Narxlar" : "Цены"}
  subtitle={lang === "uz" ? "Individual kalkulyatsiya" : "Индивидуальный расчет"}
>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
    {PRICING_CARDS.map((c) => {
      const title = lang === "uz" ? c.titleUz : c.titleRu;
      const price = lang === "uz" ? c.priceUz : c.priceRu;
      const sub = lang === "uz" ? c.subUz : c.subRu;
      const feats = lang === "uz" ? c.featuresUz : c.featuresRu;
      const note = lang === "uz" ? c.noteUz : c.noteRu;
      return (
        <Card key={c.key} className="p-0 overflow-hidden flex flex-col h-full">
          {/* Rasm */}
          <div className="h-45 w-full overflow-hidden">
            <img
              src={c.image}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>

          {/* Kontent */}
          <div className="p-5 flex flex-col flex-grow">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              {title}
            </div>

            

            <ul className="mt-4 min-h-[96px] space-y-2 text-sm text-gray-700 dark:text-gray-300">
              {feats.map((f, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-[6px] h-[6px] w-[6px] rounded-full bg-sky-500 shrink-0" />
                  <span className="leading-6">{f}</span>
                </li>
              ))}
            </ul>
  <div className="mt-auto pt-4 text-sky-600 font-semibold text-lg">
              {price}
            </div>
            {sub && <div className="text-[12px] text-gray-500">{sub}</div>}
          <div className="text-xs text-gray-500 mt-1 italic">
              {note}
            </div>
          </div>


        </Card>
      );
    })}
  </div>
</Section>



        {/* CONTACT */}
        <Section
          id="contact"
          title={lang==="uz" ? "Bog‘lanish" : "Контакты"}
          subtitle={lang==="uz" ? "Ariza qoldiring – 1 ish kuni ichida javob" : "Оставьте заявку – ответ в течение 1 рабочего дня"}
        >
          <div className="grid md:grid-cols-2 gap-8">
            {/* Chap — forma */}
            <Card className="p-6 space-y-4">
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  const payload = {
                    name: fd.get("name"),
                    email: fd.get("email"),
                    phone: fd.get("phone"),
                    test: fd.get("test"),
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
                  <label className="text-sm font-medium">{lang==="uz" ? "Qiziqtirgan sinov(lar)" : "Интересующие испытания"}</label>
                  <select name="test" className="mt-1 w-full rounded-xl border px-3 py-2">
                    {TESTS.map((tst, i) => (
                      <option key={i}>{`${tst.code} – ${tst.title}`}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">{lang==="uz" ? "Xabar" : "Сообщение"}</label>
                  <textarea
                    name="message"
                    className="mt-1 w-full rounded-xl border px-3 py-2 h-28"
                    placeholder={lang==="uz" ? "Namuna turi, kuchlanish, port(lar), sinov darajalari..." : "Тип образца, напряжение, порты, уровни испытаний..."}
                  ></textarea>
                </div>
                <button
                  disabled={sending}
                  className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {sending ? (lang==="uz" ? "Yuborilmoqda..." : "Отправляется...") : (lang==="uz" ? "Yuborish" : "Отправить")}
                </button>
              </form>
            </Card>

            {/* O‘ng — ma’lumotlar + QUICK LINKS */}
            <div className="space-y-5">
              <Card className="p-6">
                <div className="text-sm font-semibold">{lang==="uz" ? "Manzil" : "Адрес"}</div>
                <div className="text-gray-700 dark:text-gray-300 text-sm">Toshkent vil., Piskent t., Lola-ariq MFY, O‘zbekiston ko‘chasi, 174-uy</div>
                <div className="mt-3 text-sm">
                  <span className="font-medium">Telegram:</span> @EMM_Rasmiy
                </div>
                <div className="text-sm">
                  <span className="font-medium">Email:</span> piskentems@gmail.com
                </div>
                <div className="text-sm">
                  <span className="font-medium">Tel:</span> +998 (99) 508-31-04
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-sm font-semibold">{lang==="uz" ? "Ish vaqti" : "График работы"}</div>
                <ul className="mt-2 text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  <li>{lang==="uz" ? "Du–Ju: 09:00–18:00" : "Пн–Пт: 09:00–18:00"}</li>
                  <li>{lang==="uz" ? "Sh-Yak: dam olish" : "Вс: выходной"}</li>
                </ul>
              </Card>

              <Card className="p-4">
                <div className="text-sm font-semibold mb-3">{lang==="uz" ? "Hujjatlar va lokatsiya" : "Документы и локация"}</div>
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
              <div className="text-sm opacity-80">
                {lang==="uz" ? "O‘z MSt/IEC/CISPR bo‘yicha sinovlar" : "Испытания по O‘z MSt/IEC/CISPR"}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold mb-3">{lang==="uz" ? "Navigatsiya" : "Навигация"}</div>
              <div className="space-y-2 text-sm">
                {NAV.map((n) => (
                  <div key={n.href}>
                    <a
                      href={n.href}
                      className={`hover:text-cyan-300 transition-colors ${active === n.href.replace('#','') ? 'font-semibold underline' : ''}`}
                    >
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
                <div className="hover:text-cyan-300 transition-colors cursor-pointer">
                  {lang==="uz" ? "Maxfiylik siyosati" : "Политика конфиденциальности"}
                </div>
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

        {/* Scroll to Top */}
        <ScrollToTopButton />
      </div>

      {/* LIGHTBOX */}
      <Lightbox
        open={lbOpen}
        images={lbImages}
        index={lbIndex}
        onClose={closeLightbox}
        onPrev={() => prevLb(-1)}
        onNext={() => nextLb(1)}
      />

      {/* TEST MODAL */}
      <TestDetailsModal
        open={openTestModal}
        onClose={closeTest}
        test={selectedTest}
        lang={lang}
      />

      {/* NEW: EQUIPMENT MODAL */}
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
<Route path="/sinov-dasturlari" element={<SinovDasturlari />} />
<Route path="/qr-tizimi" element={<QrTizimi/>} />

    </Routes>
    
  );
}
