import React, { useEffect, useMemo, useState } from "react";
import NewsCard from "./NewsCard";

function normalize(data) {
  // Sizda hozir 2 xil format bo‘lishi mumkin:
  // 1) Array: [{...}]
  // 2) Object: { ok:true, updated_at:"...", items:[...] }
  if (Array.isArray(data)) return { ok: true, updated_at: null, items: data };
  if (data && Array.isArray(data.items))
    return { ok: !!data.ok, updated_at: data.updated_at || null, items: data.items };
  return { ok: false, updated_at: null, items: [] };
}

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setErr("");

        // 1) Vercel / statik public fayl
        let res = await fetch("/news.json", { cache: "no-store" });

        // 2) fallback: GitHub raw (public/news.json)
        if (!res.ok) {
          res = await fetch(
            "https://raw.githubusercontent.com/Odamov490/emc-lab-site/main/public/news.json",
            { cache: "no-store" }
          );
        }

        if (!res.ok) throw new Error("News fetch failed");

        const data = await res.json();
        const norm = normalize(data);

        if (!alive) return;

        if (!norm.ok) {
          setErr("Yangiliklarni olishda xatolik.");
          setItems([]);
          setUpdatedAt(null);
          return;
        }

        setUpdatedAt(norm.updated_at || null);

        const arr = Array.isArray(norm.items) ? norm.items : [];
        // eng yangi tepada chiqsin
        arr.sort((a, b) => (b.tg_id || 0) - (a.tg_id || 0));

        setItems(arr);
      } catch (e) {
        if (!alive) return;
        setErr("Serverga ulanishda xatolik (news.json topilmadi yoki format xato).");
        setItems([]);
        setUpdatedAt(null);
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

  const subtitle = useMemo(() => {
    if (updatedAt) {
      try {
        const dt = new Date(updatedAt);
        return `Press-relizlar va e’lonlar (Telegram → GitHub Actions → news.json) • Yangilandi: ${dt.toLocaleString()}`;
      } catch {
        return "Press-relizlar va e’lonlar (Telegram → GitHub Actions → news.json)";
      }
    }
    return "Press-relizlar va e’lonlar (Telegram → GitHub Actions → news.json)";
  }, [updatedAt]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold tracking-tight">Yangiliklar</h1>
      <p className="text-sm opacity-70 mt-2">{subtitle}</p>

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
        <div className="grid md:grid-cols-3 gap-8 mt-8">
          {items.map((item, idx) => (
            <NewsCard key={item.tg_id || item.id || idx} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
