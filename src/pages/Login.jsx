// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Bitta sahifa ichida 4 holat:
 *  - 'login' | 'register' | 'forgot' | 'dashboard'
 *
 * localStorage kalitlari:
 *  - emc_users      : [{name,email,password,avatar,phone,company,role,address,bio,prefs:{lang,theme,notifyEmail,notifySms},2faEnabled}, ...]
 *  - emc_auth_user  : {email}
 *  - emc_lang       : 'uz' | 'ru'
 *
 * Eslatma: email bir xil bo‘lmasligi uchun unique deb qabul qilinadi (login ham email bo‘yicha).
 */

const LS = {
  USERS: "emc_users",
  AUTH: "emc_auth_user",
  LANG: "emc_lang",
};

const t = (lang) => ({
  // umumiy
  backHome: lang === "uz" ? "← Bosh sahifaga" : "← На главную",
  loading: lang === "uz" ? "Yuklanmoqda..." : "Загрузка...",
  save: lang === "uz" ? "Saqlash" : "Сохранить",
  saved: lang === "uz" ? "Saqlandi" : "Сохранено",
  cancel: lang === "uz" ? "Bekor qilish" : "Отмена",
  delete: lang === "uz" ? "O‘chirish" : "Удалить",
  required: lang === "uz" ? "Majburiy maydon" : "Обязательное поле",
  // header
  titleLogin: lang === "uz" ? "Kirish" : "Вход",
  titleRegister: lang === "uz" ? "Ro‘yxatdan o‘tish" : "Регистрация",
  titleForgot: lang === "uz" ? "Parolni tiklash" : "Восстановление пароля",
  titleDashboard: lang === "uz" ? "Kabinet" : "Кабинет",
  // auth
  email: "Email",
  password: lang === "uz" ? "Parol" : "Пароль",
  name: lang === "uz" ? "Ism" : "Имя",
  loginBtn: lang === "uz" ? "Kirish" : "Войти",
  registerBtn: lang === "uz" ? "Ro‘yxatdan o‘tish" : "Зарегистрироваться",
  forgotLink: lang === "uz" ? "Parolni unutdingizmi?" : "Забыли пароль?",
  haveAcc: lang === "uz" ? "Akkountingiz bormi?" : "Уже есть аккаунт?",
  noAcc: lang === "uz" ? "Akkount yo‘qmi? Ro‘yxatdan o‘ting" : "Нет аккаунта? Зарегистрируйтесь",
  toLogin: lang === "uz" ? "← Kirish sahifasiga qaytish" : "← Вернуться ко входу",
  newPass: lang === "uz" ? "Yangi parol" : "Новый пароль",
  resetPass: lang === "uz" ? "Parolni yangilash" : "Обновить пароль",
  adminDemo: lang === "uz" ? "Demo: admin@emc.uz / 12345" : "Демо: admin@emc.uz / 12345",
  errBadCred: lang === "uz" ? "Email yoki parol noto‘g‘ri" : "Неверный email или пароль",
  errEmailExists: lang === "uz" ? "Bu email bilan akkount mavjud" : "Email уже зарегистрирован",
  passLen: lang === "uz" ? "Parol kamida 5 belgi bo‘lsin" : "Минимум 5 символов",
  okWelcome: lang === "uz" ? "Xush kelibsiz!" : "Добро пожаловать!",
  okReg: lang === "uz" ? "Ro‘yxatdan o‘tish muvaffaqiyatli 🎉" : "Регистрация прошла успешно 🎉",
  errNoEmail: lang === "uz" ? "Bunday email topilmadi" : "Email не найден",
  okPassUpdated: lang === "uz" ? "Parol yangilandi" : "Пароль обновлён",
  // dashboard nav
  tabOverview: lang === "uz" ? "Umumiy" : "Обзор",
  tabProfile: lang === "uz" ? "Profil" : "Профиль",
  tabSecurity: lang === "uz" ? "Xavfsizlik" : "Безопасность",
  tabPrefs: lang === "uz" ? "Preferensiyalar" : "Предпочтения",
  tabData: lang === "uz" ? "Ma’lumotlar" : "Данные",
  logout: lang === "uz" ? "Chiqish" : "Выйти",
  toSite: lang === "uz" ? "Bosh sahifaga o‘tish" : "На сайт",
  // overview
  hello: lang === "uz" ? "Salom," : "Здравствуйте,",
  quickActions: lang === "uz" ? "Tezkor amallar" : "Быстрые действия",
  goProfile: lang === "uz" ? "Profilni tahrirlash" : "Редактировать профиль",
  // profile form
  phone: lang === "uz" ? "Telefon" : "Телефон",
  company: lang === "uz" ? "Tashkilot" : "Компания",
  role: lang === "uz" ? "Lavozim (rol)" : "Должность (роль)",
  address: lang === "uz" ? "Manzil" : "Адрес",
  bio: lang === "uz" ? "Qisqacha izoh" : "О себе",
  avatar: lang === "uz" ? "Avatar" : "Аватар",
  upload: lang === "uz" ? "Yuklash" : "Загрузить",
  remove: lang === "uz" ? "O‘chirish" : "Удалить",
  // security
  currentPass: lang === "uz" ? "Joriy parol" : "Текущий пароль",
  newPassword: lang === "uz" ? "Yangi parol" : "Новый пароль",
  confirmNew: lang === "uz" ? "Yangi parol (tasdiq)" : "Новый пароль (подтверждение)",
  changePassword: lang === "uz" ? "Parolni almashtirish" : "Сменить пароль",
  errWrongPass: lang === "uz" ? "Joriy parol noto‘g‘ri" : "Неверный текущий пароль",
  errPassMismatch: lang === "uz" ? "Yangi parollar mos emas" : "Новые пароли не совпадают",
  twoFA: "2FA",
  twoFADesc:
    lang === "uz"
      ? "Ikki bosqichli tasdiqlash (demo): faollashtirilsa, kirishda qo‘shimcha kod talab qilinadi (backend talab etiladi)."
      : "Двухфакторная аутентификация (демо): при включении при входе нужен будет код (нужен backend).",
  // prefs
  language: lang === "uz" ? "Til" : "Язык",
  theme: lang === "uz" ? "Mavzu" : "Тема",
  light: lang === "uz" ? "Yorug‘" : "Светлая",
  dark: lang === "uz" ? "Qorong‘i" : "Тёмная",
  notifications: lang === "uz" ? "Bildirishnomalar" : "Уведомления",
  notifyEmail: lang === "uz" ? "Email orqali xabar" : "Уведомления на email",
  notifySms: lang === "uz" ? "SMS orqali xabar" : "Уведомления по SMS",
  // data
  exportData: lang === "uz" ? "Profilni eksport qilish (JSON)" : "Экспорт профиля (JSON)",
  importData: lang === "uz" ? "Profilni import qilish (JSON)" : "Импорт профиля (JSON)",
  deleteAccount: lang === "uz" ? "Akkountni o‘chirish" : "Удалить аккаунт",
  confirmDelete:
    lang === "uz"
      ? "Rostdan ham akkountni o‘chirilsinmi? Bu amalni qaytarib bo‘lmaydi."
      : "Точно удалить аккаунт? Это действие необратимо.",
  deleted: lang === "uz" ? "Akkount o‘chirildi" : "Аккаунт удалён",
});

