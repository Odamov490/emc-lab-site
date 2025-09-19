import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * ScrollToTopButton (PORTAL VARIANT)
 * — Tugma har qanday transform/overflow konteinerdan mustaqil bo'lishi uchun document.body ga portal qilinadi.
 * — Pastga siljiganda ko'rinadi, bosilganda tepaga silliq ko'taradi.
 * — O'ng past (biroz tepada): bottom: 80px, right: 32px.
 */
export default function ScrollToTopButton({ offset = 300 }) {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setVisible(y > offset);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  const scrollToTop = () => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToTop();
    }
  };

  const btn = (
    <div
      className={`fixed z-[9999] bottom-20 right-8 pointer-events-none select-none`}
      style={{ position: "fixed" }}
    >
      <button
        type="button"
        aria-label="Tepaga chiqish"
        title="Tepaga chiqish"
        onClick={scrollToTop}
        onKeyDown={onKey}
        className={`pointer-events-auto h-12 w-12 rounded-full shadow-lg border border-black/10
          bg-gradient-to-br from-sky-600 to-cyan-500 text-white text-xl
          flex items-center justify-center
          transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/50
          hover:translate-y-[-2px]
          ${visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
        style={{ left: "auto" }}
      >
        <span aria-hidden>↑</span>
      </button>
    </div>
  );

  // Portal -> document.body, shunda parent transform/overflow ta'sir qilmaydi
  return mounted ? createPortal(btn, document.body) : null;
}
