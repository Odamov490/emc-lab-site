// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * EMC Lab — Login + Dashboard (UZ/RU)
 * - Faqat admin hodim qo‘shadi, ro‘yxatdan o‘tish yo‘q
 * - Hodimlar login orqali kiradi
 * - Profilda: avatar, ism, lavozim, kontaktlar, statistika
 * - Mahsulotlar: kirim/chiqim, status, mas’ul hodim
 * - Admin: hodim qo‘shish/tahrirlash/o‘chirish, rollar
 * - UZ/RU til tugmasi
 * - Sessiya va ma’lumotlar localStorage’da (keyin Firestore’ga ko‘chirish oson)
 */

/* ----------------------- Utilities ----------------------- */
const LS_KEYS = {
  USERS: "emc_users",
  PRODUCTS: "emc_products",
  SESSION: "emc_session",
  LANG: "emc_lang",
};

const ROLES = ["Admin", "Laboratoriya rahbari", "Bosh mutaxassis", "1-toifali mutaxassis", "2-toifali mutaxassis", "Texnik xodim"];

const tdict = {
  uz: {
    appTitle: "EMC Lab — Hodimlar paneli",
    back: "Asosiy sayt",
    logout: "Chiqish",
    tabs: { profile: "Profil", products: "Mahsulotlar", activity: "Faollik", admin: "Admin" },
    login: {
      title: "Kirish",
      email: "Email",
      password: "Parol",
      signIn: "Kirish",
      wrong: "Email yoki parol noto‘g‘ri.",
      demo: "Demo ma’lumot: admin@emclab.uz / 123456",
    },
    profile: {
      title: "Profil",
      phone: "Telefon",
      lastLogin: "Oxirgi kirish",
      stats: "Statistika",
      tests: "Sinovlar",
      labs: "Laboratoriyalar",
      edit: "Tahrirlash",
      save: "Saqlash",
      cancel: "Bekor qilish",
      role: "Lavozim",
      email: "Email",
      changeAvatar: "Avatar URL",
    },
    products: {
      title: "Mahsulotlar nazorati",
      add: "Mahsulot qo‘shish",
      name: "Nomi",
      code: "Inventar raqami / Kod",
      status: "Holati",
      in: "Kirdi",
      out: "Chiqdi",
      responsible: "Mas’ul hodim",
      note: "Izoh",
      actions: "Amallar",
      save: "Saqlash",
      cancel: "Bekor qilish",
      edit: "Tahrirlash",
      delete: "O‘chirish",
      search: "Qidirish...",
      filter: "Filter:",
      all: "Barchasi",
      none: "Hali mahsulot yo‘q",
    },
    admin: {
      title: "Hodimlar",
      addStaff: "Hodim qo‘shish",
      name: "Ism, familiya",
      role: "Lavozim",
      phone: "Telefon",
      email: "Email (login uchun)",
      pass: "Parol",
      avatar: "Avatar URL (ixtiyoriy)",
      actions: "Amallar",
      save: "Saqlash",
      cancel: "Bekor qilish",
      edit: "Tahrirlash",
      delete: "O‘chirish",
      noUsers: "Hozircha hodim yo‘q",
    },
    lang: "Til",
  },
  ru: {
    appTitle: "EMC Lab — Панель сотрудников",
    back: "На сайт",
    logout: "Выйти",
    tabs: { profile: "Профиль", products: "Продукты", activity: "Активность", admin: "Админ" },
    login: {
      title: "Вход",
      email: "Эл. почта",
      password: "Пароль",
      signIn: "Войти",
      wrong: "Неверная почта или пароль.",
      demo: "Демо: admin@emclab.uz / 123456",
    },
    profile: {
      title: "Профиль",
      phone: "Телефон",
      lastLogin: "Последний вход",
      stats: "Статистика",
      tests: "Испытания",
      labs: "Лаборатории",
      edit: "Редактировать",
      save: "Сохранить",
      cancel: "Отмена",
      role: "Должность",
      email: "Эл. почта",
      changeAvatar: "URL аватара",
    },
    products: {
      title: "Учет продуктов",
      add: "Добавить продукт",
      name: "Название",
      code: "Инвентарный № / Код",
      status: "Статус",
      in: "Вход",
      out: "Выход",
      responsible: "Ответственный",
      note: "Примечание",
      actions: "Действия",
      save: "Сохранить",
      cancel: "Отмена",
      edit: "Редактировать",
      delete: "Удалить",
      search: "Поиск...",
      filter: "Фильтр:",
      all: "Все",
      none: "Пока нет продуктов",
    },
    admin: {
      title: "Сотрудники",
      addStaff: "Добавить сотрудника",
      name: "ФИО",
      role: "Должность",
      phone: "Телефон",
      email: "Эл. почта (для входа)",
      pass: "Пароль",
      avatar: "URL аватара (необязательно)",
      actions: "Действия",
      save: "Сохранить",
      cancel: "Отмена",
      edit: "Редактировать",
      delete: "Удалить",
      noUsers: "Пока нет сотрудников",
    },
    lang: "Язык",
  },
};

