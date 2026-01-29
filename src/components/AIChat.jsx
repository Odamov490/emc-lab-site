// src/components/AIChat.jsx
// Endi bu bo‘lim TV kanallar ko‘rsatuvchi “Live TV” paneli bo‘ldi.
// ✅ Kategoriyalar bo‘yicha filter
// ✅ Davlat bo‘yicha filter
// ✅ Qidiruv
// ✅ Favorit (localStorage)
// ✅ Kanal qo‘shish (custom) — m3u8 yoki iframe URL
//
// Eslatma:
// - Chrome/Edge’da .m3u8 oqishi uchun HLS kerak bo‘lishi mumkin.
//   Agar loyihangizda `hls.js` bo‘lsa, avtomatik ishlaydi.
//   Aks holda video o‘ynamasa, iframe URL yoki MP4 oqimdan foydalaning.

import React, { useEffect, useMemo, useRef, useState } from "react";

const LS_FAV_KEY = "emclab_tv_favorites_v1";
const LS_CUSTOM_KEY = "emclab_tv_custom_channels_v1";

const CATEGORIES = [
  "Hammasi",
  "Yangiliklar",
  "Sport",
  "Ko‘ngilochar",
  "Bolalar",
  "Musiqa",
  "Film",
  "Diniy",
  "Ilm-Fan",
  "Mahalliy",
];

const COUNTRIES = [
  "Hammasi",
  "O‘zbekiston",
  "Rossiya",
  "Turkiya",
  "AQSh",
  "Birlashgan Qirollik",
  "Qozog‘iston",
  "Boshqa",
];

// Demo kanallar (o'zingizning real stream linklaringiz bilan almashtiring)
const BUILTIN_CHANNELS = [
  {
    id: "uz-1",
    name: "UZ News (demo)",
    country: "O‘zbekiston",
    category: "Yangiliklar",
    lang: "UZ",
    // m3u8 demo o‘rniga real link qo‘ying
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "hls", // "hls" | "mp4" | "iframe"
    logo: "",
    note: "Demo stream (Mux test).",
  },
  {
    id: "uz-2",
    name: "UZ Music (demo)",
    country: "O‘zbekiston",
    category: "Musiqa",
    lang: "UZ",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "hls",
    logo: "",
  },
  {
    id: "ru-1",
    name: "RU Sport (demo)",
    country: "Rossiya",
    category: "Sport",
    lang: "RU",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "hls",
    logo: "",
  },
  {
    id: "tr-1",
    name: "TR Entertainment (demo)",
    country: "Turkiya",
    category: "Ko‘ngilochar",
    lang: "TR",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "hls",
    logo: "",
  },
  {
    id: "us-1",
    name: "US Kids (demo)",
    country: "AQSh",
    category: "Bolalar",
    lang: "EN",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
    type: "hls",
    logo: "",
  },
  {
    id: "iframe-1",
    name: "YouTube Live (iframe demo)",
    country: "Boshqa",
    category: "Yangiliklar",
    lang: "EN",
    // Bu yerga real embed URL qo'ying (YouTube embed, Twitch embed, va h.k.)
    url: "https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig",
    type: "iframe",
    logo: "",
    note: "Iframe ishlashi uchun embed URL kerak bo‘ladi.",
  },
];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function uid() {
  return "ch_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
}

function Badge({ children }) {
  return (
    <span className="text-[11px] px-2 py-1 rounded-full bg-black/5 border border-black/10">
      {children}
    </span>
  );
}

