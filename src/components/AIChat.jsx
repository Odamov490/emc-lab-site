// src/components/AIChat.jsx

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
        const mod = await import("hls.js");
        if (cancelled) return;
        const Hls = mod.default;
        if (!Hls?.isSupported()) {
          setHint("Brauzer HLS’ni qo‘llamayapti. Iltimos MP4 yoki iframe link ishlating.");
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
          "HLS oqim (.m3u8) o‘ynamasa, loyihaga `hls.js` o‘rnating yoki iframe/MP4 link ishlating."
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
            Pastdagi ro‘yxatdan kanalni bosib live ko‘rishni boshlang.
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
      <video
        className="w-full rounded-2xl border border-black/10 bg-black/5"
        controls
        playsInline
        src={channel.url}
      />
    );
  }

  // default: HLS
  return <HLSPlayer src={channel.url} poster={channel.logo} />;
}

export default function AIChat() {
  const [category, setCategory] = useState("Hammasi");
  const [country, setCountry] = useState("Hammasi");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const [favorites, setFavorites] = useState(() => new Set(loadJSON(LS_FAV_KEY, [])));
  const [customChannels, setCustomChannels] = useState(() => loadJSON(LS_CUSTOM_KEY, []));

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: "",
    country: "O‘zbekiston",
    category: "Yangiliklar",
    lang: "UZ",
    type: "hls",
    url: "",
    logo: "",
  });

  const allChannels = useMemo(() => [...BUILTIN_CHANNELS, ...customChannels], [customChannels]);

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

  const selectedChannel = useMemo(
    () => allChannels.find((c) => c.id === selectedId) || null,
    [allChannels, selectedId]
  );

  useEffect(() => saveJSON(LS_FAV_KEY, Array.from(favorites)), [favorites]);
  useEffect(() => saveJSON(LS_CUSTOM_KEY, customChannels), [customChannels]);

  useEffect(() => {
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
    const name = form.name.trim();
    const url = form.url.trim();
    if (!name || !url) return;

    const newCh = {
      id: uid(),
      name,
      country: form.country,
      category: form.category,
      lang: form.lang.trim() || "—",
      type: form.type,
      url,
      logo: form.logo.trim(),
      note: "Custom kanal",
    };

    setCustomChannels((p) => [newCh, ...p]);
    setSelectedId(newCh.id);
    setShowAdd(false);
    setForm({
      name: "",
      country: "O‘zbekiston",
      category: "Yangiliklar",
      lang: "UZ",
      type: "hls",
      url: "",
      logo: "",
    });
  };

  // ❗Siz so‘raganidek: aynan “shu format” — markazda card, ichida TV UI
  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <div>
            <div className="text-2xl font-bold">📺 Live TV</div>
            <div className="text-sm text-gray-600">
              Kanallarni davlat va turkum bo‘yicha saralab tomosha qiling.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="h-10 px-4 rounded-xl border border-black/10 bg-white/80 hover:bg-white shadow-sm"
          >
            ➕ Kanal qo‘shish
          </button>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Qidiruv: kanal, davlat, turkum..."
            className="h-10 px-3 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10 md:col-span-2"
          />

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="h-10 px-3 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="h-10 px-3 rounded-xl border border-black/10 bg-white/80 focus:outline-none focus:ring-2 focus:ring-black/10"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Add form (simple, inline) */}
        {showAdd ? (
          <div className="mb-4 rounded-2xl border border-black/10 bg-white/60 p-4">
            <div className="font-semibold mb-3">➕ Yangi kanal qo‘shish</div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-black/10 bg-white"
                placeholder="Kanal nomi (masalan: UzNews Live)"
              />

              <input
                value={form.lang}
                onChange={(e) => setForm((p) => ({ ...p, lang: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-black/10 bg-white"
                placeholder="Til (UZ/RU/EN)"
              />

              <select
                value={form.country}
                onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-black/10 bg-white"
              >
                {COUNTRIES.filter((c) => c !== "Hammasi").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-black/10 bg-white"
              >
                {CATEGORIES.filter((c) => c !== "Hammasi").map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-black/10 bg-white"
              >
                <option value="hls">HLS (.m3u8)</option>
                <option value="mp4">MP4</option>
                <option value="iframe">Iframe (YouTube/Twitch embed)</option>
              </select>

              <input
                value={form.logo}
                onChange={(e) => setForm((p) => ({ ...p, logo: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-black/10 bg-white"
                placeholder="Logo URL (ixtiyoriy)"
              />

              <input
                value={form.url}
                onChange={(e) => setForm((p) => ({ ...p, url: e.target.value }))}
                className="h-10 px-3 rounded-xl border border-black/10 bg-white md:col-span-2"
                placeholder="Stream URL: m3u8 / mp4 / iframe embed"
              />
            </div>

            <div className="mt-3 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAdd(false)}
                className="h-10 px-4 rounded-xl border border-black/10 bg-white/80 hover:bg-white"
              >
                Bekor
              </button>
              <button
                type="button"
                onClick={addChannel}
                className="h-10 px-4 rounded-xl border border-black/10 bg-black text-white hover:bg-black/90"
              >
                Qo‘shish
              </button>
            </div>

            <div className="mt-2 text-xs text-gray-600">
              .m3u8 o‘ynamasa: <span className="font-mono">npm i hls.js</span> o‘rnating yoki iframe/MP4
              ishlating.
            </div>
          </div>
        ) : null}

        {/* Main */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Player */}
          <div className="lg:col-span-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="min-w-0">
                <div className="text-lg font-semibold truncate">
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
                    className="h-9 px-3 rounded-xl border border-black/10 bg-white/80 hover:bg-white shadow-sm"
                    title="Favorit"
                  >
                    {favorites.has(selectedChannel.id) ? "★" : "☆"}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText(selectedChannel.url)}
                    className="h-9 px-3 rounded-xl border border-black/10 bg-white/80 hover:bg-white shadow-sm"
                    title="Linkni nusxalash"
                  >
                    🔗 Copy
                  </button>
                </div>
              ) : null}
            </div>

            <Player channel={selectedChannel} />
          </div>

          {/* List */}
          <div className="lg:col-span-2">
            <div className="font-semibold mb-2">Kanallar ({filtered.length})</div>

            <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
              {filtered.length === 0 ? (
                <div className="text-sm text-gray-600 p-4 rounded-xl bg-black/5 border border-black/10">
                  Hech narsa topilmadi. Filtrlarni o‘zgartiring yoki kanal qo‘shing.
                </div>
              ) : (
                filtered.map((ch) => {
                  const isFav = favorites.has(ch.id);
                  const active = selectedId === ch.id;

                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => setSelectedId(ch.id)}
                      className={[
                        "w-full text-left p-3 rounded-2xl border shadow-sm transition flex items-center gap-3",
                        active
                          ? "border-black/30 bg-white"
                          : "border-black/10 bg-white/60 hover:bg-white",
                      ].join(" ")}
                    >
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

                      <div className="text-lg" title={isFav ? "Favorit" : "Favorit emas"}>
                        {isFav ? "★" : " "}
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Favoritlarni belgilasangiz, ular ro‘yxatda tepaga chiqadi.
            </div>
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          AI Chat o‘rniga Live TV modul yoqildi ✅
        </div>
      </div>
    </div>
  );
}
