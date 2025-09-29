// src/pages/Login.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection, query, where, getDocs, addDoc, onSnapshot,
  serverTimestamp, doc, deleteDoc, updateDoc, orderBy
} from "firebase/firestore";

/** ======= KONSTANTLAR ======= */
const ORG_LIST = ["Toshkent","Attest","Premier Certification Center","Electro-Class Control"];
const STATUS_TOLOV = ["Belgilanmagan","To'lov bor","To'lov yo'q"];
const STATUS_HOLAT = ["Belgilanmagan","Jarayonda","Sinov tugatildi","Protokol yuborildi","Bekor qilindi"];
const QIZIL_ZONA = ["Ha","Yo'q"];

const T = {
  uz: {
    title:"Kirish", username:"Login", password:"Parol", signIn:"Kirish", wrong:"Login yoki parol noto‘g‘ri",
    loading:"Yuklanmoqda...", dashboard:"Boshqaruv paneli", logout:"Chiqish", hello:"Salom", role:"Roli",
    profile:"Profil", employees:"Hodimlar", activity:"Faollik",
    /** Yangi modul */
    combo:"Arizalar & Harakat",
    // umumiy maydonlar
    create:"Yaratish", save:"Saqlash", remove:"O‘chirish", edit:"Tahrirlash", cancel:"Bekor qilish",
    none:"Hozircha yo‘q", actions:"Harakatlar", time:"Vaqt", user:"Hodim", lang:"Til",
    // ariza maydonlari
    newApp:"Yangi ariza", appNum:"Ariza raqami", org:"Organ Sertifikatsiya", product:"Mahsulot",
    client:"Pskent/Toshkent (mijoz)", payStatus:"Status (to‘lov)", flowStatus:"Status (holat)",
    redZone:"Qizil zona", note:"Izoh", add:"Qo‘shish",
    // filterlar
    search:"Qidiruv", all:"Barchasi",
    // statistika
    stats:"Statistika", total:"Jami", inprog:"Jarayonda", done:"Sinov tugatildi", canceled:"Bekor qilindi", payyes:"To‘lov bor", payno:"To‘lov yo‘q",
    // employees
    addEmployee:"Yangi hodim qo‘shish", fullname:"To‘liq ism", empUsername:"Login (hodimniki)", empPassword:"Parol (hodimniki)", empRole:"Roli", admin:"Admin", employee:"Hodim", employeesList:"Hodimlar ro‘yxati", photoUrl:"Rasm (URL)",
    // head
    back:"Bosh menyu",
    // xabarlar
    saved:"Saqlandi", updated:"Yangilandi", deleted:"O‘chirildi",
  },
  ru: { /* xuddi shunday tarjimalar – qisqartirdim */ }
};

/** ======= UI ======= */
function Card({children,className=""}){return <div className={`rounded-2xl border border-black/10 bg-white/80 dark:bg-white/10 backdrop-blur p-5 shadow ${className}`}>{children}</div>;}
function Pill({children}){return <span className="inline-flex items-center rounded-full bg-sky-100 text-sky-800 px-3 py-0.5 text-xs">{children}</span>;}
function Badge({children}){return <span className="px-2 py-0.5 text-xs rounded bg-black/5">{children}</span>;}
const Input = (p)=><input {...p} className={`mt-1 w-full rounded-xl border px-3 py-2 ${p.className||""}`} />;

