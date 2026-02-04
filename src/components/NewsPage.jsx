// src/components/NewsPage.jsx
import React, { useEffect, useState } from "react";
import NewsCard from "./NewsCard";

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setErr("");

        // Keyin biz bu API'ni yozamiz: /api/news (Telegram scraping)
        const res = await fetch("/api/news");
        const data = await res.json();

        if (!alive) return;

        if (!data?.ok) {
          setErr(data?.error || "Yangiliklarni olishda xatolik");
          setItems([]);
        } else {
          setItems(Array.isArray(data.items) ? data.items : []);
        }
      } catch (e) {
        if (!alive) return;
        setErr("Serverga ulanishda xatolik");
        setItems([]);
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

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold">Yangiliklar</h1>
      <p className="text-sm opacity-70 mt-2">
        Press-relizlar va e’lonlar (Telegram’dan avtomatik)
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
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          {items.map((item) => (
            <NewsCard key={item.tg_id || item.id} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