const useLang = () => {
  const [lang, setLang] = useState(localStorage.getItem(LS_KEYS.LANG) || "uz");
  useEffect(() => localStorage.setItem(LS_KEYS.LANG, lang), [lang]);
  const t = (keyPath) => {
    // keyPath: "login.title" etc.
    const [a, b, c] = keyPath.split(".");
    return c ? tdict[lang][a][b][c] : tdict[lang][a][b] ?? tdict[lang][a] ?? keyPath;
  };
  return { lang, setLang, t, dict: tdict[lang] };
};

/* ----------------------- Seed data ----------------------- */
function seedIfEmpty() {
  const users = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || "[]");
  if (!users.length) {
    const demo = [
      {
        id: crypto.randomUUID(),
        name: "Odamov G‘ulomjon",
        role: "Admin",
        email: "admin@emclab.uz",
        phone: "+998 90 123 45 67",
        password: "123456",
        img: "/staff/4.jpg",
        lastLogin: new Date().toISOString(),
        testsDone: 120,
        labs: 6,
        isAdmin: true,
      },
      {
        id: crypto.randomUUID(),
        name: "Abdurashidov Davron",
        role: "Bosh mutaxassis",
        email: "davron@emclab.uz",
        phone: "+998 90 555 66 77",
        password: "123456",
        img: "/staff/3.png",
        lastLogin: "",
        testsDone: 58,
        labs: 4,
        isAdmin: false,
      },
    ];
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(demo));
  }
  const products = JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || "[]");
  if (!products.length) {
    localStorage.setItem(
      LS_KEYS.PRODUCTS,
      JSON.stringify([
        {
          id: crypto.randomUUID(),
          name: "SMB100B Signal Generator",
          code: "INV-001",
          status: "in",
          responsibleId: null,
          note: "Yangi kalibrovka qilingan",
          ts: Date.now(),
        },
      ])
    );
  }
}

/* ----------------------- Hooks for LS CRUD ----------------------- */
const useUsers = () => {
  const [users, setUsers] = useState(() => JSON.parse(localStorage.getItem(LS_KEYS.USERS) || "[]"));
  const save = (next) => {
    setUsers(next);
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(next));
  };
  const add = (u) => save([...users, { ...u, id: crypto.randomUUID(), isAdmin: u.role === "Admin" }]);
  const update = (id, patch) => save(users.map((u) => (u.id === id ? { ...u, ...patch, isAdmin: (patch.role ?? u.role) === "Admin" } : u)));
  const remove = (id) => save(users.filter((u) => u.id !== id));
  return { users, add, update, remove, setUsers: save };
};