/** ======= ASOSIY ======= */
export default function Login(){
  const navigate = useNavigate();
  const [lang,setLang]=useState("uz");
  const t = useMemo(()=>T[lang], [lang]);

  // auth
  const [me,setMe]=useState(null);
  const [checking,setChecking]=useState(true);
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [submitting,setSubmitting]=useState(false);

  // tabs
  const [tab,setTab]=useState("profile"); // profile | combo | employees | activity

  // movements (oldingi) — statistikada ham ishlatamiz
  const [movements,setMovements]=useState([]);

  // Applications + Movements bitta modul:
  const [apps,setApps]=useState([]);
  const emptyApp = { appNum:"", org:ORG_LIST[0], product:"", client:"", pay:"Belgilanmagan", flow:"Belgilanmagan", red:"Yo'q", note:"" };
  const [appForm,setAppForm]=useState(emptyApp);
  const [savingApp,setSavingApp]=useState(false);

  // filters
  const [q,setQ]=useState("");
  const [fPay,setFPay]=useState("Barchasi");
  const [fFlow,setFFlow]=useState("Barchasi");
  const [fRed,setFRed]=useState("Barchasi");

  // edit modal
  const [editing,setEditing]=useState(null); // doc obj yoki null
  const [editForm,setEditForm]=useState(emptyApp);
  const [updating,setUpdating]=useState(false);

  // employees
  const [empList,setEmpList]=useState([]);
  const [empForm,setEmpForm]=useState({ fullname:"", username:"", password:"", role:"employee", photoUrl:"" });
  const [savingEmp,setSavingEmp]=useState(false);

  // session
  useEffect(()=>{
    const raw=localStorage.getItem("emc_auth");
    if(raw){try{setMe(JSON.parse(raw));}catch{}}
    setChecking(false);
  },[]);

  // realtime subs
  useEffect(()=>{
    if(!me) return;
    const unsubMv = onSnapshot(collection(db,"movements"),(snap)=>{
      const list = snap.docs.map(d=>({id:d.id,...d.data()}))
        .sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      setMovements(list);
    });
    const unsubApp = onSnapshot(query(collection(db,"applications"), orderBy("createdAt","desc")),(snap)=>{
      const list = snap.docs.map(d=>({id:d.id,...d.data()}));
      setApps(list);
    });
    let unsubEmp=null;
    if(me.role==="admin"){
      unsubEmp = onSnapshot(collection(db,"employees"),(snap)=>{
        setEmpList(snap.docs.map(d=>({id:d.id,...d.data()})));
      });
    }
    return ()=>{unsubMv&&unsubMv();unsubApp&&unsubApp();unsubEmp&&unsubEmp();};
  },[me]);

  /** ======= LOGIN ======= */
  const doLogin=async(e)=>{
    e.preventDefault(); setErr(""); setSubmitting(true);
    try{
      const qy=query(collection(db,"employees"), where("username","==",u.trim()), where("password","==",p));
      const qs=await getDocs(qy);
      if(qs.empty){ setErr(t.wrong); setSubmitting(false); return; }
      const d=qs.docs[0].data();
      const auth={ id:qs.docs[0].id, username:d.username, fullname:d.fullname||d.username, role:d.role||"employee", photoUrl:d.photoUrl||"" };
      localStorage.setItem("emc_auth", JSON.stringify(auth));
      setMe(auth); setSubmitting(false); setTab("combo");
    }catch(e2){ console.error(e2); setErr("Xatolik. Keyinroq urinib ko‘ring."); setSubmitting(false); }
  };
  const logout=()=>{localStorage.removeItem("emc_auth"); setMe(null); setTab("profile");};

  /** ======= VALIDATSIYA ======= */
  function validateApp(app){
    const errors=[];
    if(!app.appNum?.trim()) errors.push("Ariza raqami majburiy.");
    if(!/^\d{3,}$/.test(app.appNum.trim())) errors.push("Ariza raqami faqat raqam va kamida 3 belgidan iborat bo‘lsin.");
    if(!app.product?.trim()) errors.push("Mahsulot majburiy.");
    if(!app.client?.trim()) errors.push("Mijoz maydoni majburiy.");
    if(!ORG_LIST.includes(app.org)) errors.push("Organ noto‘g‘ri.");
    if(!STATUS_TOLOV.includes(app.pay)) errors.push("To‘lov statusi noto‘g‘ri.");
    if(!STATUS_HOLAT.includes(app.flow)) errors.push("Holat noto‘g‘ri.");
    if(!QIZIL_ZONA.includes(app.red)) errors.push("Qizil zona noto‘g‘ri.");
    return errors;
  }

  /** ======= CREATE ======= */
  const addApp=async(e)=>{
    e.preventDefault(); if(!me) return;
    const errs=validateApp(appForm); if(errs.length){ alert(errs.join("\n")); return; }
    setSavingApp(true);
    try{
      await addDoc(collection(db,"applications"), {
        ...appForm,
        appNum: appForm.appNum.trim(),
        byUser: me.fullname, byUserId: me.id, createdAt: serverTimestamp()
      });
      setAppForm(emptyApp);
      alert(t.saved);
    }catch(ex){ console.error(ex); alert("Saqlashda xato!"); }
    finally{ setSavingApp(false); }
  };

  /** ======= UPDATE / DELETE ======= */
  const startEdit=(row)=>{ setEditing(row); setEditForm({
    appNum: row.appNum||"", org: row.org||ORG_LIST[0], product: row.product||"", client: row.client||"",
    pay: row.pay||"Belgilanmagan", flow: row.flow||"Belgilanmagan", red: row.red||"Yo'q", note: row.note||""
  });};
  const doUpdate=async()=>{
    if(!editing) return;
    const errs=validateApp(editForm); if(errs.length){ alert(errs.join("\n")); return; }
    setUpdating(true);
    try{
      await updateDoc(doc(db,"applications",editing.id), {...editForm, updatedAt: serverTimestamp()});
      setEditing(null); alert(t.updated);
    }catch(ex){ console.error(ex); alert("Yangilashda xato!"); }
    finally{ setUpdating(false); }
  };
  const removeApp=async(id)=>{
    if(!confirm("O‘chirasizmi?")) return;
    try{ await deleteDoc(doc(db,"applications",id)); alert(t.deleted); }
    catch(ex){ console.error(ex); alert("O‘chirishda xato!"); }
  };

  /** ======= EMPLOYEES ======= */
  const addEmployee=async(e)=>{
    e.preventDefault(); if(!me||me.role!=="admin") return;
    if(!empForm.username.trim()||!empForm.password.trim()||!empForm.fullname.trim()) return alert("To‘liq to‘ldiring.");
    setSavingEmp(true);
    try{
      await addDoc(collection(db,"employees"), {
        username: empForm.username.trim(), password: empForm.password.trim(),
        fullname: empForm.fullname.trim(), role: empForm.role, photoUrl: empForm.photoUrl?.trim()||"",
        createdAt: serverTimestamp(),
      });
      setEmpForm({ fullname:"", username:"", password:"", role:"employee", photoUrl:"" });
      alert(t.saved);
    }catch(ex){ console.error(ex); alert("Hodim qo‘shishda xato!"); }
    finally{ setSavingEmp(false); }
  };
  const removeEmployee=async(id)=>{
    if(!me||me.role!=="admin") return;
    if(!confirm("Hodimni o‘chirasizmi?")) return;
    try{ await deleteDoc(doc(db,"employees",id)); alert(t.deleted); }
    catch(ex){ console.error(ex); alert("O‘chirishda xato!"); }
  };

  if(checking) return (<div className="min-h-screen grid place-items-center"><div className="text-sm text-gray-600">{t.loading}</div></div>);

  /** ======= LOGIN EKRANI ======= */
  if(!me){
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="w-full max-w-md">
          <div className="mb-4 flex items-center justify-between">
            <h1 className="text-2xl font-semibold">{t.title}</h1>
            <div className="flex items-center gap-2 text-sm">
              <span>{t.lang}:</span>
              <button onClick={()=>setLang("uz")} className={`px-2 py-1 rounded border ${lang==="uz"?"border-sky-500 text-sky-700":"border-black/10"}`}>UZ</button>
              <button onClick={()=>setLang("ru")} className={`px-2 py-1 rounded border ${lang==="ru"?"border-sky-500 text-sky-700":"border-black/10"}`}>RU</button>
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

  /** ======= FILTRLASH ======= */
  const filtered = apps.filter(a=>{
    const text = (a.appNum+" "+a.product+" "+a.client+" "+a.org+" "+(a.note||"")).toLowerCase();
    const okText = !q || text.includes(q.toLowerCase());
    const okPay = fPay==="Barchasi" || a.pay===fPay;
    const okFlow= fFlow==="Barchasi"|| a.flow===fFlow;
    const okRed = fRed==="Barchasi" || a.red===fRed;
    return okText && okPay && okFlow && okRed;
  });

  // statistikalar
  const stat = {
    total: apps.length,
    inprog: apps.filter(a=>a.flow==="Jarayonda").length,
    done: apps.filter(a=>a.flow==="Sinov tugatildi").length,
    canceled: apps.filter(a=>a.flow==="Bekor qilindi").length,
    payyes: apps.filter(a=>a.pay==="To'lov bor").length,
    payno: apps.filter(a=>a.pay==="To'lov yo'q").length,
  };

  /** ======= DASHBOARD ======= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-black/10">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400" />
            <div className="font-semibold">{T[lang].dashboard}</div>
            <Pill>{me.role}</Pill>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={()=>setLang(lang==="uz"?"ru":"uz")} className="rounded-lg border px-2 py-1 text-[12px]">{lang==="uz"?"РУ":"UZ"}</button>
            <button onClick={()=>navigate("/")} className="rounded-lg border px-3 py-1.5 hover:bg-black/5">{t.back}</button>
            <button onClick={logout} className="rounded-lg border px-3 py-1.5 hover:bg-black/5">{t.logout}</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-6 grid md:grid-cols-[220px_1fr] gap-6">
        {/* Sidebar */}
        <Card className="p-0 overflow-hidden">
          <div className="p-4 border-b border-black/10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-black/10 grid place-items-center overflow-hidden">
                {me.photoUrl ? <img src={me.photoUrl} alt="" className="h-10 w-10 object-cover"/> : <span className="text-xs">👤</span>}
              </div>
              <div>
                <div className="font-semibold">{t.hello}, {me.fullname}</div>
                <div className="text-xs text-gray-500">{t.role}: {me.role}</div>
              </div>
            </div>
          </div>
          <nav className="p-2">
            <button onClick={()=>setTab("profile")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="profile"?"bg-black/5 font-semibold":""}`}>{t.profile}</button>
            <button onClick={()=>setTab("combo")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="combo"?"bg-black/5 font-semibold":""}`}>{t.combo}</button>
            {me.role==="admin" && <button onClick={()=>setTab("employees")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="employees"?"bg-black/5 font-semibold":""}`}>{t.employees}</button>}
            <button onClick={()=>setTab("activity")} className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${tab==="activity"?"bg-black/5 font-semibold":""}`}>{t.activity}</button>
          </nav>
        </Card>

        {/* Main */}
        <div className="space-y-6">
          {/* PROFILE */}
          {tab==="profile" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.profile}</div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><div className="text-gray-500">{t.username}</div><div className="font-medium">{me.username}</div></div>
                <div><div className="text-gray-500">{t.role}</div><div className="font-medium">{me.role}</div></div>
                <div className="sm:col-span-2"><div className="text-gray-500">{t.fullname}</div><div className="font-medium">{me.fullname}</div></div>
              </div>
            </Card>
          )}

          {/* COMBO: ARIZALAR & HARAKAT */}
          {tab==="combo" && (
            <>
              {/* STAT */}
              <Card>
                <div className="text-lg font-semibold mb-3">{t.stats}</div>
                <div className="flex flex-wrap gap-2 text-sm">
                  <Badge>{t.total}: {stat.total}</Badge>
                  <Badge>{t.inprog}: {stat.inprog}</Badge>
                  <Badge>{t.done}: {stat.done}</Badge>
                  <Badge>{t.canceled}: {stat.canceled}</Badge>
                  <Badge>{t.payyes}: {stat.payyes}</Badge>
                  <Badge>{t.payno}: {stat.payno}</Badge>
                </div>
              </Card>

              {/* CREATE FORM */}
              <Card>
                <div className="text-lg font-semibold mb-3">{t.newApp}</div>
                <form onSubmit={addApp} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><label className="font-medium">{t.appNum}</label><Input value={appForm.appNum} onChange={e=>setAppForm(s=>({...s,appNum:e.target.value}))} placeholder="4654563" required/></div>
                  <div><label className="font-medium">{t.org}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.org} onChange={e=>setAppForm(s=>({...s,org:e.target.value}))}>
                      {ORG_LIST.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div><label className="font-medium">{t.product}</label><Input value={appForm.product} onChange={e=>setAppForm(s=>({...s,product:e.target.value}))} placeholder="Choynak" required/></div>
                  <div><label className="font-medium">{t.client}</label><Input value={appForm.client} onChange={e=>setAppForm(s=>({...s,client:e.target.value}))} placeholder="pskent" required/></div>
                  <div><label className="font-medium">{t.payStatus}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.pay} onChange={e=>setAppForm(s=>({...s,pay:e.target.value}))}>
                      {STATUS_TOLOV.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div><label className="font-medium">{t.flowStatus}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.flow} onChange={e=>setAppForm(s=>({...s,flow:e.target.value}))}>
                      {STATUS_HOLAT.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div><label className="font-medium">{t.redZone}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.red} onChange={e=>setAppForm(s=>({...s,red:e.target.value}))}>
                      {QIZIL_ZONA.map(o=><option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-1"><label className="font-medium">{t.note}</label><Input value={appForm.note} onChange={e=>setAppForm(s=>({...s,note:e.target.value}))} placeholder="ixtiyoriy"/></div>
                  <div className="sm:col-span-2">
                    <button disabled={savingApp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">{savingApp?t.loading:t.add}</button>
                  </div>
                </form>
              </Card>

              {/* FILTER + TABLE */}
              <Card>
                <div className="flex flex-wrap gap-3 items-center mb-3">
                  <input className="rounded-xl border px-3 py-2 text-sm" placeholder={t.search} value={q} onChange={e=>setQ(e.target.value)}/>
                  <select className="rounded-xl border px-3 py-2 text-sm" value={fPay} onChange={e=>setFPay(e.target.value)}>
                    <option>{t.all}</option>{STATUS_TOLOV.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <select className="rounded-xl border px-3 py-2 text-sm" value={fFlow} onChange={e=>setFFlow(e.target.value)}>
                    <option>{t.all}</option>{STATUS_HOLAT.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <select className="rounded-xl border px-3 py-2 text-sm" value={fRed} onChange={e=>setFRed(e.target.value)}>
                    <option>{t.all}</option>{QIZIL_ZONA.map(s=><option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3">{t.appNum}</th>
                        <th className="py-2 pr-3">{t.org}</th>
                        <th className="py-2 pr-3">{t.product}</th>
                        <th className="py-2 pr-3">{t.client}</th>
                        <th className="py-2 pr-3">{t.payStatus}</th>
                        <th className="py-2 pr-3">{t.flowStatus}</th>
                        <th className="py-2 pr-3">{t.redZone}</th>
                        <th className="py-2 pr-3">{t.note}</th>
                        <th className="py-2 pr-3">{t.user}</th>
                        <th className="py-2 pr-3">{t.time}</th>
                        <th className="py-2 pr-3">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.length===0 && (<tr><td colSpan={11} className="py-4 text-gray-400">{t.none}</td></tr>)}
                      {filtered.map(r=>(
                        <tr key={r.id} className="border-t">
                          <td className="py-2 pr-3">{r.appNum}</td>
                          <td className="py-2 pr-3">{r.org}</td>
                          <td className="py-2 pr-3">{r.product}</td>
                          <td className="py-2 pr-3">{r.client}</td>
                          <td className="py-2 pr-3"><Pill>{r.pay}</Pill></td>
                          <td className="py-2 pr-3"><Pill>{r.flow}</Pill></td>
                          <td className="py-2 pr-3">{r.red}</td>
                          <td className="py-2 pr-3">{r.note||"-"}</td>
                          <td className="py-2 pr-3">{r.byUser||"-"}</td>
                          <td className="py-2 pr-3">{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleString():"-"}</td>
                          <td className="py-2 pr-3 flex gap-3">
                            <button className="text-sky-700 hover:underline" onClick={()=>startEdit(r)}>{t.edit}</button>
                            <button className="text-red-600 hover:underline" onClick={()=>removeApp(r.id)}>{t.remove}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* EDIT MODAL (oddiy) */}
              {editing && (
                <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
                  <Card className="max-w-2xl w-full">
                    <div className="text-lg font-semibold mb-3">{t.edit} — {editing.appNum}</div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div><label className="font-medium">{t.appNum}</label><Input value={editForm.appNum} onChange={e=>setEditForm(s=>({...s,appNum:e.target.value}))}/></div>
                      <div><label className="font-medium">{t.org}</label>
                        <select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.org} onChange={e=>setEditForm(s=>({...s,org:e.target.value}))}>{ORG_LIST.map(o=><option key={o}>{o}</option>)}</select>
                      </div>
                      <div><label className="font-medium">{t.product}</label><Input value={editForm.product} onChange={e=>setEditForm(s=>({...s,product:e.target.value}))}/></div>
                      <div><label className="font-medium">{t.client}</label><Input value={editForm.client} onChange={e=>setEditForm(s=>({...s,client:e.target.value}))}/></div>
                      <div><label className="font-medium">{t.payStatus}</label>
                        <select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.pay} onChange={e=>setEditForm(s=>({...s,pay:e.target.value}))}>{STATUS_TOLOV.map(o=><option key={o}>{o}</option>)}</select>
                      </div>
                      <div><label className="font-medium">{t.flowStatus}</label>
                        <select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.flow} onChange={e=>setEditForm(s=>({...s,flow:e.target.value}))}>{STATUS_HOLAT.map(o=><option key={o}>{o}</option>)}</select>
                      </div>
                      <div><label className="font-medium">{t.redZone}</label>
                        <select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.red} onChange={e=>setEditForm(s=>({...s,red:e.target.value}))}>{QIZIL_ZONA.map(o=><option key={o}>{o}</option>)}</select>
                      </div>
                      <div className="sm:col-span-1"><label className="font-medium">{t.note}</label><Input value={editForm.note} onChange={e=>setEditForm(s=>({...s,note:e.target.value}))}/></div>
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button onClick={doUpdate} disabled={updating} className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60">{updating?t.loading:t.save}</button>
                      <button onClick={()=>setEditing(null)} className="rounded-xl border px-4 py-2 text-sm">{t.cancel}</button>
                    </div>
                  </Card>
                </div>
              )}
            </>
          )}

          {/* EMPLOYEES */}
          {tab==="employees" && me.role==="admin" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addEmployee}</div>
                <form onSubmit={addEmployee} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><label className="font-medium">{t.fullname}</label><Input value={empForm.fullname} onChange={e=>setEmpForm(s=>({...s,fullname:e.target.value}))} placeholder="Sobirov Doston" required/></div>
                  <div><label className="font-medium">{t.empUsername}</label><Input value={empForm.username} onChange={e=>setEmpForm(s=>({...s,username:e.target.value}))} placeholder="doston" required/></div>
                  <div><label className="font-medium">{t.empPassword}</label><Input type="text" value={empForm.password} onChange={e=>setEmpForm(s=>({...s,password:e.target.value}))} placeholder="parol" required/></div>
                  <div><label className="font-medium">{t.photoUrl}</label><Input type="url" value={empForm.photoUrl} onChange={e=>setEmpForm(s=>({...s,photoUrl:e.target.value}))} placeholder="https://...jpg"/></div>
                  <div><label className="font-medium">{t.empRole}</label>
                    <select className="mt-1 w-full rounded-xl border px-3 py-2" value={empForm.role} onChange={e=>setEmpForm(s=>({...s,role:e.target.value}))}>
                      <option value="employee">{t.employee}</option>
                      <option value="admin">{t.admin}</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <button disabled={savingEmp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">{savingEmp?t.loading:t.create}</button>
                  </div>
                </form>
              </Card>

              <Card>
                <div className="text-lg font-semibold mb-3">{t.employeesList}</div>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3">Rasm</th>
                        <th className="py-2 pr-3">{t.fullname}</th>
                        <th className="py-2 pr-3">{t.username}</th>
                        <th className="py-2 pr-3">{t.role}</th>
                        <th className="py-2 pr-3">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {empList.length===0 && (<tr><td colSpan={5} className="py-4 text-gray-400">{t.none}</td></tr>)}
                      {empList.map(e=>(
                        <tr key={e.id} className="border-t">
                          <td className="py-2 pr-3">
                            {e.photoUrl ? <img src={e.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover"/> : <span>—</span>}
                          </td>
                          <td className="py-2 pr-3">{e.fullname||"-"}</td>
                          <td className="py-2 pr-3">{e.username}</td>
                          <td className="py-2 pr-3">{e.role}</td>
                          <td className="py-2 pr-3">
                            <button onClick={()=>removeEmployee(e.id)} className="text-red-600 hover:underline">{t.remove}</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* ACTIVITY – oldingi movements feed */}
          {tab==="activity" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.activity}</div>
              <div className="space-y-3 text-sm">
                {movements.length===0 && <div className="text-gray-400">{t.none}</div>}
                {movements.slice(0,30).map(m=>(
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="mt-1"><Pill>{m.type==="in"?"Kirim":"Chiqim"}</Pill></div>
                    <div>
                      <div className="font-medium">{m.product} <span className="text-gray-500">×{m.qty}</span></div>
                      <div className="text-xs text-gray-500">
                        {m.byUser} • {m.createdAt?.toDate?m.createdAt.toDate().toLocaleString():"-"} {m.note?` • ${m.note}`:""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
