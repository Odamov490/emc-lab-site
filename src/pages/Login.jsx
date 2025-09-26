// src/pages/Login.jsx
import React from "react";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold mb-4">Kirish</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            alert("Kirish ishladi (demo)!");
          }}
          className="space-y-3"
        >
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              type="email"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Parol</label>
            <input
              type="password"
              required
              className="mt-1 w-full rounded-xl border px-3 py-2"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-gray-900 text-white px-4 py-2 hover:opacity-90"
          >
            Kirish
          </button>
        </form>
      </div>
    </div>
  );
}
