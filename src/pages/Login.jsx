// src/pages/Login.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, query, where, getDocs, addDoc, onSnapshot, serverTimestamp, doc, deleteDoc, updateDoc, orderBy, limit } from "firebase/firestore";

import { T, ORG_LIST, STATUS_TOLOV, STATUS_HOLAT, QIZIL_ZONA } from "../utils/constants";
import { emptyApp, validateApp, formatDT } from "../utils/helpers";
import { Card, Pill } from "../components/ui";

import LoginForm from "../features/LoginForm";
import Sidebar from "../features/Sidebar";
import Stats from "../features/Stats";
import CreateApp from "../features/CreateApp";
import ApplicationsTable from "../features/ApplicationsTable";
import EditModal from "../features/EditModal";
import EmployeesAdmin from "../features/EmployeesAdmin";
import ActivityFeed from "../features/ActivityFeed";
import Standards from "../features/Standards";

export default function Login(){
  const navigate = useNavigate();
  const [lang,setLang]=useState(() => localStorage.getItem("emc_lang") || "uz");
  const t = useMemo(()=>T[lang], [lang]);

  useEffect(()=>{ localStorage.setItem("emc_lang", lang); }, [lang]);

  const [me,setMe]=useState(null);
  const [checking,setChecking]=useState(true);

  // tabs
  const [tab,setTab]=useState("combo");

  // data
  const [apps,setApps]=useState([]);
  const [movements,setMovements]=useState([]);
  const [empList,setEmpList]=useState([]);

  // forms
  const [appForm,setAppForm]=useState(emptyApp);
  const [savingApp,setSavingApp]=useState(false);

  const [editing,setEditing]=useState(null);
  const [editForm,setEditForm]=useState(emptyApp);
  const [updating,setUpdating]=useState(false);

  const [empForm,setEmpForm]=useState({ fullname:"", username:"", password:"", role:"employee", photoUrl:"" });
  const [savingEmp,setSavingEmp]=useState(false);

  // filters
  const [q,setQ]=useState(""); const [fPay,setFPay]=useState(t.all); const [fFlow,setFFlow]=useState(t.all); const [fRed,setFRed]=useState(t.all);

  // sorting
  const [sortKey,setSortKey]=useState("createdAt");
  const [sortDir,setSortDir]=useState("desc");

  // pagination
  const [perPage,setPerPage]=useState(10); const [page,setPage]=useState(1);

  // search debounce
  const [debouncedQ,setDebouncedQ]=useState("");
  const debounceRef = useRef(null);
  useEffect(()=>{
    clearTimeout(debounceRef.current);
    debounceRef.current=setTimeout(()=>setDebouncedQ(q), 250);
    return ()=>clearTimeout(debounceRef.current);
  }, [q]);

  // session load
  useEffect(()=>{
    const raw=localStorage.getItem("emc_auth");
    if(raw){ try{ setMe(JSON.parse(raw)); }catch{} }
    setChecking(false);
  },[]);

  // realtime subscriptions
  useEffect(()=>{
    if(!me) return;
    const unsubApp = onSnapshot(query(collection(db,"applications"), orderBy("createdAt","desc")),(snap)=>{
      setApps(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    const unsubMv = onSnapshot(collection(db,"movements"),(snap)=>{
      const list=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>(b.createdAt?.seconds||0)-(a.createdAt?.seconds||0));
      setMovements(list);
    });
    let unsubEmp=null;
    if(me.role==="admin"){
      unsubEmp = onSnapshot(collection(db,"employees"),(snap)=>setEmpList(snap.docs.map(d=>({id:d.id,...d.data()}))));
    }
    return ()=>{unsubApp(); unsubMv(); unsubEmp&&unsubEmp();}
  },[me]);

  // login handler
  if(checking){
    return <div className="min-h-screen grid place-items-center"><div className="text-sm text-gray-600">{t.loading}</div></div>;
  }
  if(!me){
    return <LoginForm lang={lang} setLang={setLang} onLoggedIn={(auth)=>{ setMe(auth); setTab("combo"); }} />;
  }

  const logout=()=>{localStorage.removeItem("emc_auth"); setMe(null); setTab("combo");};

  // CRUD — applications
  async function addApp(e){
    e.preventDefault(); if(!me) return;
    const errs=validateApp(appForm); if(errs.length){ alert(errs.join("\\n")); return; }
    setSavingApp(true);
    try{
      const dupQ = query(collection(db,"applications"), where("appNum","==", appForm.appNum.trim()), limit(1));
      const dupSnap = await getDocs(dupQ);
      if(!dupSnap.empty){ alert(t.duplicate); setSavingApp(false); return; }

      await addDoc(collection(db,"applications"), { ...appForm, appNum:appForm.appNum.trim(), byUser:me.fullname, byUserId:me.id, createdAt:serverTimestamp() });
      setAppForm(emptyApp); alert(t.saved);
    }catch(ex){ console.error(ex); alert("Saqlashda xato!"); } finally{ setSavingApp(false); }
  }
  const startEdit=(row)=>{ setEditing(row); setEditForm({ appNum:row.appNum||"", org:row.org||ORG_LIST[0], product:row.product||"", client:row.client||"", pay:row.pay||STATUS_TOLOV[0], flow:row.flow||STATUS_HOLAT[0], red:row.red||QIZIL_ZONA[1], note:row.note||"" }); };
  const doUpdate=async()=>{
    if(!editing) return;
    const errs=validateApp(editForm); if(errs.length){ alert(errs.join("\\n")); return; }
    setUpdating(true);
    try{ await updateDoc(doc(db,"applications",editing.id), {...editForm, updatedAt:serverTimestamp()}); setEditing(null); alert(t.updated); }
    catch(ex){ console.error(ex); alert("Yangilashda xato!"); } finally{ setUpdating(false); }
  };
  const removeApp=async(id)=>{ if(!confirm("O‘chirasizmi?")) return; try{ await deleteDoc(doc(db,"applications",id)); alert(t.deleted); }catch(ex){ console.error(ex); alert("O‘chirishda xato!"); } };

  const canQuickEdit = (row) => me?.role === 'admin' || row.byUserId === me?.id;
  const setFlow = async (row, value) => { try{ await updateDoc(doc(db,'applications',row.id), { flow:value, updatedAt:serverTimestamp() }); }catch(e){ console.error(e); alert('Xato'); } };
  const setPay = async (row, value) => { try{ await updateDoc(doc(db,'applications',row.id), { pay:value, updatedAt:serverTimestamp() }); }catch(e){ console.error(e); alert('Xato'); } };

  // filters/sort/pagination
  const filtered = apps.filter(a=>{
    const text=(a.appNum+" "+a.product+" "+a.client+" "+a.org+" "+(a.note||"")).toLowerCase();
    const okText=!debouncedQ || text.includes(debouncedQ.toLowerCase());
    const okPay=(fPay===t.all)||a.pay===fPay;
    const okFlow=(fFlow===t.all)||a.flow===fFlow;
    const okRed=(fRed===t.all)||a.red===fRed;
    return okText&&okPay&&okFlow&&okRed;
  }).sort((a,b)=>{
    const dir = sortDir === 'asc' ? 1 : -1;
    const va = sortKey==='createdAt' ? (a.createdAt?.seconds||0) : (a[sortKey]||'');
    const vb = sortKey==='createdAt' ? (b.createdAt?.seconds||0) : (b[sortKey]||'');
    if(va<vb) return -1*dir; if(va>vb) return 1*dir; return 0;
  });
  const pages = Math.max(1, Math.ceil(filtered.length/perPage));
  const pageItems = filtered.slice((page-1)*perPage, (page-1)*perPage+perPage);

  const stat = {
    total: apps.length,
    inprog: apps.filter(a=>a.flow==="Jarayonda").length,
    done: apps.filter(a=>a.flow==="Sinov tugatildi").length,
    canceled: apps.filter(a=>a.flow==="Bekor qilindi").length,
    payyes: apps.filter(a=>a.pay==="To'lov bor").length,
    payno: apps.filter(a=>a.pay==="To'lov yo'q").length,
  };

  // Standards
  const [stdList,setStdList]=useState([]);
  const [stdQ,setStdQ]=useState("");
  const [stdErr,setStdErr]=useState("");
  const [stdLoading,setStdLoading]=useState(false);
  const loadStandards = async ()=>{
    setStdErr(""); setStdLoading(true);
    try{
      const res = await fetch('/standards/index.json', {cache:'no-store'});
      const text = await res.text();
      let json;
      try{ json = JSON.parse(text); }catch(parseErr){ throw new Error(t.stdBadJson+` (JSON.parse)\\n`+parseErr.message); }
      if(!Array.isArray(json)) throw new Error(t.stdBadJson+` (Array expected)`);
      const ok = json.every(x=> x && typeof x.id!=="undefined" && x.name && x.file);
      if(!ok) throw new Error(t.stdBadJson+` (fields: id,name,file)`);
      setStdList(json);
    }catch(e){ console.error(e); setStdErr(String(e.message||e)); setStdList([]); }
    finally{ setStdLoading(false); }
  };
  useEffect(()=>{ if(tab==="standards") loadStandards(); }, [tab]);

  const stdFiltered = stdList.filter(s=>{
    if(!stdQ.trim()) return true;
    const q = stdQ.toLowerCase();
    return (s.name||"").toLowerCase().includes(q) || (s.desc||"").toLowerCase().includes(q) || (s.file||"").toLowerCase().includes(q);
  });

  // ----- RENDER AUTHENTICATED UI -----
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-black/10">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-sky-500 to-cyan-400" />
            <div className="font-semibold">{T[lang].dashboard}</div>
            <Pill>{me.role}</Pill>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={()=>setLang(lang==="uz"?"ru":"uz")} className="rounded-lg border px-2 py-1 text-[12px]">{lang==="uz"?"РУ":"UZ"}</button>
            <button onClick={()=>navigate("/")} className="rounded-lg border px-3 py-1.5 hover:bg-black/5">{t.back}</button>
            <button onClick={()=>{localStorage.removeItem("emc_auth"); setMe(null); setTab("combo");}} className="rounded-lg border px-3 py-1.5 hover:bg-black/5">{t.logout}</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[230px_1fr] gap-6">
        <Sidebar lang={lang} me={me} tab={tab} setTab={setTab} />

        <div className="space-y-6">
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

          {tab==="combo" && (
            <>
              <Stats lang={lang} stat={stat} />
              <CreateApp lang={lang} appForm={appForm} setAppForm={setAppForm} onSubmit={addApp} saving={savingApp} />
              <Card>
                <div className="flex flex-wrap gap-3 items-center mb-3">
                  <input className="rounded-xl border px-3 py-2 text-sm" placeholder={t.search} value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/>
                  <select className="rounded-xl border px-3 py-2 text-sm" value={fPay} onChange={e=>{setFPay(e.target.value); setPage(1);}}>
                    <option>{t.all}</option>{STATUS_TOLOV.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <select className="rounded-xl border px-3 py-2 text-sm" value={fFlow} onChange={e=>{setFFlow(e.target.value); setPage(1);}}>
                    <option>{t.all}</option>{STATUS_HOLAT.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <select className="rounded-xl border px-3 py-2 text-sm" value={fRed} onChange={e=>{setFRed(e.target.value); setPage(1);}}>
                    <option>{t.all}</option>{QIZIL_ZONA.map(s=><option key={s}>{s}</option>)}
                  </select>
                  <div className="ml-auto flex items-center gap-2 text-sm">
                    <span>{t.perPage}:</span>
                    <select className="rounded-xl border px-2 py-1" value={perPage} onChange={e=>{setPerPage(parseInt(e.target.value||"10",10)); setPage(1);}}>
                      {[5,10,20,50].map(n=><option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                </div>

                <ApplicationsTable
                  lang={lang}
                  items={pageItems}
                  t={t}
                  canQuickEdit={(row)=> me?.role === 'admin' || row.byUserId === me?.id}
                  setPay={setPay}
                  setFlow={setFlow}
                  startEdit={startEdit}
                  removeApp={(id)=> me.role==='admin' && removeApp(id)}
                  page={{current:page, set:setPage}}
                  pages={pages}
                  setPage={setPage}
                  sortKey={sortKey} setSortKey={setSortKey}
                  sortDir={sortDir} setSortDir={setSortDir}
                />
              </Card>
              <EditModal lang={lang} t={t} editing={editing} editForm={editForm} setEditForm={setEditForm} onSave={doUpdate} onClose={()=>setEditing(null)} updating={updating} />
            </>
          )}

          {tab==="employees" && me.role==="admin" && (
            <EmployeesAdmin lang={lang} t={t} me={me}
              empForm={empForm} setEmpForm={setEmpForm}
              savingEmp={savingEmp} addEmployee={async(e)=>{
                e.preventDefault(); if(!me||me.role!=="admin") return;
                const body={ ...empForm };
                if(!body.username.trim()||!body.password.trim()||!body.fullname.trim()) return alert("To‘liq to‘ldiring.");
                setSavingEmp(true);
                try{
                  await addDoc(collection(db,"employees"), { username:body.username.trim(), password:body.password.trim(), fullname:body.fullname.trim(), role:body.role, photoUrl:body.photoUrl||"", createdAt:serverTimestamp() });
                  setEmpForm({ fullname:"", username:"", password:"", role:"employee", photoUrl:"" }); alert(t.saved);
                }catch(ex){ console.error(ex); alert("Hodim qo‘shishda xato!"); } finally{ setSavingEmp(false); }
              }}
              empList={empList}
              removeEmployee={async(id)=>{ if(!me||me.role!=="admin") return; if(!confirm("Hodimni o‘chirasizmi?")) return; try{ await deleteDoc(doc(db,"employees",id)); alert(t.deleted); }catch(ex){ console.error(ex); alert("O‘chirishda xato!"); } }}
            />
          )}

          {tab==="activity" && (
            <ActivityFeed lang={lang} movements={movements} />
          )}

          {tab==="standards" && (
            <Standards lang={lang} stdQ={stdQ} setStdQ={setStdQ}
              stdFiltered={stdList.filter(s=>{
                if(!stdQ.trim()) return true;
                const q = stdQ.toLowerCase();
                return (s.name||"").toLowerCase().includes(q) || (s.desc||"").toLowerCase().includes(q) || (s.file||"").toLowerCase().includes(q);
              })}
              stdLoading={stdLoading}
              stdErr={stdErr}
              loadStandards={loadStandards}
            />
          )}
        </div>
      </div>
    </div>
  );
}
