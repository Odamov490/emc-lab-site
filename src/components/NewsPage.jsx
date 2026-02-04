// src/components/NewsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
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

        // 1) Vercel/static: public/news.json
        let res = await fetch("/news.json", { cache: "no-store" });

        // 2) Fallback: GitHub raw (agar kerak bo‘lib qolsa)
        if (!res.ok) {
          res = await fetch(
            "https://raw.githubusercontent.com/Odamov490/emc-lab-site/main/public/news.json",
            { cache: "no-store" }
          );
        }

        if (!res.ok) throw new Error("News fetch failed");
        const data = await res.json();

        if (!alive) return;

        // Bizning format: { ok:true, items:[...] }
        const list = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
        setItems(list);
      } catch (e) {
        if (!alive) return;
        setErr("Yangiliklarni olishda xatolik. (news.json topilmadi yoki format xato)");
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

  const updatedAt = useMemo(() => {
    // Agar JSON ichida updated_at bo‘lsa ko‘rsatamiz (ixtiyoriy)
    return "";
  }, []);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight">Yangiliklar</h1>
        <p className="text-sm text-black/60">
          Press-relizlar va e’lonlar (Telegram → GitHub Actions → news.json)
        </p>
        {updatedAt ? (
          <div className="text-xs text-black/45">Oxirgi yangilanish: {updatedAt}</div>
        ) : null}
      </div>

      {/* Content */}
      {loading ? (
        <div className="mt-8 rounded-2xl border bg-white p-6">
          <div className="animate-pulse space-y-3">
            <div className="h-5 w-40 rounded bg-black/10" />
            <div className="h-4 w-2/3 rounded bg-black/10" />
            <div className="h-4 w-1/2 rounded bg-black/10" />
          </div>
        </div>
      ) : err ? (
        <div className="mt-8 rounded-2xl border bg-white p-6">
          <div className="font-semibold text-red-600">Xatolik</div>
          <div className="text-sm text-black/60 mt-2">{err}</div>
          <div className="text-xs text-black/45 mt-3">
            Maslahat: GitHub Actions → “Update Telegram News” ishga tushganini va public/news.json yangilangani
            tekshiring.
          </div>
        </div>
      ) : items.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-white p-6">
          <div className="font-semibold">Hozircha yangiliklar yo‘q</div>
          <div className="text-sm text-black/60 mt-2">Tez orada yangiliklar shu yerda chiqadi.</div>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, idx) => (
            <NewsCard key={item.tg_id || item.id || idx} item={item} />
          ))}
        </div>
      )}
    </main>
  );
}
