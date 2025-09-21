import React, { useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function AdminUsers() {
  const { createUser } = useAuth();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("staff");

  const list = useMemo(() => {
    return JSON.parse(localStorage.getItem("emc_users") || "[]");
  }, [email, fullName, role]);

  const add = (e) => {
    e.preventDefault();
    createUser({ email, fullName, role });
    setEmail(""); setFullName("");
    alert("Xodim qo‘shildi (demo). Backend bo‘lsa bazaga yozasiz.");
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Admin: Xodimlar</h1>
      <form onSubmit={add} className="rounded-xl border p-4 grid sm:grid-cols-4 gap-3">
        <input className="border rounded-lg px-3 py-2" placeholder="F.I.Sh" value={fullName} onChange={e=>setFullName(e.target.value)} required />
        <input className="border rounded-lg px-3 py-2" placeholder="email@emc.uz" value={email} onChange={e=>setEmail(e.target.value)} required />
        <select className="border rounded-lg px-3 py-2" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="admin">admin</option>
          <option value="manager">manager</option>
          <option value="staff">staff</option>
        </select>
        <button className="rounded-lg bg-gray-900 text-white">Qo‘shish</button>
      </form>

      <div className="mt-6">
        <h2 className="font-semibold mb-2">Ro‘yxat (demo):</h2>
        <div className="space-y-2">
          {list.map(u => (
            <div key={u.id} className="rounded-lg border p-3 flex justify-between">
              <div>
                <div className="font-medium">{u.fullName}</div>
                <div className="text-sm text-gray-500">{u.email}</div>
              </div>
              <div className="text-sm uppercase">{u.role}</div>
            </div>
          ))}
          {list.length === 0 && <div className="text-sm text-gray-500">Hozircha yo‘q.</div>}
        </div>
      </div>
    </div>
  );
}
