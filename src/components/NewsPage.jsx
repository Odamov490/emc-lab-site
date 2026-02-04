import React, { useEffect, useMemo, useState } from "react";
import NewsCard from "./NewsCard";

function fmtUpdated(iso) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    // Uzbek formatga yaqin: DD.MM.YYYY, HH:MM
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, "0");
    const mi = String(d.getMinutes()).padStart(2, "0");
    return `${dd}.${mm}.${yy}, ${hh}:${mi}`;
  } catch {
    return "";
  }
}

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setErr("");

        let res = await fetch("/news.json", { cache: "no-store" });

        // fallback (agar kerak bo'lsa)
        if (!res.ok) {
          res = await fetch(
            "https://raw.githubusercontent.com/Odamov490/emc-lab-site/main/public/news.json",
            { cache: "no-store" }
          );
        }

        if (!res.ok) throw new Error("News fetch failed");
        const data = await res.json();

        if (!alive) return;

        const list = Array.isArray(data?.items) ? data.items : [];
        setItems(list);
        setUpdatedAt(data?.updated_at || "");
      } catch (e) {
        if (!alive) return;
        setErr("Yangiliklarni olishda xatolik (news.json topilmadi yoki format xato).");
        setItems([]);
        setUpdatedAt("");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, []);

  const updatedLabel = useMemo(() => fmtUpdated(updatedAt), [updatedAt]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-extrabold tracking-tight">Yangiliklar</h1>
      <p className="text-sm opacity-70 mt-2">
      
        {updatedLabel ? ` • Yangilandi: ${updatedLabel}` : ""}
      </p>

      {loading ? (
        <div className="mt-10 rounded-2xl border p-6">Yuklanmoqda...</div>
      ) : err ? (
        <div className="mt-10 rounded-2xl border p-6">
          <div className="font-semibold">Xatolik</div>
          <div className="text-sm opacity-70 mt-2">{err}</div>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-10 rounded-2xl border p-6">
          <div className="font-semibold">Hozircha yangiliklar yo‘q</div>
          <div className="text-sm opacity-70 mt-2">
            Tez orada yangiliklar shu yerda chiqadi.
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 mt-10">
          {items.map((item, idx) => (
            <NewsCard key={item?.tg_id || idx} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
