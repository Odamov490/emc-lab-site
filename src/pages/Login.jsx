// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { db } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  onSnapshot,
  serverTimestamp,
  doc,
  deleteDoc,
  updateDoc,
  orderBy,
} from "firebase/firestore";

// OPTIONAL: hodim rasm yuklash uchun Firebase Storage (agar firebase.js’da export qilingan bo‘lsa)
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/** ======= TIL (UZ/RU) ======= */
const T = {
  uz: {
    title: "Kirish",
    username: "Login",
    password: "Parol",
    signIn: "Kirish",
    wrong: "Login yoki parol noto‘g‘ri",
    loading: "Yuklanmoqda...",
    dashboard: "Boshqaruv paneli",
    logout: "Chiqish",
    hello: "Salom",
    role: "Roli",
    profile: "Profil",
    activity: "Faollik",
    products: "Mahsulot harakati",
    employees: "Hodimlar",
    applications: "Arizalar",
    // profile+
    fullName: "To‘liq ism",
    position: "Lavozim",
    phone: "Telefon",
    bio: "Qisqa bio",
    photo: "Rasm",
    saveChanges: "O‘zgarishlarni saqlash",
    // stats
    stats: "Statistika",
    totalEmployees: "Hodimlar",
    todayIn: "Bugun kirim",
    todayOut: "Bugun chiqim",
    totalMoves: "Umumiy harakat",
    last7days: "So‘nggi 7 kun",
    // movement
    addMovement: "Harakat qo‘shish",
    productName: "Mahsulot nomi",
    quantity: "Miqdor",
    type: "Turi",
    in: "Kirim",
    out: "Chiqim",
    note: "Izoh",
    save: "Saqlash",
    lastMovements: "Oxirgi harakatlar",
    time: "Vaqt",
    user: "Hodim",
    actions: "Harakatlar",
    remove: "O‘chirish",
    edit: "Tahrirlash",
    search: "Qidiruv",
    filter: "Filtr",
    all: "Barchasi",
    // employees
    addEmployee: "Yangi hodim qo‘shish",
    fullname: "To‘liq ism",
    empUsername: "Login (hodimniki)",
    empPassword: "Parol (hodimniki)",
    empRole: "Roli",
    admin: "Admin",
    employee: "Hodim",
    create: "Yaratish",
    employeesList: "Hodimlar ro‘yxati",
    none: "Hozircha yo‘q",
    lang: "Til",
    upload: "Yuklash",
    // applications
    newApp: "Yangi ariza",
    appNum: "Ariza raqami",
    certOrg: "Organ Sertifikatsiya",
    product: "Mahsulot",
    client: "Pskent/Toshkent (mijoz)",
    createdAt: "Yaratilgan sana",
    statusPay: "Status (to‘lov)",
    statusProc: "Status (holat)",
    redZone: "Qizil zona",
    comment: "Izoh",
    status: "Holat",
    cancelled: "Bekor qilindi",
    pending: "Jarayonda",
    scheduled: "Belgilanmagan",
    finished: "Sinov tugatildi",
    protocol: "Protokol yuborildi",
    accepted: "Qabul qilindi",
    submitted: "Topshirildi",
    yes: "Ha",
    no: "Yo‘q",
    add: "Qo‘shish",
    update: "Yangilash",
  },
  ru: {
    title: "Вход",
    username: "Логин",
    password: "Пароль",
    signIn: "Войти",
    wrong: "Логин или пароль неверны",
    loading: "Загрузка...",
    dashboard: "Панель управления",
    logout: "Выйти",
    hello: "Здравствуйте",
    role: "Роль",
    profile: "Профиль",
    activity: "Активность",
    products: "Движение товара",
    employees: "Сотрудники",
    applications: "Заявки",
    // profile+
    fullName: "Полное имя",
    position: "Должность",
    phone: "Телефон",
    bio: "Краткое био",
    photo: "Фото",
    saveChanges: "Сохранить изменения",
    // stats
    stats: "Статистика",
    totalEmployees: "Сотрудники",
    todayIn: "Приход (сегодня)",
    todayOut: "Расход (сегодня)",
    totalMoves: "Всего движений",
    last7days: "Последние 7 дней",
    // movement
    addMovement: "Добавить движение",
    productName: "Название товара",
    quantity: "Количество",
    type: "Тип",
    in: "Приход",
    out: "Расход",
    note: "Примечание",
    save: "Сохранить",
    lastMovements: "Последние движения",
    time: "Время",
    user: "Сотрудник",
    actions: "Действия",
    remove: "Удалить",
    edit: "Редактировать",
    search: "Поиск",
    filter: "Фильтр",
    all: "Все",
    // employees
    addEmployee: "Добавить сотрудника",
    fullname: "Полное имя",
    empUsername: "Логин (сотр.)",
    empPassword: "Пароль (сотр.)",
    empRole: "Роль",
    admin: "Админ",
    employee: "Сотр.",
    create: "Создать",
    employeesList: "Список сотрудников",
    none: "Пока нет",
    lang: "Язык",
    upload: "Загрузить",
    // applications
    newApp: "Новая заявка",
    appNum: "№ заявки",
    certOrg: "Орган сертификации",
    product: "Продукция",
    client: "Пскент/Ташкент (клиент)",
    createdAt: "Дата создания",
    statusPay: "Статус (оплата)",
    statusProc: "Статус (состояние)",
    redZone: "Красная зона",
    comment: "Комментарий",
    status: "Статус",
    cancelled: "Отклонено",
    pending: "В работе",
    scheduled: "Не назначено",
    finished: "Испытание завершено",
    protocol: "Протокол отправлен",
    accepted: "Принято",
    submitted: "Сдано",
    yes: "Да",
    no: "Нет",
    add: "Добавить",
    update: "Обновить",
  },
};

