// src/components/AIChat.jsx
// Live TV PRO — Auto Open Playlists (iptv-org)
// ✅ Auto load (no user input)
// ✅ Categories filter
// ✅ Fast search
// ✅ Favorites + Recents (localStorage)
// ✅ HLS (.m3u8) via CDN (Vercel-safe)
// ✅ Virtual list (10k+ kanal lag qilmaydi)
// ✅ Cache (6 hours) to speed up
// ✅ Autoplay on channel select (no extra Play click)
//
// ❌ Country filter removed (per request)

import React, { useEffect, useMemo, useRef, useState } from "react";

/* =========================
   CONFIG
========================= */

const LS_FAV_KEY = "emclab_tv_fav_v3";
const LS_RECENT_KEY = "emclab_tv_recent_v3";
const LS_LAST_SELECTED = "emclab_tv_last_selected_v3";
const LS_CACHE_KEY = "emclab_tv_cache_channels_v3";
const LS_CACHE_TIME = "emclab_tv_cache_time_v3";

const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";

// Ochiq manbalar (iptv-org). Ba'zi streamlar ishlamasligi mumkin — normal.
const OPEN_SOURCES = [
  { key: "UZ", label: "🇺🇿 Uzbekistan", url: "https://iptv-org.github.io/iptv/countries/uz.m3u" },
  { key: "News", label: "📰 News", url: "https://iptv-org.github.io/iptv/categories/news.m3u" },
  { key: "Sports", label: "🏅 Sports", url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
  { key: "Kids", label: "🧒 Kids", url: "https://iptv-org.github.io/iptv/categories/kids.m3u" },
  { key: "Animation", label: "🎬 Animation", url: "https://iptv-org.github.io/iptv/categories/animation.m3u" },
  { key: "Music", label: "🎵 Music", url: "https://iptv-org.github.io/iptv/categories/music.m3u" },
  { key: "Movies", label: "🎞️ Movies", url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
  { key: "World", label: "🌍 World (big)", url: "https://iptv-org.github.io/iptv/index.m3u" },
];

// Demo fallback (agar internet bo‘lmasa ham panel ishlaydi)
const DEMO_CHANNELS = [
  {
    id: "demo-1",
    name: "Demo HLS Stream (Mux Test)",
    country: "Boshqa",
    category: "Demo",
    lang: "EN",
    type: "hls",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    logo: "",
  },
  {
    id: "demo-2",
    name: "NASA Live (YouTube)",
    country: "AQSh",
    category: "Ilm-Fan",
    lang: "EN",
    type: "iframe",
    url: "https://www.youtube.com/embed/21X5lGlDOfg",
    logo: "",
  },
];

/* =========================
   UTILS
========================= */

function safeGetJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function safeSetJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function norm(s = "") {
  return String(s).toLowerCase().trim();
}

function makeId(prefix = "ch") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(16)}`;
}

function guessType(url = "") {
  const u = url.toLowerCase();
  if (u.includes("youtube.com/embed") || u.includes("player.twitch.tv") || u.includes("<iframe")) return "iframe";
  if (u.endsWith(".mp4") || u.includes(".mp4?")) return "mp4";
  if (u.endsWith(".m3u8") || u.includes(".m3u8?")) return "hls";
  return "hls";
}

/* =========================
   HLS LOADER (CDN, Vercel-safe)
========================= */

function loadHlsFromCdn() {
  if (typeof window === "undefined") return Promise.reject(new Error("no window"));
  if (window.Hls) return Promise.resolve(window.Hls);
  if (window.__HLS_PROMISE__) return window.__HLS_PROMISE__;

  window.__HLS_PROMISE__ = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-hlsjs="1"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Hls));
      existing.addEventListener("error", () => reject(new Error("hls.js load error")));
      return;
    }
    const s = document.createElement("script");
    s.src = HLS_CDN;
    s.async = true;
    s.defer = true;
    s.dataset.hlsjs = "1";
    s.onload = () => resolve(window.Hls);
    s.onerror = () => reject(new Error("hls.js load error"));
    document.head.appendChild(s);
  });

  return window.__HLS_PROMISE__;
}

/* =========================
   M3U PARSER (EXTINF)
========================= */

function parseExtinfAttrs(line) {
  const attrs = {};
  const beforeComma = line.split(",")[0] || "";
  const afterComma = line.includes(",") ? line.slice(line.indexOf(",") + 1) : "";
  attrs.displayName = afterComma.trim();

  const re = /([a-zA-Z0-9_-]+)="([^"]*)"/g;
  let m;
  while ((m = re.exec(beforeComma))) {
    attrs[m[1]] = m[2];
  }
  return attrs;
}

function parseM3U(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const out = [];
  let current = null;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (!l) continue;

    if (l.startsWith("#EXTINF:")) {
      const attrs = parseExtinfAttrs(l);
      current = {
        id: makeId("m3u"),
        name: attrs["tvg-name"] || attrs.displayName || "Unknown",
        country: attrs["tvg-country"] || "Boshqa",
        category: attrs["group-title"] || "Boshqa",
        lang: attrs["tvg-language"] || "—",
        logo: attrs["tvg-logo"] || "",
        type: "hls",
        url: "",
        tvgId: attrs["tvg-id"] || "",
      };
      continue;
    }

    if (current && !l.startsWith("#")) {
      current.url = l;
      current.type = guessType(l);
      out.push(current);
      current = null;
    }
  }

  return out;
}

/* =========================
   UI SMALL COMPONENTS
========================= */

function Pill({ children }) {
  return (
    <span className="text-[11px] px-2.5 py-1 rounded-full border border-black/10 bg-white/70 text-black/70">
      {children}
    </span>
  );
}

function ActionBtn({ title, onClick, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "h-10 w-10 rounded-2xl border border-black/10",
        "bg-white/70 hover:bg-white shadow-sm",
        "inline-flex items-center justify-center transition active:scale-95",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

function SoftButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-3 h-10 rounded-2xl border border-black/10 bg-white/70 hover:bg-white shadow-sm transition"
    >
      {children}
    </button>
  );
}

/* =========================
   PLAYER
========================= */

function HLSPlayer({ src, poster, autoPlayToken }) {
  const videoRef = useRef(null);
  const [hint, setHint] = useState("");

  useEffect(() => {
    let hls = null;
    let cancelled = false;

    async function run() {
      setHint("");
      const video = videoRef.current;
      if (!video || !src) return;

      const canNative = video.canPlayType("application/vnd.apple.mpegurl");
      if (canNative) {
        video.src = src;
        try {
          video.muted = true;
          await video.play();
          video.muted = false;
        } catch {
          // autoplay blocked
        }
        return;
      }

      try {
        const Hls = await loadHlsFromCdn();
        if (cancelled) return;

        if (!Hls || !Hls.isSupported()) {
          setHint("Brauzer HLS’ni qo‘llamaydi. MP4 yoki iframe ishlating.");
          return;
        }

        hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, async () => {
          try {
            video.muted = true;
            await video.play();
            video.muted = false;
          } catch {
            // autoplay blocked
          }
        });
      } catch {
        setHint("HLS yuklanmadi (CDN blok bo‘lishi mumkin). MP4/iframe sinab ko‘ring.");
      }
    }

    run();

    return () => {
      cancelled = true;
      try {
        if (hls) hls.destroy();
      } catch {
        // ignore
      }
    };
  }, [src, autoPlayToken]);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        className="w-full rounded-[28px] border border-black/10 bg-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        controls
        playsInline
        poster={poster || undefined}
      />
      {hint ? <div className="mt-2 text-xs text-black/60">{hint}</div> : null}
    </div>
  );
}

function Player({ channel, autoPlayToken }) {
  if (!channel) {
    return (
      <div className="h-[320px] rounded-[28px] border border-black/10 bg-white/60 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-3xl mb-2">📺</div>
          <div className="font-semibold">Kanal tanlang</div>
          <div className="text-sm text-black/60 mt-1">Chap tomondan kanalni tanlang.</div>
        </div>
      </div>
    );
  }

  if (channel.type === "iframe") {
    return (
      <div className="w-full">
        <div className="aspect-video w-full overflow-hidden rounded-[28px] border border-black/10 bg-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
          <iframe
            title={channel.name}
            src={channel.url}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    );
  }

  if (channel.type === "mp4") {
    return (
      <video
        className="w-full rounded-[28px] border border-black/10 bg-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        controls
        playsInline
        src={channel.url}
        autoPlay
      />
    );
  }

  return <HLSPlayer src={channel.url} poster={channel.logo} autoPlayToken={autoPlayToken} />;
}

/* =========================
   VIRTUAL LIST
========================= */

function VirtualList({ items, rowHeight = 76, height = 520, renderRow }) {
  const [scrollTop, setScrollTop] = useState(0);

  const total = items.length;
  const totalHeight = total * rowHeight;
  const overscan = 6;

  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
  const endIndex = Math.min(total - 1, Math.floor((scrollTop + height) / rowHeight) + overscan);

  const visible = [];
  for (let i = startIndex; i <= endIndex; i++) visible.push(i);

  return (
    <div style={{ height, overflow: "auto" }} className="pr-1" onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}>
      <div style={{ height: totalHeight, position: "relative" }}>
        {visible.map((i) => (
          <div
            key={items[i]?.id || i}
            style={{ position: "absolute", top: i * rowHeight, left: 0, right: 0, height: rowHeight }}
          >
            {renderRow(items[i], i)}
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================
   DATA LOADER (AUTO)
========================= */

async function fetchText(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
  return await res.text();
}

function dedupeAndNormalize(channels) {
  const seen = new Set();
  const out = [];

  for (const c of channels) {
    const url = (c.url || "").trim();
    if (!url) continue;

    const key = url.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    out.push({
      ...c,
      id: c.id || makeId("auto"),
      name: c.name || "TV",
      country: c.country || "Boshqa",
      category: c.category || "Boshqa",
      lang: c.lang || "—",
      logo: c.logo || "",
      type: c.type || guessType(url),
      url,
    });
  }
  return out;
}

async function loadOpenPlaylists(setProgress) {
  const urls = OPEN_SOURCES.map((s) => s.url);
  const results = await Promise.allSettled(urls.map(fetchText));

  let ok = 0;
  let all = [];

  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (r.status === "fulfilled") {
      ok++;
      const parsed = parseM3U(r.value);
      all = all.concat(parsed);
    }
    setProgress?.({ ok, total: results.length });
  }

  return dedupeAndNormalize(all);
}

/* =========================
   MAIN
========================= */

export default function AIChat() {
  const [sourceName, setSourceName] = useState("Open");
  const [channels, setChannels] = useState(() => {
    const cached = safeGetJSON(LS_CACHE_KEY, null);
    const cachedAt = Number(localStorage.getItem(LS_CACHE_TIME) || 0);
    if (cached && Array.isArray(cached) && cachedAt && Date.now() - cachedAt < CACHE_TTL_MS) return cached;
    return DEMO_CHANNELS;
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({ ok: 0, total: OPEN_SOURCES.length });
  const [error, setError] = useState("");

  // filters
  const [category, setCategory] = useState("Hammasi");
  const [query, setQuery] = useState("");

  // favorites, recents
  const [favorites, setFavorites] = useState(() => new Set(safeGetJSON(LS_FAV_KEY, [])));
  const [recents, setRecents] = useState(() => safeGetJSON(LS_RECENT_KEY, []));

  // selection
  const [selectedId, setSelectedId] = useState(() => safeGetJSON(LS_LAST_SELECTED, null));
  const [autoPlayToken, setAutoPlayToken] = useState(0);

  const allChannels = useMemo(() => {
    return sourceName === "Demo" ? DEMO_CHANNELS : channels;
  }, [sourceName, channels]);

  const categories = useMemo(() => {
    const set = new Set(["Hammasi"]);
    for (const c of allChannels) set.add(c.category || "Boshqa");
    const arr = Array.from(set);
    arr.sort((a, b) => {
      if (a === "Hammasi") return -1;
      if (b === "Hammasi") return 1;
      return String(a).localeCompare(String(b));
    });
    return arr;
  }, [allChannels]);

  const filtered = useMemo(() => {
    const q = norm(query);
    let list = allChannels.slice();

    if (category !== "Hammasi") list = list.filter((c) => (c.category || "Boshqa") === category);

    if (q) {
      list = list.filter((c) => {
        const hay = norm(`${c.name} ${c.category} ${c.lang}`);
        return hay.includes(q);
      });
    }

    // favorite first
    list.sort((a, b) => {
      const af = favorites.has(a.id) ? 1 : 0;
      const bf = favorites.has(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      return (a.name || "").localeCompare(b.name || "");
    });

    return list;
  }, [allChannels, category, query, favorites]);

  const selectedChannel = useMemo(() => {
    const found = allChannels.find((c) => c.id === selectedId);
    return found || null;
  }, [allChannels, selectedId]);

  // persist
  useEffect(() => safeSetJSON(LS_FAV_KEY, Array.from(favorites)), [favorites]);
  useEffect(() => safeSetJSON(LS_RECENT_KEY, recents), [recents]);
  useEffect(() => safeSetJSON(LS_LAST_SELECTED, selectedId), [selectedId]);

  // default select
  useEffect(() => {
    if (!selectedId && filtered.length) {
      setSelectedId(filtered[0].id);
      setAutoPlayToken((t) => t + 1);
    }
  }, [filtered, selectedId]);

  // recents
  const recentChannels = useMemo(() => {
    const map = new Map(allChannels.map((c) => [c.id, c]));
    return recents.map((id) => map.get(id)).filter(Boolean);
  }, [allChannels, recents]);

  const selectChannel = (ch) => {
    setSelectedId(ch.id);
    setAutoPlayToken((t) => t + 1);
    setRecents((prev) => [ch.id, ...prev.filter((x) => x !== ch.id)].slice(0, 30));
  };

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // AUTO LOAD open sources
  const refreshOpen = async () => {
    setLoading(true);
    setError("");
    setProgress({ ok: 0, total: OPEN_SOURCES.length });

    try {
      const loaded = await loadOpenPlaylists(setProgress);

      setChannels(loaded.length ? loaded : DEMO_CHANNELS);

      try {
        localStorage.setItem(LS_CACHE_TIME, String(Date.now()));
        safeSetJSON(LS_CACHE_KEY, loaded);
      } catch {
        // ignore cache issues
      }

      if (loaded.length) {
        setSelectedId((prev) => (loaded.some((x) => x.id === prev) ? prev : loaded[0].id));
        setAutoPlayToken((t) => t + 1);
      }
    } catch {
      setError("Ochiq playlist yuklanmadi (internet/CORS bo‘lishi mumkin). Demo yoqildi.");
      setChannels(DEMO_CHANNELS);
      setSourceName("Demo");
    } finally {
      setLoading(false);
    }
  };

  // initial auto-load (if cache expired)
  useEffect(() => {
    if (sourceName !== "Open") return;

    const cached = safeGetJSON(LS_CACHE_KEY, null);
    const cachedAt = Number(localStorage.getItem(LS_CACHE_TIME) || 0);
    const fresh = cached && Array.isArray(cached) && cachedAt && Date.now() - cachedAt < CACHE_TTL_MS;

    if (!fresh) refreshOpen();
  }, [sourceName]);

  // UI counts
  const favCount = favorites.size;

  return (
    <div className="h-full w-full p-4 md:p-6">
      {/* Premium background */}
      <div className="max-w-7xl mx-auto h-full relative">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-20 -left-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
          <div className="absolute top-8 right-0 h-96 w-96 rounded-full bg-rose-500/15 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-sky-500/15 blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f6f7fb] via-[#f7f8fc] to-[#eef1f8]" />
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="text-2xl font-bold tracking-tight">
              Live TV <span className="text-black/50 font-semibold">(PRO)</span>
            </div>
            <div className="text-sm text-black/60">
              Ochiq manbalar avtomatik yuklanadi • tez qidiruv • favorit • oxirgi ko‘rilganlar
            </div>

            {loading ? (
              <div className="text-xs text-black/60 mt-1">
                Yuklanmoqda: {progress.ok}/{progress.total} manba…
              </div>
            ) : null}
            {error ? <div className="text-xs text-red-600 mt-1">{error}</div> : null}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Pill>Source: {sourceName}</Pill>
              <Pill>Fav: {favCount}</Pill>
              <Pill>Virtual list</Pill>
            </div>

            <ActionBtn title="Yangilash" onClick={refreshOpen}>
              ↻
            </ActionBtn>

            <ActionBtn title="Open/Demo almashtirish" onClick={() => setSourceName((p) => (p === "Open" ? "Demo" : "Open"))}>
              🔁
            </ActionBtn>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-[28px] bg-white/70 backdrop-blur border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <div className="text-xs text-black/60 mb-1">Qidiruv</div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kanal nomi yoki turkum bo‘yicha..."
                className="w-full h-11 px-4 rounded-2xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="md:w-72">
              <div className="text-xs text-black/60 mb-1">Turkum</div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-4 rounded-2xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:w-44 flex items-end">
              <SoftButton
                onClick={() => {
                  setCategory("Hammasi");
                  setQuery("");
                }}
              >
                Reset
              </SoftButton>
            </div>
          </div>

          {/* Quick: Recents */}
          {recentChannels.length ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <div className="text-xs text-black/60 w-full">Oxirgi ko‘rilganlar:</div>
              {recentChannels.slice(0, 10).map((ch) => (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => selectChannel(ch)}
                  className="px-3 py-2 rounded-2xl border border-black/10 bg-white/70 hover:bg-white shadow-sm text-sm transition"
                >
                  {ch.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100%-180px)]">
          {/* Channel list */}
          <div className="lg:col-span-2 rounded-[28px] bg-white/70 backdrop-blur border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-3 md:p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Kanallar</div>
              <div className="text-xs text-black/60">{filtered.length} ta • Fav: {favCount} ta</div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-sm text-black/60 p-4 rounded-2xl bg-black/5 border border-black/10">
                Hech narsa topilmadi. Qidiruv yoki turkumni o‘zgartiring.
              </div>
            ) : (
              <VirtualList
                items={filtered}
                rowHeight={76}
                height={560}
                renderRow={(ch) => {
                  const isFav = favorites.has(ch.id);
                  const active = selectedId === ch.id;

                  return (
                    <div
                      className={[
                        "group rounded-[22px] border cursor-pointer transition mx-0",
                        "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
                        active ? "border-black/20 bg-white" : "border-black/10 bg-white/70 hover:bg-white",
                      ].join(" ")}
                      onClick={() => selectChannel(ch)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") selectChannel(ch);
                      }}
                    >
                      <div className="p-3 flex gap-3 items-center">
                        <div className="h-10 w-10 rounded-2xl bg-black/5 border border-black/10 flex items-center justify-center overflow-hidden">
                          {ch.logo ? (
                            <img src={ch.logo} alt={ch.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-lg">📡</span>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="font-semibold truncate">{ch.name}</div>
                          <div className="text-xs text-black/60 truncate">
                            {(ch.category || "Boshqa")} • {(ch.lang || "—")}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFav(ch.id);
                          }}
                          className={[
                            "h-9 w-9 rounded-2xl border border-black/10 bg-white/70 hover:bg-white shadow-sm",
                            "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition",
                          ].join(" ")}
                          title={isFav ? "Favoritdan olib tashlash" : "Favoritga qo‘shish"}
                        >
                          {isFav ? "★" : "☆"}
                        </button>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </div>

          {/* Player */}
          <div className="lg:col-span-3 rounded-[28px] bg-white/70 backdrop-blur border border-black/10 shadow-[0_20px_60px_rgba(0,0,0,0.10)] p-3 md:p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {selectedChannel ? selectedChannel.name : "Kanal tanlanmagan"}
                </div>
                <div className="text-xs text-black/60">
                  {selectedChannel ? `${selectedChannel.category || "Boshqa"} • ${selectedChannel.lang || "—"}` : "—"}
                </div>
              </div>

              {selectedChannel ? (
                <div className="flex items-center gap-2">
                  <SoftButton onClick={() => toggleFav(selectedChannel.id)}>
                    {favorites.has(selectedChannel.id) ? "★ Favorit" : "☆ Favorit"}
                  </SoftButton>
                  <SoftButton onClick={() => window?.navigator?.clipboard?.writeText(selectedChannel.url || "")}>
                    🔗 Copy
                  </SoftButton>
                </div>
              ) : null}
            </div>

            <Player channel={selectedChannel} autoPlayToken={autoPlayToken} />

            <div className="mt-3 text-xs text-black/60">
              <span className="font-semibold">Eslatma:</span> HLS (.m3u8) ishlashi uchun hls.js CDN’dan yuklanadi.
              Ba’zi streamlar CORS/geo-block sabab ishlamasligi mumkin.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
