// src/features/ApplicationsTable.jsx
import React from "react";
import { Pill } from "../components/ui";
import { STATUS_TOLOV, STATUS_HOLAT, T } from "../utils/constants";
import { formatDT } from "../utils/helpers";

export default function ApplicationsTable({ lang, items, t, canQuickEdit, setPay, setFlow, startEdit, removeApp, page, pages, setPage, sortKey, setSortKey, sortDir, setSortDir }){
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
  return (
    <>
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
            {items.length===0 && (<tr><td colSpan={11} className="py-4 text-gray-400">{t.none}</td></tr>)}
            {items.map(r=>{
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
                  {(true) && ( // admin check is done before passing removeApp
                    <button className="text-red-600 hover:underline" onClick={()=>removeApp(r.id)}>{t.remove}</button>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex items-center justify-between text-sm">
        <div> {page.current}/{pages} </div>
        <div className="flex gap-2">
          <button disabled={page.current<=1} onClick={()=>page.set(1)} className="rounded border px-2 py-1 disabled:opacity-50">«</button>
          <button disabled={page.current<=1} onClick={()=>page.set(Math.max(1,page.current-1))} className="rounded border px-2 py-1 disabled:opacity-50">‹</button>
          <button disabled={page.current>=pages} onClick={()=>page.set(Math.min(pages,page.current+1))} className="rounded border px-2 py-1 disabled:opacity-50">›</button>
          <button disabled={page.current>=pages} onClick={()=>page.set(pages)} className="rounded border px-2 py-1 disabled:opacity-50">»</button>
        </div>
      </div>
    </>
  );
}
