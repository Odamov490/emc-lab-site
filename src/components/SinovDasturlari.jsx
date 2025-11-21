import React, { useState } from "react";

export default function SinovDasturlari() {
  const [lang, setLang] = useState("uz");

  return (
    <div className="video-bg-container">
      {/* 🎥 Video fon */}
      <video
        className="video-bg"
        src="/video/bird.mp4"
        autoPlay
        loop
        muted
        playsInline
      />

      <div className="content">
        <div className="lang-switch">
          <button
            className={lang === "uz" ? "active" : ""}
            onClick={() => setLang("uz")}
          >
            UZ
          </button>
          <button
            className={lang === "ru" ? "active" : ""}
            onClick={() => setLang("ru")}
          >
            RU
          </button>
        </div>

        <h1>{lang === "uz" ? "Sinov dasturlari" : "Программы испытаний"}</h1>

        <p>
          {lang === "uz"
            ? "Quyidagi dasturlarni onlayn ko‘rishingiz yoki yuklab olishingiz mumkin."
            : "Вы можете открыть или скачать следующие программы испытаний."}
        </p>

        {/* Shu yerda kartalar bo‘ladi */}
      </div>
    </div>
  );
}
