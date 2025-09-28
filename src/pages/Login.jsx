// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { utils as XLSXUtils, writeFile as XLSXWriteFile } from "xlsx";

import { db, storage } from "../firebase";
import {
  collection, query, where, getDocs, addDoc, onSnapshot,
  serverTimestamp, doc, deleteDoc, updateDoc, orderBy
} from "firebase/firestore";
import {
  ref as storageRef, uploadBytes, getDownloadURL
} from "firebase/storage";

/** ======= TIL (UZ/RU) ======= */
const T = {
  uz: {
    title: "Kirish",
    username: "Login",
    password: "Parol",
    signIn: "Kirish",
    wrong: "Login yoki parol noto‘g‘ri",
    loading: "Yuklanmoqda...",
    dashboard: "Boshqaruv",
    logout: "Chiqish",
    hello: "Salom",
    role: "Roli",
    profile: "Profil",
    activity: "Faollik",
    products: "Mahsulot harakati",
    employees: "Hodimlar",
    applications: "Arizalar",
    save: "Saqlash",
    update: "Yangilash",
    none: "Hozircha yo‘q",
    // profile
    fullname: "To‘liq ism",
    avatar: "Rasm (avatar)",
    upload: "Yuklash",
    // products
    addMovement: "Harakat qo‘shish",
    productName: "Mahsulot nomi",
    quantity: "Miqdor",
    type: "Turi",
    in: "Kirim",
    out: "Chiqim",
    note: "Izoh",
    lastMovements: "Oxirgi harakatlar",
    time: "Vaqt",
    user: "Hodim",
    actions: "Harakatlar",
    remove: "O‘chirish",
    // employees
    addEmployee: "Yangi hodim",
    empUsername: "Login",
    empPassword: "Parol",
    empRole: "Roli",
    admin: "Admin",
    employee: "Hodim",
    create: "Yaratish",
    employeesList: "Hodimlar ro‘yxati",
    // applications
    gridTitle: "Arizalar (sertifikatlash jarayoni)",
    newApp: "Yangi ariza",
    appnum: "Buyurtma №",
    org: "Organi",
    product: "Mahsulot",
    site: "Pskent/Iskit",
    createdAt: "Yaratilgan sana",
    payStatus: "To‘lov holati",
    state: "Holat",
    redzone: "Qizil zona",
    comment: "Izoh",
    search: "Qidirish...",
    filter: "Filtr",
    exportExcel: "Excel’ga eksport",
    clear: "Tozalash",
    // stats
    stats: "Statistika",
    totEmployees: "Hodimlar",
    totMoves: "Harakatlar",
    totApps: "Arizalar",
  },
  ru: {
    title: "Вход",
    username: "Логин",
    password: "Пароль",
    signIn: "Войти",
    wrong: "Логин или пароль неверны",
    loading: "Загрузка...",
    dashboard: "Панель",
    logout: "Выйти",
    hello: "Здравствуйте",
    role: "Роль",
    profile: "Профиль",
    activity: "Активность",
    products: "Движение товара",
    employees: "Сотрудники",
    applications: "Заявки",
    save: "Сохранить",
    update: "Обновить",
    none: "Пока нет",
    // profile
    fullname: "Полное имя",
    avatar: "Фото (аватар)",
    upload: "Загрузить",
    // products
    addMovement: "Добавить движение",
    productName: "Название",
    quantity: "Кол-во",
    type: "Тип",
    in: "Приход",
    out: "Расход",
    note: "Примечание",
    lastMovements: "Последние движения",
    time: "Время",
    user: "Сотр.",
    actions: "Действия",
    remove: "Удалить",
    // employees
    addEmployee: "Добавить сотрудника",
    empUsername: "Логин",
    empPassword: "Пароль",
    empRole: "Роль",
    admin: "Админ",
    employee: "Сотр.",
    create: "Создать",
    employeesList: "Список сотрудников",
    // applications
    gridTitle: "Заявки (сертификация)",
    newApp: "Новая заявка",
    appnum: "№ заявки",
    org: "Орган",
    product: "Продукция",
    site: "Пскент/Испыт.",
    createdAt: "Дата создания",
    payStatus: "Статус оплаты",
    state: "Статус (сост.)",
    redzone: "Красная зона",
    comment: "Комментарий",
    search: "Поиск...",
    filter: "Фильтр",
    exportExcel: "Экспорт в Excel",
    clear: "Очистить",
    // stats
    stats: "Статистика",
    totEmployees: "Сотр.",
    totMoves: "Движения",
    totApps: "Заявки",
  },
};

