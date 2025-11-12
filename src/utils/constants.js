// src/utils/constants.js
// ====== STAFF photos (sync with public/staff/*) ======
export const STAFF_PHOTOS = {
  "Xakimov Aziz": "/staff/1.png",
  "Tillayev Anvar": "/staff/2.png",
  "Abdurashidov Davron": "/staff/3.png",
  "Odamov G‘ulomjon": "/staff/4.jpg",
  "Reimbayev Xushnud": "/staff/5.png",
  "Alekseyev Andrey": "/staff/6.png",
  "Abduvohobov Ravshan": "/staff/7.png",
  "Joldasbaev Dastanbek": "/staff/8.jpg",
  "Sobirov Doston": "/staff/9.png",
  "Karimov Suxrob": "/staff/10.png",
  "Sharofiddinov Najmiddin": "/staff/11.png",
  "Suxanov Alijan": "/staff/12.png",
};

// ====== ENUM/LISTS ======
export const ORG_LIST = ["Toshkent","Attest","Premier Certification Center","Electro-Class Control"];
export const STATUS_TOLOV = ["Belgilanmagan","To'lov bor","To'lov yo'q"];
export const STATUS_HOLAT = ["Belgilanmagan","Jarayonda","Sinov tugatildi","Protokol yuborildi","Bekor qilindi"];
export const QIZIL_ZONA = ["Ha","Yo'q"];

// ====== LANG ======
export const T = {
  uz: {
    title:"Kirish", username:"Login", password:"Parol", signIn:"Kirish", wrong:"Login yoki parol noto‘g‘ri",
    loading:"Yuklanmoqda...", dashboard:"Boshqaruv paneli", logout:"Chiqish", hello:"Salom", role:"Roli",
    profile:"Profil", activity:"Faollik", employees:"Hodimlar", standards:"Standartlar",
    combo:"Arizalar & Harakat", stats:"Statistika", total:"Jami", inprog:"Jarayonda", done:"Sinov tugatildi",
    canceled:"Bekor qilindi", payyes:"To‘lov bor", payno:"To‘lov yo‘q",
    newApp:"Yangi ariza", appNum:"Ariza raqami", org:"Organ Sertifikatsiya", product:"Mahsulot",
    client:"Pskent/Toshkent (mijoz)", payStatus:"Status (to‘lov)", flowStatus:"Status (holat)", redZone:"Qizil zona",
    note:"Izoh", add:"Qo‘shish", save:"Saqlash", remove:"O‘chirish", edit:"Tahrirlash", cancel:"Bekor qilish",
    actions:"Harakatlar", time:"Vaqt", user:"Hodim", search:"Qidiruv", all:"Barchasi", none:"Hozircha yo‘q",
    back:"Bosh menyu", create:"Yaratish", employeesList:"Hodimlar ro‘yxati", addEmployee:"Yangi hodim qo‘shish",
    fullname:"To‘liq ism", empUsername:"Login (hodimniki)", empPassword:"Parol (hodimniki)", empRole:"Roli",
    admin:"Admin", employee:"Hodim", photoUrl:"Rasm (URL)", importCSV:"CSV import", exportCSV:"CSV export",
    perPage:"Sahifada", saved:"Saqlandi", updated:"Yangilandi", deleted:"O‘chirildi",
    changePass:"Parolni almashtirish", newPass:"Yangi parol", confirm:"Tasdiqlash", passChanged:"Parol almashtirildi",
    duplicate:"Bu ariza raqami allaqachon mavjud", sort:"Saralash",
    stdTitle:"Standartlar to‘plami", stdHint:"/public/standards/ ichiga fayllarni joylang va index.json ni to‘ldiring",
    stdRefresh:"Yangilash", stdDownload:"Yuklab olish", stdOpenFolder:"Papkani ochish", stdCount:"Jami fayl",
    stdBadJson:"index.json xato yoki to‘liq emas", stdEmpty:"Hozircha standartlar topilmadi",
  },
  ru: {
    title:"Вход", username:"Логин", password:"Пароль", signIn:"Войти", wrong:"Логин или пароль неверны",
    loading:"Загрузка...", dashboard:"Панель", logout:"Выйти", hello:"Здравствуйте", role:"Роль",
    profile:"Профиль", activity:"Лента", employees:"Сотрудники", standards:"Стандарты",
    combo:"Заявки & Движение", stats:"Статистика", total:"Всего", inprog:"В процессе", done:"Завершено",
    canceled:"Отменено", payyes:"Оплачено", payno:"Без оплаты",
    newApp:"Новая заявка", appNum:"№ заявки", org:"Орган сертиф.", product:"Изделие",
    client:"Пскент/Ташкент (клиент)", payStatus:"Статус (оплата)", flowStatus:"Статус (этап)", redZone:"Красная зона",
    note:"Примечание", add:"Добавить", save:"Сохранить", remove:"Удалить", edit:"Править", cancel:"Отмена",
    actions:"Действия", time:"Время", user:"Сотр.", search:"Поиск", all:"Все", none:"Пока нет",
    back:"В меню", create:"Создать", employeesList:"Список сотрудников", addEmployee:"Добавить сотрудника",
    fullname:"ФИО", empUsername:"Логин (сотр.)", empPassword:"Пароль (сотр.)", empRole:"Роль",
    admin:"Админ", employee:"Сотр.", photoUrl:"Фото (URL)", importCSV:"Импорт CSV", exportCSV:"Экспорт CSV",
    perPage:"На странице", saved:"Сохранено", updated:"Обновлено", deleted:"Удалено",
    changePass:"Сменить пароль", newPass:"Новый пароль", confirm:"Подтвердить", passChanged:"Пароль изменен",
    duplicate:"Такая заявка уже существует", sort:"Сортировка",
    stdTitle:"Каталог стандартов", stdHint:"Положите файлы в /public/standards/ и заполните index.json",
    stdRefresh:"Обновить", stdDownload:"Скачать", stdOpenFolder:"Открыть папку", stdCount:"Всего файлов",
    stdBadJson:"index.json поврежден или неполный", stdEmpty:"Пока нет стандартов",
  }
};
