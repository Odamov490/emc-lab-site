// src/features/EditModal.jsx
import React from "react";
import { Card, Input } from "../components/ui";
import { ORG_LIST, STATUS_TOLOV, STATUS_HOLAT, QIZIL_ZONA, T } from "../utils/constants";

export default function EditModal({ lang, t, editing, editForm, setEditForm, onSave, onClose, updating }){
  if(!editing) return null;
  return (
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
          <button onClick={onSave} disabled={updating} className="rounded-xl bg-sky-600 text-white px-4 py-2 text-sm hover:opacity-90 disabled:opacity-60">{updating?t.loading:t.save}</button>
          <button onClick={onClose} className="rounded-xl border px-4 py-2 text-sm">{t.cancel}</button>
        </div>
      </Card>
    </div>
  );
}
