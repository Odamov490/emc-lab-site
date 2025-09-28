// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Bitta komponent ichida 4 holat:
 *  - 'login'     : kirish formasi
 *  - 'register'  : ro'yxatdan o'tish formasi
 *  - 'forgot'    : parolni tiklash formasi
 *  - 'dashboard' : tizimga kirgandan keyingi sahifa
 *
 * Foydalanuvchilar va sessiya localStorage da saqlanadi:
 *   - users: [{name, email, password}, ...]
 *   - authUser: {name, email}
 */

const LS_KEYS = {
  USERS: "emc_users",
  AUTH: "emc_auth_user",
};

function readUsers() {
  try {
    const raw = localStorage.getItem(LS_KEYS.USERS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUsers(list) {
  localStorage.setItem(LS_KEYS.USERS, JSON.stringify(list));
}

function setSession(user) {
  localStorage.setItem(LS_KEYS.AUTH, JSON.stringify({ name: user.name, email: user.email }));
}

function getSession() {
  const raw = localStorage.getItem(LS_KEYS.AUTH);
  return raw ? JSON.parse(raw) : null;
}

function clearSession() {
  localStorage.removeItem(LS_KEYS.AUTH);
}

export default function Login() {
  const navigate = useNavigate();

  // UI holati
  const [view, setView] = useState("login"); // 'login' | 'register' | 'forgot' | 'dashboard'
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Form state-lar
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");

  const [fpEmail, setFpEmail] = useState("");
  const [fpNewPass, setFpNewPass] = useState("");

  // Default admin foydalanuvchi (agar bo‘lmasa)
  useEffect(() => {
    const users = readUsers();
    const exists = users.some((u) => u.email === "admin@emc.uz");
    if (!exists) {
      users.push({ name: "Admin", email: "admin@emc.uz", password: "12345" });
      writeUsers(users);
    }
  }, []);

  // Sessiya bor bo‘lsa darhol dashboard ko‘rsatamiz
  const currentUser = useMemo(() => getSession(), []);
  useEffect(() => {
    if (currentUser) setView("dashboard");
  }, [currentUser]);

  // Helper — xabar
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
      const user = users.find(
        (u) => u.email.trim().toLowerCase() === loginEmail.trim().toLowerCase()
      );
      if (!user || user.password !== loginPass) {
        setLoading(false);
        toast("Email yoki parol noto‘g‘ri", "error");
        return;
      }
      setSession(user);
      setLoading(false);
      setView("dashboard");
      toast("Xush kelibsiz!");
    }, 500);
  };

  // === Ro'yxatdan o'tish ===
  const onRegister = (e) => {
    e.preventDefault();
    if (regPass.length < 5) {
      toast("Parol kamida 5 ta belgidan iborat bo‘lsin", "error");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const users = readUsers();
      const exists = users.some(
        (u) => u.email.trim().toLowerCase() === regEmail.trim().toLowerCase()
      );
      if (exists) {
        setLoading(false);
        toast("Bu email bilan akkount mavjud", "error");
        return;
      }
      const user = { name: regName || "Foydalanuvchi", email: regEmail, password: regPass };
      users.push(user);
      writeUsers(users);
      setSession(user);
      setLoading(false);
      setView("dashboard");
      toast("Ro‘yxatdan o‘tish muvaffaqiyatli 🎉");
    }, 600);
  };

  // === Parolni tiklash ===
  const onResetPass = (e) => {
    e.preventDefault();
    if (fpNewPass.length < 5) {
      toast("Yangi parol 5 ta belgidan kam bo‘lmasin", "error");
      return;
    }
    const users = readUsers();
    const idx = users.findIndex(
      (u) => u.email.trim().toLowerCase() === fpEmail.trim().toLowerCase()
    );
    if (idx === -1) {
      toast("Bunday email topilmadi", "error");
      return;
    }
    users[idx].password = fpNewPass;
    writeUsers(users);
    toast("Parol yangilandi. Endi kirishingiz mumkin ✔");
    setView("login");
    setLoginEmail(fpEmail);
    setLoginPass("");
  };

  // === Chiqish ===
  const logout = () => {
    clearSession();
    toast("Chiqildi");
    setView("login");
  };

  // === UI ===
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      {/* Karta */}
      <div className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-100 p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-semibold">
            {view === "login" && "Kirish"}
            {view === "register" && "Ro‘yxatdan o‘tish"}
            {view === "forgot" && "Parolni tiklash"}
            {view === "dashboard" && "Dashboard"}
          </h1>
          <button
            className="text-sm text-blue-600 hover:underline"
            onClick={() => navigate("/")}
            title="Bosh sahifaga qaytish"
          >
            ← Bosh sahifa
          </button>
        </div>

        {/* Xabar */}
        {msg && (
          <div
            className={`mb-4 rounded-lg px-3 py-2 text-sm ${
              msg.type === "error" ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* LOGIN */}
        {view === "login" && (
          <form onSubmit={onLogin} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Parol"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={loginPass}
              onChange={(e) => setLoginPass(e.target.value)}
              required
            />
            <button
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700 disabled:opacity-60"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                className="text-blue-600 hover:underline"
                onClick={() => setView("forgot")}
              >
                Parolni unutdingizmi?
              </button>
              <button
                type="button"
                className="text-gray-600 hover:underline"
                onClick={() => setView("register")}
              >
                Akkount yo‘qmi? Ro‘yxatdan o‘ting
              </button>
            </div>

            {/* Demo hisob */}
            <div className="text-xs text-gray-500 mt-2">
              Demo: <b>admin@emc.uz</b> / <b>12345</b>
            </div>
          </form>
        )}

        {/* REGISTER */}
        {view === "register" && (
          <form onSubmit={onRegister} className="space-y-4">
            <input
              type="text"
              placeholder="Ism (ixtiyoriy)"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={regName}
              onChange={(e) => setRegName(e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Parol (kamida 5 belgi)"
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
              {loading ? "Yuborilmoqda..." : "Ro‘yxatdan o‘tish"}
            </button>

            <div className="text-sm text-center">
              Akkountingiz bormi?{" "}
              <button type="button" className="text-blue-600 hover:underline" onClick={() => setView("login")}>
                Kirish
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD */}
        {view === "forgot" && (
          <form onSubmit={onResetPass} className="space-y-4">
            <input
              type="email"
              placeholder="Email"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={fpEmail}
              onChange={(e) => setFpEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Yangi parol"
              className="w-full rounded-lg border px-3 py-2 outline-none focus:ring focus:ring-blue-200"
              value={fpNewPass}
              onChange={(e) => setFpNewPass(e.target.value)}
              required
            />
            <button className="w-full rounded-lg bg-blue-600 text-white py-2.5 font-medium hover:bg-blue-700">
              Parolni yangilash
            </button>

            <div className="text-sm text-center">
              <button type="button" className="text-blue-600 hover:underline" onClick={() => setView("login")}>
                ← Kirish sahifasiga qaytish
              </button>
            </div>
          </form>
        )}

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div className="space-y-4">
            <div className="rounded-xl border p-4 bg-gray-50">
              <div className="text-sm text-gray-600">Foydalanuvchi</div>
              <div className="text-lg font-semibold">
                {getSession()?.name || "Foydalanuvchi"}
              </div>
              <div className="text-sm text-gray-700">{getSession()?.email}</div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => navigate("/")}
                className="rounded-lg border px-4 py-2 hover:bg-gray-50"
              >
                Bosh sahifaga o‘tish
              </button>
              <button
                onClick={logout}
                className="rounded-lg bg-rose-600 text-white px-4 py-2 hover:bg-rose-700"
              >
                Chiqish
              </button>
            </div>

            <div className="text-sm text-gray-500">
              Bu demo Dashboard. Keyinroq bu yerdan arizalar, fayllar, profil,
              parolni o‘zgartirish va h.k. modullarni qo‘shamiz.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
