// src/features/Stats.jsx
import React from "react";
import { Card, Pill } from "../components/ui";
import { T } from "../utils/constants";

export default function Stats({ lang, stat }){
  const t = T[lang];
  return (
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
  );
}