const useProducts = () => {
  const [items, setItems] = useState(() => JSON.parse(localStorage.getItem(LS_KEYS.PRODUCTS) || "[]"));
  const save = (next) => {
    setItems(next);
    localStorage.setItem(LS_KEYS.PRODUCTS, JSON.stringify(next));
  };
  const add = (p) => save([{ ...p, id: crypto.randomUUID(), ts: Date.now() }, ...items]);
  const update = (id, patch) => save(items.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  const remove = (id) => save(items.filter((p) => p.id !== id));
  return { items, add, update, remove, setItems: save };
};

/* ----------------------- Login Page ----------------------- */
function LoginForm({ onSuccess }) {
  const { dict } = useLang();
  const [email, setEmail] = useState("admin@emclab.uz");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState("");

  const submit = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem(LS_KEYS.USERS) || "[]");
    const u = users.find((x) => x.email.trim().toLowerCase() === email.trim().toLowerCase() && x.password === password);
    if (!u) {
      setError(dict.login.wrong);
      return;
    }
    const updated = users.map((x) => (x.id === u.id ? { ...x, lastLogin: new Date().toISOString() } : x));
    localStorage.setItem(LS_KEYS.USERS, JSON.stringify(updated));
    localStorage.setItem(LS_KEYS.SESSION, JSON.stringify({ userId: u.id }));
    onSuccess(u.id);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-black/10 bg-white/80 backdrop-blur p-6 shadow">
        <h1 className="text-2xl font-semibold">{dict.login.title}</h1>
        <p className="text-xs text-gray-500 mt-1">{dict.login.demo}</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium">{dict.login.email}</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">{dict.login.password}</label>
            <input
              className="mt-1 w-full rounded-xl border px-3 py-2"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              required
            />
          </div>

        {error && <div className="text-red-600 text-sm">{error}</div>}

          <button className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
            {dict.login.signIn}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ----------------------- Top Bar ----------------------- */
function TopBar({ onBack, onLogout, lang, setLang }) {
  const { dict } = useLang();
  return (
    <div className="sticky top-0 z-30 bg-white/70 backdrop-blur border-b border-black/10">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400" />
          <div className="font-semibold">{dict.appTitle}</div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value)}
            className="rounded-lg border px-2 py-1 text-sm"
            aria-label={dict.lang}
          >
            <option value="uz">UZ</option>
            <option value="ru">RU</option>
          </select>
          <button onClick={onBack} className="rounded-lg border px-3 py-1 text-sm hover:bg-black/5">
            {dict.back}
          </button>
          <button onClick={onLogout} className="rounded-lg border px-3 py-1 text-sm hover:bg-black/5">
            {dict.logout}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Tabs ----------------------- */
function Tabs({ value, onChange, labels }) {
  return (
    <div className="border-b border-black/10 bg-white/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex gap-2">
          {Object.entries(labels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => onChange(key)}
              className={`px-4 py-2 text-sm rounded-t-lg border-b-2 ${
                value === key ? "border-cyan-500 text-cyan-700" : "border-transparent hover:text-cyan-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Profile ----------------------- */
function ProfileView({ me, onUpdate, dict }) {
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(me);

  useEffect(() => setForm(me), [me]);

  const save = () => {
    onUpdate(form);
    setEdit(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-1">
        <div className="rounded-2xl border bg-white p-6">
          <div className="flex flex-col items-center">
            <img
              src={form.img || "/placeholder-avatar.jpg"}
              alt={form.name}
              className="w-32 h-32 rounded-full border-4 border-cyan-400 object-cover"
              onError={(e) => (e.currentTarget.src = "/placeholder-avatar.jpg")}
            />
            <h2 className="text-xl font-semibold mt-3 text-center">{form.name}</h2>
            <div className="text-sm text-gray-600">{form.role}</div>
          </div>

          <div className="mt-6 space-y-2 text-sm">
            <div><b>{dict.profile.email}:</b> {form.email}</div>
            <div><b>{dict.profile.phone}:</b> {form.phone || "-"}</div>
            <div><b>{dict.profile.lastLogin}:</b> {form.lastLogin ? new Date(form.lastLogin).toLocaleString() : "-"}</div>
          </div>

          <div className="mt-6">
            {!edit ? (
              <button onClick={() => setEdit(true)} className="w-full rounded-xl border px-4 py-2 text-sm hover:bg-black/5">
                {dict.profile.edit}
              </button>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-sm">{dict.profile.role}</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm">{dict.profile.phone}</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={form.phone || ""}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm">{dict.profile.changeAvatar}</label>
                  <input
                    className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
                    value={form.img || ""}
                    onChange={(e) => setForm({ ...form, img: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={save} className="flex-1 rounded-xl bg-cyan-600 text-white px-4 py-2 text-sm hover:opacity-90">
                    {dict.profile.save}
                  </button>
                  <button onClick={() => setEdit(false)} className="flex-1 rounded-xl border px-4 py-2 text-sm hover:bg-black/5">
                    {dict.profile.cancel}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="text-lg font-semibold">{dict.profile.stats}</h3>
          <div className="grid sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-cyan-50 text-center">
              <div className="text-2xl font-semibold">{me.testsDone ?? 0}</div>
              <div className="text-sm">{dict.profile.tests}</div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 text-center">
              <div className="text-2xl font-semibold">{me.labs ?? 0}</div>
              <div className="text-sm">{dict.profile.labs}</div>
            </div>
            <div className="p-4 rounded-xl bg-indigo-50 text-center">
              <div className="text-2xl font-semibold">{me.isAdmin ? "Admin" : "Staff"}</div>
              <div className="text-sm">Role</div>
            </div>
          </div>
        </div>

        {/* Activity placeholder */}
        <div className="rounded-2xl border bg-white p-6 mt-6">
          <h3 className="text-lg font-semibold">Activity</h3>
          <p className="text-sm text-gray-600 mt-2">
            {/* Future: pull from Firestore logs */}
            Recent actions, product changes, and login history will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Products ----------------------- */
function ProductsView({ dict, items, add, update, remove, users, me }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: "", code: "", status: "in", responsibleId: me.id, note: "" });

  const filtered = useMemo(() => {
    return items
      .filter((p) => (filter === "all" ? true : p.status === filter))
      .filter((p) => {
        const s = `${p.name} ${p.code} ${p.note}`.toLowerCase();
        return s.includes(q.toLowerCase());
      });
  }, [items, q, filter]);

  const startEdit = (p) => {
    setEditing(p.id);
    setForm({ name: p.name, code: p.code, status: p.status, responsibleId: p.responsibleId || me.id, note: p.note || "" });
  };

  const cancel = () => {
    setEditing(null);
    setForm({ name: "", code: "", status: "in", responsibleId: me.id, note: "" });
  };

  const saveNew = () => {
    if (!form.name.trim()) return;
    add(form);
    cancel();
  };

  const saveEdit = () => {
    update(editing, form);
    cancel();
  };

  const responsibleName = (id) => users.find((u) => u.id === id)?.name || "-";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <h3 className="text-lg font-semibold">{dict.products.title}</h3>
          <div className="flex items-center gap-2">
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder={dict.products.search}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <label className="text-sm">{dict.products.filter}</label>
            <select className="rounded-xl border px-3 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">{dict.products.all}</option>
              <option value="in">{dict.products.in}</option>
              <option value="out">{dict.products.out}</option>
            </select>
          </div>
        </div>

        {/* Add / Edit form */}
        <div className="mt-5 grid md:grid-cols-5 gap-3">
          <input
            className="rounded-xl border px-3 py-2 text-sm md:col-span-1"
            placeholder={dict.products.name}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="rounded-xl border px-3 py-2 text-sm md:col-span-1"
            placeholder={dict.products.code}
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="in">{dict.products.in}</option>
            <option value="out">{dict.products.out}</option>
          </select>
          <select
            className="rounded-xl border px-3 py-2 text-sm"
            value={form.responsibleId || ""}
            onChange={(e) => setForm({ ...form, responsibleId: e.target.value })}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
          <input
            className="rounded-xl border px-3 py-2 text-sm md:col-span-1"
            placeholder={dict.products.note}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
        </div>
        <div className="mt-3 flex gap-2">
          {!editing ? (
            <button onClick={saveNew} className="rounded-xl bg-cyan-600 text-white px-4 py-2 text-sm hover:opacity-90">
              {dict.products.add}
            </button>
          ) : (
            <>
              <button onClick={saveEdit} className="rounded-xl bg-cyan-600 text-white px-4 py-2 text-sm hover:opacity-90">
                {dict.products.save}
              </button>
              <button onClick={cancel} className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5">
                {dict.products.cancel}
              </button>
            </>
          )}
        </div>

        {/* Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-3">{dict.products.name}</th>
                <th className="py-2 pr-3">{dict.products.code}</th>
                <th className="py-2 pr-3">{dict.products.status}</th>
                <th className="py-2 pr-3">{dict.products.responsible}</th>
                <th className="py-2 pr-3">{dict.products.note}</th>
                <th className="py-2">{dict.products.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((p) => (
                  <tr key={p.id} className="border-t">
                    <td className="py-2 pr-3">{p.name}</td>
                    <td className="py-2 pr-3">{p.code}</td>
                    <td className="py-2 pr-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          p.status === "in" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {p.status === "in" ? dict.products.in : dict.products.out}
                      </span>
                    </td>
                    <td className="py-2 pr-3">{responsibleName(p.responsibleId)}</td>
                    <td className="py-2 pr-3">{p.note}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(p)} className="rounded-lg border px-3 py-1 hover:bg-black/5">
                          {dict.products.edit}
                        </button>
                        <button onClick={() => remove(p.id)} className="rounded-lg border px-3 py-1 hover:bg-black/5">
                          {dict.products.delete}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6 text-gray-500" colSpan={6}>
                    {dict.products.none}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Admin (Users) ----------------------- */
function AdminUsers({ dict, users, add, update, remove, me }) {
  if (!me.isAdmin) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="rounded-2xl border bg-white p-6">
          <h3 className="text-lg font-semibold">Admin</h3>
          <p className="text-sm text-gray-600 mt-2">Access denied.</p>
        </div>
      </div>
    );
  }

  const emptyForm = { name: "", role: "Texnik xodim", phone: "", email: "", password: "", img: "" };
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);

  const startAdd = () => {
    setAdding(true);
    setEditId(null);
    setForm(emptyForm);
  };

  const startEdit = (u) => {
    setEditId(u.id);
    setAdding(false);
    setForm({ name: u.name, role: u.role, phone: u.phone || "", email: u.email, password: u.password || "", img: u.img || "" });
  };

  const cancel = () => {
    setAdding(false);
    setEditId(null);
    setForm(emptyForm);
  };

  const save = () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) return;
    if (adding) {
      add({ ...form });
    } else if (editId) {
      update(editId, { ...form });
    }
    cancel();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{dict.admin.title}</h3>
          <button onClick={startAdd} className="rounded-xl bg-cyan-600 text-white px-4 py-2 text-sm hover:opacity-90">
            {dict.admin.addStaff}
          </button>
        </div>

        {(adding || editId) && (
          <div className="mt-5 grid md:grid-cols-6 gap-3">
            <input
              className="rounded-xl border px-3 py-2 text-sm md:col-span-2"
              placeholder={dict.admin.name}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <select
              className="rounded-xl border px-3 py-2 text-sm"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder={dict.admin.phone}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder={dict.admin.email}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm"
              placeholder={dict.admin.pass}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              type="text"
            />
            <input
              className="rounded-xl border px-3 py-2 text-sm md:col-span-3"
              placeholder={dict.admin.avatar}
              value={form.img}
              onChange={(e) => setForm({ ...form, img: e.target.value })}
            />
            <div className="md:col-span-3 flex gap-2">
              <button onClick={save} className="rounded-xl bg-cyan-600 text-white px-4 py-2 text-sm hover:opacity-90">
                {dict.admin.save}
              </button>
              <button onClick={cancel} className="rounded-xl border px-4 py-2 text-sm hover:bg-black/5">
                {dict.admin.cancel}
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-600">
                <th className="py-2 pr-3">{dict.admin.name}</th>
                <th className="py-2 pr-3">{dict.admin.role}</th>
                <th className="py-2 pr-3">{dict.admin.phone}</th>
                <th className="py-2 pr-3">{dict.admin.email}</th>
                <th className="py-2">{dict.admin.actions}</th>
              </tr>
            </thead>
            <tbody>
              {users.length ? (
                users.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="py-2 pr-3">
                      <div className="flex items-center gap-2">
                        <img
                          src={u.img || "/placeholder-avatar.jpg"}
                          alt={u.name}
                          className="w-8 h-8 rounded-full object-cover border"
                          onError={(e) => (e.currentTarget.src = "/placeholder-avatar.jpg")}
                        />
                        <span>{u.name}</span>
                        {u.isAdmin && (
                          <span className="text-[10px] ml-1 px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-700">Admin</span>
                        )}
                      </div>
                    </td>
                    <td className="py-2 pr-3">{u.role}</td>
                    <td className="py-2 pr-3">{u.phone || "-"}</td>
                    <td className="py-2 pr-3">{u.email}</td>
                    <td className="py-2">
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(u)} className="rounded-lg border px-3 py-1 hover:bg-black/5">
                          {dict.admin.edit}
                        </button>
                        {u.id !== me.id && (
                          <button onClick={() => remove(u.id)} className="rounded-lg border px-3 py-1 hover:bg-black/5">
                            {dict.admin.delete}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-6 text-gray-500" colSpan={5}>
                    {dict.admin.noUsers}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ----------------------- Main Component ----------------------- */
export default function Login() {
  // Seed demo data (one-time)
  useEffect(() => seedIfEmpty(), []);

  const { lang, setLang, dict } = useLang();
  const nav = useNavigate();

  const { users, add: addUser, update: updateUser, remove: removeUser, setUsers } = useUsers();
  const { items, add: addProduct, update: updateProduct, remove: removeProduct } = useProducts();

  const [tab, setTab] = useState("profile");
  const [me, setMe] = useState(null);

  // Restore session
  useEffect(() => {
    const s = JSON.parse(localStorage.getItem(LS_KEYS.SESSION) || "null");
    if (s?.userId) {
      const u = users.find((x) => x.id === s.userId);
      if (u) setMe(u);
    }
  }, [users]);

  const handleLoginSuccess = (userId) => {
    const u = users.find((x) => x.id === userId);
    setMe(u || null);
  };

  const handleLogout = () => {
    localStorage.removeItem(LS_KEYS.SESSION);
    setMe(null);
  };

  const updateMe = (patch) => {
    if (!me) return;
    const next = { ...me, ...patch };
    setMe(next);
    updateUser(me.id, patch);
  };

  // Keep my changes in list
  useEffect(() => {
    if (!me) return;
    setUsers(users.map((u) => (u.id === me.id ? me : u)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me?.name, me?.role, me?.phone, me?.img]);

  if (!me) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
        <SiteHeaderTop dict={dict} />
        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <TopBar onBack={() => nav("/")} onLogout={handleLogout} lang={lang} setLang={setLang} />
      <Tabs
        value={tab}
        onChange={setTab}
        labels={{
          profile: dict.tabs.profile,
          products: dict.tabs.products,
          activity: dict.tabs.activity,
          ...(me.isAdmin ? { admin: dict.tabs.admin } : {}),
        }}
      />

      {tab === "profile" && <ProfileView me={me} onUpdate={updateMe} dict={dict} />}

      {tab === "products" && (
        <ProductsView
          dict={dict}
          items={items}
          add={addProduct}
          update={updateProduct}
          remove={removeProduct}
          users={users}
          me={me}
        />
      )}

      {tab === "activity" && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="text-lg font-semibold">Activity</h3>
            <p className="text-sm text-gray-600 mt-2">Bu bo‘limni keyin Firestore loglari bilan to‘ldiramiz.</p>
          </div>
        </div>
      )}

      {tab === "admin" && (
        <AdminUsers dict={dict} users={users} add={addUser} update={updateUser} remove={removeUser} me={me} />
      )}
    </div>
  );
}

/* ----------------------- Small Header on Login screen ----------------------- */
function SiteHeaderTop({ dict }) {
  return (
    <div className="border-b border-black/10 bg-white/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400" />
        <div className="font-semibold">EMC Lab</div>
        <div className="ml-auto text-xs text-gray-500">{dict.appTitle}</div>
      </div>
    </div>
  );
}
