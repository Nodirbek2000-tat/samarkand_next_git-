"use client";

import { useEffect } from "react";

/**
 * Ko'rinmayotgan bo'limlardagi cheksiz CSS animatsiyalarni (marquee, aylanuvchi naqshlar, yulduzlar…)
 * to'xtatadi: bo'lim ekrandan chiqsa `data-offscreen` qo'yiladi, globals.css esa ichidagi
 * animatsiyalarni pauza qiladi. Protsessor va videokarta faqat ko'rinayotgan joy uchun ishlaydi.
 */
export function OffscreenPause() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>("main section, body footer");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.removeAttribute("data-offscreen");
          else e.target.setAttribute("data-offscreen", "");
        }
      },
      { rootMargin: "160px 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return null;
}
