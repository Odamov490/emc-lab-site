// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

/* -------------------- Til matnlari -------------------- */
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
    addEmployee: "Yangi hodim qo‘shish",
    fullname: "To‘liq ism",
    empUsername: "Login (hodim)",
    empPassword: "Parol (hodim)",
    empRole: "Roli",
    admin: "Admin",
    employee: "Hodim",
    create: "Yaratish",
    employeesList: "Hodimlar ro‘yxati",
    none: "Hozircha yo‘q",
    lang: "Til",
    permError: "Ruxsat yetarli emas (Firestore Security Rules).",
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
    permError: "Недостаточно прав (правила безопасности Firestore).",
  },
};

/* -------------------- Kichik UI -------------------- */
function Card({ children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-black/10 bg-white/80 backdrop-blur p-5 shadow ${className}`}>
      {children}
    </div>
  );
}
function Pill({ children }) {
  return <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-800 px-3 py-0.5 text-xs">{children}</span>;
}

/* -------------------- Login/Dashboard -------------------- */
export default function Login() {
  const [lang, setLang] = useState("uz"); // "uz" | "ru"
  const t = useMemo(() => T[lang], [lang]);

  // auth state
  const [me, setMe] = useState(null);
  const [checking, setChecking] = useState(true);

  // login form
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // dashboard
  const [tab, setTab] = useState("profile"); // profile | products | employees | activity

  // real-time movements
  const [movements, setMovements] = useState([]);
  const [mvForm, setMvForm] = useState({ product: "", qty: "", type: "in", note: "" });
  const [savingMv, setSavingMv] = useState(false);

  // employees (admin)
  const [empList, setEmpList] = useState([]);
  const [empForm, setEmpForm] = useState({ fullname: "", username: "", password: "", role: "employee" });
  const [savingEmp, setSavingEmp] = useState(false);

  /* ---- Session yuklash ---- */
  useEffect(() => {
    const raw = localStorage.getItem("emc_auth");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setMe(parsed);
        console.log("[AUTH] Sessiondan yuklandi:", parsed);
      } catch {
        localStorage.removeItem("emc_auth");
      }
    }
    setChecking(false);
  }, []);

  /* ---- Real-time subscriptions ---- */
  useEffect(() => {
    if (!me) return;

    console.log("[RT] Subscribing to collections…");

    // movements
    const unsubMv = onSnapshot(
      collection(db, "movements"),
      (snap) => {
        const list = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setMovements(list);
        console.log("[RT] movements:", list);
      },
      (e) => console.error("[RT] movements error:", e)
    );

    // employees — only for admin
    let unsubEmp = null;
    if (me.role === "admin") {
      unsubEmp = onSnapshot(
        collection(db, "employees"),
        (snap) => {
          const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
          setEmpList(list);
          console.log("[RT] employees:", list);
        },
        (e) => console.error("[RT] employees error:", e)
      );
    }

    return () => {
      unsubMv && unsubMv();
      unsubEmp && unsubEmp();
    };
  }, [me]);

  /* ---- Login ---- */
  const doLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setSubmitting(true);

    // Trim inputs
    const username = u.trim();
    const password = p;

    try {
      // Firestore query
      const q = query(collection(db, "employees"), where("username", "==", username), where("password", "==", password));
      console.log("[LOGIN] Query:", { username, password: "***" });

      const qs = await getDocs(q);
      console.log("[LOGIN] Firestore docs:", qs.docs.map((d) => ({ id: d.id, ...d.data() })));

      if (qs.empty) {
        setErr(t.wrong);
        setSubmitting(false);
        return;
      }

      // Take first match
      const docData = qs.docs[0].data();
      const authObj = {
        id: qs.docs[0].id,
        username: docData.username,
        fullname: docData.fullname || docData.username,
        role: docData.role || "employee",
      };

      localStorage.setItem("emc_auth", JSON.stringify(authObj));
      setMe(authObj);
      setSubmitting(false);
      setTab("profile");
      console.log("[LOGIN] Success:", authObj);
    } catch (e) {
      console.error("[LOGIN] Error:", e);
      if (e?.code === "permission-denied") {
        setErr(t.permError);
      } else {
        setErr("Xatolik. Keyinroq urinib ko‘ring.");
      }
      setSubmitting(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("emc_auth");
    setMe(null);
    setTab("profile");
  };

  /* ---- Movements ---- */
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
    } catch (e) {
      console.error("[MOVEMENT] add error:", e);
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
    } catch (e) {
      console.error("[MOVEMENT] delete error:", e);
      alert("O‘chirishda xatolik!");
    }
  };

  /* ---- Employees (admin) ---- */
  const addEmployee = async (e) => {
    e.preventDefault();
    if (!me || me.role !== "admin") return;

    const { fullname, username, password, role } = empForm;
    if (!fullname.trim() || !username.trim() || !password.trim()) {
      return alert("To‘liq to‘ldiring.");
    }
    setSavingEmp(true);
    try {
      await addDoc(collection(db, "employees"), {
        fullname: fullname.trim(),
        username: username.trim(),
        password: password.trim(),
        role,
        createdAt: serverTimestamp(),
      });
      setEmpForm({ fullname: "", username: "", password: "", role: "employee" });
    } catch (e) {
      console.error("[EMP] add error:", e);
      alert("Hodim qo‘shishda xatolik!");
    } finally {
      setSavingEmp(false);
    }
  };

  const removeEmployee = async (id) => {
    if (!me || me.role !== "admin") return;
    if (!confirm("Hodimni o‘chirasizmi?")) return;
    try {
      await deleteDoc(doc(db, "employees", id));
    } catch (e) {
      console.error("[EMP] delete error:", e);
      alert("O‘chirishda xatolik!");
    }
  };

  /* -------------------- Render -------------------- */
  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-sm text-gray-600">{t.loading}</div>
      </div>
    );
  }

  // --- Login form (unauth) ---
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
                  placeholder="admin"
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

          <div className="mt-4 text-xs text-gray-500">
            {/* Admin Firestore orqali hodim qo‘shadi: collection "employees" */}
          </div>
        </div>
      </div>
    );
  }

  // --- Dashboard (auth) ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400" />
            <div className="font-semibold">{t.dashboard}</div>
            <Pill>{me.role}</Pill>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => setLang(lang === "uz" ? "ru" : "uz")} className="rounded-lg border px-2 py-1 text-[12px]">
              {lang === "uz" ? "РУ" : "UZ"}
            </button>
            <button onClick={logout} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-black/5">
              {t.logout}
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-black/10">
            <div className="font-semibold">
              {t.hello}, {me.fullname}
            </div>
            <div className="text-xs text-gray-500">
              {t.role}: {me.role}
            </div>
          </div>
          <nav className="p-2">
            <button
              onClick={() => setTab("profile")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
                tab === "profile" ? "bg-black/5 font-semibold" : ""
              }`}
            >
              {t.profile}
            </button>
            <button
              onClick={() => setTab("products")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
                tab === "products" ? "bg-black/5 font-semibold" : ""
              }`}
            >
              {t.products}
            </button>
            {me.role === "admin" && (
              <button
                onClick={() => setTab("employees")}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
                  tab === "employees" ? "bg-black/5 font-semibold" : ""
                }`}
              >
                {t.employees}
              </button>
            )}
            <button
              onClick={() => setTab("activity")}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
                tab === "activity" ? "bg-black/5 font-semibold" : ""
              }`}
            >
              {t.activity}
            </button>
          </nav>
        </Card>

        {/* Main */}
        <div className="space-y-6">
          {/* PROFILE */}
          {tab === "profile" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.profile}</div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">{t.username}</div>
                  <div className="font-medium">{me.username}</div>
                </div>
                <div>
                  <div className="text-gray-500">{t.role}</div>
                  <div className="font-medium">{me.role}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="text-gray-500">{t.fullname}</div>
                  <div className="font-medium">{me.fullname}</div>
                </div>
              </div>
            </Card>
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addMovement}</div>
                <form onSubmit={addMovement} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">{t.productName}</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={mvForm.product}
                      onChange={(e) => setMvForm((s) => ({ ...s, product: e.target.value }))}
                      placeholder="Masalan: R&S ESW8"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium">{t.quantity}</label>
                    <input
                      type="number"
                      min={1}
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={mvForm.qty}
                      onChange={(e) => setMvForm((s) => ({ ...s, qty: e.target.value }))}
                      placeholder="1"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium">{t.type}</label>
                    <select
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={mvForm.type}
                      onChange={(e) => setMvForm((s) => ({ ...s, type: e.target.value }))}
                    >
                      <option value="in">{t.in}</option>
                      <option value="out">{t.out}</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-medium">{t.note}</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={mvForm.note}
                      onChange={(e) => setMvForm((s) => ({ ...s, note: e.target.value }))}
                      placeholder="ixtiyoriy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      disabled={savingMv}
                      className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                    >
                      {savingMv ? t.loading : t.save}
                    </button>
                  </div>
                </form>
              </Card>

              <Card>
                <div className="text-lg font-semibold mb-3">{t.lastMovements}</div>
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
                      {movements.length === 0 && (
                        <tr>
                          <td colSpan={7} className="py-4 text-gray-400">
                            {t.none}
                          </td>
                        </tr>
                      )}
                      {movements.map((m) => (
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
                            <button onClick={() => removeMovement(m.id)} className="text-red-600 hover:underline">
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

          {/* EMPLOYEES (admin) */}
          {tab === "employees" && me.role === "admin" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addEmployee}</div>
                <form onSubmit={addEmployee} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="font-medium">{t.fullname}</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={empForm.fullname}
                      onChange={(e) => setEmpForm((s) => ({ ...s, fullname: e.target.value }))}
                      placeholder="Gulomjon Odamov"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium">{t.empUsername}</label>
                    <input
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={empForm.username}
                      onChange={(e) => setEmpForm((s) => ({ ...s, username: e.target.value }))}
                      placeholder="doston"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium">{t.empPassword}</label>
                    <input
                      type="text"
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={empForm.password}
                      onChange={(e) => setEmpForm((s) => ({ ...s, password: e.target.value }))}
                      placeholder="parol"
                      required
                    />
                  </div>
                  <div>
                    <label className="font-medium">{t.empRole}</label>
                    <select
                      className="mt-1 w-full rounded-xl border px-3 py-2"
                      value={empForm.role}
                      onChange={(e) => setEmpForm((s) => ({ ...s, role: e.target.value }))}
                    >
                      <option value="employee">{t.employee}</option>
                      <option value="admin">{t.admin}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      disabled={savingEmp}
                      className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                    >
                      {savingEmp ? t.loading : t.create}
                    </button>
                  </div>
                </form>
              </Card>

              <Card>
                <div className="text-lg font-semibold mb-3">{t.employeesList}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3">{t.fullname}</th>
                        <th className="py-2 pr-3">{t.username}</th>
                        <th className="py-2 pr-3">{t.role}</th>
                        <th className="py-2 pr-3">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empList.length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-4 text-gray-400">
                            {t.none}
                          </td>
                        </tr>
                      )}
                      {empList.map((e) => (
                        <tr key={e.id} className="border-t">
                          <td className="py-2 pr-3">{e.fullname || "-"}</td>
                          <td className="py-2 pr-3">{e.username}</td>
                          <td className="py-2 pr-3">{e.role}</td>
                          <td className="py-2 pr-3">
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

          {/* ACTIVITY */}
          {tab === "activity" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.activity}</div>
              <div className="space-y-3 text-sm">
                {movements.length === 0 && <div className="text-gray-400">{t.none}</div>}
                {movements.slice(0, 30).map((m) => (
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
