// src/ScrollToTopButton.jsx
import React, { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Local CSS for the light sweep */}
      <style>{`
        @keyframes sweep {
          0%   { transform: translateY(120%); }
          100% { transform: translateY(-120%); }
        }
        .light-sweep {
          background: linear-gradient(
            120deg,
            rgba(255,255,255,0) 0%,
            rgba(255,255,255,.55) 50%,
            rgba(255,255,255,0) 100%
          );
          animation: sweep 1.6s linear infinite;
        }
      `}</style>

      {visible && (
        <button
          onClick={scrollToTop}
          aria-label="Tepaga qaytish"
          className="
            fixed bottom-6 right-6 z-50
            rounded-full p-4
            text-white shadow-lg
            bg-gradient-to-r from-sky-600 to-cyan-600
            hover:from-sky-700 hover:to-cyan-700
            transition-transform duration-200
            active:scale-95
            ring-1 ring-white/40
            relative overflow-hidden
          "
        >
          {/* Light sweep layer (pointer events off) */}
          <span
            className="
              pointer-events-none
              absolute inset-0
              light-sweep
              opacity-70
              -rotate-12
            "
          />

          {/* Bouncing up arrow */}
          <svg
            className="w-6 h-6 relative z-10 animate-bounce"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18" />
          </svg>
        </button>
      )}
    </>
  );
}
