// src/features/Sidebar.jsx
import React from "react";
import { Card, Pill } from "../components/ui";
import { T } from "../utils/constants";

export default function Sidebar({ lang, me, tab, setTab }){
  const t = T[lang];
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-black/10">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-black/10 grid place-items-center overflow-hidden">
            {me.photoUrl ? <img src={me.photoUrl} alt="" className="h-12 w-12 object-cover"/> : <span className="text-sm">👤</span>}
          </div>
          <div>
            <div className="font-semibold">{t.hello}, {me.fullname}</div>
            <div className="text-xs text-gray-500">{t.role}: {me.role}</div>
          </div>
        </div>
      </div>
      <nav className="p-2">
        <button onClick={()=>setTab("combo")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="combo"?"bg-black/5 font-semibold":""}`}>{t.combo}</button>
        <button onClick={()=>setTab("profile")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="profile"?"bg-black/5 font-semibold":""}`}>{t.profile}</button>
        {me.role==="admin" && <button onClick={()=>setTab("employees")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="employees"?"bg-black/5 font-semibold":""}`}>{t.employees}</button>}
        <button onClick={()=>setTab("activity")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="activity"?"bg-black/5 font-semibold":""}`}>{t.activity}</button>
        <button onClick={()=>setTab("standards")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="standards"?"bg-black/5 font-semibold":""}`}>{t.standards}</button>
      </nav>
    </Card>
  );
}