function readUsers() {
  try {
    const raw = localStorage.getItem(LS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function writeUsers(list) {
  localStorage.setItem(LS.USERS, JSON.stringify(list));
}
function setSessionEmail(email) {
  localStorage.setItem(LS.AUTH, JSON.stringify({ email }));
}
function getSessionEmail() {
  try {
    const raw = localStorage.getItem(LS.AUTH);
    return raw ? JSON.parse(raw).email : null;
  } catch {
    return null;
  }
}
function clearSession() {
  localStorage.removeItem(LS.AUTH);
}
function getLang() {
  return localStorage.getItem(LS.LANG) || "uz";
}
function setLang(v) {
  localStorage.setItem(LS.LANG, v);
}

export default function Login() {
  const navigate = useNavigate();

  // Tillar
  const [lang, setLangState] = useState(getLang());
  const i18n = useMemo(() => t(lang), [lang]);
  const switchLang = (v) => {
    setLang(v);
    setLangState(v);
  };

  // UI holatlari
  const [view, setView] = useState("login"); // 'login' | 'register' | 'forgot' | 'dashboard'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Auth form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const [fpEmail, setFpEmail] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");

  // Session & user
  const sessionEmail = useMemo(() => getSessionEmail(), []);
  const [user, setUser] = useState(null);

  // Default admin
  useEffect(() => {
    const users = readUsers();
    if (!users.some((u) => u.email === "admin@emc.uz")) {
      users.push({
        name: "Admin",
        email: "admin@emc.uz",
        password: "12345",
        avatar: "",
        phone: "",
        company: "EMC Lab",
        role: "Administrator",
        address: "",
        bio: "",
        prefs: { lang: getLang(), theme: "light", notifyEmail: true, notifySms: false },
        twofaEnabled: false,
      });
      writeUsers(users);
    }
  }, []);

  // Sessiya bor bo‘lsa userni yuklash
  useEffect(() => {
    const email = sessionEmail;
    if (email) {
      const users = readUsers();
      const u = users.find((x) => x.email === email) || null;
      setUser(u);
      setView("dashboard");
      if (u?.prefs?.lang) switchLang(u.prefs.lang);
    }
  }, [sessionEmail]);

  const toast = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 2500);
  };

  // === Kirish ===
  const onLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const users = readUsers();
      const u = users.find(
        (x) => x.email.trim().toLowerCase() === loginEmail.trim().toLowerCase()
      );
      if (!u || u.password !== loginPass) {
        setLoading(false);
        toast(i18n.errBadCred, "error");
        return;
      }
      setSessionEmail(u.email);
      setUser(u);
      setLoading(false);
      setView("dashboard");
      switchLang(u?.prefs?.lang || lang);
      toast(i18n.okWelcome);
    }, 400);
  };

  // === Ro‘yxatdan o‘tish ===
  const onRegister = (e) => {
    e.preventDefault();
    if (regPass.length < 5) {
      toast(i18n.passLen, "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const users = readUsers();
      const exists = users.some(
        (x) => x.email.trim().toLowerCase() === regEmail.trim().toLowerCase()
      );
      if (exists) {
        setLoading(false);
        toast(i18n.errEmailExists, "error");
        return;
      }
      const newUser = {
        name: regName || "User",
        email: regEmail,
        password: regPass,
        avatar: "",
        phone: "",
        company: "",
        role: "",
        address: "",
        bio: "",
        prefs: { lang: lang, theme: "light", notifyEmail: true, notifySms: false },
        twofaEnabled: false,
      };
      users.push(newUser);
      writeUsers(users);
      setSessionEmail(newUser.email);
      setUser(newUser);
      setLoading(false);
      setView("dashboard");
      toast(i18n.okReg);
    }, 500);
  };

  // === Parolni tiklash ===
  const onResetPass = (e) => {
    e.preventDefault();
    if (fpNewPass.length < 5) {
      toast(i18n.passLen, "error");
      return;
    }
    const users = readUsers();
    const idx = users.findIndex(
      (x) => x.email.trim().toLowerCase() === fpEmail.trim().toLowerCase()
    );
    if (idx === -1) {
      toast(i18n.errNoEmail, "error");
      return;
    }
    users[idx].password = fpNewPass;
    writeUsers(users);
    toast(i18n.okPassUpdated);
    setView("login");
    setLoginEmail(fpEmail);
    setLoginPass("");
  };

  // === Logout ===
  const logout = () => {
    clearSession();
    setUser(null);
    setView("login");
    toast("OK");
  };

  // === Profil yordamchi: userni yangilash va saqlash ===
  const saveUser = (next) => {
    const users = readUsers();
    const idx = users.findIndex((x) => x.email === user.email);
    if (idx !== -1) {
      users[idx] = next;
      writeUsers(users);
      setUser(next);
    }
    toast(i18n.saved);
  };

  // === Parolni almashtirish ===
  const changePassword = (curr, next, confirm) => {
    if (user.password !== curr) return toast(i18n.errWrongPass, "error");
    if (next.length < 5) return toast(i18n.passLen, "error");
    if (next !== confirm) return toast(i18n.errPassMismatch, "error");
    saveUser({ ...user, password: next });
  };

  // === Avatar yuklash (base64) ===
  const onPickAvatar = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      saveUser({ ...user, avatar: reader.result });
    };
    reader.readAsDataURL(file);
  };

  // === Profil JSON eksport / import ===
  const exportProfile = () => {
    const blob = new Blob([JSON.stringify(user, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `profile_${user.email}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importProfile = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        // email o‘zgarmas — xavfsizlik uchun
        const next = {
          ...user,
          ...data,
          email: user.email,
          password: user.password,
        };
        saveUser(next);
      } catch {
        toast("JSON error", "error");
      }
    };
    reader.readAsText(file);
  };

  // === Akkountni o‘chirish ===
  const deleteAccount = () => {
    if (!confirm(i18n.confirmDelete)) return;
    const users = readUsers().filter((x) => x.email !== user.email);
    writeUsers(users);
    clearSession();
    setUser(null);
    setView("login");
    toast(i18n.deleted);
  };

  // ============== UI ==============

  const Header = (
    <div className="flex items-center justify-between mb-6">
      <h1 className="text-xl font-semibold">
        {view === "login" && i18n.titleLogin}
        {view === "register" && i18n.titleRegister}
        {view === "forgot" && i18n.titleForgot}
        {view === "dashboard" && i18n.titleDashboard}
      </h1>
      <div className="flex items-center gap-2">
        {/* Til tanlash */}
        <select
          value={lang}
          onChange={(e) => {
            const v = e.target.value;
            switchLang(v);
            if (user) saveUser({ ...user, prefs: { ...(user.prefs || {}), lang: v } });
          }}
          className="rounded-lg border px-2 py-1 text-sm"
        >
          <option value="uz">UZ</option>
          <option value="ru">RU</option>
        </select>

        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => navigate("/")}
          title={i18n.backHome}
        >
          {i18n.backHome}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl border border-gray-100 p-6">
        {Header}

        {msg && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              msg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* ====== AUTH FORMS ====== */}
        {view !== "dashboard" && (
          <>
            {view === "login" && (
              <form onSubmit={onLogin} className="space-y-4 max-w-md">
                <input
                  type="email"
                  placeholder={i18n.email}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder={i18n.password}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  required
                />
                <button
                  disabled={loading}
                  className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? i18n.loading : i18n.loginBtn}
                </button>

                <div className="flex items-center justify-between text-sm">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setView("forgot")}>
                    {i18n.forgotLink}
                  </button>
                  <button type="button" className="text-gray-600 hover:underline" onClick={() => setView("register")}>
                    {i18n.noAcc}
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">{i18n.adminDemo}</div>
              </form>
            )}

            {view === "register" && (
              <form onSubmit={onRegister} className="space-y-4 max-w-md">
                <input
                  type="text"
                  placeholder={`${i18n.name} (${lang === "uz" ? "ixtiyoriy" : "необязательно"})`}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                />
                <input
                  type="email"
                  placeholder={i18n.email}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder={`${i18n.password} (≥5)`}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  required
                  minLength={5}
                />
                <button
                  disabled={loading}
                  className="w-full rounded-lg bg-emerald-600 text-white py-2.5 font-medium hover:bg-emerald-700 disabled:opacity-60"
                >
                  {loading ? i18n.loading : i18n.registerBtn}
                </button>

                <div className="text-sm">
                  {i18n.haveAcc}{" "}
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setView("login")}>
                    {i18n.titleLogin}
                  </button>
                </div>
              </form>
            )}

            {view === "forgot" && (
              <form onSubmit={onResetPass} className="space-y-4 max-w-md">
                <input
                  type="email"
                  placeholder={i18n.email}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                  value={fpEmail}
                  onChange={(e) => setFpEmail(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder={i18n.newPass}
                  className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
                  value={fpNewPass}
                  onChange={(e) => setFpNewPass(e.target.value)}
                  required
                  minLength={5}
                />
                <button className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700">
                  {i18n.resetPass}
                </button>

                <div className="text-sm text-center">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => setView("login")}>
                    {i18n.toLogin}
                  </button>
                </div>
              </form>
            )}
          </>
        )}

        {/* ====== DASHBOARD + PROFIL ====== */}
        {view === "dashboard" && user && (
          <Dashboard
            i18n={i18n}
            user={user}
            setUser={setUser}
            saveUser={saveUser}
            changePassword={changePassword}
            onPickAvatar={onPickAvatar}
            exportProfile={exportProfile}
            importProfile={importProfile}
            deleteAccount={deleteAccount}
            logout={logout}
            navigate={navigate}
            switchLang={switchLang}
          />
        )}
      </div>
    </div>
  );
}

/** ===================== Dashboard & Tabs ===================== */
function Dashboard({
  i18n,
  user,
  saveUser,
  changePassword,
  onPickAvatar,
  exportProfile,
  importProfile,
  deleteAccount,
  logout,
  navigate,
  switchLang,
}) {
  const [tab, setTab] = useState("overview"); // overview | profile | security | prefs | data

  // Profil form local state
  const [name, setName] = useState(user.name || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [company, setCompany] = useState(user.company || "");
  const [role, setRole] = useState(user.role || "");
  const [address, setAddress] = useState(user.address || "");
  const [bio, setBio] = useState(user.bio || "");

  // Security form
  const [currPass, setCurrPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [twofa, setTwofa] = useState(!!user.twofaEnabled);

  // Prefs
  const [theme, setTheme] = useState(user?.prefs?.theme || "light");
  const [notifyEmail, setNotifyEmail] = useState(user?.prefs?.notifyEmail ?? true);
  const [notifySms, setNotifySms] = useState(user?.prefs?.notifySms ?? false);
  const [lang, setLangPref] = useState(user?.prefs?.lang || "uz");

  useEffect(() => {
    setName(user.name || "");
    setPhone(user.phone || "");
    setCompany(user.company || "");
    setRole(user.role || "");
    setAddress(user.address || "");
    setBio(user.bio || "");
    setTwofa(!!user.twofaEnabled);
    setTheme(user?.prefs?.theme || "light");
    setNotifyEmail(user?.prefs?.notifyEmail ?? true);
    setNotifySms(user?.prefs?.notifySms ?? false);
    setLangPref(user?.prefs?.lang || "uz");
  }, [user]);

  const saveProfile = () => {
    saveUser({
      ...user,
      name,
      phone,
      company,
      role,
      address,
      bio,
    });
  };

  const savePrefs = () => {
    const next = {
      ...(user.prefs || {}),
      theme,
      notifyEmail,
      notifySms,
      lang,
    };
    saveUser({ ...user, prefs: next });
    switchLang(lang);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <aside className="lg:col-span-1">
        <div className="rounded-2xl border bg-gray-50 p-4">
          <div className="flex items-center gap-3">
            <img
              src={user.avatar || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`}
              alt="avatar"
              className="h-12 w-12 rounded-full object-cover border"
            />
            <div>
              <div className="font-semibold">{user.name || "User"}</div>
              <div className="text-sm text-gray-600">{user.email}</div>
            </div>
          </div>

          <nav className="mt-4 space-y-1">
            <TabBtn active={tab === "overview"} onClick={() => setTab("overview")}>
              {i18n.tabOverview}
            </TabBtn>
            <TabBtn active={tab === "profile"} onClick={() => setTab("profile")}>
              {i18n.tabProfile}
            </TabBtn>
            <TabBtn active={tab === "security"} onClick={() => setTab("security")}>
              {i18n.tabSecurity}
            </TabBtn>
            <TabBtn active={tab === "prefs"} onClick={() => setTab("prefs")}>
              {i18n.tabPrefs}
            </TabBtn>
            <TabBtn active={tab === "data"} onClick={() => setTab("data")}>
              {i18n.tabData}
            </TabBtn>
          </nav>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate("/")}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-white"
            >
              {i18n.toSite}
            </button>
            <button
              onClick={logout}
              className="rounded-lg bg-rose-600 text-white px-3 py-2 text-sm hover:bg-rose-700"
            >
              {i18n.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <section className="lg:col-span-3">
        {tab === "overview" && (
          <div className="space-y-4">
            <Card>
              <div className="text-sm text-gray-600">{i18n.hello}</div>
              <div className="text-2xl font-semibold">{user.name || "User"}</div>
              <div className="text-sm text-gray-700">{user.email}</div>
            </Card>

            <Card>
              <div className="font-medium mb-3">{i18n.quickActions}</div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setTab("profile")} className="rounded-lg border px-3 py-2 hover:bg-gray-50">
                  {i18n.goProfile}
                </button>
              </div>
            </Card>
          </div>
        )}

        {tab === "profile" && (
          <div className="space-y-6">
            <Card>
              <div className="font-medium mb-4">{i18n.tabProfile}</div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">{i18n.name}</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={i18n.name}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2 bg-gray-100" value={user.email} disabled />
                </div>
                <div>
                  <label className="text-sm font-medium">{i18n.phone}</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+998 __ ___ __ __"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{i18n.company}</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{i18n.role}</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{i18n.address}</label>
                  <input
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">{i18n.bio}</label>
                  <textarea
                    className="mt-1 w-full rounded-lg border px-3 py-2 h-28"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder={i18n.bio}
                  />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <button onClick={saveProfile} className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
                  {i18n.save}
                </button>
              </div>
            </Card>

            <Card>
              <div className="font-medium mb-3">{i18n.avatar}</div>
              <div className="flex items-center gap-4">
                <img
                  src={
                    user.avatar ||
                    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user.name || user.email)}`
                  }
                  alt="avatar"
                  className="h-20 w-20 rounded-full object-cover border"
                />
                <div className="space-x-2">
                  <label className="inline-block">
                    <span className="rounded-lg border px-3 py-2 cursor-pointer hover:bg-gray-50 inline-block">
                      {i18n.upload}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => onPickAvatar(e.target.files?.[0])}
                    />
                  </label>
                  {user.avatar && (
                    <button
                      className="rounded-lg border px-3 py-2 hover:bg-gray-50"
                      onClick={() => saveUser({ ...user, avatar: "" })}
                    >
                      {i18n.remove}
                    </button>
                  )}
                </div>
              </div>
            </Card>
          </div>
        )}

        {tab === "security" && (
          <div className="space-y-6">
            <Card>
              <div className="font-medium mb-4">{i18n.changePassword}</div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">{i18n.currentPass}</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={currPass}
                    onChange={(e) => setCurrPass(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{i18n.newPassword}</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={newPass}
                    onChange={(e) => setNewPass(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">{i18n.confirmNew}</label>
                  <input
                    type="password"
                    className="mt-1 w-full rounded-lg border px-3 py-2"
                    value={newPass2}
                    onChange={(e) => setNewPass2(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => changePassword(currPass, newPass, newPass2)}
                  className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
                >
                  {i18n.changePassword}
                </button>
              </div>
            </Card>

            <Card>
              <div className="font-medium mb-2">{i18n.twoFA}</div>
              <p className="text-sm text-gray-600 mb-3">{i18n.twoFADesc}</p>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={twofa}
                  onChange={(e) => {
                    setTwofa(e.target.checked);
                    saveUser({ ...user, twofaEnabled: e.target.checked });
                  }}
                />
                <span>2FA</span>
              </label>
            </Card>
          </div>
        )}

        {tab === "prefs" && (
          <div className="space-y-6">
            <Card>
              <div className="font-medium mb-4">{i18n.language}</div>
              <select
                value={lang}
                onChange={(e) => setLangPref(e.target.value)}
                className="rounded-lg border px-3 py-2"
              >
                <option value="uz">O‘zbekcha</option>
                <option value="ru">Русский</option>
              </select>
            </Card>

            <Card>
              <div className="font-medium mb-4">{i18n.theme}</div>
              <div className="flex items-center gap-3">
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="theme" checked={theme === "light"} onChange={() => setTheme("light")} />
                  <span>{i18n.light}</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input type="radio" name="theme" checked={theme === "dark"} onChange={() => setTheme("dark")} />
                  <span>{i18n.dark}</span>
                </label>
              </div>
            </Card>

            <Card>
              <div className="font-medium mb-4">{i18n.notifications}</div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={notifyEmail} onChange={(e) => setNotifyEmail(e.target.checked)} />
                <span>{i18n.notifyEmail}</span>
              </label>
              <label className="mt-2 flex items-center gap-2">
                <input type="checkbox" checked={notifySms} onChange={(e) => setNotifySms(e.target.checked)} />
                <span>{i18n.notifySms}</span>
              </label>

              <div className="mt-4">
                <button onClick={savePrefs} className="rounded-lg bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
                  {i18n.save}
                </button>
              </div>
            </Card>
          </div>
        )}

        {tab === "data" && (
          <div className="space-y-6">
            <Card>
              <div className="font-medium mb-3">{i18n.exportData}</div>
              <button onClick={exportProfile} className="rounded-lg border px-4 py-2 hover:bg-gray-50">
                JSON
              </button>
            </Card>

            <Card>
              <div className="font-medium mb-3">{i18n.importData}</div>
              <label className="inline-block">
                <span className="rounded-lg border px-4 py-2 hover:bg-gray-50 cursor-pointer">JSON</span>
                <input type="file" accept="application/json" className="hidden" onChange={(e) => importProfile(e.target.files?.[0])} />
              </label>
            </Card>

            <Card>
              <div className="font-medium mb-3 text-rose-700">{i18n.deleteAccount}</div>
              <button onClick={deleteAccount} className="rounded-lg bg-rose-600 text-white px-4 py-2 hover:bg-rose-700">
                {i18n.delete}
              </button>
            </Card>
          </div>
        )}
      </section>
    </div>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
        active ? "bg-white border shadow-sm" : "hover:bg-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function Card({ children }) {
  return <div className="rounded-2xl border p-4 bg-white">{children}</div>;
}
