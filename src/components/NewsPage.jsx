import React, { useEffect, useMemo, useState } from "react";
import NewsCard from "../components/NewsCard";

function fmtUpdatedAt(s) {
  if (!s) return "";
  try {
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return String(s);
    return d.toLocaleString();
  } catch {
    return String(s);
  }
}

export default function News() {
  const [data, setData] = useState(null);
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setErr("");
        const res = await fetch("/news.json", { cache: "no-store" });
        if (!res.ok) throw new Error("news.json yuklanmadi");
        const js = await res.json();
        if (!alive) return;
        setData(js);
      } catch (e) {
        if (!alive) return;
        setErr(String(e?.message || e));
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const items = Array.isArray(data?.items) ? data.items : [];

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) => {
      const t = `${it?.title || ""}\n${it?.text || ""}`.toLowerCase();
      return t.includes(s);
    });
  }, [items, q]);

  return (
    <main className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            Yangiliklar
          </h1>
          <div className="mt-2 text-sm opacity-70">
            • Yangilandi: {fmtUpdatedAt(data?.updated_at)}
          </div>
        </div>

        <div className="w-full md:w-[360px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Qidirish (sarlavha yoki matn)..."
            className="w-full rounded-2xl border border-black/10 bg-white/70 px-4 py-3 outline-none focus:ring-2 focus:ring-black/10"
          />
        </div>
      </div>

      {err ? (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 text-red-800 p-4">
          Xatolik: {err}
        </div>
      ) : null}

      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <NewsCard key={item?.tg_id || item?.url || Math.random()} item={item} />
        ))}
      </section>

      {!err && data && filtered.length === 0 ? (
        <div className="mt-10 opacity-70">Hech narsa topilmadi.</div>
      ) : null}
    </main>
  );
}
