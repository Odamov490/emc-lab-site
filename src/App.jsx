import React, { useMemo, useState, useEffect } from "react";
import ScrollToTopButton from "./ScrollToTopButton";
import SinovDasturlari from "./components/SinovDasturlari";
import Login from "./pages/Login"; // login sahifang
 // asosiy sahifa
 import { Routes, Route, useNavigate } from "react-router-dom";
 import NewsPage from "./components/NewsPage";


/********************* CONFIG *********************/
const NAV = [
  { href: "#about", label: { uz: "Biz haqimizda", ru: "О нас" } },
  { href: "#services", label: { uz: "Xizmatlar", ru: "Услуги" } },
  { href: "#equipment", label: { uz: "Jihozlar", ru: "Оборудование" } },
 // { href: "#accreditation", label: { uz: "Akkreditatsiya", ru: "Аккредитация" } },
  { href: "#gallery", label: { uz: "Galereya", ru: "Галерея" } },
  //{ href: "#excursion", label: { uz: "Ekskursiya", ru: "Экскурсия" } },
  { href: "#team", label: { uz: "Jamoa", ru: "Команда" } },
  { href: "#pricing", label: { uz: "Narxlar", ru: "Цены" } },
  { href: "#contact", label: { uz: "Bog‘lanish", ru: "Контакты" } },
   { href: "/sinov-dasturlari", label: { uz: "Sinov dasturlari", ru: "Программы испытаний" } },
     { href: "/news", label: { uz: "Yangiliklar", ru: "Новости" } },
];

