import React, { useEffect, useMemo, useState } from "react";
import NewsCard from "./NewsCard";

export default function NewsPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [updatedAt, setUpdatedAt] = useState("");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoading(true);
        setErr("");

        let res = await fetch("/news.json", { cache: "no-store" });
        if (!res.ok) {
          res = await fetch(
            "https://raw.githubusercontent.com/Odamov490/emc-lab-site/main/public/news.json",
            { cache: "no-store" }
          );
        }
        if (!res.ok) throw new Error("News fetch failed");

        const data = await res.json();
        if (!alive) return;

        const list = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
        setItems(list);
        setUpdatedAt(data?.updated_at || "");
      } catch (e) {
        if (!alive) return;
        setErr("Yangiliklarni olishda xatolik (news.json topilmadi yoki format xato).");
        setItems([]);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }

    run();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter((it) =>
      (it.title || "").toLowerCase().includes(s) ||
      (it.text || "").toLowerCase().includes(s)
    );
  }, [items, q]);

  return (
    <main className="min-h-[70vh]">
      {/* Header */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-indigo-200 blur-3xl opacity-60" />
          <div className="absolute -top-10 right-0 h-72 w-72 rounded-full bg-pink-200 blur-3xl opacity-60" />
          <div className="absolute bottom-0 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-200 blur-3xl opacity-40" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-10 pb-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Yangiliklar
              </h1>
              <p className="text-sm md:text-base opacity-70 mt-2">
                Press-relizlar va e’lonlar (Telegram → GitHub Actions → news.json)
              </p>

              {updatedAt ? (
                <div className="mt-3 inline-flex items-center gap-2 text-xs px-3 py-1 rounded-full border bg-white/60">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Oxirgi yangilanish:{" "}
                  <span className="font-medium">
                    {new Date(updatedAt).toLocaleString()}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Search */}
            <div className="w-full md:w-[360px]">
              <div className="rounded-2xl border bg-white/60 backdrop-blur p-2 shadow-sm">
                <div className="flex items-center gap-2 px-2">
                  <span className="text-xs opacity-60">Qidirish:</span>
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Masalan: UzTest, akkreditatsiya, kurs..."
                    className="w-full bg-transparent outline-none text-sm p-2"
                  />
                </div>
              </div>
              <div className="text-[11px] opacity-60 mt-2 px-2">
                Topildi: <span className="font-semibold">{filtered.length}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        {loading ? (
          <div className="mt-8 rounded-2xl border bg-white/60 backdrop-blur p-6 shadow-sm">
            Yuklanmoqda...
          </div>
        ) : err ? (
          <div className="mt-8 rounded-2xl border bg-white/60 backdrop-blur p-6 shadow-sm">
            <div className="font-semibold">Xatolik</div>
            <div className="text-sm opacity-70 mt-2">{err}</div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-8 rounded-2xl border bg-white/60 backdrop-blur p-6 shadow-sm">
            <div className="font-semibold">Hozircha yangiliklar yo‘q</div>
            <div className="text-sm opacity-70 mt-2">
              Tez orada yangiliklar shu yerda chiqadi.
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filtered.map((item, idx) => (
              <NewsCard key={item.tg_id || item.id || idx} item={item} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
