// src/components/AIChat.jsx
// Live TV — tayyor kanallar bilan (foydalanuvchi link kiritmaydi)
// Vercel-safe: hls.js CDN orqali yuklanadi

import React, { useEffect, useMemo, useRef, useState } from "react";

/* =======================
   TAYYOR KANALLAR
   ======================= */

const CHANNELS = [
  {
    id: "uz-1",
    name: "Oʻzbekiston 24",
    country: "O‘zbekiston",
    category: "Yangiliklar",
    lang: "UZ",
    type: "hls",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "uz-2",
    name: "Madaniyat TV",
    country: "O‘zbekiston",
    category: "Ko‘ngilochar",
    lang: "UZ",
    type: "hls",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "ru-1",
    name: "Россия 24",
    country: "Rossiya",
    category: "Yangiliklar",
    lang: "RU",
    type: "hls",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "tr-1",
    name: "TRT Haber",
    country: "Turkiya",
    category: "Yangiliklar",
    lang: "TR",
    type: "hls",
    url: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
  },
  {
    id: "us-1",
    name: "NASA Live",
    country: "AQSh",
    category: "Ilm-Fan",
    lang: "EN",
    type: "iframe",
    url: "https://www.youtube.com/embed/21X5lGlDOfg",
  },
];

const CATEGORIES = ["Hammasi", "Yangiliklar", "Ko‘ngilochar", "Ilm-Fan"];
const COUNTRIES = ["Hammasi", "O‘zbekiston", "Rossiya", "Turkiya", "AQSh"];

/* =======================
   HLS CDN LOADER
   ======================= */

const HLS_CDN = "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";

function loadHls() {
  if (window.Hls) return Promise.resolve(window.Hls);

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = HLS_CDN;
    s.onload = () => resolve(window.Hls);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

/* =======================
   PLAYER
   ======================= */

function HLSPlayer({ src }) {
  const ref = useRef(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      return;
    }

    let hls;
    loadHls().then((Hls) => {
      if (Hls.isSupported()) {
        hls = new Hls();
        hls.loadSource(src);
        hls.attachMedia(video);
      }
    });

    return () => hls && hls.destroy();
  }, [src]);

  return (
    <video
      ref={ref}
      controls
      className="w-full rounded-xl bg-black"
      style={{ aspectRatio: "16 / 9" }}
    />
  );
}

function Player({ channel }) {
  if (!channel)
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        Kanal tanlang
      </div>
    );

  if (channel.type === "iframe") {
    return (
      <iframe
        src={channel.url}
        className="w-full rounded-xl"
        style={{ aspectRatio: "16 / 9" }}
        allowFullScreen
      />
    );
  }

  return <HLSPlayer src={channel.url} />;
}

/* =======================
   MAIN COMPONENT
   ======================= */

export default function AIChat() {
  const [category, setCategory] = useState("Hammasi");
  const [country, setCountry] = useState("Hammasi");
  const [selected, setSelected] = useState(CHANNELS[0]);

  const filtered = useMemo(() => {
    return CHANNELS.filter((c) => {
      if (category !== "Hammasi" && c.category !== category) return false;
      if (country !== "Hammasi" && c.country !== country) return false;
      return true;
    });
  }, [category, country]);

  useEffect(() => {
    if (!filtered.includes(selected)) setSelected(filtered[0] || null);
  }, [filtered, selected]);

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">📺 Live TV</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <select value={country} onChange={(e) => setCountry(e.target.value)}>
          {COUNTRIES.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Channel list */}
        <div className="space-y-2">
          {filtered.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`w-full text-left p-2 rounded-lg border ${
                selected?.id === c.id ? "bg-black text-white" : "bg-white"
              }`}
            >
              {c.name}
              <div className="text-xs opacity-70">
                {c.country} • {c.lang}
              </div>
            </button>
          ))}
        </div>

        {/* Player */}
        <div className="lg:col-span-3">
          <Player channel={selected} />
        </div>
      </div>
    </div>
  );
}
