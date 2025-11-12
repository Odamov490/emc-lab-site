// src/features/ActivityFeed.jsx
import React from "react";
import { Card, Pill } from "../components/ui";
import { formatDT } from "../utils/helpers";
import { T } from "../utils/constants";

export default function ActivityFeed({ lang, movements }){
  const t = T[lang];
  return (
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
  );
}
