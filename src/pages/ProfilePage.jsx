import React from "react";
import { useNavigate } from "react-router-dom";

const getUser = () => {
  try { return JSON.parse(localStorage.getItem("emc_user") || "null"); } catch { return null; }
};
const signOut = () => localStorage.removeItem("emc_user");

export default function ProfilePage() {
  const nav = useNavigate();
  const user = getUser();

  if (!user) {
    nav("/login", { replace: true, state: { from: "/profile" } });
    return null;
  }

  return (
    <div className="min-h-[70vh] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-black/10 bg-white/70 backdrop-blur p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">Profil</h1>
              <p className="text-sm text-gray-600 mt-1">Tizimdagi roli: <b>{user.role}</b></p>
            </div>
            <button
              onClick={() => { signOut(); nav("/login", { replace: true }); }}
              className="rounded-xl border border-black/10 px-3 py-1.5 text-sm hover:bg-black/5"
            >
              Chiqish
            </button>
          </div>

          <div className="mt-6 grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
              <div className="text-sm text-gray-500">Ism (emaildan)</div>
              <div className="font-medium">{user.name}</div>
            </div>
            <div className="rounded-2xl border border-black/10 bg-white/60 p-4">
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{user.email}</div>
            </div>
          </div>

          {/* Role-based bloklar misoli */}
          {user.role === "admin" && (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4">
              <div className="font-semibold mb-2">Admin panel (demo)</div>
              <ul className="list-disc list-inside text-sm text-gray-700">
                <li>Hodim qo‘shish / ro‘yxatga olish</li>
                <li>Rollarni belgilash: admin, employee, viewer</li>
                <li>Foydalanuvchi huquqlarini boshqarish</li>
              </ul>
            </div>
          )}

          {user.role !== "admin" && (
            <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4">
              <div className="font-semibold mb-2">Hodim profili (demo)</div>
              <p className="text-sm text-gray-700">
                Bu sahifada shaxsiy ma’lumotlar, kalibrovka topshiriqlari tarixi, tayinlangan vazifalar va h.k. bo‘lishi mumkin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
