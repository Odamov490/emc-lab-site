// src/features/LoginForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { STAFF_PHOTOS, T } from "../utils/constants";
import { Card, Input } from "../components/ui";

export default function LoginForm({ lang, setLang, onLoggedIn }){
  const t = T[lang];
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [submitting,setSubmitting]=useState(false);

  const doLogin=async(e)=>{
    e.preventDefault(); setErr(""); setSubmitting(true);
    try{
      const qy=query(collection(db,"employees"), where("username","==",u.trim()), where("password","==",p));
      const qs=await getDocs(qy);
      if(qs.empty){ setErr(t.wrong); setSubmitting(false); return; }
      const d=qs.docs[0].data();
      const photo = d.photoUrl || STAFF_PHOTOS[d.fullname] || "";
      if(!d.photoUrl && STAFF_PHOTOS[d.fullname]){
        try{ await updateDoc(doc(db,"employees", qs.docs[0].id), { photoUrl: STAFF_PHOTOS[d.fullname] }); }catch{}
      }
      const auth={ id:qs.docs[0].id, username:d.username, fullname:d.fullname||d.username, role:d.role||"employee", photoUrl:photo };
      localStorage.setItem("emc_auth", JSON.stringify(auth));
      onLoggedIn(auth);
    }catch(e2){ console.error(e2); setErr("Xatolik. Keyinroq urinib ko‘ring."); }
    finally{ setSubmitting(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
      <div className="w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">{t.title}</h1>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={()=>setLang("uz")} className={`px-2 py-1 rounded border ${lang==="uz"?"border-sky-500 text-sky-700":"border-black/10"}`}>UZ</button>
            <button onClick={()=>setLang("ru")} className={`px-2 py-1 rounded border ${lang==="ru"?"border-sky-500 text-sky-700":"border-black/10"}`}>РУ</button>
          </div>
        </div>
        <Card>
          <form onSubmit={doLogin} className="space-y-4">
            <div><label className="text-sm font-medium">{t.username}</label><Input value={u} onChange={e=>setU(e.target.value)} placeholder="employee1" required/></div>
            <div><label className="text-sm font-medium">{t.password}</label><Input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="••••••" required/></div>
            {err && <div className="text-sm text-red-600">{err}</div>}
            <button disabled={submitting} className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">{submitting?t.loading:t.signIn}</button>
          </form>
        </Card>
      </div>
    </div>
  );
}