const TESTS = [
  { code: "O’zMSt IEC 61000.4.2-2023", title: "Устойчивость к электростатическим разрядам", note: "Sifat qiymat", icon: "⚡" },
  { code: "O‘z MSt IEC 61000-4-4:2023", title: "Устойчивость к электрическим быстрым переходным процессам (пачкам)", note: "Sifat qiymat", icon: "💥" },
  { code: "Oʻz MSt IEC 61000-4-5:2023", title: "Устойчивость к выбросу напряжения", note: "Sifat qiymat", icon: "🌩️" },
  { code: "Oʻz MSt IEC 61000.4.11-2013", title: "Устойчивость к провалам, кратковременным прерываниям", note: "Sifat qiymat", icon: "🔌" },
  { code: "O'z MSt IEC 61000-4-6:2023", title: "Устойчивость к кондуктивным  помехам, вызванным радиочастотными полями", note: "Sifat qiymat", icon: "🧲" },
  { code: "O‘zMSt IEC 61000-4-3:2023", title: "Устойчивость к радиочастотному электромагнитному полю", note: "Sifat qiymat", icon: "📡" },
  { code: "ГОСТ CISPR 14-1-2022, раздел 9", title: "Уровень напряженности поля ИРП", note: "Son qiymat", icon: "📶" },
  { code: "O‘zMSt IEC 61000-3-3:2023", title: "Ограничение изменений напряжения, колебаний напряжения и фликера", note: "Son qiymat", icon: "🕯️" },
  { code: "O‘zMSt IEC 61000-3-2:2023", title: "Гармонические составляющие тока", note: "Son qiymat", icon: "🎚️" },
  { code: "ГОСТ CISPR 14-1-2022", title: "Уровень напряжения ИРП на сетевых зажимах", note: "Son qiymat", icon: "🔊" },
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
  { name: "Bayonxonov Sobitxon", role: "Texnik xodim", img: "/staff/11.png" },
 
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
🔹 Bu sinov nima?

Tez o‘tuvchi o‘tish jarayonlari (EFT/Burst) — bu elektr tarmoqlarida yoki signal liniyalarida kalitlash jarayonlari vaqtida paydo bo‘ladigan juda qisqa, lekin tez-tez takrorlanadigan impulslardir.

Oddiy misollar:

rele yoqilib-o‘chishi

dvigatel, invertor ishga tushishi

kontaktorlar almashishi

sanoat uskunalarining kalitlash jarayonlari

Bu impulslar ko‘zga ko‘rinmaydi, lekin elektron qurilmalar uchun juda xavfli bo‘lishi mumkin.

🔹 Nima uchun EFT/Burst sinovi kerak?

Real sharoitda qurilmalar:

sanoat tarmoqlariga ulanadi

uzun kabellar orqali ishlaydi

rele, dvigatel, invertorlar bilan yonma-yon joylashadi

Agar qurilma EFT ga chidamsiz bo‘lsa:

noto‘g‘ri buyruqlar paydo bo‘ladi

sensor va nazorat tizimlari adashadi

aloqa uziladi

qurilma qayta yuklanadi yoki osilib qoladi

👉 Shu sababli EFT sinovi ishonchlilik va funksional barqarorlikni tekshiradi.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus EFT/Burst generatori yordamida o‘tkaziladi.

Impulslar:

5/50 ns davomiylikda

5 kHz – 100 kHz chastotada

impuls paketlari (burst) ko‘rinishida yuboriladi

Zarba to‘g‘ridan-to‘g‘ri emas, balki:

quvvat liniyasiga

signal va aloqa portlariga

CDN (Coupling/Decoupling Network) orqali uzatiladi.

🔹 Qaysi joylarga ta’sir qilinadi?

Sinov quyidagi liniyalarga beriladi:

AC / DC quvvat liniyalari

signal kabellari

boshqaruv va aloqa portlari (RS, CAN, Ethernet va boshqalar)

Bu real ekspluatatsiyadagi sharoitni takrorlaydi.

🔹 Sinov darajalari nimani anglatadi?

Sinov darajasi qurilmaning qaysi muhitga mo‘ljallanganini ko‘rsatadi:

past darajalar — ofis va maishiy qurilmalar

yuqori darajalar — sanoat va avtomatika tizimlari

Qurilma impulslar ta’sirida ham to‘g‘ri ishlashi yoki tez tiklanishi kerak.

🔹 Natijalar qanday baholanadi?

Baholash mezonlari ESD dagi kabi:

A — normal ishlash

B — vaqtinchalik buzilish, avtomatik tiklanish

C — operator aralashuvi kerak

D — ishdan chiqish (qabul qilinmaydi)

🔹 Qayerlarda ayniqsa muhim?

EFT/Burst sinovi ayniqsa muhim:

nazorat va avtomatika tizimlari

invertorlar

PLC va boshqaruv modullari

sanoat elektronikalari

🔹 Xulosa (oddiy qilib)

EFT/Burst sinovi shuni tekshiradi:

“Bu qurilma elektr tarmog‘idagi tezkor shovqinlarga qaramay, barqaror ishlay oladimi?”
    `,
    ru: `
🔹 Что такое EFT / Burst?

Электрические быстрые переходные процессы (EFT/Burst) — это короткие, но часто повторяющиеся импульсы, возникающие в силовых и сигнальных линиях при коммутационных процессах.

Примеры:

включение и отключение реле

запуск электродвигателей и инверторов

работа контакторов

коммутация промышленного оборудования

Импульсы очень короткие, но способны серьезно повлиять на электронные устройства.

🔹 Зачем нужно испытание EFT/Burst?

В реальных условиях устройства:

подключены к промышленным электросетям

работают с длинными кабелями

находятся рядом с источниками коммутационных помех

Если устройство неустойчиво к EFT:

возникают ложные сигналы

сбои в системах управления

нарушения связи

перезагрузки или зависания

👉 Испытание EFT/Burst подтверждает надежность и функциональную устойчивость оборудования.

🔹 Как проводится испытание?

Испытание выполняется с помощью генератора EFT/Burst.

Характеристики импульсов:

длительность 5/50 нс

частота повторения 5 кГц – 100 кГц

подача в виде импульсных пакетов

Импульсы вводятся через:

линии питания

сигнальные и коммуникационные порты

с использованием CDN (Coupling/Decoupling Network).

🔹 На какие линии подается воздействие?

Испытание проводится на:

силовые линии AC / DC

сигнальные кабели

порты управления и связи (RS, CAN, Ethernet и др.)

Это имитирует реальные условия эксплуатации.

🔹 Что означают уровни испытаний?

Уровень испытаний показывает, для какой среды предназначено устройство:

низкие уровни — офисная и бытовая среда

высокие уровни — промышленная среда

Устройство должно сохранять работоспособность или быстро восстанавливаться.

🔹 Оценка результатов

Критерии оценки:

A — нормальная работа

B — временное нарушение с самовосстановлением

C — требуется вмешательство оператора

D — отказ оборудования (недопустимо)

🔹 Где особенно важно?

Испытание EFT/Burst критически важно для:

систем управления и автоматизации

инверторов

ПЛК и управляющих модулей

промышленной электроники

🔹 Итог

Испытание EFT/Burst отвечает на вопрос:

«Сможет ли устройство стабильно работать при наличии быстрых электрических помех в сети?»
    `,
  },

 "Oʻz MSt IEC 61000-4-5:2023": {
    uz: `
🔹 Bu sinov nima?

Kuchlanish zarbasi (Surge) — bu elektr tarmog‘ida juda qisqa vaqt ichida paydo bo‘ladigan, lekin katta energiyaga ega kuchlanish impulsidir.

U asosan quyidagi holatlarda yuzaga keladi:

chaqmoq urishi (to‘g‘ridan-to‘g‘ri yoki bilvosita)

elektr tarmog‘ida katta yuklarning ulanishi yoki uzilishi

transformator va podstansiya jarayonlari

sanoat uskunalarining ishga tushishi

Surge impulslari kam uchraydi, lekin elektron qurilmalar uchun eng xavfli ta’sirlardan biri hisoblanadi.

🔹 Nima uchun Surge sinovi kerak?

Agar qurilma kuchlanish zarbalariga chidamsiz bo‘lsa:

elektron komponentlar kuyadi

quvvat bloklari ishdan chiqadi

boshqaruv platalari shikastlanadi

qurilma butunlay yaroqsiz holga keladi

👉 Surge sinovi qurilmaning elektr xavfsizligi va uzoq muddatli ishonchliligini baholaydi.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus Surge generatori yordamida amalga oshiriladi.

Impulslar quyidagi shaklda beriladi:

kuchlanish impulsi: 1,2 / 50 µs

tok impulsi: 8 / 20 µs

Impulslar:

quvvat liniyalariga (AC / DC)

signal va aloqa liniyalariga

maxsus CDN (ulash-ajratish tarmog‘i) orqali kiritiladi.

🔹 Qaysi holatlar taqlid qilinadi?

Sinov real hayotdagi quyidagi holatlarni modellashtiradi:

chaqmoqning elektr tarmog‘iga ta’siri

uzoq tashqi kabellar orqali keladigan impulslar

tashqi muhitdan keladigan yuqori energiyali zarbalar

Bu sinov EFT ga qaraganda kamroq, lekin ancha kuchli ta’sirni tekshiradi.

🔹 Sinov darajalari nimani anglatadi?

Sinov darajalari qurilmaning qayerda ishlatilishini ko‘rsatadi:

past darajalar — maishiy va ofis qurilmalari

yuqori darajalar — sanoat va tashqi muhitga ulangan qurilmalar

Qurilma zarba vaqtida:

ishlashni saqlab qolishi

yoki xavfsiz holatda tiklanishi
kerak.

🔹 Natijalar qanday baholanadi?

Baholash mezonlari:

A — normal ishlash, buzilish yo‘q

B — vaqtinchalik buzilish, avtomatik tiklanish

C — operator aralashuvi talab etiladi

D — doimiy shikastlanish (qabul qilinmaydi)

🔹 Qayerlarda ayniqsa muhim?

Surge sinovi ayniqsa muhim:

tashqi elektr tarmoqlariga ulangan qurilmalar

sanoat avtomatikasi

energetika va aloqa uskunalari

ochiq hududda ishlovchi elektronika

🔹 Xulosa (oddiy qilib)

Surge sinovi quyidagi savolga javob beradi:

“Bu qurilma chaqmoq va tarmoqdagi kuchli zarbalarga bardosh bera oladimi?”

    `,
    ru: `
🔹 Что такое импульс перенапряжения (Surge)?

Выброс напряжения (Surge) — это кратковременный импульс высокого напряжения с большой энергией, возникающий в электрических сетях.

Основные источники:

удары молнии (прямые и косвенные)

коммутационные процессы в электросетях

работа трансформаторов и подстанций

включение мощного промышленного оборудования

Такие импульсы редки, но являются одними из самых разрушительных для электроники.

🔹 Зачем необходимо испытание Surge?

Если устройство неустойчиво к выбросам напряжения:

выходят из строя электронные компоненты

повреждаются блоки питания

нарушается работа управляющих плат

оборудование полностью выходит из строя

👉 Испытание Surge подтверждает электрическую безопасность и надежность оборудования.

🔹 Как проводится испытание?

Испытание выполняется с использованием генератора импульсов перенапряжения (Surge).

Форма импульсов:

напряжение: 1,2 / 50 мкс

ток: 8 / 20 мкс

Импульсы подаются:

на линии питания (AC / DC)

на сигнальные и коммуникационные линии

через CDN (сеть связи/развязки).

🔹 Какие условия моделируются?

Испытание имитирует:

воздействие молнии на электросеть

проникновение импульсов по внешним кабелям

высокоэнергетические перенапряжения

В отличие от EFT, воздействие реже, но значительно мощнее.

🔹 Уровни испытаний

Уровни испытаний показывают условия эксплуатации:

низкие уровни — бытовая и офисная среда

высокие уровни — промышленная и уличная среда

Устройство должно сохранять работоспособность или безопасно восстанавливаться.

🔹 Оценка результатов

Критерии:

A — нормальная работа

B — временное нарушение с самовосстановлением

C — требуется вмешательство оператора

D — необратимое повреждение (недопустимо)

🔹 Где особенно важно?

Испытание Surge критически важно для:

оборудования, подключенного к внешним сетям

промышленной автоматизации

энергетических и телекоммуникационных систем

уличных и инфраструктурных устройств

🔹 Итог

Испытание Surge отвечает на вопрос:

«Выдержит ли устройство мощные импульсы перенапряжения, вызванные молнией или сетью?»

    `,
  },

 "ʻz MSt IEC 61000.4.11-2013": {
    uz: `
🔹 Bu sinov nima?

Kuchlanish provallari (voltage dips) va qisqa muddatli uzilishlar — bu elektr tarmog‘ida kuchlanishning keskin pasayib ketishi yoki butunlay yo‘qolib, qisqa vaqt ichida qayta tiklanishi holatlaridir.

Bunday holatlar quyidagi sabablar bilan yuzaga keladi:

yirik yuklarning (dvigatel, kompressor) ishga tushishi

elektr tarmog‘idagi avariyalar

podstansiya va ta’minot tizimidagi o‘zgarishlar

avtomatik himoya tizimlarining ishga tushishi

Bu hodisalar har kuni uchraydi va ko‘plab qurilmalar uchun muammo tug‘diradi.

🔹 Nima uchun bu sinov kerak?

Agar qurilma kuchlanish pasayishlariga chidamsiz bo‘lsa:

o‘chib qoladi

qayta yuklanadi

noto‘g‘ri ishlay boshlaydi

texnologik jarayon to‘xtaydi

👉 Bu sinov qurilmaning elektr tarmog‘i barqaror bo‘lmagan sharoitlarda ham ishlay olishini tekshiradi.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus kuchlanish provallari generatori yordamida amalga oshiriladi.

Sinov jarayonida:

kuchlanish ma’lum foizgacha pasaytiriladi (masalan, 0%, 40%, 70%)

pasayish aniq belgilangan vaqt oralig‘ida davom etadi

so‘ng kuchlanish normal holatga qaytariladi

Bu jarayon bir necha marta takrorlanadi.

🔹 Qanday holatlar tekshiriladi?

Sinov quyidagilarni baholaydi:

qurilma provallar vaqtida ishlay oladimi

o‘chib qoladimi yoki osilib qoladimi

kuchlanish qaytgach avtomatik tiklanadimi

operator aralashuvi talab qilinadimi

Bu real elektr tarmoqlaridagi vaziyatni aniq aks ettiradi.

🔹 Sinov darajalari nimani anglatadi?

Sinov darajalari:

provallarning chuqurligi (kuchlanish foizi)

davomiyligi (millisekund yoki sekund)

bilan belgilanadi.

Yuqori barqarorlik — qurilmaning sanoat va muhim tizimlar uchun mosligini ko‘rsatadi.

🔹 Natijalar qanday baholanadi?

Baholash mezonlari:

A — normal ishlash, ta’sir yo‘q

B — vaqtinchalik buzilish, avtomatik tiklanish

C — operator aralashuvi zarur

D — qurilma ishdan chiqadi (qabul qilinmaydi)

🔹 Qayerlarda ayniqsa muhim?

Bu sinov ayniqsa muhim:

avtomatika va boshqaruv tizimlari

serverlar va IT uskunalari

sanoat qurilmalari

uzluksiz ishlashi zarur bo‘lgan texnologiyalar

🔹 Xulosa (oddiy qilib)

Bu sinov quyidagiga javob beradi:

“Elektr tarmog‘ida kuchlanish pasayib yoki yo‘qolib qolsa, qurilma o‘zini qanday tutadi?”

    `,
    ru: `
🔹 Что это за испытание?

Провалы напряжения и кратковременные прерывания — это резкое снижение или полное исчезновение напряжения в электросети на короткий промежуток времени с последующим восстановлением.

Основные причины:

пуск мощных электродвигателей

аварии в электрических сетях

переключения на подстанциях

срабатывание защитных устройств

Это одни из самых распространённых нарушений качества электроэнергии.

🔹 Зачем необходимо это испытание?

Если оборудование неустойчиво к таким явлениям:

происходит отключение

перезапуск системы

сбои в работе

остановка технологических процессов

👉 Испытание подтверждает работоспособность оборудования при нестабильном электропитании.

🔹 Как проводится испытание?

Испытание выполняется с использованием генератора провалов напряжения.

В процессе:

напряжение понижается до заданного уровня

выдерживается определённое время

затем восстанавливается до номинального значения

Испытания повторяются несколько раз для оценки устойчивости.

🔹 Что оценивается?

Проверяется:

сохранение работоспособности

корректность восстановления

необходимость вмешательства оператора

отсутствие повреждений оборудования

🔹 Уровни испытаний

Уровни определяются:

глубиной провала напряжения

длительностью воздействия

Чем выше устойчивость — тем выше надежность оборудования.

🔹 Оценка результатов

Критерии:

A — нормальная работа

B — временное нарушение с самовосстановлением

C — требуется вмешательство оператора

D — отказ оборудования (недопустимо)

🔹 Где особенно важно?

Испытание критично для:

систем управления и автоматики

серверного и IT-оборудования

промышленной электроники

непрерывных технологических процессов

🔹 Итог

Испытание IEC 61000-4-11 отвечает на вопрос:

«Как поведёт себя устройство при падении или исчезновении напряжения в сети?»

    `,
  },

   "O'z MSt IEC 61000-4-6:2023": {
    uz: `
🔹 Bu sinov nima?

Konduktiv radiochastotali xalaqitlar — bu yuqori chastotali elektromagnit shovqinlarning kabel va simlar orqali qurilmaga kirib kelishidir.

Bu shovqinlar havodan emas, balki:

quvvat kabellari

signal va aloqa liniyalari

boshqaruv simlari

orqali bevosita qurilma ichiga o‘tadi.

🔹 Bunday xalaqitlar qayerdan paydo bo‘ladi?

Real sharoitda konduktiv RF shovqinlar quyidagi manbalardan keladi:

radio uzatkichlar

mobil aloqa bazaviy stansiyalari

sanoat radio uskunalari

inverterlar va chastota o‘zgartirgichlar

yuqori chastotali generatorlar

Uzoq kabel bu holatda antenna kabi ishlaydi va RF signalni ichkariga olib kiradi.

🔹 Nima uchun bu sinov kerak?

Agar qurilma bunday xalaqitlarga chidamsiz bo‘lsa:

noto‘g‘ri signallar paydo bo‘ladi

sensorlar adashadi

aloqa uziladi

boshqaruv tizimi xato ishlaydi

👉 Bu sinov qurilmaning RF muhitida barqaror ishlashini tekshiradi.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus RF generatori yordamida amalga oshiriladi.

Jarayon quyidagicha:

RF signal 150 kHz – 80 MHz diapazonda yaratiladi

signal kabelga CDN yoki EM-clamp orqali kiritiladi

signal darajasi bosqichma-bosqich oshiriladi

qurilmaning ishlashi kuzatiladi

Bu usul real sharoitdagi RF ta’sirini aniq takrorlaydi.

🔹 Qaysi liniyalar sinovdan o‘tkaziladi?

Sinov odatda quyidagilarga qo‘llaniladi:

AC / DC quvvat liniyalari

signal kabellari

boshqaruv va aloqa portlari (Ethernet, RS, CAN va boshqalar)

Har bir kabel alohida baholanadi.

🔹 Sinov darajalari nimani anglatadi?

Sinov darajasi (V):

qurilmaning ishlash muhiti

sanoat yoki maishiy qo‘llanilishi

ni belgilaydi.

Yuqori daraja — og‘ir elektromagnit muhitga moslikni bildiradi.

🔹 Natijalar qanday baholanadi?

Baholash mezonlari:

A — normal ishlash

B — vaqtinchalik buzilish, avtomatik tiklanish

C — operator aralashuvi talab etiladi

D — doimiy shikastlanish (qabul qilinmaydi)

🔹 Qayerlarda ayniqsa muhim?

Bu sinov ayniqsa muhim:

sanoat avtomatikasi

PLC va boshqaruv modullari

tibbiy va o‘lchov uskunalari

aloqa va IT qurilmalari

🔹 Xulosa (oddiy qilib)

Bu sinov quyidagiga javob beradi:

“Kabel orqali kelayotgan radiochastotali shovqinlar qurilmaning ishiga xalaqit qilmaydimi?”

    `,
    ru: `
🔹 Что это за испытание?

Кондуктивные радиочастотные помехи — это высокочастотные электромагнитные воздействия, проникающие в оборудование через кабели и провода.

В отличие от излучаемых помех, здесь RF-сигнал:

поступает по линиям питания

по сигнальным и управляющим кабелям

напрямую попадает внутрь устройства

🔹 Источники кондуктивных RF-помех

Основные источники:

радиопередатчики

базовые станции мобильной связи

промышленное RF-оборудование

инверторы и преобразователи частоты

мощные электронные установки

Длинные кабели работают как приёмные антенны.

🔹 Зачем необходимо это испытание?

Если оборудование неустойчиво к таким помехам:

появляются ложные сигналы

нарушается управление

возникают сбои связи

оборудование работает некорректно

👉 Испытание подтверждает устойчивость оборудования в радиочастотной среде.

🔹 Как проводится испытание?

Испытание выполняется с использованием:

RF-генератора

CDN или EM-clamp

Параметры воздействия:

частотный диапазон 150 кГц – 80 МГц

подача сигнала через кабели

пошаговое увеличение уровня воздействия

Работа оборудования контролируется на всём диапазоне частот.

🔹 Какие линии испытываются?

Испытанию подвергаются:

линии питания AC / DC

сигнальные кабели

линии управления и связи (Ethernet, RS-485, CAN и др.)

🔹 Уровни испытаний

Уровень испытаний определяется:

условиями эксплуатации

типом оборудования

требуемой степенью электромагнитной устойчивости

Чем выше уровень — тем выше устойчивость.

🔹 Оценка результатов

Критерии:

A — нормальная работа

B — временные нарушения с самовосстановлением

C — требуется вмешательство оператора

D — отказ оборудования (недопустимо)

🔹 Где особенно важно?

Испытание IEC 61000-4-6 критически важно для:

промышленной автоматики

ПЛК и систем управления

измерительных и медицинских приборов

телекоммуникационного оборудования

🔹 Итог

Испытание отвечает на вопрос:

«Будет ли устройство стабильно работать при наличии радиочастотных помех, передающихся по кабелям?»

    `,
  },


   "O‘zMSt IEC 61000-4-3:2023": {
    uz: `
🔹 Bu sinov nima?

Radioto‘lqinli elektromagnit maydon — bu atrof-muhitdagi radiochastotali nurlanish bo‘lib, u qurilmaga havo orqali, ya’ni kabelsiz ta’sir qiladi.

Bu konduktiv sinovdan farqli ravishda:

signal kabel orqali emas

to‘g‘ridan-to‘g‘ri elektromagnit maydon orqali
qurilmaga ta’sir ko‘rsatadi.

🔹 Bunday elektromagnit maydonlar qayerdan keladi?

Real hayotda bunday RF maydonlar quyidagi manbalardan hosil bo‘ladi:

mobil aloqa bazaviy stansiyalari

radio va televideniye uzatkichlari

Wi-Fi va Bluetooth qurilmalari

radar tizimlari

sanoat RF uskunalari

Qurilma bu manbalar yaqinida ishlaganda doimiy elektromagnit ta’sir ostida bo‘ladi.

🔹 Nima uchun bu sinov kerak?

Agar qurilma radioto‘lqinli elektromagnit maydonga chidamsiz bo‘lsa:

noto‘g‘ri buyruqlar qabul qilinadi

sensorlar xato o‘qiydi

displey va boshqaruv buziladi

qurilma beqaror ishlaydi

👉 Bu sinov qurilmaning radioaloqa bilan to‘yingan muhitda ham ishonchli ishlashini tekshiradi.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus anechoyik yoki yarim-anechoyik kamerada o‘tkaziladi.

Jarayon:

qurilma maxsus platformaga joylashtiriladi

antenna yordamida 80 MHz – 6 GHz diapazonda RF signal nurlantiriladi

elektromagnit maydon kuchlanganligi belgilangan darajagacha oshiriladi (V/m)

qurilmaning ishlashi doimiy kuzatiladi

Signal barcha yo‘nalishlardan berilib, real sharoit modellashtiriladi.

🔹 Qanday holatlar tekshiriladi?

Sinov davomida baholanadi:

qurilma uzluksiz ishlayaptimi

noto‘g‘ri ishlash holatlari bormi

avtomatik tiklanish mavjudmi

operator aralashuvi kerakmi

🔹 Sinov darajalari nimani anglatadi?

Sinov darajasi (V/m):

elektromagnit muhitning og‘irligi

qurilmaning qo‘llanilish sohasi

ni bildiradi.

Masalan:

past darajalar — maishiy/ofis muhiti

yuqori darajalar — sanoat va ochiq hududlar

🔹 Natijalar qanday baholanadi?

Baholash mezonlari:

A — normal ishlash

B — vaqtinchalik buzilish, avtomatik tiklanish

C — operator aralashuvi talab etiladi

D — qurilma ishdan chiqadi (qabul qilinmaydi)

🔹 Qayerlarda ayniqsa muhim?

Radiatsiyalangan RF sinovi ayniqsa muhim:

simsiz texnologiyalar yonida ishlovchi qurilmalar

sanoat avtomatikasi

tibbiy va o‘lchov asboblari

transport va infratuzilma elektronikalari

🔹 Xulosa (oddiy qilib)

Bu sinov quyidagiga javob beradi:

“Qurilma kuchli radiochastotali nurlanish ostida ham to‘g‘ri ishlay oladimi?”

    `,
    ru: `
🔹 Что это за испытание?

Радиочастотное электромагнитное поле — это излучаемое RF-воздействие, которое влияет на оборудование через пространство, без проводного подключения.

В отличие от кондуктивных помех, здесь:

воздействие осуществляется по воздуху

электромагнитное поле напрямую влияет на электронные схемы

🔹 Источники радиочастотных полей

Основные источники:

базовые станции мобильной связи

радиовещательные и телевизионные передатчики

Wi-Fi, Bluetooth

радиолокационные системы

промышленное RF-оборудование

Оборудование может находиться под таким воздействием постоянно.

🔹 Зачем необходимо это испытание?

Если устройство неустойчиво к радиочастотному полю:

возникают ложные срабатывания

нарушается управление

появляются сбои в работе

система становится нестабильной

👉 Испытание подтверждает устойчивость оборудования к внешнему электромагнитному излучению.

🔹 Как проводится испытание?

Испытание выполняется в:

полуанэхоичной или анехоичной камере

Процесс:

оборудование устанавливается на испытательную площадку

с помощью антенн создаётся RF-поле в диапазоне 80 МГц – 6 ГГц

уровень поля задаётся в В/м

оборудование контролируется на всех частотах

Излучение подаётся с разных направлений.

🔹 Что оценивается?

Оценивается:

корректность работы

устойчивость к воздействию

способность к самовосстановлению

отсутствие повреждений

🔹 Уровни испытаний

Уровень (В/м) характеризует:

условия эксплуатации

степень электромагнитной насыщенности среды

Чем выше уровень — тем выше требования к оборудованию.

🔹 Оценка результатов

Критерии:

A — нормальная работа

B — временные нарушения с самовосстановлением

C — требуется вмешательство оператора

D — отказ оборудования (недопустимо)

🔹 Где особенно важно?

Испытание IEC 61000-4-3 критически важно для:

оборудования, работающего рядом с радиопередатчиками

промышленной автоматики

медицинской техники

транспортных и инфраструктурных систем

🔹 Итог

Испытание отвечает на вопрос:

«Сможет ли оборудование стабильно работать в условиях сильного радиочастотного излучения?»

    `,
  },


   "ГОСТ CISPR 14-1-2022, раздел 9": {
    uz: `
🔹 Bu nima?

IRP (Индустриальные радиопомехи) — bu qurilmaning ishlashi davomida o‘zi hosil qiladigan radiochastotali elektromagnit shovqinlardir.

Bu sinov:

qurilmaning tashqariga qancha elektromagnit nurlanish chiqarayotganini

atrofdagi radioaloqa va boshqa qurilmalarga xalaqit bermasligini

baholaydi.

👉 Bu immunitet emas, balki chiqarilayotgan shovqin (emissiya) sinovidir.

🔹 Nima uchun bu sinov kerak?

Agar qurilma haddan tashqari IRP chiqarsa:

radio va TV signallar buziladi

Wi-Fi va aloqa tizimlari ishlamaydi

boshqa elektron qurilmalar noto‘g‘ri ishlaydi

👉 Shu sababli davlat va xalqaro me’yorlar qurilmaning maksimal ruxsat etilgan nurlanish darajasini qat’iy belgilaydi.

🔹 Sinov nimani o‘lchaydi?

Ushbu sinovda o‘lchanadi:

radiochastotali elektromagnit maydonning kuchlanganligi (V/m yoki dBµV/m)

qurilma chiqarayotgan nurlanish spektri

ruxsat etilgan limitlardan oshish-oshmasligi

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus:

yarim-anechoyik kamera

yoki ochiq sinov maydonchasida

o‘tkaziladi.

Jarayon:

qurilma normal ish rejimida yoqiladi

o‘lchov antennasi bilan 30 MHz – 300 MHz (va yuqori diapazonlar) tekshiriladi

turli balandlik va masofalarda o‘lchov qilinadi

maksimal chiqish aniqlanadi

🔹 Qaysi qurilmalar uchun majburiy?

ГОСТ CISPR 14-1 asosan quyidagilarga tatbiq etiladi:

maishiy elektr jihozlari

elektr asboblar

maishiy mashinalar

shunga o‘xshash qurilmalar

🔹 Natijalar qanday baholanadi?

O‘lchangan qiymatlar:

standartda belgilangan limit chiziqlari bilan solishtiriladi

Natija:

✅ limitdan past — muvofiq

❌ limitdan yuqori — nomuvofiq

Bu yerda A/B/C/D yo‘q — faqat limitga mos yoki mos emas.

🔹 Xulosa (oddiy qilib)

Bu sinov quyidagiga javob beradi:

“Qurilma ishlayotganda atrofga radio shovqin chiqarib, boshqa qurilmalarga xalaqit bermayaptimi?”

    `,
    ru: `
🔹 Что такое ИРП?

Индустриальные радиопомехи (ИРП) — это радиочастотные электромагнитные излучения, которые устройство само создаёт во время работы.

Данное испытание относится к:

эмиссии (излучению)

а не к помехоустойчивости

Оно показывает, насколько сильно устройство излучает радиопомехи во внешнюю среду.

🔹 Зачем проводится это испытание?

Если оборудование превышает допустимые уровни ИРП:

нарушается радиосвязь и телевещание

возникают помехи Wi-Fi и связи

страдает работа другой электроники

👉 Поэтому нормативы строго ограничивают уровень излучения.

🔹 Что измеряется?

В ходе испытаний измеряется:

напряжённость электромагнитного поля (dBµV/m)

спектр радиопомех

соответствие установленным пределам

🔹 Как проводится испытание?

Испытание проводится:

в полуанэхоичной камере

либо на открытой измерительной площадке

Процедура:

оборудование работает в нормальном режиме

измерения выполняются в диапазоне 30 МГц – 300 МГц и выше

антенна перемещается по высоте и расстоянию

фиксируется максимальный уровень излучения

🔹 Для какого оборудования применяется?

ГОСТ CISPR 14-1 распространяется на:

бытовые электрические приборы

электроинструменты

аналогичное оборудование

🔹 Оценка результатов

Результаты:

сравниваются с предельными значениями стандарта

Итог:

✅ соответствует требованиям

❌ превышает допустимый уровень

Классификация A/B/C/D не применяется.

🔹 Итог

Испытание отвечает на вопрос:

«Не создаёт ли устройство недопустимых радиопомех для окружающей среды?»

    `,
  },


   "O‘zMSt IEC 61000-3-3:2023": {
    uz: `
🔹 Bu nima?

Kuchlanish o‘zgarishlari va tebranishlari — bu elektr tarmog‘ida yuklamaning tez-tez o‘zgarishi natijasida kuchlanishning vaqtinchalik pasayib-ko‘tarilishidir.

Fliker (flicker) esa shu tebranishlar sabab:

chiroqlar miltillashi

yorug‘likning ko‘zga sezilarli o‘zgarishi

insonda noqulaylik va charchoq

kabi holatlarni yuzaga keltiradi.

🔹 Fliker qayerdan paydo bo‘ladi?

Fliker odatda quyidagi qurilmalar sababli yuzaga keladi:

dvigatellar va kompressorlar

payvandlash apparatlari

isitgichlar

kuchli impulsli yuklamalar

tez-tez yoqilib-o‘chadigan qurilmalar

Ayniqsa maishiy va umumiy tarmoqlarda bu muammo sezilarli bo‘ladi.

🔹 Nima uchun bu sinov kerak?

Agar qurilma fliker va kuchlanish tebranishlarini kuchli hosil qilsa:

yoritish tizimlari bezovta qiladi

boshqa qurilmalar beqaror ishlaydi

elektr tarmog‘i sifati yomonlashadi

👉 Shu sababli standart qurilmaning tarmoqqa ta’sirini cheklashni talab qiladi.

Bu sinov qurilma nimaga chidamli ekanini emas, balki:

qurilma elektr tarmog‘ini qanchalik “bezovta qilayotganini” baholaydi.

🔹 Sinov nimani o‘lchaydi?

Sinov jarayonida quyidagilar baholanadi:

kuchlanish o‘zgarishlari (ΔU)

qisqa muddatli fliker — Pst

uzoq muddatli fliker — Plt

Bu ko‘rsatkichlar inson ko‘zi sezgirligiga mos matematik model asosida hisoblanadi.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus fliker analizatori yordamida amalga oshiriladi.

Jarayon:

qurilma normal ish rejimida ishlatiladi

tarmoq kuchlanishidagi o‘zgarishlar o‘lchanadi

fliker ko‘rsatkichlari hisoblanadi

natijalar standart limitlari bilan solishtiriladi

🔹 Qaysi qurilmalar uchun majburiy?

IEC 61000-3-3 asosan:

maishiy elektr qurilmalari

ofis texnikasi

16 A gacha bo‘lgan qurilmalar

uchun qo‘llaniladi.

🔹 Natijalar qanday baholanadi?

Natijalar:

standartda belgilangan limit qiymatlar bilan taqqoslanadi

Baholash:

✅ limitdan oshmasa — muvofiq

❌ limitdan oshsa — nomuvofiq

Bu sinovda A/B/C/D mezonlari qo‘llanilmaydi.

🔹 Xulosa (oddiy qilib)

Bu sinov quyidagiga javob beradi:

“Bu qurilma elektr tarmog‘ida kuchlanishni buzib, chiroqlarni miltillatmayaptimi?”

    `,
    ru: `
🔹 Что это?

Изменения и колебания напряжения — это временные отклонения напряжения в сети, возникающие из-за переменной нагрузки.

Фликер (flicker) — это визуально заметное:

мерцание света

колебание яркости ламп

которое вызывает дискомфорт у человека.

🔹 Причины возникновения фликера

Основные источники:

электродвигатели

компрессоры

сварочные аппараты

нагревательные устройства

импульсные нагрузки

Особенно заметно в бытовых и распределительных сетях.

🔹 Зачем проводится это испытание?

Если оборудование вызывает сильный фликер:

ухудшается качество электроэнергии

нарушается работа других устройств

создаётся дискомфорт для пользователей

👉 Испытание оценивает влияние оборудования на электрическую сеть, а не его помехоустойчивость.

🔹 Что измеряется?

В процессе испытаний оцениваются:

изменения напряжения (ΔU)

кратковременный фликер — Pst

долговременный фликер — Plt

Расчёты выполняются по модели чувствительности человеческого зрения.

🔹 Как проводится испытание?

Испытание выполняется с помощью анализатора фликера.

Процедура:

оборудование работает в штатном режиме

измеряются колебания напряжения

рассчитываются показатели фликера

значения сравниваются с нормативными пределами

🔹 Для какого оборудования применяется?

Стандарт IEC 61000-3-3 применяется к:

бытовым приборам

офисному оборудованию

устройствам с током до 16 А

🔹 Оценка результатов

Результаты:

сравниваются с установленными пределами

Итог:

✅ соответствует требованиям

❌ не соответствует требованиям

Классификация A/B/C/D не используется.

🔹 Итог

Испытание отвечает на вопрос:

«Не ухудшает ли оборудование качество напряжения в сети и не вызывает ли мерцание света?»

    `,
  },


   "O‘zMSt IEC 61000-3-2:2023": {
    uz: `
🔹 Bu nima?

Tok garmoniklari — bu elektr qurilma iste’mol qilayotgan tokning ideal sinus shakldan og‘ishi natijasida paydo bo‘ladigan qo‘shimcha chastotalardir.

Bunga sabab bo‘ladigan qurilmalar:

impulsli quvvat manbalari

invertorlar va zaryadlovchi qurilmalar

LED yoritish tizimlari

kompyuter va IT texnikasi

Bunday qurilmalar tarmoqdan tokni notekis, bo‘lak-bo‘lak qilib oladi.

🔹 Garmoniklar nimaga xavfli?

Agar tok garmoniklari yuqori bo‘lsa:

elektr tarmog‘i qizib ketadi

transformator va kabellar ortiqcha yuklanadi

avtomatik himoya noto‘g‘ri ishlaydi

kuchlanish sifati yomonlashadi

boshqa qurilmalar ishi buziladi

👉 Shu sababli standartlar tok garmoniklarini qat’iy cheklaydi.

🔹 Bu sinov nimani baholaydi?

IEC 61000-3-2 sinovi:

qurilma tarmoqqa qancha garmonik tok chiqarayotganini

har bir garmonik (3-, 5-, 7- va boshqalar) bo‘yicha limitdan oshmasligini

tekshiradi.

Bu immunitet sinovi emas, balki tarmoqqa ta’sir (emissiya) sinovidir.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus quvvat analizatori yordamida bajariladi.

Jarayon:

qurilma nominal rejimda ishlaydi

tok shakli real vaqt rejimida o‘lchanadi

garmonik spektr ajratib olinadi

har bir garmonik standart limitlari bilan solishtiriladi

🔹 Qurilmalar sinflari (A / B / C / D)

IEC 61000-3-2 qurilmalarni to‘rt sinfga ajratadi:

A sinf — ko‘pchilik maishiy va sanoat qurilmalari

B sinf — ko‘chma elektr asboblar

C sinf — yoritish uskunalari (LED, lampalar)

D sinf — maxsus elektronika (kompyuterlar, TV, monitorlar)

Har bir sinf uchun alohida garmonik limitlar belgilangan.

🔹 Qaysi qurilmalar uchun majburiy?

Standart asosan:

16 A gacha bo‘lgan qurilmalar

maishiy va ofis texnikasi

yoritish uskunalari

uchun majburiy hisoblanadi.

🔹 Natijalar qanday baholanadi?

Natijalar:

har bir garmonik komponent bo‘yicha

belgilangan limit qiymatlar bilan solishtiriladi

Baholash:

✅ limitdan oshmasa — muvofiq

❌ limitdan oshsa — nomuvofiq

Bu sinovda A/B/C/D ishlash mezonlari qo‘llanilmaydi (ular sinflar uchun).

🔹 Xulosa (oddiy qilib)

Bu sinov quyidagiga javob beradi:

“Bu qurilma elektr tarmog‘ini garmonik toklar bilan qanchalik ifloslayapti?”

    `,
    ru: `
🔹 Что это такое?

Гармоники тока — это дополнительные частотные составляющие тока, возникающие из-за нелинейного потребления электроэнергии.

Основные источники:

импульсные источники питания

инверторы и зарядные устройства

светодиодное освещение

компьютерная и офисная техника

Такое оборудование потребляет ток не по синусоиде.

🔹 Почему гармоники опасны?

Повышенный уровень гармоник приводит к:

перегреву кабелей и трансформаторов

снижению эффективности сети

сбоям защитных устройств

ухудшению качества электроэнергии

👉 Поэтому уровень гармонических токов строго нормируется.

🔹 Что оценивает испытание?

Испытание IEC 61000-3-2 определяет:

уровень гармонических токов

соответствие каждого гармоника установленным пределам

Это испытание относится к эмиссии, а не к помехоустойчивости.

🔹 Как проводится испытание?

Испытание выполняется с помощью анализатора качества электроэнергии.

Процедура:

оборудование работает в номинальном режиме

измеряется форма тока

рассчитываются гармонические составляющие

значения сравниваются с нормативами

🔹 Классы оборудования (A / B / C / D)

Оборудование классифицируется:

Класс A — общее оборудование

Класс B — переносные инструменты

Класс C — осветительное оборудование

Класс D — компьютерная и мультимедийная техника

Для каждого класса действуют свои пределы гармоник.

🔹 Для какого оборудования применяется?

Стандарт распространяется на:

оборудование с током до 16 А

бытовые и офисные устройства

осветительные приборы

🔹 Оценка результатов

Результаты:

сравниваются с установленными пределами

Итог:

✅ соответствует требованиям

❌ не соответствует требованиям

Критерии A/B/C/D применяются только для классификации, не для оценки работы.

🔹 Итог

Испытание отвечает на вопрос:

«Не создаёт ли оборудование недопустимых гармонических искажений тока в сети?»

    `,
  },


   "ГОСТ CISPR 14-1-2022": {
    uz: `
🔹 Bu nima?

IRP kuchlanishi tarmoq klemmalarida — bu qurilma ishlayotgan paytda elektr tarmog‘iga qaytarib yuboradigan radiochastotali shovqin kuchlanishidir.

Bu shovqin:

havo orqali tarqalmaydi

to‘g‘ridan-to‘g‘ri elektr simlari orqali boshqa qurilmalarga o‘tadi

👉 Bu chiqarilayotgan xalaqit (emissiya) sinoviga kiradi, immunitet emas.

🔹 Nima uchun bu sinov kerak?

Agar qurilma tarmoqqa kuchli IRP yuborsa:

boshqa qurilmalar shovqin bilan ishlaydi

radio va aloqa tizimlari buziladi

umumiy elektr tarmog‘i “ifloslanadi”

👉 Shu sababli standart qurilmaning tarmoqqa uzatayotgan shovqinini qat’iy cheklaydi.

🔹 Sinov nimani o‘lchaydi?

Sinov davomida o‘lchanadi:

tarmoq klemmalaridagi radiochastotali kuchlanish darajasi

o‘lchov birliklari: dBµV

shovqin spektri va maksimal qiymatlar

O‘lchovlar 150 kHz – 30 MHz chastota diapazonida amalga oshiriladi.

🔹 Sinov qanday o‘tkaziladi?

Sinov maxsus:

LISN (Line Impedance Stabilization Network)

o‘lchov qabul qilgichi (receiver)

yordamida bajariladi.

Jarayon:

qurilma nominal rejimda ishlaydi

LISN orqali tarmoq shovqini ajratib olinadi

har bir faza va nol liniyasi bo‘yicha o‘lchanadi

maksimal IRP darajasi aniqlanadi

🔹 Qaysi qurilmalar uchun qo‘llaniladi?

ГОСТ CISPR 14-1 asosan:

maishiy elektr qurilmalari

elektr asboblar

maishiy mashinalar

shunga o‘xshash uskunalar

uchun majburiy hisoblanadi.

🔹 Natijalar qanday baholanadi?

O‘lchangan qiymatlar:

standartda belgilangan limit chiziqlari bilan solishtiriladi

Natija:

✅ limitdan past — muvofiq

❌ limitdan yuqori — nomuvofiq

Bu sinovda A/B/C/D mezonlari qo‘llanilmaydi.

🔹 Xulosa (oddiy qilib)

Bu sinov quyidagiga javob beradi:

“Qurilma elektr tarmog‘i orqali boshqa qurilmalarga radio shovqin tarqatmayaptimi?”

    `,
    ru: `
🔹 Что это такое?

Напряжение ИРП на сетевых зажимах — это уровень радиочастотных помех, которые оборудование возвращает в электрическую сеть во время работы.

Помехи:

распространяются по проводам

воздействуют на другое оборудование через сеть

Это испытание относится к кондуктивной эмиссии.

🔹 Зачем проводится это испытание?

Если оборудование создает высокий уровень ИРП:

возникают помехи в других устройствах

нарушается работа радио- и телесистем

ухудшается качество электросети

👉 Поэтому стандарт ограничивает допустимый уровень таких помех.

🔹 Что измеряется?

В ходе испытаний измеряется:

уровень напряжения радиопомех на сетевых зажимах

единицы измерения: dBµV

спектр помех

Диапазон частот: 150 кГц – 30 МГц.

🔹 Как проводится испытание?

Испытание выполняется с использованием:

LISN (сеть стабилизации импеданса линии)

измерительного приёмника

Процедура:

оборудование работает в штатном режиме

помехи отделяются от сети с помощью LISN

измерения проводятся по каждой линии

фиксируется максимальный уровень ИРП

🔹 Для какого оборудования применяется?

ГОСТ CISPR 14-1 распространяется на:

бытовые электрические приборы

электроинструменты

бытовые машины и аналогичное оборудование

🔹 Оценка результатов

Результаты:

сравниваются с предельными значениями стандарта

Итог:

✅ соответствует требованиям

❌ не соответствует требованиям

Классификация A/B/C/D не применяется.

🔹 Итог

Испытание отвечает на вопрос:

«Не создает ли оборудование недопустимых радиопомех в электрической сети?»

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
  const sectionIds = NAV
    .filter((n) => n.href.startsWith("#")) // faqat sectionlar
    .map((n) => n.href.replace("#", ""));

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] }
  );

  sectionIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

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
          <div className="w-full overflow-hidden bg-yellow-50 border border-yellow-300 rounded-xl">
  <div className="whitespace-nowrap animate-marquee py-2 text-sm text-yellow-800 font-medium">
   ⚠️Sayt hozir TEST rejimida ishlamoqda. Ushbu platforma hozircha hech qanday tashkilotga rasman tegishli emas. Saytda joylashtirilgan ma’lumotlar sinov xarakteriga ega bo‘lib, istalgan vaqtda yangilanishi yoki o‘zgartirilishi mumkin.
  </div>
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
            <img
  src="/favicon.png"
  alt="EMC Lab"
  className="h-9 w-9 rounded-2xl object-cover ring-2 ring-white/60"
