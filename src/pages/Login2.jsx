import React, { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await login(email.trim(), password);
      nav("/dashboard");
    } catch (e) {
      setErr(e.message || "Xatolik");
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">Kirish</h1>
        {err && <div className="text-sm text-red-600">{err}</div>}
        <div>
          <label className="text-sm">Email</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="text-sm">Parol</label>
          <input type="password" className="mt-1 w-full border rounded-lg px-3 py-2" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button className="w-full rounded-lg bg-gray-900 text-white py-2">Kirish</button>
        <div className="text-xs text-gray-500">
          Demo: <b>admin@emc.uz</b> / <b>123456</b>
        </div>
      </form>
    </div>
  );
}
