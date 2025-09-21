import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Minimal mock auth using localStorage (no backend yet)
const saveUser = (user) => localStorage.setItem("emc_user", JSON.stringify(user));
const getUser = () => {
  try { return JSON.parse(localStorage.getItem("emc_user") || "null"); } catch { return null; }
};

export default function LoginPage() {
  const nav = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const from = location.state?.from || "/profile";

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Very simple demo auth:
    // - admin:    admin@emc.uz / 123456  -> role: admin
    // - employee: user@emc.uz  / 123456  -> role: employee
    // Any other email with this password -> role: viewer
    if (password !== "123456") {
      setError("Parol noto‘g‘ri. Demo: 123456");
      return;
    }

    let role = "viewer";
    if (email.trim().toLowerCase() === "admin@emc.uz") role = "admin";
    else if (email.trim().toLowerCase() === "user@emc.uz") role = "employee";

    const user = { email, role, name: email.split("@")[0] };
    saveUser(user);
    nav(from, { replace: true });
  };

  // If already logged in, jump to profile
  if (getUser()) {
    nav("/profile", { replace: true });
    return null;
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white/70 backdrop-blur p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-1">Tizimga kirish</h1>
        <p className="text-sm text-gray-600 mb-4">Demo: admin@emc.uz yoki user@emc.uz / 123456</p>

        {error && <div className="mb-3 rounded-lg bg-red-50 text-red-700 px-3 py-2 text-sm border border-red-200">{error}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="name@emc.uz"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Parol</label>
            <input
              type="password"
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="••••••"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              required
            />
          </div>
          <button
            className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90"
            type="submit"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
}