function IconButton({ title, onClick, children }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="inline-flex items-center justify-center h-9 w-9 rounded-xl border border-black/10 bg-white/70 hover:bg-white shadow-sm"
      type="button"
    >
      {children}
    </button>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
        role="button"
        tabIndex={-1}
      />
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-xl border border-black/10 overflow-hidden">
        <div className="p-4 border-b border-black/10 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-black/10 hover:bg-black/5"
            type="button"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

function HLSPlayer({ src, poster }) {
  const videoRef = useRef(null);
  const [hint, setHint] = useState("");

  useEffect(() => {
    let hlsInstance = null;
    let cancelled = false;

    async function setup() {
      setHint("");
      const video = videoRef.current;
      if (!video || !src) return;

      // Safari ko‘pincha HLS’ni native o‘ynaydi
      const canPlayNative = video.canPlayType("application/vnd.apple.mpegurl");
      if (canPlayNative) {
        video.src = src;
        return;
      }

      // Agar hls.js bo‘lsa, ishlatamiz (dynamic import)
  try {
  const mod = await import(/* @vite-ignore */ "hls.js");
  if (cancelled) return;

  const Hls = mod.default;
  if (!Hls || !Hls.isSupported()) {
    setHint("Brauzer HLS’ni qo‘llamaydi. MP4 yoki iframe ishlating.");
    return;
  }

  hlsInstance = new Hls({
    enableWorker: true,
    lowLatencyMode: true,
  });

  hlsInstance.loadSource(src);
  hlsInstance.attachMedia(video);
} catch (e) {
  setHint(
    "HLS oqimni yuklab bo‘lmadi. npm i hls.js qilinganini tekshiring."
  );
}

    }

    setup();

    return () => {
      cancelled = true;
      try {
        if (hlsInstance) hlsInstance.destroy();
      } catch {
        // ignore
      }
    };
  }, [src]);

  return (
    <div className="w-full">
      <video
        ref={videoRef}
        className="w-full rounded-2xl border border-black/10 bg-black/5"
        controls
        playsInline
        poster={poster || undefined}
      />
      {hint ? <div className="mt-2 text-xs text-gray-600">{hint}</div> : null}
    </div>
  );
}

function Player({ channel }) {
  if (!channel) {
    return (
      <div className="h-[320px] rounded-2xl border border-black/10 bg-white/60 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="text-3xl mb-2">📺</div>
          <div className="font-semibold">Kanal tanlang</div>
          <div className="text-sm text-gray-600 mt-1">
            Chap tomondan kanalni bosib live ko‘rishni boshlang.
          </div>
        </div>
      </div>
    );
  }

  if (channel.type === "iframe") {
    return (
      <div className="w-full">
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-black/10 bg-black/5">
          <iframe
            title={channel.name}
            src={channel.url}
            className="w-full h-full"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        {channel.note ? <div className="mt-2 text-xs text-gray-600">{channel.note}</div> : null}
      </div>
    );
  }

  if (channel.type === "mp4") {
    return (
      <div className="w-full">
        <video
          className="w-full rounded-2xl border border-black/10 bg-black/5"
          controls
          playsInline
          src={channel.url}
        />
      </div>
    );
  }

  // Default: HLS
  return <HLSPlayer src={channel.url} poster={channel.logo} />;
}

function ChannelCard({ ch, active, isFav, onSelect, onToggleFav }) {
  return (
    <div
      className={[
        "group rounded-2xl border shadow-sm cursor-pointer transition",
        active ? "border-black/30 bg-white" : "border-black/10 bg-white/70 hover:bg-white",
      ].join(" ")}
      onClick={() => onSelect(ch)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onSelect(ch);
      }}
    >
      <div className="p-3 flex gap-3 items-center">
        <div className="h-10 w-10 rounded-xl bg-black/5 border border-black/10 flex items-center justify-center overflow-hidden">
          {ch.logo ? (
            <img src={ch.logo} alt={ch.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-lg">📡</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="font-semibold truncate">{ch.name}</div>
          <div className="text-xs text-gray-600 truncate">
            {ch.country} • {ch.category} • {ch.lang || "—"}
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav(ch.id);
          }}
          className={[
            "h-9 w-9 rounded-xl border border-black/10 bg-white/70 hover:bg-white shadow-sm",
            "opacity-100 md:opacity-0 md:group-hover:opacity-100 transition",
          ].join(" ")}
          title={isFav ? "Favoritdan olib tashlash" : "Favoritga qo‘shish"}
        >
          {isFav ? "★" : "☆"}
        </button>
      </div>
    </div>
  );
}

export default function AIChat() {
  const [category, setCategory] = useState("Hammasi");
  const [country, setCountry] = useState("Hammasi");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [favorites, setFavorites] = useState(() => new Set(loadJSON(LS_FAV_KEY, [])));
  const [customChannels, setCustomChannels] = useState(() => loadJSON(LS_CUSTOM_KEY, []));

  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    country: "O‘zbekiston",
    category: "Yangiliklar",
    lang: "UZ",
    type: "hls",
    url: "",
    logo: "",
  });

  const allChannels = useMemo(() => {
    // Custom kanallarga unique id berilgan bo‘lishi shart
    return [...BUILTIN_CHANNELS, ...customChannels];
  }, [customChannels]);

  const selectedChannel = useMemo(() => {
    const found = allChannels.find((c) => c.id === selectedId);
    return found || null;
  }, [allChannels, selectedId]);

  const filtered = useMemo(() => {
    const q = normalize(query);

    let list = allChannels.slice();

    if (category !== "Hammasi") list = list.filter((c) => c.category === category);
    if (country !== "Hammasi") list = list.filter((c) => c.country === country);

    if (q) {
      list = list.filter((c) => {
        const hay = normalize(`${c.name} ${c.country} ${c.category} ${c.lang}`);
        return hay.includes(q);
      });
    }

    // Favoritlar tepaga
    list.sort((a, b) => {
      const af = favorites.has(a.id) ? 1 : 0;
      const bf = favorites.has(b.id) ? 1 : 0;
      if (af !== bf) return bf - af;
      return a.name.localeCompare(b.name);
    });

    return list;
  }, [allChannels, category, country, query, favorites]);

  const counts = useMemo(() => {
    const byCat = {};
    for (const cat of CATEGORIES) byCat[cat] = 0;
    for (const c of allChannels) {
      byCat["Hammasi"] = (byCat["Hammasi"] || 0) + 1;
      byCat[c.category] = (byCat[c.category] || 0) + 1;
    }
    return byCat;
  }, [allChannels]);

  useEffect(() => {
    saveJSON(LS_FAV_KEY, Array.from(favorites));
  }, [favorites]);

  useEffect(() => {
    saveJSON(LS_CUSTOM_KEY, customChannels);
  }, [customChannels]);

  useEffect(() => {
    // Default tanlash: birinchi kanal
    if (!selectedId && filtered.length) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const addChannel = () => {
    const name = addForm.name.trim();
    const url = addForm.url.trim();
    if (!name || !url) return;

    const newCh = {
      id: uid(),
      name,
      country: addForm.country,
      category: addForm.category,
      lang: addForm.lang.trim() || "—",
      type: addForm.type,
      url,
      logo: addForm.logo.trim(),
      note: "Custom kanal",
    };

    setCustomChannels((prev) => [newCh, ...prev]);
    setAddOpen(false);
    setAddForm({
      name: "",
      country: "O‘zbekiston",
      category: "Yangiliklar",
      lang: "UZ",
      type: "hls",
      url: "",
      logo: "",
    });
    setSelectedId(newCh.id);
  };

  const removeCustom = (id) => {
    setCustomChannels((prev) => prev.filter((c) => c.id !== id));
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="h-full w-full p-4 md:p-6">
      <div className="max-w-7xl mx-auto h-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="text-2xl font-bold">📺 Live TV</div>
            <div className="text-sm text-gray-600">
              Kanallarni turkum va davlat bo‘yicha saralab tomosha qiling.
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2">
              <Badge>Emclab TV</Badge>
              <Badge>Categories</Badge>
              <Badge>Countries</Badge>
            </div>

            <IconButton title="Kanal qo‘shish" onClick={() => setAddOpen(true)}>
              ➕
            </IconButton>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow-sm p-3 md:p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-3 md:items-center">
            <div className="flex-1">
              <div className="text-xs text-gray-600 mb-1">Qidiruv</div>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Kanal nomi, davlat, turkum..."
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10"
              />
            </div>

            <div className="md:w-64">
              <div className="text-xs text-gray-600 mb-1">Davlat</div>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:w-64">
              <div className="text-xs text-gray-600 mb-1">Turkum</div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c} ({counts[c] || 0})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick category chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {CATEGORIES.slice(0, 7).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={[
                  "px-3 py-2 rounded-xl border text-sm shadow-sm",
                  category === c
                    ? "border-black/30 bg-white"
                    : "border-black/10 bg-white/60 hover:bg-white",
                ].join(" ")}
              >
                {c} <span className="text-xs text-gray-500">({counts[c] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 h-[calc(100%-180px)]">
          {/* Channel list */}
          <div className="lg:col-span-2 rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow-sm p-3 md:p-4 overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Kanallar</div>
              <div className="text-xs text-gray-600">
                {filtered.length} ta • Favorit: {favorites.size} ta
              </div>
            </div>

            <div className="space-y-2 overflow-auto pr-1" style={{ maxHeight: "62vh" }}>
              {filtered.length === 0 ? (
                <div className="text-sm text-gray-600 p-4 rounded-xl bg-black/5 border border-black/10">
                  Hech narsa topilmadi. Filtrlarni o‘zgartiring yoki yangi kanal qo‘shing.
                </div>
              ) : (
                filtered.map((ch) => {
                  const isFav = favorites.has(ch.id);
                  const isActive = selectedId === ch.id;
                  const isCustom = customChannels.some((c) => c.id === ch.id);

                  return (
                    <div key={ch.id} className="relative">
                      <ChannelCard
                        ch={ch}
                        active={isActive}
                        isFav={isFav}
                        onSelect={(c) => setSelectedId(c.id)}
                        onToggleFav={toggleFav}
                      />
                      {isCustom ? (
                        <button
                          type="button"
                          onClick={() => removeCustom(ch.id)}
                          className="absolute -top-2 -right-2 h-7 w-7 rounded-full bg-white border border-black/10 shadow flex items-center justify-center text-xs hover:bg-black/5"
                          title="Custom kanalni o‘chirish"
                        >
                          🗑️
                        </button>
                      ) : null}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Player */}
          <div className="lg:col-span-3 rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow-sm p-3 md:p-4">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="font-semibold truncate">
                  {selectedChannel ? selectedChannel.name : "Kanal tanlanmagan"}
                </div>
                <div className="text-xs text-gray-600">
                  {selectedChannel
                    ? `${selectedChannel.country} • ${selectedChannel.category} • ${selectedChannel.lang || "—"}`
                    : "—"}
                </div>
              </div>

              {selectedChannel ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleFav(selectedChannel.id)}
                    className="px-3 h-9 rounded-xl border border-black/10 bg-white/70 hover:bg-white shadow-sm"
                    title="Favorit"
                  >
                    {favorites.has(selectedChannel.id) ? "★ Favorit" : "☆ Favorit"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(selectedChannel.url)}
                    className="px-3 h-9 rounded-xl border border-black/10 bg-white/70 hover:bg-white shadow-sm"
                    title="Linkni nusxalash"
                  >
                    🔗 Copy
                  </button>
                </div>
              ) : null}
            </div>

            <Player channel={selectedChannel} />

            <div className="mt-3 text-xs text-gray-600">
              <span className="font-semibold">Maslahat:</span> Agar .m3u8 o‘ynamasa,{" "}
              <span className="font-mono">npm i hls.js</span> o‘rnating yoki iframe/MP4 stream link
              qo‘ying.
            </div>
          </div>
        </div>

        {/* Add channel modal */}
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="➕ Yangi kanal qo‘shish">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <div className="text-xs text-gray-600 mb-1">Kanal nomi</div>
              <input
                value={addForm.name}
                onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-black/10"
                placeholder="Masalan: UzNews Live"
              />
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Davlat</div>
              <select
                value={addForm.country}
                onChange={(e) => setAddForm((p) => ({ ...p, country: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white"
              >
                {COUNTRIES.filter((c) => c !== "Hammasi").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Turkum</div>
              <select
                value={addForm.category}
                onChange={(e) => setAddForm((p) => ({ ...p, category: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white"
              >
                {CATEGORIES.filter((c) => c !== "Hammasi").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Til</div>
              <input
                value={addForm.lang}
                onChange={(e) => setAddForm((p) => ({ ...p, lang: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white"
                placeholder="UZ / RU / EN"
              />
            </div>

            <div>
              <div className="text-xs text-gray-600 mb-1">Player turi</div>
              <select
                value={addForm.type}
                onChange={(e) => setAddForm((p) => ({ ...p, type: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white"
              >
                <option value="hls">HLS (.m3u8)</option>
                <option value="mp4">MP4</option>
                <option value="iframe">Iframe (YouTube/Twitch/Player)</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-gray-600 mb-1">
                URL (m3u8 / mp4 / embed link)
              </div>
              <input
                value={addForm.url}
                onChange={(e) => setAddForm((p) => ({ ...p, url: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white"
                placeholder="https://... (m3u8 yoki mp4 yoki iframe embed)"
              />
              <div className="text-[11px] text-gray-500 mt-1">
                Iframe uchun odatda “embed” URL kerak bo‘ladi.
              </div>
            </div>

            <div className="md:col-span-2">
              <div className="text-xs text-gray-600 mb-1">Logo URL (ixtiyoriy)</div>
              <input
                value={addForm.logo}
                onChange={(e) => setAddForm((p) => ({ ...p, logo: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-black/10 bg-white"
                placeholder="https://.../logo.png"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setAddOpen(false)}
              className="px-4 h-10 rounded-xl border border-black/10 bg-white/70 hover:bg-white shadow-sm"
            >
              Bekor
            </button>
            <button
              type="button"
              onClick={addChannel}
              className="px-4 h-10 rounded-xl border border-black/10 bg-black text-white hover:bg-black/90 shadow-sm"
            >
              Qo‘shish
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}
