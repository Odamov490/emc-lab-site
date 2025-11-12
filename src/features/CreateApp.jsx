// src/features/CreateApp.jsx
import React from "react";
import { Card, Input } from "../components/ui";
import { ORG_LIST, STATUS_TOLOV, STATUS_HOLAT, QIZIL_ZONA, T } from "../utils/constants";

export default function CreateApp({ lang, appForm, setAppForm, onSubmit, saving, tSavedLabel }){
  const t = T[lang];
  return (
    <Card>
      <div className="text-lg font-semibold mb-3">{t.newApp}</div>
      <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4 text-sm">
        <div><label className="font-medium">{t.appNum}</label><Input value={appForm.appNum} onChange={e=>setAppForm(s=>({...s,appNum:e.target.value}))} placeholder="4654563" required/></div>
        <div><label className="font-medium">{t.org}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.org} onChange={e=>setAppForm(s=>({...s,org:e.target.value}))}>{ORG_LIST.map(o=><option key={o}>{o}</option>)}</select></div>
        <div><label className="font-medium">{t.product}</label><Input value={appForm.product} onChange={e=>setAppForm(s=>({...s,product:e.target.value}))} placeholder="Choynak" required/></div>
        <div><label className="font-medium">{t.client}</label><Input value={appForm.client} onChange={e=>setAppForm(s=>({...s,client:e.target.value}))} placeholder="pskent" required/></div>
        <div><label className="font-medium">{t.payStatus}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.pay} onChange={e=>setAppForm(s=>({...s,pay:e.target.value}))}>{STATUS_TOLOV.map(o=><option key={o}>{o}</option>)}</select></div>
        <div><label className="font-medium">{t.flowStatus}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.flow} onChange={e=>setAppForm(s=>({...s,flow:e.target.value}))}>{STATUS_HOLAT.map(o=><option key={o}>{o}</option>)}</select></div>
        <div><label className="font-medium">{t.redZone}</label><select className="mt-1 w-full rounded-xl border px-3 py-2" value={appForm.red} onChange={e=>setAppForm(s=>({...s,red:e.target.value}))}>{QIZIL_ZONA.map(o=><option key={o}>{o}</option>)}</select></div>
        <div className="sm:col-span-1"><label className="font-medium">{t.note}</label><Input value={appForm.note} onChange={e=>setAppForm(s=>({...s,note:e.target.value}))} placeholder="ixtiyoriy"/></div>
        <div className="sm:col-span-2">
          <button disabled={saving} className="rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60">{saving?t.loading:t.add}</button>
        </div>
      </form>
    </Card>
  );
}
