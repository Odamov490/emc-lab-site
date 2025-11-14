// src/pages/Login.jsx (enhanced + Standartlar)
import React, { useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ApplicationChat from "../components/ApplicationChat";
import IaChat from "../components/ia-chat";

// ...

{tab === "chat" && (
  <>
    <Card>
      <ApplicationChat me={me} />
    </Card>
    <IaChat me={me} />
  </>
)}

import { db } from "../firebase";
import {
  collection, query, where, getDocs, addDoc, onSnapshot,
  serverTimestamp, doc, deleteDoc, updateDoc, orderBy, limit
} from "firebase/firestore";

/** ===========================================================
 *  SAYT BILAN UYG‘UN — STAFF rasmlari (public/staff/*)
 *  (App.jsx dagi STAFF ro‘yxati bilan bir xil yo‘llar)
 *  ===========================================================
 */
const STAFF_PHOTOS = {
  "Xakimov Aziz": "/staff/1.png",
  "Tillayev Anvar": "/staff/2.png",
  "Abdurashidov Davron": "/staff/3.png",
  "Odamov G‘ulomjon": "/staff/4.jpg",
  "Reimbayev Xushnud": "/staff/5.png",
  "Alekseyev Andrey": "/staff/6.png",
  "Abduvohobov Ravshan": "/staff/7.png",
  "Joldasbaev Dastanbek": "/staff/8.jpg",
  "Sobirov Doston": "/staff/9.png",
  "Karimov Suxrob": "/staff/10.png",
  "Sharofiddinov Najmiddin": "/staff/11.png",
   "Suxanov Alijan": "/staff/12.png",
};

/** ======= ENUM/LISTLAR (Google Sheets dagi ustunlar kabi) ======= */
const ORG_LIST = ["Toshkent","Attest","Premier Certification Center","Electro-Class Control"];
const STATUS_TOLOV = ["Belgilanmagan","To'lov bor","To'lov yo'q"];
const STATUS_HOLAT = ["Belgilanmagan","Jarayonda","Sinov tugatildi","Protokol yuborildi","Bekor qilindi"];
const QIZIL_ZONA = ["Ha","Yo'q"];

/** ======= TIL ======= */
const T = {
  uz: {
    title:"Kirish", username:"Login", password:"Parol", signIn:"Kirish", wrong:"Login yoki parol noto‘g‘ri",
    loading:"Yuklanmoqda...", dashboard:"Boshqaruv paneli", logout:"Chiqish", hello:"Salom", role:"Roli",
    profile:"Profil", activity:"Faollik", employees:"Hodimlar", standards:"Standartlar",chat:"Chat",
    combo:"Arizalar & Harakat", stats:"Statistika", total:"Jami", inprog:"Jarayonda", done:"Sinov tugatildi",
    canceled:"Bekor qilindi", payyes:"To‘lov bor", payno:"To‘lov yo‘q",
    newApp:"Yangi ariza", appNum:"Ariza raqami", org:"Organ Sertifikatsiya", product:"Mahsulot",
    client:"Pskent/Toshkent (mijoz)", payStatus:"Status (to‘lov)", flowStatus:"Status (holat)", redZone:"Qizil zona",
    note:"Izoh", add:"Qo‘shish", save:"Saqlash", remove:"O‘chirish", edit:"Tahrirlash", cancel:"Bekor qilish",
    actions:"Harakatlar", time:"Vaqt", user:"Hodim", search:"Qidiruv", all:"Barchasi", none:"Hozircha yo‘q",
    back:"Bosh menyu", create:"Yaratish", employeesList:"Hodimlar ro‘yxati", addEmployee:"Yangi hodim qo‘shish",
    fullname:"To‘liq ism", empUsername:"Login (hodimniki)", empPassword:"Parol (hodimniki)", empRole:"Roli",
    admin:"Admin", employee:"Hodim", photoUrl:"Rasm (URL)", importCSV:"CSV import", exportCSV:"CSV export",
    perPage:"Sahifada", saved:"Saqlandi", updated:"Yangilandi", deleted:"O‘chirildi",
    changePass:"Parolni almashtirish", newPass:"Yangi parol", confirm:"Tasdiqlash", passChanged:"Parol almashtirildi",
    duplicate:"Bu ariza raqami allaqachon mavjud", sort:"Saralash",
    stdTitle:"Standartlar to‘plami", stdHint:"/public/standards/ ichiga fayllarni joylang va index.json ni to‘ldiring",
    stdRefresh:"Yangilash", stdDownload:"Yuklab olish", stdOpenFolder:"Papkani ochish", stdCount:"Jami fayl",
    stdBadJson:"index.json xato yoki to‘liq emas", stdEmpty:"Hozircha standartlar topilmadi",
  },
  ru: {
    title:"Вход", username:"Логин", password:"Пароль", signIn:"Войти", wrong:"Логин или пароль неверны",
    loading:"Загрузка...", dashboard:"Панель", logout:"Выйти", hello:"Здравствуйте", role:"Роль",
    profile:"Профиль", activity:"Лента", employees:"Сотрудники", standards:"Стандарты",chat:"Чат",
    combo:"Заявки & Движение", stats:"Статистика", total:"Всего", inprog:"В процессе", done:"Завершено",
    canceled:"Отменено", payyes:"Оплачено", payno:"Без оплаты",
    newApp:"Новая заявка", appNum:"№ заявки", org:"Орган сертиф.", product:"Изделие",
    client:"Пскент/Ташкент (клиент)", payStatus:"Статус (оплата)", flowStatus:"Статус (этап)", redZone:"Красная зона",
    note:"Примечание", add:"Добавить", save:"Сохранить", remove:"Удалить", edit:"Править", cancel:"Отмена",
    actions:"Действия", time:"Время", user:"Сотр.", search:"Поиск", all:"Все", none:"Пока нет",
    back:"В меню", create:"Создать", employeesList:"Список сотрудников", addEmployee:"Добавить сотрудника",
    fullname:"ФИО", empUsername:"Логин (сотр.)", empPassword:"Пароль (сотр.)", empRole:"Роль",
    admin:"Админ", employee:"Сотр.", photoUrl:"Фото (URL)", importCSV:"Импорт CSV", exportCSV:"Экспорт CSV",
    perPage:"На странице", saved:"Сохранено", updated:"Обновлено", deleted:"Удалено",
    changePass:"Сменить пароль", newPass:"Новый пароль", confirm:"Подтвердить", passChanged:"Пароль изменен",
    duplicate:"Такая заявка уже существует", sort:"Сортировка",
    stdTitle:"Каталог стандартов", stdHint:"Положите файлы в /public/standards/ и заполните index.json",
    stdRefresh:"Обновить", stdDownload:"Скачать", stdOpenFolder:"Открыть папку", stdCount:"Всего файлов",
    stdBadJson:"index.json поврежден или неполный", stdEmpty:"Пока нет стандартов",
  
  }
};

/** ======= KICHIK UI ======= */
function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-black/10 bg-white/80 dark:bg-white/10 backdrop-blur p-5 shadow ${className}`}>{children}</div>;
}
function Pill({ children }) {
  return <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs bg-sky-100 text-sky-800">{children}</span>;
}
const Input = (p)=><input {...p} className={`mt-1 w-full rounded-xl border px-3 py-2 ${p.className||""}`} />;

/** ======= YORDAMCHILAR ======= */
const emptyApp = { appNum:"", org:ORG_LIST[0], product:"", client:"", pay:STATUS_TOLOV[0], flow:STATUS_HOLAT[0], red:QIZIL_ZONA[1], note:"" };

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

/** ======= ASOSIY ======= */
export default function Login(){
  const navigate = useNavigate();
  const [lang,setLang]=useState(() => localStorage.getItem("emc_lang") || "uz");
  const t = useMemo(()=>T[lang], [lang]);

  // persist language
  useEffect(()=>{ localStorage.setItem("emc_lang", lang); }, [lang]);

  // auth
  const [me,setMe]=useState(null);
  const [checking,setChecking]=useState(true);
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState(""); const [submitting,setSubmitting]=useState(false);

  // tabs
  const [tab,setTab]=useState("combo"); // profile | combo | employees | activity | standards

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
  const [sortKey,setSortKey]=useState("createdAt"); // appNum | org | product | client | pay | flow | red | createdAt
  const [sortDir,setSortDir]=useState("desc"); // asc | desc

  // pagination
  const [perPage,setPerPage]=useState(10); const [page,setPage]=useState(1);

  // simple debounce for search
  const [debouncedQ,setDebouncedQ]=useState("");
  const debounceRef = useRef(null);
  useEffect(()=>{
    clearTimeout(debounceRef.current);
    debounceRef.current=setTimeout(()=>setDebouncedQ(q), 250);
    return ()=>clearTimeout(debounceRef.current);
  }, [q]);

  // session
  useEffect(()=>{
    const raw=localStorage.getItem("emc_auth");
    if(raw){ try{ setMe(JSON.parse(raw)); }catch{}
    }
    setChecking(false);
  },[]);

  // realtime
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

  /** ======= LOGIN ======= */
  const doLogin=async(e)=>{
    e.preventDefault(); setErr(""); setSubmitting(true);
    try{
      const qy=query(collection(db,"employees"), where("username","==",u.trim()), where("password","==",p));
      const qs=await getDocs(qy);
      if(qs.empty){ setErr(t.wrong); setSubmitting(false); return; }
      const d=qs.docs[0].data();
      // FOTO: agar yo‘q bo‘lsa, sayt STAFF dan avtomatik beramiz
      const photo = d.photoUrl || STAFF_PHOTOS[d.fullname] || "";
      if(!d.photoUrl && STAFF_PHOTOS[d.fullname]){
        try{ await updateDoc(doc(db,"employees", qs.docs[0].id), { photoUrl: STAFF_PHOTOS[d.fullname] }); }catch{}
      }
      const auth={ id:qs.docs[0].id, username:d.username, fullname:d.fullname||d.username, role:d.role||"employee", photoUrl:photo };
      localStorage.setItem("emc_auth", JSON.stringify(auth));
      setMe(auth); setSubmitting(false); setTab("combo");
    }catch(e2){ console.error(e2); setErr("Xatolik. Keyinroq urinib ko‘ring."); setSubmitting(false); }
  };
  const logout=()=>{localStorage.removeItem("emc_auth"); setMe(null); setTab("combo");};

  /** ======= HELPERS ======= */
  const formatDT=(ts)=>{ try{ return ts?.toDate ? ts.toDate().toLocaleString() : "-"; }catch{return "-";} };

  /** ======= CRUD (applications) ======= */
  const addApp=async(e)=>{
    e.preventDefault(); if(!me) return;
    const errs=validateApp(appForm); if(errs.length){ alert(errs.join("\n")); return; }
    setSavingApp(true);
    try{
      // === Duplicate check by appNum ===
      const dupQ = query(collection(db,"applications"), where("appNum","==", appForm.appNum.trim()), limit(1));
      const dupSnap = await getDocs(dupQ);
      if(!dupSnap.empty){ alert(t.duplicate); setSavingApp(false); return; }

      await addDoc(collection(db,"applications"), { ...appForm, appNum:appForm.appNum.trim(), byUser:me.fullname, byUserId:me.id, createdAt:serverTimestamp() });
      setAppForm(emptyApp); alert(t.saved);
    }catch(ex){ console.error(ex); alert("Saqlashda xato!"); } finally{ setSavingApp(false); }
  };
  const startEdit=(row)=>{ setEditing(row); setEditForm({ appNum:row.appNum||"", org:row.org||ORG_LIST[0], product:row.product||"", client:row.client||"", pay:row.pay||STATUS_TOLOV[0], flow:row.flow||STATUS_HOLAT[0], red:row.red||QIZIL_ZONA[1], note:row.note||"" }); };
  const doUpdate=async()=>{
    if(!editing) return;
    const errs=validateApp(editForm); if(errs.length){ alert(errs.join("\n")); return; }
    setUpdating=true;
    try{ await updateDoc(doc(db,"applications",editing.id), {...editForm, updatedAt:serverTimestamp()}); setEditing(null); alert(t.updated); }
    catch(ex){ console.error(ex); alert("Yangilashda xato!"); } finally{ setUpdating(false); }
  };
  const removeApp=async(id)=>{ if(!confirm("O‘chirasizmi?")) return; try{ await deleteDoc(doc(db,"applications",id)); alert(t.deleted); }catch(ex){ console.error(ex); alert("O‘chirishda xato!"); } };

  // inline quick setters for status (admin or the creator)
  const canQuickEdit = (row) => me?.role === 'admin' || row.byUserId === me?.id;
  const setFlow = async (row, value) => { try{ await updateDoc(doc(db,'applications',row.id), { flow:value, updatedAt:serverTimestamp() }); }catch(e){ console.error(e); alert('Xato'); } };
  const setPay = async (row, value) => { try{ await updateDoc(doc(db,'applications',row.id), { pay:value, updatedAt:serverTimestamp() }); }catch(e){ console.error(e); alert('Xato'); } };

  /** ======= EMPLOYEES ======= */
  const addEmployee=async(e)=>{
    e.preventDefault(); if(!me||me.role!=="admin") return;
    const body={ ...empForm };
    if(!body.photoUrl && STAFF_PHOTOS[body.fullname]) body.photoUrl=STAFF_PHOTOS[body.fullname];
    if(!body.username.trim()||!body.password.trim()||!body.fullname.trim()) return alert("To‘liq to‘ldiring.");
    setSavingEmp(true);
    try{
      await addDoc(collection(db,"employees"), { username:body.username.trim(), password:body.password.trim(), fullname:body.fullname.trim(), role:body.role, photoUrl:body.photoUrl||"", createdAt:serverTimestamp() });
      setEmpForm({ fullname:"", username:"", password:"", role:"employee", photoUrl:"" }); alert(t.saved);
    }catch(ex){ console.error(ex); alert("Hodim qo‘shishda xato!"); } finally{ setSavingEmp(false); }
  };
  const removeEmployee=async(id)=>{ if(!me||me.role!=="admin") return; if(!confirm("Hodimni o‘chirasizmi?")) return; try{ await deleteDoc(doc(db,"employees",id)); alert(t.deleted); }catch(ex){ console.error(ex); alert("O‘chirishda xato!"); } };

  // profile: change own password
  const [newPass,setNewPass]=useState("");
  const [changing,setChanging]=useState(false);
  const changeMyPass=async()=>{
    if(!me) return; if(!newPass.trim()) return alert("Parol kiriting");
    setChanging(true);
    try{ await updateDoc(doc(db,'employees', me.id), { password:newPass.trim() }); alert(t.passChanged); setNewPass(""); }
    catch(e){ console.error(e); alert('Xato'); }
    finally{ setChanging(false); }
  };

  /** ======= FILTER/PAGINATION/SORT ======= */
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

  /** ======= STAT ======= */
  const stat = {
    total: apps.length,
    inprog: apps.filter(a=>a.flow==="Jarayonda").length,
    done: apps.filter(a=>a.flow==="Sinov tugatildi").length,
    canceled: apps.filter(a=>a.flow==="Bekor qilindi").length,
    payyes: apps.filter(a=>a.pay==="To'lov bor").length,
    payno: apps.filter(a=>a.pay==="To'lov yo'q").length,
  };

  // ====== STANDARDS state ======
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
      try{ json = JSON.parse(text); }catch(parseErr){ throw new Error(t.stdBadJson+` (JSON.parse)\n`+parseErr.message); }
      if(!Array.isArray(json)) throw new Error(t.stdBadJson+` (Array expected)`);
      // minimal schema check
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

  if(checking){
    return <div className="min-h-screen grid place-items-center"><div className="text-sm text-gray-600">{t.loading}</div></div>;
  }

  /** ======= LOGIN EKRANI ======= */
  if(!me){
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

  const SortBtn = ({col, label}) => (
    <button
      className="inline-flex items-center gap-1 hover:underline"
      onClick={()=>{
        if(sortKey===col){ setSortDir(d=>d==='asc'?'desc':'asc'); } else { setSortKey(col); setSortDir('asc'); }
        setPage(1);
      }}
      title={`${t.sort}: ${label}`}
    >
      {label}
      {sortKey===col && (<span>{sortDir==='asc'? '↑':'↓'}</span>)}
    </button>
  );

  /** ======= DASHBOARD ======= */
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50">
      {/* Top bar */}
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
            <button onClick={logout} className="rounded-lg border px-3 py-1.5 hover:bg-black/5">{t.logout}</button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid md:grid-cols-[230px_1fr] gap-6">
    {/* Sidebar */}
<Card className="p-0 overflow-hidden">
  <div className="p-4 border-b border-black/10">
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-full bg-black/10 grid place-items-center overflow-hidden">
        {me.photoUrl ? (
          <img src={me.photoUrl} alt="" className="h-12 w-12 object-cover" />
        ) : (
          <span className="text-sm">👤</span>
        )}
      </div>
      <div>
        <div className="font-semibold">
          {t.hello}, {me.fullname}
        </div>
        <div className="text-xs text-gray-500">
          {t.role}: {me.role}
        </div>
      </div>
    </div>
  </div>

  <nav className="p-2">
  

    {/* PROFILE */}
    <button
      onClick={() => setTab("profile")}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
        tab === "profile" ? "bg-black/5 font-semibold" : ""
      }`}
    >
      {t.profile}
    </button>

  {/* ARIZALAR & HARAKAT */}
    <button
      onClick={() => setTab("combo")}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
        tab === "combo" ? "bg-black/5 font-semibold" : ""
      }`}
    >
      {t.combo}
    </button>

    {/* EMPLOYEES (Adminlarga) */}
    {me.role === "admin" && (
      <button
        onClick={() => setTab("employees")}
        className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
          tab === "employees" ? "bg-black/5 font-semibold" : ""
        }`}
      >
        {t.employees}
      </button>
    )}

    {/* FAOLLIK */}
    <button
      onClick={() => setTab("activity")}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
        tab === "activity" ? "bg-black/5 font-semibold" : ""
      }`}
    >
      {t.activity}
    </button>

    {/* YANGI – CHAT */}
    <button
      onClick={() => setTab("chat")}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
        tab === "chat" ? "bg-black/5 font-semibold" : ""
      }`}
    >
      {t.chat}
    </button>

    {/* STANDARDS */}
    <button
      onClick={() => setTab("standards")}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
        tab === "standards" ? "bg-black/5 font-semibold" : ""
      }`}
    > 
      {t.standards}
    </button>

<button
  onClick={() => setTab("ai")}
  className={`w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-black/5 ${
    tab === "ai" ? "bg-black/5 font-semibold" : ""
  }`}
>
  🤖 AI Assistent
</button>


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
              {/* Change password */}
              <div className="mt-5 border-t pt-4">
                <div className="font-medium mb-2">{t.changePass}</div>
                <div className="flex gap-2 max-w-sm">
                  <Input type="text" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder={t.newPass} />
                  <button onClick={changeMyPass} disabled={changing} className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60">{t.confirm}</button>
                </div>
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
                  <Pill>{t.total}: {stat.total}</Pill>
                  <Pill>{t.inprog}: {stat.inprog}</Pill>
                  <Pill>{t.done}: {stat.done}</Pill>
                  <Pill>{t.canceled}: {stat.canceled}</Pill>
                  <Pill>{t.payyes}: {stat.payyes}</Pill>
                  <Pill>{t.payno}: {stat.payno}</Pill>
                </div>
              </Card>

              {/* CREATE */}
              <Card>
                <div className="text-lg font-semibold mb-3">{t.newApp}</div>
                <form onSubmit={addApp} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><label className="font-medium">{t.appNum}</label><Input value={appForm.appNum} onChange={e=>setAppForm(s=>({...s,appNum:e.target.value}))} placeholder="4654563" required/></div>
                  <div><label className="font-medium">{t.org}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.org} onChange={e=>setAppForm(s=>({...s,org:e.target.value}))}>{ORG_LIST.map(o=>
                    <option key={o}>{o}</option>)}</select></div>
                  <div><label className="font-medium">{t.product}</label><Input value={appForm.product} onChange={e=>setAppForm(s=>({...s,product:e.target.value}))} placeholder="Choynak" required/></div>
                  <div><label className="font-medium">{t.client}</label><Input value={appForm.client} onChange={e=>setAppForm(s=>({...s,client:e.target.value}))} placeholder="pskent" required/></div>
                  <div><label className="font-medium">{t.payStatus}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.pay} onChange={e=>setAppForm(s=>({...s,pay:e.target.value}))}>{STATUS_TOLOV.map(o=>
                    <option key={o}>{o}</option>)}</select></div>
                  <div><label className="font-medium">{t.flowStatus}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.flow} onChange={e=>setAppForm(s=>({...s,flow:e.target.value}))}>{STATUS_HOLAT.map(o=>
                    <option key={o}>{o}</option>)}</select></div>
                  <div><label className="font-medium">{t.redZone}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.red} onChange={e=>setAppForm(s=>({...s,red:e.target.value}))}>{QIZIL_ZONA.map(o=>
                    <option key={o}>{o}</option>)}</select></div>
                  <div className="sm:col-span-1"><label className="font-medium">{t.note}</label><Input value={appForm.note} onChange={e=>setAppForm(s=>({...s,note:e.target.value}))} placeholder="ixtiyoriy"/></div>
                  <div className="sm:col-span-2">
                    <button disabled={savingApp} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">{savingApp?t.loading:t.add}</button>
                    {/* CSV IMPORT/EXPORT */}
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="rounded-xl border px-3 py-1.5 text-sm cursor-pointer hover:bg-black/5">
                        {t.importCSV}
                        <input type="file" accept=".csv" className="hidden" onChange={async(e)=>{
                          const file=e.target.files?.[0]; if(!file) return;
                          const text=await file.text();
                          // CSV: appNum,org,product,client,pay,flow,red,note
                          const rows=text.split(/\r?\n/).filter(Boolean).slice(1);
                          for(const row of rows){
                            // parse simple CSV (no commas inside fields). For advanced, use PapaParse in future.
                            const [appNum,org,product,client,pay,flow,red,note] = row.split(",").map(s=>s?.trim());
                            const draft={appNum,org,product,client,pay,flow,red,note};
                            const errs=validateApp(draft); if(errs.length) continue;
                            try{
                              // skip duplicates by appNum
                              const dq=query(collection(db,'applications'), where('appNum','==', (appNum||'').trim()), limit(1));
                              const ds=await getDocs(dq); if(!ds.empty) continue;
                              await addDoc(collection(db,"applications"), {...draft, byUser:me.fullname, byUserId:me.id, createdAt:serverTimestamp()});
                            }catch{}
                          }
                          alert(t.saved);
                          e.target.value="";
                        }}/>
                      </label>
                      <button className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5" onClick={()=>{
                        const header="appNum,org,product,client,pay,flow,red,note\n";
                        const body=filtered.map(a=>[a.appNum,a.org,a.product,a.client,a.pay,a.flow,a.red,(a.note||"")].join(",")).join("\n");
                        const blob=new Blob([header+body],{type:"text/csv"}); const url=URL.createObjectURL(blob);
                        const a=document.createElement("a"); a.href=url; a.download="applications.csv"; a.click(); URL.revokeObjectURL(url);
                      }}>{t.exportCSV}</button>
                    </div>
                  </div>
                </form>
              </Card>

              {/* FILTER + TABLE + PAGINATION */}
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

                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2 pr-3"><SortBtn col="appNum" label={t.appNum} /></th>
                        <th className="py-2 pr-3"><SortBtn col="org" label={t.org} /></th>
                        <th className="py-2 pr-3"><SortBtn col="product" label={t.product} /></th>
                        <th className="py-2 pr-3"><SortBtn col="client" label={t.client} /></th>
                        <th className="py-2 pr-3"><SortBtn col="pay" label={t.payStatus} /></th>
                        <th className="py-2 pr-3"><SortBtn col="flow" label={t.flowStatus} /></th>
                        <th className="py-2 pr-3"><SortBtn col="red" label={t.redZone} /></th>
                        <th className="py-2 pr-3">{t.note}</th>
                        <th className="py-2 pr-3">{t.user}</th>
                        <th className="py-2 pr-3"><SortBtn col="createdAt" label={t.time} /></th>
                        <th className="py-2 pr-3">{t.actions}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pageItems.length===0 && (<tr><td colSpan={11} className="py-4 text-gray-400">{t.none}</td></tr>)}
                      {pageItems.map(r=>{
                        const redCell = r.red==="Ha" ? "bg-red-50" : "";
                        return (
                        <tr key={r.id} className={`border-t ${redCell}`}>
                          <td className="py-2 pr-3">{r.appNum}</td>
                          <td className="py-2 pr-3">{r.org}</td>
                          <td className="py-2 pr-3">{r.product}</td>
                          <td className="py-2 pr-3">{r.client}</td>
                          <td className="py-2 pr-3">
                            {canQuickEdit(r) ? (
                              <select className="rounded border px-2 py-1" value={r.pay} onChange={e=>setPay(r, e.target.value)}>
                                {STATUS_TOLOV.map(s=> <option key={s}>{s}</option>)}
                              </select>
                            ) : (<Pill>{r.pay}</Pill>)}
                          </td>
                          <td className="py-2 pr-3">
                            {canQuickEdit(r) ? (
                              <select className="rounded border px-2 py-1" value={r.flow} onChange={e=>setFlow(r, e.target.value)}>
                                {STATUS_HOLAT.map(s=> <option key={s}>{s}</option>)}
                              </select>
                            ) : (<Pill>{r.flow}</Pill>)}
                          </td>
                          <td className="py-2 pr-3">{r.red==="Ha" ? <span className="px-2 py-0.5 text-xs rounded bg-red-100 text-red-700">Ha</span> : "Yo'q"}</td>
                          <td className="py-2 pr-3">{r.note||"-"}</td>
                          <td className="py-2 pr-3">{r.byUser||"-"}</td>
                          <td className="py-2 pr-3">{formatDT(r.createdAt)}{r.updatedAt? <span className="text-xs text-gray-400"> • upd {formatDT(r.updatedAt)}</span> : null}</td>
                          <td className="py-2 pr-3 flex gap-3">
                            <button className="text-sky-700 hover:underline" onClick={()=>startEdit(r)}>{t.edit}</button>
                            {(me.role==='admin') && (
                              <button className="text-red-600 hover:underline" onClick={()=>removeApp(r.id)}>{t.remove}</button>
                            )}
                          </td>
                        </tr>
                      )})}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                <div className="mt-3 flex items-center justify-between text-sm">
                  <div> {page}/{pages} </div>
                  <div className="flex gap-2">
                    <button disabled={page<=1} onClick={()=>setPage(1)} className="rounded border px-2 py-1 disabled:opacity-50">«</button>
                    <button disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} className="rounded border px-2 py-1 disabled:opacity-50">‹</button>
                    <button disabled={page>=pages} onClick={()=>setPage(p=>Math.min(pages,p+1))} className="rounded border px-2 py-1 disabled:opacity-50">›</button>
                    <button disabled={page>=pages} onClick={()=>setPage(pages)} className="rounded border px-2 py-1 disabled:opacity-50">»</button>
                  </div>
                </div>
              </Card>

              {/* EDIT MODAL */}
              {editing && (
                <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
                  <Card className="max-w-2xl w-full">
                    <div className="text-lg font-semibold mb-3">{t.edit} — {editing.appNum}</div>
                    <div className="grid sm:grid-cols-2 gap-4 text-sm">
                      <div><label className="font-medium">{t.appNum}</label><Input value={editForm.appNum} onChange={e=>setEditForm(s=>({...s,appNum:e.target.value}))}/></div>
                      <div><label className="font-medium">{t.org}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.org} onChange={e=>setEditForm(s=>({...s,org:e.target.value}))}>{ORG_LIST.map(o=><option key={o}>{o}</option>)}</select></div>
                      <div><label className="font-medium">{t.product}</label><Input value={editForm.product} onChange={e=>setEditForm(s=>({...s,product:e.target.value}))}/></div>
                      <div><label className="font-medium">{t.client}</label><Input value={editForm.client} onChange={e=>setEditForm(s=>({...s,client:e.target.value}))}/></div>
                      <div><label className="font-medium">{t.payStatus}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.pay} onChange={e=>setEditForm(s=>({...s,pay:e.target.value}))}>{STATUS_TOLOV.map(o=><option key={o}>{o}</option>)}</select></div>
                      <div><label className="font-medium">{t.flowStatus}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.flow} onChange={e=>setEditForm(s=>({...s,flow:e.target.value}))}>{STATUS_HOLAT.map(o=><option key={o}>{o}</option>)}</select></div>
                      <div><label className="font-medium">{t.redZone}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={editForm.red} onChange={e=>setEditForm(s=>({...s,red:e.target.value}))}>{QIZIL_ZONA.map(o=><option key={o}>{o}</option>)}</select></div>
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

          {/* EMPLOYEES (Admin) */}
          {tab==="employees" && me.role==="admin" && (
            <>
              <Card>
                <div className="text-lg font-semibold mb-3">{t.addEmployee}</div>
                <form onSubmit={addEmployee} className="grid sm:grid-cols-2 gap-4 text-sm">
                  <div><label className="font-medium">{t.fullname}</label><Input value={empForm.fullname} onChange={e=>setEmpForm(s=>({...s,fullname:e.target.value}))} placeholder="Sobirov Doston" required/></div>
                  <div><label className="font-medium">{t.empUsername}</label><Input value={empForm.username} onChange={e=>setEmpForm(s=>({...s,username:e.target.value}))} placeholder="doston" required/></div>
                  <div><label className="font-medium">{t.empPassword}</label><Input type="text" value={empForm.password} onChange={e=>setEmpForm(s=>({...s,password:e.target.value}))} placeholder="parol" required/></div>
                  <div><label className="font-medium">{t.photoUrl}</label><Input type="url" value={empForm.photoUrl} onChange={e=>setEmpForm(s=>({...s,photoUrl:e.target.value}))} placeholder="https://...jpg (ixtiyoriy)"/></div>
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
                          <td className="py-2 pr-3">{e.photoUrl ? <img src={e.photoUrl} alt="" className="h-8 w-8 rounded-full object-cover"/> : "—"}</td>
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

          {/* ACTIVITY — movements feed (ilgari mavjud) */}
          {tab==="activity" && (
            <Card>
              <div className="text-lg font-semibold mb-3">{t.activity}</div>
              <div className="space-y-3 text-sm">
                {movements.length===0 && <div className="text-gray-400">{t.none}</div>}
                {movements.slice(0,50).map(m=>(
                  <div key={m.id} className="flex items-start gap-3">
                    <div className="mt-1"><Pill>{m.type==="in"?"Kirim":"Chiqim"}</Pill></div>
                    <div>
                      <div className="font-medium">{m.product} <span className="text-gray-500">×{m.qty}</span></div>
                      <div className="text-xs text-gray-500">
                        {m.byUser} • {formatDT(m.createdAt)} {m.note?` • ${m.note}`:""}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* ======= NEW: STANDARDS ======= */}
          {tab==="standards" && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <div className="text-lg font-semibold">{t.stdTitle}</div>
                <div className="flex items-center gap-2">
                  <a href="/standards/" target="_blank" rel="noreferrer" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5">{t.stdOpenFolder}</a>
                  <button onClick={loadStandards} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-black/5">{t.stdRefresh}</button>
                </div>
              </div>

              <div className="text-xs text-gray-500 mb-3">{t.stdHint}</div>

              <div className="flex items-center gap-2 mb-3">
                <input className="rounded-xl border px-3 py-2 text-sm flex-1" placeholder={t.search} value={stdQ} onChange={e=>setStdQ(e.target.value)} />
                <Pill>{t.stdCount}: {stdFiltered.length}</Pill>
              </div>

              {stdLoading && <div className="text-sm text-gray-600">{t.loading}</div>}
              {stdErr && <div className="text-sm text-red-600 whitespace-pre-wrap">{stdErr}</div>}
              {!stdLoading && !stdErr && stdFiltered.length===0 && (
                <div className="text-sm text-gray-500">{t.stdEmpty}</div>
              )}

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {stdFiltered.map(s=> (
                  <div key={s.id} className="rounded-xl border p-3 bg-white/60">
                    <div className="font-medium text-sm mb-1">{s.name}</div>
                    {s.desc && <div className="text-xs text-gray-500 mb-2">{s.desc}</div>}
                    <div className="flex gap-2">
                      <a href={s.file} download className="rounded-lg bg-sky-600 text-white px-3 py-1.5 text-xs hover:opacity-90">{t.stdDownload}</a>
                      <a href={s.file} target="_blank" rel="noreferrer" className="rounded-lg border px-3 py-1.5 text-xs hover:bg-black/5">PDF</a>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) }

{/* CHAT */}
{tab === "chat" && (
  <Card>
      <ApplicationChat me={me} />
  </Card>
)}

          {/* AI ASSISTENT */}  
          {tab === "ai" && (
  <Card>
    <IaChat me={me} />
  </Card>
)}



        </div>
      </div>
    </div>
  );
}
