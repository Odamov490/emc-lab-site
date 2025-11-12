// src/components/ui.js
import React from "react";

export function Card({ children, className = "" }) {
  return <div className={`rounded-2xl border border-black/10 bg-white/80 dark:bg-white/10 backdrop-blur p-5 shadow ${className}`}>{children}</div>;
}
export function Pill({ children }) {
  return <span className="inline-flex items-center rounded-full px-3 py-0.5 text-xs bg-sky-100 text-sky-800">{children}</span>;
}
export const Input = (p)=><input {...p} className={`mt-1 w-full rounded-xl border px-3 py-2 ${p.className||""}`} />;
