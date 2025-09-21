import React from "react";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user, logout } = useAuth();
  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Profil</h1>
        <button onClick={logout} className="border rounded-lg px-3 py-1.5">Chiqish</button>
      </div>
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">F.I.Sh</div>
          <div className="font-medium">{user.fullName}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Email</div>
          <div className="font-medium">{user.email}</div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-sm text-gray-500">Rol</div>
          <div className="font-medium uppercase">{user.role}</div>
        </div>
      </div>
    </div>
  );
}
