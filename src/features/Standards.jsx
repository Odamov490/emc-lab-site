// src/features/Standards.jsx
import React from "react";
import { Card, Pill } from "../components/ui";
import { T } from "../utils/constants";

export default function Standards({ lang, stdQ, setStdQ, stdFiltered, stdLoading, stdErr, loadStandards }){
  const t = T[lang];
  return (
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
  );
}