/** ===== UI ===== */
const Card = ({ children, className = "" }) => (
  <div className={`rounded-2xl border border-black/10 bg-white/80 backdrop-blur p-5 shadow ${className}`}>
    {children}
  </div>
);
const Pill = ({ children, tone = "sky" }) => (
  <span className={`inline-flex items-center rounded-full bg-${tone}-100 text-${tone}-800 px-3 py-0.5 text-xs`}>
    {children}
  </span>
);

/** ===== LOGIN ===== */
export default function Login() {
  const navigate = useNavigate();
  const [lang, setLang] = useState("uz"); // uz | ru
  const t = useMemo(() => T[lang], [lang]);

  // auth
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

  // login form
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // tabs
  const [tab, setTab] = useState("dashboard"); // dashboard | profile | products | employees | applications | activity

  // movements
  const [movements, setMovements] = useState([]);
  const [mvForm, setMvForm] = useState({ product: "", qty: "", type: "in", note: "" });
  const [savingMv, setSavingMv] = useState(false);

  // employees (admin)
  const [empList, setEmpList] = useState([]);
  const [empForm, setEmpForm] = useState({ fullname: "", username: "", password: "", role: "employee", avatarUrl: "" });
  const [savingEmp, setSavingEmp] = useState(false);

  // profile edit
  const [profileFullname, setProfileFullname] = useState("");
  const [profileAvatarFile, setProfileAvatarFile] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // applications
  const [apps, setApps] = useState([]);
  const emptyApp = {
    appnum: "", org: "", product: "", site: "",
    payStatus: "", state: "", redzone: "", comment: ""
  };
  const [appForm, setAppForm] = useState(emptyApp);
  const [savingApp, setSavingApp] = useState(false);
  const [search, setSearch] = useState("");
  const [filterState, setFilterState] = useState("");

  // stats
  const [stats, setStats] = useState({ employees: 0, moves: 0, apps: 0 });

  /** Sessiyani yuklash */
  useEffect(() => {
    const raw = localStorage.getItem("emc_auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setMe(parsed);
        setProfileFullname(parsed.fullname || parsed.username);
      } catch {}
    }
    setChecking(false);
  }, []);

  /** Real-time listeners */
  useEffect(() => {
    if (!me) return;
    // movements
    const unsubMv = onSnapshot(collection(db, "movements"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a,b)=> (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      setMovements(list);
      setStats((s)=>({ ...s, moves: list.length }));
    });

    // employees (admin only)
    let unsubEmp = null;
    if (me.role === "admin") {
      unsubEmp = onSnapshot(collection(db, "employees"), (snap) => {
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setEmpList(list);
        setStats((s)=>({ ...s, employees: list.length }));
      });
    }

    // applications
    const unsubApps = onSnapshot(collection(db, "applications"), (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a,b)=> (b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      setApps(list);
      setStats((s)=>({ ...s, apps: list.length }));
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
      // faqat username bo‘yicha hujjatni olib, parolni clientda solishtiramiz
      const q = query(collection(db, "employees"), where("username", "==", u.trim()));
      const qs = await getDocs(q);
      if (qs.empty) {
        setErr(t.wrong); setSubmitting(false); return;
      }
      const d = qs.docs[0]; const data = d.data();
      if ((data.password || "") !== p) {
        setErr(t.wrong); setSubmitting(false); return;
      }
      const authObj = {
        id: d.id,
        username: data.username,
        fullname: data.fullname || data.username,
        role: data.role || "employee",
        avatarUrl: data.avatarUrl || ""
      };
      localStorage.setItem("emc_auth", JSON.stringify(authObj));
      setMe(authObj);
      setProfileFullname(authObj.fullname);
      setSubmitting(false);
      setTab("dashboard");
    } catch (e2) {
      console.error(e2);
      setErr("Xatolik. Keyinroq urinib ko‘ring.");
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("emc_auth");
    setMe(null);
    setTab("dashboard");
  };

  /** Movements */
  const addMovement = async (e) => {
    e.preventDefault();
    if (!me) return;
    if (!mvForm.product.trim() || !mvForm.qty) return;
    setSavingMv(true);
    try {
      await addDoc(collection(db, "movements"), {
        product: mvForm.product.trim(),
        qty: Number(mvForm.qty),
        type: mvForm.type,
        note: mvForm.note.trim(),
        byUser: me.fullname,
        byUserId: me.id,
        createdAt: serverTimestamp(),
      });
      setMvForm({ product: "", qty: "", type: "in", note: "" });
    } finally {
      setSavingMv(false);
    }
  };
  const removeMovement = async (id) => {
    if (!me) return;
    if (!confirm("O‘chirasizmi?")) return;
    await deleteDoc(doc(db, "movements", id));
  };

  /** Employees (admin) */
  const addEmployee = async (e) => {
    e.preventDefault();
    if (!me || me.role !== "admin") return;
    const { fullname, username, password, role } = empForm;
    if (!fullname.trim() || !username.trim() || !password.trim()) return;
    setSavingEmp(true);
    try {
      await addDoc(collection(db, "employees"), {
        fullname: fullname.trim(), username: username.trim(),
        password: password.trim(), role, createdAt: serverTimestamp(), avatarUrl: ""
      });
      setEmpForm({ fullname: "", username: "", password: "", role: "employee", avatarUrl: "" });
    } finally {
      setSavingEmp(false);
    }
  };
  const removeEmployee = async (id) => {
    if (!me || me.role !== "admin") return;
    if (!confirm("Hodimni o‘chirasizmi?")) return;
    await deleteDoc(doc(db, "employees", id));
  };

  /** Profile update (name + avatar) */
  const saveProfile = async (e) => {
    e.preventDefault();
    if (!me) return;
    setUpdatingProfile(true);
    try {
      let avatarUrl = me.avatarUrl || "";
      if (profileAvatarFile) {
        const r = storageRef(storage, `avatars/${me.id}_${Date.now()}`);
        await uploadBytes(r, profileAvatarFile);
        avatarUrl = await getDownloadURL(r);
      }
      // Firestore da userni yangilash
      await updateDoc(doc(db, "employees", me.id), {
        fullname: profileFullname.trim(),
        ...(avatarUrl ? { avatarUrl } : {})
      });
      const updated = { ...me, fullname: profileFullname.trim(), avatarUrl };
      localStorage.setItem("emc_auth", JSON.stringify(updated));
      setMe(updated);
      setProfileAvatarFile(null);
      alert("Profil yangilandi.");
    } catch (e2) {
      console.error(e2);
      alert("Profilni yangilashda xatolik.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  /** Applications (CRUD + export) */
  const addApplication = async (e) => {
    e.preventDefault();
    if (!me) return;
    const payload = {
      ...appForm,
      appnum: appForm.appnum.trim(),
      org: appForm.org.trim(),
      product: appForm.product.trim(),
      site: appForm.site.trim(),
      payStatus: appForm.payStatus.trim(),
      state: appForm.state.trim(),
      redzone: appForm.redzone.trim(),
      comment: appForm.comment.trim(),
      createdAt: serverTimestamp(),
      createdBy: me.fullname,
    };
    setSavingApp(true);
    try {
      await addDoc(collection(db, "applications"), payload);
      setAppForm(emptyApp);
    } finally {
      setSavingApp(false);
    }
  };
  const removeApplication = async (id) => {
    if (!me) return;
    if (!confirm("Arizani o‘chirasizmi?")) return;
    await deleteDoc(doc(db, "applications", id));
  };
  const filteredApps = useMemo(() => {
    const q = search.toLowerCase();
    return apps.filter(a => {
      const blob = `${a.appnum} ${a.org} ${a.product} ${a.site} ${a.payStatus} ${a.state} ${a.redzone} ${a.comment}`.toLowerCase();
      const okQ = q ? blob.includes(q) : true;
      const okF = filterState ? (a.state || "").toLowerCase().includes(filterState.toLowerCase()) : true;
      return okQ && okF;
    });
  }, [apps, search, filterState]);

  const exportToExcel = () => {
    const rows = filteredApps.map(a => ({
      [t.appnum]: a.appnum || "",
      [t.org]: a.org || "",
      [t.product]: a.product || "",
      [t.site]: a.site || "",
      [t.createdAt]: a.createdAt?.toDate ? dayjs(a.createdAt.toDate()).format("DD.MM.YYYY HH:mm") : "",
      [t.payStatus]: a.payStatus || "",
      [t.state]: a.state || "",
      [t.redzone]: a.redzone || "",
      [t.comment]: a.comment || "",
      [t.user]: a.createdBy || ""
    }));
    const ws = XLSXUtils.json_to_sheet(rows);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Applications");
    XLSXWriteFile(wb, `applications_${dayjs().format("YYYYMMDD_HHmm")}.xlsx`);
  };

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-gray-600">{t.loading}</div>
      </div>
    );
  }

  /** === LOGIN FORM === */
  if (!me) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{t.title}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span>Til:</span>
              <button onClick={()=>setLang("uz")} className={`px-2 py-1 rounded border ${lang==="uz"?"border-sky-500 text-sky-700":"border-black/10"}`}>UZ</button>
              <button onClick={()=>setLang("ru")} className={`px-2 py-1 rounded border ${lang==="ru"?"border-sky-500 text-sky-700":"border-black/10"}`}>RU</button>
            </div>
          </div>
          <Card>
            <form onSubmit={doLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">{t.username}</label>
                <input className="mt-1 w-full rounded-xl border px-3 py-2" value={u} onChange={(e)=>setU(e.target.value)} placeholder="admin" required />
              </div>
              <div>
                <label className="text-sm font-medium">{t.password}</label>
                <input type="password" className="mt-1 w-full rounded-xl border px-3 py-2" value={p} onChange={(e)=>setP(e.target.value)} placeholder="••••••" required />
              </div>
              {err && <div className="text-sm text-red-600">{err}</div>}
              <button disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">
                {submitting ? t.loading : t.signIn}
              </button>
            </form>
          </Card>
        </div>
      </div>
    );
  }

  /** === APP (after login) === */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Topbar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400" />
            <div className="font-semibold">EMC • {t.dashboard}</div>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <button onClick={()=>setLang(lang==="uz"?"ru":"uz")} className="rounded-lg border px-2 py-1 text-[12px]">{lang==="uz"?"РУ":"UZ"}</button>
            <button onClick={logout} className="rounded-lg border px-3 py-1.5 hover:bg-black/5">{t.logout}</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid lg:grid-cols-[240px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-black/10 flex items-center gap-3">
            <img
              src={me.avatarUrl || "/placeholder-avatar.jpg"}
              alt="avatar" className="h-12 w-12 rounded-full object-cover border"
              onError={(e)=>{e.currentTarget.src="/placeholder-avatar.jpg";}}
            />
            <div>
              <div className="font-semibold">{me.fullname}</div>
              <div className="text-xs text-gray-500">{t.role}: {me.role}</div>
            </div>
          </div>
          <nav className="p-2 text-sm">
            {["dashboard","profile","products","applications", ...(me.role==="admin"?["employees"]:[]), "activity"].map(key=>(
              <button key={key}
                onClick={()=>setTab(key)}
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-black/5 ${tab===key?"bg-black/5 font-semibold":""}`}
              >
                {key==="dashboard"?t.stats:
                 key==="profile"?t.profile:
                 key==="products"?t.products:
                 key==="applications"?t.applications:
                 key==="employees"?t.employees:
                 t.activity}
              </button>
            ))}
          </nav>
        </Card>

        {/* Main */}
        <div className="space-y-6">
          {/* DASHBOARD */}
          {tab==="dashboard" && (
            <>
              <div className="grid sm:grid-cols-3 gap-4">
                <Card><div className="text-sm text-gray-500">{t.totEmployees}</div><div className="text-3xl font-semibold">{stats.employees}</div></Card>
                <Card><div className="text-sm text-gray-500">{t.totMoves}</div><div className="text-3xl font-semibold">{stats.moves}</div></Card>
                <Card><div className="text-sm text-gray-500">{t.totApps}</div><div className="text-3xl font-semibold">{stats.apps}</div></Card>
              </div>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.activity}</div>
                <div className="space-y-3 text-sm">
                  {movements.length===0 && <div className="text-gray-400">{t.none}</div>}
                  {movements.slice(0,20).map(m=>(
                    <div key={m.id} className="flex items-start gap-3">
                      <Pill tone={m.type==="in"?"emerald":"rose"}>{m.type==="in"?t.in:t.out}</Pill>
                      <div>
                        <div className="font-medium">{m.product} <span className="text-gray-500">×{m.qty}</span></div>
                        <div className="text-xs text-gray-500">{m.byUser} • {m.createdAt?.toDate?dayjs(m.createdAt.toDate()).format("DD.MM.YYYY HH:mm"):"-"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </>
          )}

          {/* PROFILE */}
          {tab==="profile" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.profile}</div>
              <form onSubmit={saveProfile} className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium">{t.fullname}</div>
                  <input className="mt-1 w-full rounded-xl border px-3 py-2" value={profileFullname} onChange={(e)=>setProfileFullname(e.target.value)} />
                </div>
                <div>
                  <div className="font-medium">{t.avatar}</div>
                  <input type="file" accept="image/*" className="mt-1 w-full rounded-xl border px-3 py-2" onChange={(e)=>setProfileAvatarFile(e.target.files?.[0]||null)} />
                </div>
                <div className="sm:col-span-2">
                  <button disabled={updatingProfile} className="rounded-xl bg-gray-900 text-white px-4 py-2">{updatingProfile?t.loading:t.update}</button>
                </div>
              </form>
            </Card>
          )}

          {/* PRODUCTS */}
          {tab==="products" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addMovement}</div>
                <form onSubmit={addMovement} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">{t.productName}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.product} onChange={(e)=>setMvForm(s=>({...s,product:e.target.value}))} required />
                  </div>
                  <div>
                    <label className="font-medium">{t.quantity}</label>
                    <input type="number" min={1} className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.qty} onChange={(e)=>setMvForm(s=>({...s,qty:e.target.value}))} required />
                  </div>
                  <div>
                    <label className="font-medium">{t.type}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.type} onChange={(e)=>setMvForm(s=>({...s,type:e.target.value}))}>
                      <option value="in">{t.in}</option>
                      <option value="out">{t.out}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium">{t.note}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={mvForm.note} onChange={(e)=>setMvForm(s=>({...s,note:e.target.value}))} />
                  </div>
                  <div className="sm:col-span-2">
                    <button disabled={savingMv} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2">{savingMv?t.loading:t.save}</button>
                  </div>
                </form>
              </Card>

              <Card>
                <div className="text-lg font-semibold mb-3">{t.lastMovements}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="text-left text-gray-500">
                      <th className="py-2 pr-3">{t.productName}</th>
                      <th className="py-2 pr-3">{t.quantity}</th>
                      <th className="py-2 pr-3">{t.type}</th>
                      <th className="py-2 pr-3">{t.note}</th>
                      <th className="py-2 pr-3">{t.user}</th>
                      <th className="py-2 pr-3">{t.time}</th>
                      <th className="py-2 pr-3">{t.actions}</th>
                    </tr></thead>
                    <tbody>
                      {movements.length===0 && <tr><td colSpan={7} className="py-4 text-gray-400">{t.none}</td></tr>}
                      {movements.map(m=>(
                        <tr key={m.id} className="border-t">
                          <td className="py-2 pr-3">{m.product}</td>
                          <td className="py-2 pr-3">{m.qty}</td>
                          <td className="py-2 pr-3"><Pill tone={m.type==="in"?"emerald":"rose"}>{m.type==="in"?t.in:t.out}</Pill></td>
                          <td className="py-2 pr-3">{m.note||"-"}</td>
                          <td className="py-2 pr-3">{m.byUser}</td>
                          <td className="py-2 pr-3">{m.createdAt?.toDate?dayjs(m.createdAt.toDate()).format("DD.MM.YYYY HH:mm"):"-"}</td>
                          <td className="py-2 pr-3"><button onClick={()=>removeMovement(m.id)} className="text-red-600 hover:underline">{t.remove}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* EMPLOYEES (ADMIN) */}
          {tab==="employees" && me.role==="admin" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addEmployee}</div>
                <form onSubmit={addEmployee} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><label className="font-medium">{t.fullname}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.fullname} onChange={(e)=>setEmpForm(s=>({...s,fullname:e.target.value}))} required />
                  </div>
                  <div><label className="font-medium">{t.empUsername}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.username} onChange={(e)=>setEmpForm(s=>({...s,username:e.target.value}))} required />
                  </div>
                  <div><label className="font-medium">{t.empPassword}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.password} onChange={(e)=>setEmpForm(s=>({...s,password:e.target.value}))} required />
                  </div>
                  <div><label className="font-medium">{t.empRole}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.role} onChange={(e)=>setEmpForm(s=>({...s,role:e.target.value}))}>
                      <option value="employee">{t.employee}</option>
                      <option value="admin">{t.admin}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button disabled={savingEmp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2">{savingEmp?t.loading:t.create}</button>
                  </div>
                </form>
              </Card>

              <Card>
                <div className="text-lg font-semibold mb-3">{t.employeesList}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="text-left text-gray-500">
                      <th className="py-2 pr-3">{t.fullname}</th>
                      <th className="py-2 pr-3">{t.username}</th>
                      <th className="py-2 pr-3">{t.role}</th>
                      <th className="py-2 pr-3">{t.actions}</th>
                    </tr></thead>
                    <tbody>
                      {empList.length===0 && <tr><td colSpan={4} className="py-4 text-gray-400">{t.none}</td></tr>}
                      {empList.map(e=>(
                        <tr key={e.id} className="border-t">
                          <td className="py-2 pr-3 flex items-center gap-2">
                            <img src={e.avatarUrl||"/placeholder-avatar.jpg"} className="h-7 w-7 rounded-full object-cover border" onError={(ev)=>{ev.currentTarget.src="/placeholder-avatar.jpg"}}/>
                            {e.fullname||"-"}
                          </td>
                          <td className="py-2 pr-3">{e.username}</td>
                          <td className="py-2 pr-3">{e.role}</td>
                          <td className="py-2 pr-3"><button onClick={()=>removeEmployee(e.id)} className="text-red-600 hover:underline">{t.remove}</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* APPLICATIONS */}
          {tab==="applications" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.newApp}</div>
                <form onSubmit={addApplication} className="grid md:grid-cols-3 gap-4 text-sm">
                  <div><label className="font-medium">{t.appnum}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.appnum} onChange={(e)=>setAppForm(s=>({...s,appnum:e.target.value}))} required />
                  </div>
                  <div><label className="font-medium">{t.org}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.org} onChange={(e)=>setAppForm(s=>({...s,org:e.target.value}))} />
                  </div>
                  <div><label className="font-medium">{t.product}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.product} onChange={(e)=>setAppForm(s=>({...s,product:e.target.value}))} />
                  </div>
                  <div><label className="font-medium">{t.site}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.site} onChange={(e)=>setAppForm(s=>({...s,site:e.target.value}))} />
                  </div>
                  <div><label className="font-medium">{t.payStatus}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.payStatus} onChange={(e)=>setAppForm(s=>({...s,payStatus:e.target.value}))} />
                  </div>
                  <div><label className="font-medium">{t.state}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.state} onChange={(e)=>setAppForm(s=>({...s,state:e.target.value}))} />
                  </div>
                  <div><label className="font-medium">{t.redzone}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.redzone} onChange={(e)=>setAppForm(s=>({...s,redzone:e.target.value}))} />
                  </div>
                  <div className="md:col-span-2"><label className="font-medium">{t.comment}</label>
                    <input className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.comment} onChange={(e)=>setAppForm(s=>({...s,comment:e.target.value}))} />
                  </div>
                  <div className="md:col-span-3">
                    <button disabled={savingApp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2">{savingApp?t.loading:t.save}</button>
                  </div>
                </form>
              </Card>

              <Card>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                  <div className="text-lg font-semibold">{t.gridTitle}</div>
                  <div className="flex items-center gap-2">
                    <input className="rounded-xl border px-3 py-2 text-sm" placeholder={t.search} value={search} onChange={(e)=>setSearch(e.target.value)} />
                    <input className="rounded-xl border px-3 py-2 text-sm" placeholder={t.filter+" • "+t.state} value={filterState} onChange={(e)=>setFilterState(e.target.value)} />
                    <button onClick={()=>{setSearch(""); setFilterState("");}} className="rounded-xl border px-3 py-2 text-sm">{t.clear}</button>
                    <button onClick={exportToExcel} className="rounded-xl bg-gray-900 text-white px-3 py-2 text-sm">{t.exportExcel}</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead><tr className="text-left text-gray-500">
                      <th className="py-2 pr-3">{t.appnum}</th>
                      <th className="py-2 pr-3">{t.org}</th>
                      <th className="py-2 pr-3">{t.product}</th>
                      <th className="py-2 pr-3">{t.site}</th>
                      <th className="py-2 pr-3">{t.createdAt}</th>
                      <th className="py-2 pr-3">{t.payStatus}</th>
                      <th className="py-2 pr-3">{t.state}</th>
                      <th className="py-2 pr-3">{t.redzone}</th>
                      <th className="py-2 pr-3">{t.comment}</th>
                      <th className="py-2 pr-3">{t.actions}</th>
                    </tr></thead>
                    <tbody>
                      {filteredApps.length===0 && <tr><td colSpan={10} className="py-4 text-gray-400">{t.none}</td></tr>}
                      {filteredApps.map(a=>(
                        <tr key={a.id} className="border-t">
                          <td className="py-2 pr-3">{a.appnum}</td>
                          <td className="py-2 pr-3">{a.org}</td>
                          <td className="py-2 pr-3">{a.product}</td>
                          <td className="py-2 pr-3">{a.site}</td>
                          <td className="py-2 pr-3">{a.createdAt?.toDate?dayjs(a.createdAt.toDate()).format("DD.MM.YYYY"):""}</td>
                          <td className="py-2 pr-3">{a.payStatus}</td>
                          <td className="py-2 pr-3">
                            <Pill tone={/tugat|готов|законч/i.test(a.state||"")?"emerald":/bekor|отмен/i.test(a.state||"")?"rose":"sky"}>
                              {a.state||""}
                            </Pill>
                          </td>
                          <td className="py-2 pr-3">{a.redzone}</td>
                          <td className="py-2 pr-3">{a.comment}</td>
                          <td className="py-2 pr-3">
                            <button onClick={()=>removeApplication(a.id)} className="text-red-600 hover:underline">{t.remove}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* ACTIVITY – o‘qish uchun qisqa feed (harakatlardan) */}
          {tab==="activity" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.activity}</div>
              <div className="space-y-3 text-sm">
                {movements.length===0 && <div className="text-gray-400">{t.none}</div>}
                {movements.slice(0, 50).map(m=>(
                  <div key={m.id} className="flex items-start gap-3">
                    <Pill tone={m.type==="in"?"emerald":"rose"}>{m.type==="in"?t.in:t.out}</Pill>
                    <div>
                      <div className="font-medium">{m.product} <span className="text-gray-500">×{m.qty}</span></div>
                      <div className="text-xs text-gray-500">
                        {m.byUser} • {m.createdAt?.toDate?dayjs(m.createdAt.toDate()).format("DD.MM.YYYY HH:mm"):"-"} {m.note?`• ${m.note}`:""}
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