/** ======= KICHIK UI ======= */
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white/80 dark:bg-white/10 backdrop-blur p-5 shadow ${className}`}>
      {children}
    </div>
  );
}
function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full bg-sky-100 text-sky-800 px-3 py-0.5 text-xs ${className}`}>
      {children}
    </span>
  );
}
const Line = () => <div className="h-px bg-black/10 my-3" />;

/** ======= YORDAMCHI ======= */
const procStatuses = ["pending", "scheduled", "finished", "protocol", "accepted", "submitted", "cancelled"]; // Jarayonda...
const payStatuses = ["paid", "unpaid", "unknown"];

/** ======= LOGIN KOMPONENT ======= */
export default function Login() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("uz"); // uz | ru
  const t = useMemo(() => T[lang], [lang]);

  // auth holati
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

  // login form
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // tabs
  const [tab, setTab] = useState("profile"); // profile | products | employees | applications | activity

  // movements (real-time)
  const [movements, setMovements] = useState([]);
  const [mvForm, setMvForm] = useState({ product: "", qty: "", type: "in", note: "" });
  const [savingMv, setSavingMv] = useState(false);
  const [mvSearch, setMvSearch] = useState("");
  const [mvTypeFilter, setMvTypeFilter] = useState("all");

  // employees (admin only)
  const [empList, setEmpList] = useState([]);
  const [empForm, setEmpForm] = useState({
    fullname: "",
    username: "",
    password: "",
    role: "employee",
    position: "",
    phone: "",
    bio: "",
    photoURL: "",
  });
  const [savingEmp, setSavingEmp] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);

  // applications (Google Sheets tarzida)
  const [apps, setApps] = useState([]);
  const [appForm, setAppForm] = useState({
    appNum: "",
    certOrg: "",
    product: "",
    client: "",
    statusPay: "unknown",
    statusProc: "pending",
    red: false,
    comment: "",
  });
  const [savingApp, setSavingApp] = useState(false);
  const [editingApp, setEditingApp] = useState(null);
  const [appSearch, setAppSearch] = useState("");
  const [appProcFilter, setAppProcFilter] = useState("all");

  // profil tahriri
  const [profileForm, setProfileForm] = useState({
    fullname: "",
    position: "",
    phone: "",
    bio: "",
    photoURL: "",
  });
  const [savingProfile, setSavingProfile] = useState(false);

  /** Sessiyani localStorage dan yuklash */
  useEffect(() => {
    const raw = localStorage.getItem("emc_auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setMe(parsed);
      } catch {}
    }
    setChecking(false);
  }, []);

  /** Real-time streamlar (faqat login bo‘lganda) */
  useEffect(() => {
    if (!me) return;

    // movements
    const unsubMv = onSnapshot(collection(db, "movements"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setMovements(list);
    });

    // employees
    let unsubEmp = null;
    if (me.role === "admin") {
      unsubEmp = onSnapshot(collection(db, "employees"), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEmpList(list);
      });
    } else {
      // faqat o‘z profilini olish (tahrirlash uchun)
      (async () => {
        const qy = query(collection(db, "employees"), where("username", "==", me.username));
        const qs = await getDocs(qy);
        if (!qs.empty) {
          const d = qs.docs[0];
          setProfileForm((s) => ({
            ...s,
            fullname: d.data().fullname || me.fullname,
            position: d.data().position || "",
            phone: d.data().phone || "",
            bio: d.data().bio || "",
            photoURL: d.data().photoURL || "",
          }));
        }
      })();
    }

    // applications
    const unsubApps = onSnapshot(collection(db, "applications"), (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setApps(list);
    });

    return () => {
      unsubMv && unsubMv();
      unsubEmp && unsubEmp();
      unsubApps && unsubApps();
    };
  }, [me]);

  /** Login */
  const doLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);
    try {
      const qy = query(
        collection(db, "employees"),
        where("username", "==", u.trim()),
        where("password", "==", p)
      );
      const qs = await getDocs(qy);
      if (qs.empty) {
        setErr(t.wrong);
        setSubmitting(false);
        return;
      }
      const d = qs.docs[0].data();
      const authObj = {
        id: qs.docs[0].id,
        username: d.username,
        fullname: d.fullname || d.username,
        role: d.role || "employee",
        photoURL: d.photoURL || "",
      };
      localStorage.setItem("emc_auth", JSON.stringify(authObj));
      setMe(authObj);
      setProfileForm((s) => ({
        ...s,
        fullname: authObj.fullname,
        photoURL: authObj.photoURL || "",
      }));
      setSubmitting(false);
      setTab("profile");
    } catch (e2) {
      console.error(e2);
      setErr("Xatolik. Keyinroq urinib ko‘ring.");
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("emc_auth");
    setMe(null);
    setTab("profile");
  };

  /** ===== Movements ===== */
  const addMovement = async (e) => {
    e.preventDefault();
    if (!me) return;
    if (!mvForm.product.trim() || !mvForm.qty) return;

    setSavingMv(true);
    try {
      await addDoc(collection(db, "movements"), {
        product: mvForm.product.trim(),
        qty: Number(mvForm.qty),
        type: mvForm.type, // "in" | "out"
        note: mvForm.note.trim(),
        byUser: me.fullname,
        byUserId: me.id,
        createdAt: serverTimestamp(),
      });
      setMvForm({ product: "", qty: "", type: "in", note: "" });
    } catch (e3) {
      console.error(e3);
      alert("Saqlashda xatolik!");
    } finally {
      setSavingMv(false);
    }
  };
  const removeMovement = async (id) => {
    if (!me) return;
    if (!confirm("O‘chirasizmi?")) return;
    try {
      await deleteDoc(doc(db, "movements", id));
    } catch (e5) {
      console.error(e5);
      alert("O‘chirishda xatolik!");
    }
  };

  /** ===== Employees ===== */
  const uploadPhoto = async (file) => {
    if (!storage || !file) return null;
    const r = ref(storage, `employees/${Date.now()}_${file.name}`);
    await uploadBytes(r, file);
    return await getDownloadURL(r);
  };

  const addOrUpdateEmployee = async (e) => {
    e.preventDefault();
    if (!me || me.role !== "admin") return;

    if (!empForm.username.trim() || !empForm.password.trim() || !empForm.fullname.trim()) {
      return alert("To‘liq to‘ldiring.");
    }
    setSavingEmp(true);
    try {
      let photoURL = empForm.photoURL;
      if (empForm._file) {
        const url = await uploadPhoto(empForm._file).catch(() => null);
        if (url) photoURL = url;
      }
      const payload = {
        username: empForm.username.trim(),
        password: empForm.password.trim(),
        fullname: empForm.fullname.trim(),
        role: empForm.role,
        position: empForm.position || "",
        phone: empForm.phone || "",
        bio: empForm.bio || "",
        photoURL: photoURL || "",
        updatedAt: serverTimestamp(),
      };
      if (editingEmp) {
        await updateDoc(doc(db, "employees", editingEmp.id), payload);
      } else {
        await addDoc(collection(db, "employees"), { ...payload, createdAt: serverTimestamp() });
      }
      setEmpForm({
        fullname: "",
        username: "",
        password: "",
        role: "employee",
        position: "",
        phone: "",
        bio: "",
        photoURL: "",
      });
      setEditingEmp(null);
    } catch (e4) {
      console.error(e4);
      alert("Hodim saqlashda xatolik!");
    } finally {
      setSavingEmp(false);
    }
  };
  const removeEmployee = async (id) => {
    if (!me || me.role !== "admin") return;
    if (!confirm("Hodimni o‘chirasizmi?")) return;
    try {
      await deleteDoc(doc(db, "employees", id));
    } catch (e6) {
      console.error(e6);
      alert("O‘chirishda xatolik!");
    }
  };

  /** ===== Applications ===== */
  const addOrUpdateApp = async (e) => {
    e.preventDefault();
    if (!me) return;
    setSavingApp(true);
    try {
      const payload = {
        appNum: appForm.appNum.trim(),
        certOrg: appForm.certOrg.trim(),
        product: appForm.product.trim(),
        client: appForm.client.trim(),
        statusPay: appForm.statusPay,
        statusProc: appForm.statusProc,
        red: !!appForm.red,
        comment: appForm.comment.trim(),
        updatedAt: serverTimestamp(),
      };
      if (editingApp) {
        await updateDoc(doc(db, "applications", editingApp.id), payload);
      } else {
        await addDoc(collection(db, "applications"), { ...payload, createdAt: serverTimestamp() });
      }
      setAppForm({
        appNum: "",
        certOrg: "",
        product: "",
        client: "",
        statusPay: "unknown",
        statusProc: "pending",
        red: false,
        comment: "",
      });
      setEditingApp(null);
    } catch (e) {
      console.error(e);
      alert("Ariza saqlanmadi!");
    } finally {
      setSavingApp(false);
    }
  };
  const removeApp = async (id) => {
    if (!me) return;
    if (!confirm("Arizani o‘chirasizmi?")) return;
    try {
      await deleteDoc(doc(db, "applications", id));
    } catch (e) {
      console.error(e);
      alert("O‘chirishda xatolik!");
    }
  };

  /** ===== Profile update (non-admin ham) ===== */
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!me) return;
    setSavingProfile(true);
    try {
      let photoURL = profileForm.photoURL || "";
      if (profileForm._file) {
        const url = await uploadPhoto(profileForm._file).catch(() => null);
        if (url) photoURL = url;
      }
      // employee hujjatini topib yangilaymiz
      const qy = query(collection(db, "employees"), where("username", "==", me.username));
      const qs = await getDocs(qy);
      if (!qs.empty) {
        await updateDoc(doc(db, "employees", qs.docs[0].id), {
          fullname: profileForm.fullname,
          position: profileForm.position,
          phone: profileForm.phone,
          bio: profileForm.bio,
          photoURL,
          updatedAt: serverTimestamp(),
        });
      }
      // local auth yangilash
      const updated = { ...me, fullname: profileForm.fullname, photoURL };
      localStorage.setItem("emc_auth", JSON.stringify(updated));
      setMe(updated);
    } catch (e) {
      console.error(e);
      alert("Profil saqlanmadi!");
    } finally {
      setSavingProfile(false);
    }
  };

  /** Hisob-kitoblar (statistika) */
  const today = new Date();
  const isSameDay = (d) => {
    const x = new Date(d);
    return (
      x.getFullYear() === today.getFullYear() &&
      x.getMonth() === today.getMonth() &&
      x.getDate() === today.getDate()
    );
  };
  const todayIn = movements.filter((m) => m.type === "in" && m.createdAt?.toDate && isSameDay(m.createdAt.toDate())).length;
  const todayOut = movements.filter((m) => m.type === "out" && m.createdAt?.toDate && isSameDay(m.createdAt.toDate())).length;
  const totalMoves = movements.length;

  const last7 = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    const label = `${d.getMonth() + 1}/${d.getDate()}`;
    const count = movements.filter((m) => m.createdAt?.toDate && (
      new Date(m.createdAt.toDate()).toDateString() === d.toDateString()
    )).length;
    return { label, count };
  });

  /** Filtering */
  const movFiltered = movements.filter((m) => {
    const okType = mvTypeFilter === "all" || m.type === mvTypeFilter;
    const text = `${m.product} ${m.note || ""} ${m.byUser || ""}`.toLowerCase();
    return okType && text.includes(mvSearch.toLowerCase());
  });

  const appsFiltered = apps.filter((a) => {
    const okProc = appProcFilter === "all" || a.statusProc === appProcFilter;
    const text = `${a.appNum} ${a.certOrg} ${a.product} ${a.client} ${a.comment || ""}`.toLowerCase();
    return okProc && text.includes(appSearch.toLowerCase());
  });

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-gray-600">{t.loading}</div>
      </div>
    );
  }

  // === Agar kirilmagan bo‘lsa — LOGIN FORMA ===
  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{t.title}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span>{t.lang}:</span>
              <button
                onClick={() => setLang("uz")}
                className={`px-2 py-1 rounded border ${lang === "uz" ? "border-sky-500 text-sky-700" : "border-black/10"}`}
              >
                UZ
              </button>
              <button
                onClick={() => setLang("ru")}
                className={`px-2 py-1 rounded border ${lang === "ru" ? "border-sky-500 text-sky-700" : "border-black/10"}`}
              >
                RU
              </button>
            </div>
          </div>

          <Card>
            <form onSubmit={doLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.username}</label>
                <input
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={u}
                  onChange={(e) => setU(e.target.value)}
                  placeholder="employee1"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">{t.password}</label>
                <input
                  type="password"
                  className="mt-1 w-full rounded-xl border px-3 py-2"
                  value={p}
                  onChange={(e) => setP(e.target.value)}
                  placeholder="••••••"
                  required
                />
              </div>

              {err && <div className="text-sm text-red-600">{err}</div>}

              <button
                disabled={submitting}
                className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
              >
                {submitting ? t.loading : t.signIn}
              </button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  // === Kirgandan keyin — DASHBOARD ===
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400" />
            <div className="font-semibold">{T[lang].dashboard}</div>
            <Pill>{me.role}</Pill>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button
              onClick={() => setLang(lang === "uz" ? "ru" : "uz")}
              className="rounded-lg border px-2 py-1 text-[12px]"
            >
              {lang === "uz" ? "РУ" : "UZ"}
            </button>
            <button
              onClick={logout}
              className="rounded-lg border px-3 py-1.5 text-sm hover:bg-black/5"
            >
              {t.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-black/10">
            <div className="flex items-center gap-3">
              <img
                src={me.photoURL || profileForm.photoURL || "https://dummyimage.com/80x80/edf2f7/222&text=👤"}
                alt="avatar"
                className="w-10 h-10 rounded-xl object-cover"
              />
              <div>
                <div className="font-semibold">{t.hello}, {me.fullname}</div>
                <div className="text-xs text-gray-500">{t.role}: {me.role}</div>
              </div>
            </div>
          </div>
          <nav className="p-2">
            <button onClick={() => setTab("profile")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab === "profile" ? "bg-black/5 font-semibold" : ""}`}>{t.profile}</button>
            <button onClick={() => setTab("products")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab === "products" ? "bg-black/5 font-semibold" : ""}`}>{t.products}</button>
            <button onClick={() => setTab("applications")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab === "applications" ? "bg-black/5 font-semibold" : ""}`}>{t.applications}</button>
            {me.role === "admin" && (
              <button onClick={() => setTab("employees")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab === "employees" ? "bg-black/5 font-semibold" : ""}`}>{t.employees}</button>
            )}
            <button onClick={() => setTab("activity")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab === "activity" ? "bg-black/5 font-semibold" : ""}`}>{t.activity}</button>
          </nav>
        </Card>

        {/* Main */}
        <div className="space-y-6">
          {/* PROFILE + STATS */}
          {tab === "profile" && (
            <>
              {/* Stats (admin) */}
              <Card>
                <div className="text-lg font-semibold mb-3">{t.stats}</div>
                <div className="grid sm:grid-cols-4 gap-4 text-sm">
                  <div className="rounded-xl border p-3">
                    <div className="text-gray-500">{t.totalEmployees}</div>
                    <div className="text-2xl font-semibold">{empList.length || "-"}</div>
                  </div>
                  <div className="rounded-xl border p-3">
                    <div className="text-gray-500">{t.todayIn}</div>
                    <div className="text-2xl font-semibold">{todayIn}</div>
                  </div>
                  <div className="rounded-xl border p-3">
                    <div className="text-gray-500">{t.todayOut}</div>
                    <div className="text-2xl font-semibold">{todayOut}</div>
                  </div>
                  <div className="rounded-xl border p-3">
                    <div className="text-gray-500">{t.totalMoves}</div>
                    <div className="text-2xl font-semibold">{totalMoves}</div>
                  </div>
                </div>
                <Line />
                {/* Simple bar chart (CSS) */}
                <div>
                  <div className="text-sm text-gray-500 mb-2">{t.last7days}</div>
                  <div className="flex items-end gap-2 h-24">
                    {last7.map((d) => (
                      <div key={d.label} className="flex flex-col items-center gap-1">
                        <div className="w-6 rounded-xs bg-sky-400" style={{ height: `${(d.count || 0) * 14}px` }} />
                        <div className="text-[10px] text-gray-500">{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="text-lg font-semibold mb-3">{t.profile}</div>
                <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <img
                      src={profileForm.photoURL || "https://dummyimage.com/120x120/edf2f7/222&text=👤"}
                      alt="avatar"
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border px-3 py-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setProfileForm((s) => ({ ...s, _file: file }));
                        }}
                      />
                      {t.upload}
                    </label>
                  </div>
                  <div>
                    <label className="font-medium">{t.fullName}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={profileForm.fullname} onChange={(e) => setProfileForm((s) => ({ ...s, fullname: e.target.value }))} />
                  </div>
                  <div>
                    <label className="font-medium">{t.position}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={profileForm.position} onChange={(e) => setProfileForm((s) => ({ ...s, position: e.target.value }))} />
                  </div>
                  <div>
                    <label className="font-medium">{t.phone}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={profileForm.phone} onChange={(e) => setProfileForm((s) => ({ ...s, phone: e.target.value }))} placeholder="+998 ** *** ** **" />
                  </div>
                  <div>
                    <label className="font-medium">{t.bio}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={profileForm.bio} onChange={(e) => setProfileForm((s) => ({ ...s, bio: e.target.value }))} placeholder="Qisqa ma’lumot" />
                  </div>
                  <div className="sm:col-span-2">
                    <button disabled={savingProfile} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                      {savingProfile ? t.loading : t.saveChanges}
                    </button>
                  </div>
                </form>
              </Card>
            </>
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addMovement}</div>
                <form onSubmit={addMovement} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">{t.productName}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.product} onChange={(e) => setMvForm((s) => ({ ...s, product: e.target.value }))} placeholder="Masalan: R&S ESW8" required />
                  </div>
                  <div>
                    <label className="font-medium">{t.quantity}</label>
                    <input type="number" min={1} className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.qty} onChange={(e) => setMvForm((s) => ({ ...s, qty: e.target.value }))} placeholder="1" required />
                  </div>
                  <div>
                    <label className="font-medium">{t.type}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.type} onChange={(e) => setMvForm((s) => ({ ...s, type: e.target.value }))}>
                      <option value="in">{t.in}</option>
                      <option value="out">{t.out}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium">{t.note}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.note} onChange={(e) => setMvForm((s) => ({ ...s, note: e.target.value }))} placeholder="ixtiyoriy" />
                  </div>
                  <div className="sm:col-span-2">
                    <button disabled={savingMv} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                      {savingMv ? t.loading : t.save}
                    </button>
                  </div>
                </form>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">{t.lastMovements}</div>
                  <div className="flex items-center gap-2">
                    <input placeholder={t.search} className="rounded-lg border px-2 py-1 text-sm" value={mvSearch} onChange={(e) => setMvSearch(e.target.value)} />
                    <select className="rounded-lg border px-2 py-1 text-sm" value={mvTypeFilter} onChange={(e) => setMvTypeFilter(e.target.value)}>
                      <option value="all">{t.all}</option>
                      <option value="in">{t.in}</option>
                      <option value="out">{t.out}</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3">{t.productName}</th>
                        <th className="py-2 pr-3">{t.quantity}</th>
                        <th className="py-2 pr-3">{t.type}</th>
                        <th className="py-2 pr-3">{t.note}</th>
                        <th className="py-2 pr-3">{t.user}</th>
                        <th className="py-2 pr-3">{t.time}</th>
                        <th className="py-2 pr-3">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movFiltered.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-4 text-gray-400">{t.none}</td>
                        </tr>
                      )}
                      {movFiltered.map((m) => (
                        <tr key={m.id} className="border-t">
                          <td className="py-2 pr-3">{m.product}</td>
                          <td className="py-2 pr-3">{m.qty}</td>
                          <td className="py-2 pr-3">
                            <Pill>{m.type === "in" ? t.in : t.out}</Pill>
                          </td>
                          <td className="py-2 pr-3">{m.note || "-"}</td>
                          <td className="py-2 pr-3">{m.byUser}</td>
                          <td className="py-2 pr-3">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : "-"}</td>
                          <td className="py-2 pr-3">
                            <button onClick={() => removeMovement(m.id)} className="text-red-600 hover:underline">{t.remove}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* APPLICATIONS */}
          {tab === "applications" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.newApp}</div>
                <form onSubmit={addOrUpdateApp} className="grid sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="font-medium">{t.appNum}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.appNum} onChange={(e) => setAppForm((s) => ({ ...s, appNum: e.target.value }))} placeholder="137545" required />
                  </div>
                  <div>
                    <label className="font-medium">{t.certOrg}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.certOrg} onChange={(e) => setAppForm((s) => ({ ...s, certOrg: e.target.value }))} placeholder="Toshkent / Attest / Premier..." />
                  </div>
                  <div>
                    <label className="font-medium">{t.product}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.product} onChange={(e) => setAppForm((s) => ({ ...s, product: e.target.value }))} placeholder="Elektr choynak" />
                  </div>
                  <div>
                    <label className="font-medium">{t.client}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.client} onChange={(e) => setAppForm((s) => ({ ...s, client: e.target.value }))} placeholder="Belgilanmagan / Pskent / Toshkent" />
                  </div>
                  <div>
                    <label className="font-medium">{t.statusPay}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.statusPay} onChange={(e) => setAppForm((s) => ({ ...s, statusPay: e.target.value }))}>
                      <option value="unknown">—</option>
                      <option value="paid">{lang === "uz" ? "To‘lov bor" : "Оплачено"}</option>
                      <option value="unpaid">{lang === "uz" ? "Belgilanmagan" : "Не оплачено"}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium">{t.statusProc}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.statusProc} onChange={(e) => setAppForm((s) => ({ ...s, statusProc: e.target.value }))}>
                      <option value="pending">{t.pending}</option>
                      <option value="scheduled">{t.scheduled}</option>
                      <option value="finished">{t.finished}</option>
                      <option value="protocol">{t.protocol}</option>
                      <option value="accepted">{t.accepted}</option>
                      <option value="submitted">{t.submitted}</option>
                      <option value="cancelled">{t.cancelled}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium">{t.redZone}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.red ? "yes" : "no"} onChange={(e) => setAppForm((s) => ({ ...s, red: e.target.value === "yes" }))}>
                      <option value="no">{t.no}</option>
                      <option value="yes">{t.yes}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="font-medium">{t.comment}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.comment} onChange={(e) => setAppForm((s) => ({ ...s, comment: e.target.value }))} placeholder="Izoh..." />
                  </div>
                  <div className="sm:col-span-3">
                    <button disabled={savingApp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                      {savingApp ? t.loading : editingApp ? t.update : t.add}
                    </button>
                    {editingApp && (
                      <button type="button" onClick={() => { setEditingApp(null); setAppForm({ appNum: "", certOrg: "", product: "", client: "", statusPay: "unknown", statusProc: "pending", red: false, comment: "" }); }} className="ml-2 rounded-xl border px-4 py-2 text-sm">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-3">
                  <div className="text-lg font-semibold">{t.applications}</div>
                  <div className="flex items-center gap-2">
                    <input placeholder={t.search} className="rounded-lg border px-2 py-1 text-sm" value={appSearch} onChange={(e) => setAppSearch(e.target.value)} />
                    <select className="rounded-lg border px-2 py-1 text-sm" value={appProcFilter} onChange={(e) => setAppProcFilter(e.target.value)}>
                      <option value="all">{t.all}</option>
                      {procStatuses.map((s) => (
                        <option key={s} value={s}>{T[lang][s] || s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3">{t.appNum}</th>
                        <th className="py-2 pr-3">{t.certOrg}</th>
                        <th className="py-2 pr-3">{t.product}</th>
                        <th className="py-2 pr-3">{t.client}</th>
                        <th className="py-2 pr-3">{t.statusPay}</th>
                        <th className="py-2 pr-3">{t.statusProc}</th>
                        <th className="py-2 pr-3">{t.redZone}</th>
                        <th className="py-2 pr-3">{t.comment}</th>
                        <th className="py-2 pr-3">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appsFiltered.length === 0 && (
                        <tr>
                          <td colSpan={9} className="py-4 text-gray-400">{t.none}</td>
                        </tr>
                      )}
                      {appsFiltered.map((a) => (
                        <tr key={a.id} className={`border-t ${a.red ? "bg-red-50" : ""}`}>
                          <td className="py-2 pr-3">{a.appNum}</td>
                          <td className="py-2 pr-3">{a.certOrg}</td>
                          <td className="py-2 pr-3">{a.product}</td>
                          <td className="py-2 pr-3">{a.client}</td>
                          <td className="py-2 pr-3">{a.statusPay === "paid" ? (lang === "uz" ? "To‘lov bor" : "Оплачено") : a.statusPay === "unpaid" ? (lang === "uz" ? "Belgilanmagan" : "Не оплачено") : "—"}</td>
                          <td className="py-2 pr-3">
                            <Pill className={
                              a.statusProc === "finished" ? "bg-green-100 text-green-800" :
                              a.statusProc === "protocol" ? "bg-amber-100 text-amber-800" :
                              a.statusProc === "cancelled" ? "bg-rose-100 text-rose-800" :
                              "bg-sky-100 text-sky-800"
                            }>
                              {T[lang][a.statusProc] || a.statusProc}
                            </Pill>
                          </td>
                          <td className="py-2 pr-3">{a.red ? t.yes : t.no}</td>
                          <td className="py-2 pr-3">{a.comment || "-"}</td>
                          <td className="py-2 pr-3 space-x-3">
                            <button
                              className="text-sky-700 hover:underline"
                              onClick={() => {
                                setEditingApp(a);
                                setAppForm({
                                  appNum: a.appNum || "",
                                  certOrg: a.certOrg || "",
                                  product: a.product || "",
                                  client: a.client || "",
                                  statusPay: a.statusPay || "unknown",
                                  statusProc: a.statusProc || "pending",
                                  red: !!a.red,
                                  comment: a.comment || "",
                                });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                            >
                              {t.edit}
                            </button>
                            <button className="text-red-600 hover:underline" onClick={() => removeApp(a.id)}>{t.remove}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* EMPLOYEES (admin only) */}
          {tab === "employees" && me.role === "admin" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addEmployee}</div>
                <form onSubmit={addOrUpdateEmployee} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div className="sm:col-span-2 flex items-center gap-4">
                    <img
                      src={empForm.photoURL || "https://dummyimage.com/120x120/edf2f7/222&text=👤"}
                      alt="avatar"
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg border px-3 py-2">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setEmpForm((s) => ({ ...s, _file: file }));
                        }}
                      />
                      {t.upload}
                    </label>
                  </div>
                  <div>
                    <label className="font-medium">{t.fullname}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.fullname} onChange={(e) => setEmpForm((s) => ({ ...s, fullname: e.target.value }))} placeholder="Sobirov Doston" required />
                  </div>
                  <div>
                    <label className="font-medium">{t.empUsername}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.username} onChange={(e) => setEmpForm((s) => ({ ...s, username: e.target.value }))} placeholder="doston" required />
                  </div>
                  <div>
                    <label className="font-medium">{t.empPassword}</label>
                    <input type="text" className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.password} onChange={(e) => setEmpForm((s) => ({ ...s, password: e.target.value }))} placeholder="parol" required />
                  </div>
                  <div>
                    <label className="font-medium">{t.empRole}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.role} onChange={(e) => setEmpForm((s) => ({ ...s, role: e.target.value }))}>
                      <option value="employee">{t.employee}</option>
                      <option value="admin">{t.admin}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium">{t.position}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.position} onChange={(e) => setEmpForm((s) => ({ ...s, position: e.target.value }))} placeholder="Laborant / Operator" />
                  </div>
                  <div>
                    <label className="font-medium">{t.phone}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.phone} onChange={(e) => setEmpForm((s) => ({ ...s, phone: e.target.value }))} placeholder="+998 ** *** ** **" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="font-medium">{t.bio}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.bio} onChange={(e) => setEmpForm((s) => ({ ...s, bio: e.target.value }))} placeholder="Qisqa ma’lumot" />
                  </div>
                  <div className="sm:col-span-2">
                    <button disabled={savingEmp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                      {savingEmp ? t.loading : editingEmp ? t.update : t.create}
                    </button>
                    {editingEmp && (
                      <button type="button" onClick={() => { setEditingEmp(null); setEmpForm({ fullname: "", username: "", password: "", role: "employee", position: "", phone: "", bio: "", photoURL: "" }); }} className="ml-2 rounded-xl border px-4 py-2 text-sm">
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </Card>

              <Card>
                <div className="text-lg font-semibold mb-3">{t.employeesList}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3">{t.photo}</th>
                        <th className="py-2 pr-3">{t.fullname}</th>
                        <th className="py-2 pr-3">{t.username}</th>
                        <th className="py-2 pr-3">{t.position}</th>
                        <th className="py-2 pr-3">{t.role}</th>
                        <th className="py-2 pr-3">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empList.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-4 text-gray-400">{t.none}</td>
                        </tr>
                      )}
                      {empList.map((e) => (
                        <tr key={e.id} className="border-t">
                          <td className="py-2 pr-3">
                            <img src={e.photoURL || "https://dummyimage.com/80x80/edf2f7/222&text=👤"} alt="" className="w-8 h-8 rounded-lg object-cover" />
                          </td>
                          <td className="py-2 pr-3">{e.fullname || "-"}</td>
                          <td className="py-2 pr-3">{e.username}</td>
                          <td className="py-2 pr-3">{e.position || "-"}</td>
                          <td className="py-2 pr-3">{e.role}</td>
                          <td className="py-2 pr-3 space-x-3">
                            <button
                              onClick={() => {
                                setEditingEmp(e);
                                setEmpForm({ ...e, password: e.password || "", _file: null });
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="text-sky-700 hover:underline"
                            >
                              {t.edit}
                            </button>
                            <button onClick={() => removeEmployee(e.id)} className="text-red-600 hover:underline">
                              {t.remove}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* ACTIVITY (feed) */}
          {tab === "activity" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.activity}</div>
              <div className="space-y-3 text-sm">
                {movements.length === 0 && <div className="text-gray-400">{t.none}</div>}
                {movements.slice(0, 50).map((m) => (
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="mt-1">
                      <Pill>{m.type === "in" ? t.in : t.out}</Pill>
                    </div>
                    <div>
                      <div className="font-medium">
                        {m.product} <span className="text-gray-500">×{m.qty}</span>
                      </div>
                      <div className="text-xs text-gray-500">
                        {m.byUser} • {m.createdAt?.toDate ? m.createdAt.toDate().toLocaleString() : "-"}
                        {m.note ? ` • ${m.note}` : ""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
