import React, { useEffect, useState } from "react";

/**
 * ScrollToTopButton
 * — Pastga siljiganda ko'rinadi, bosilganda tepa (0px) ga silliq ko'taradi.
 * — Tailwind CSS sinflari bilan bezatilgan (dumaloq ko'k tugma, soya, hover animatsiya).
 * — Klaviatura va screen-reader uchun mos (aria-attributes, Enter/Space ishlaydi).
 *
 * Props:
 *  - offset: necha piksel scrolldan keyin tugma ko'rinsin (default: 300)
 */
export default function ScrollToTopButton({ offset = 300 }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setVisible(y > offset);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [offset]);

  const scrollToTop = () => {
    // Foydalanuvchi "reduced motion" sozlamasini hurmat qilish
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReduced ? "auto" : "smooth" });
  };

  const onKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToTop();
    }
  };

  return (
    <button
      type="button"
      aria-label="Tepaga chiqish"
      title="Tepaga chiqish"
      onClick={scrollToTop}
      onKeyDown={onKey}
      className={`fixed z-50 bottom-20 right-8   // ⬅️ pastdan 80px, o‘ngdan 32px
        h-12 w-12 rounded-full shadow-lg border border-black/10
        bg-gradient-to-br from-sky-600 to-cyan-500 text-white text-xl
        flex items-center justify-center select-none
        transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/50
        hover:translate-y-[-2px]
        ${visible ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-90 pointer-events-none"}
      `}
    >
      {/* yuqoriga o'qcha */}
      <span aria-hidden>↑</span>
    </button>
  );
}