/>

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

  <div className="flex items-center gap-3">
              <button onClick={() => setLang("uz")} className={`hover:underline ${lang === "uz" ? "font-semibold" : ""}`}>UZ</button>
              <span className="text-gray-400">|</span>
              <button onClick={() => setLang("ru")} className={`hover:underline ${lang === "ru" ? "font-semibold" : ""}`}>РУ</button>
              <span className="mx-1" />
      
                 



            </div>

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
              <a 
  href="https://academy.emclab.uz/"
  target="_blank"
  rel="noopener noreferrer"
  className="
    relative inline-flex items-center justify-center
    px-6 py-3
    text-sm font-semibold
    text-white
    rounded-2xl
    overflow-hidden
    bg-gradient-to-r from-sky-600 via-cyan-500 to-blue-600
    bg-[length:200%_200%]
    shadow-lg
    transition-all duration-500
    hover:scale-105
    hover:shadow-2xl
    hover:bg-[position:100%_0]
  "
>
  <span className="relative z-10">
    {lang === "uz" ? "EMC Akademiyasi" : "Академия EMC"}
  </span>

  {/* Shine Effect */}
  <span className="
    absolute top-0 left-[-75%]
    w-1/2 h-full
    bg-white/20
    skew-x-12
    transition-all duration-700
    group-hover:left-[125%]
  "></span>
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
                {/* <div>
                  <label className="text-sm font-medium">{lang==="uz" ? "Qiziqtirgan sinov(lar)" : "Интересующие испытания"}</label>
                  <select name="test" className="mt-1 w-full rounded-xl border px-3 py-2">
                    {TESTS.map((tst, i) => (
                      <option key={i}>{`${tst.code} – ${tst.title}`}</option>
                    ))}
                  </select>
                </div> */}
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
      <Route path="/news" element={<NewsPage />} />
      <Route path="/sinov-dasturlari" element={<SinovDasturlari />} />

    </Routes>
    
  );
}
