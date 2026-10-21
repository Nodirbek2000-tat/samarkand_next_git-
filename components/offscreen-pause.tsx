"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

/**
 * Ko'rinmayotgan bo'limlardagi cheksiz CSS animatsiyalarni (marquee, aylanuvchi naqshlar, yulduzlar…)
 * to'xtatadi: bo'lim ekrandan chiqsa `data-offscreen` qo'yiladi, globals.css esa ichidagi
 * animatsiyalarni pauza qiladi. Protsessor va videokarta faqat ko'rinayotgan joy uchun ishlaydi.
 *
 * `data-cv` belgili bo'limlarni esa brauzer ekrandan uzoqda bo'lganda umuman hisoblamaydi va chizmaydi
 * (content-visibility: auto): har qanday animatsiya yoki o'lchov uchun sahifaning butun uslubi/joylashuvi
 * qayta hisoblanganda ular qatnashmaydi. Bo'limning balandligi o'lchab qotiriladi — pastdagilar siljimaydi;
 * ScrollTrigger sahifani qayta o'lchashidan oldin (ekran o'lchami o'zgarsa) ular odatdagidek chiziladi.
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

    const cv = Array.from(document.querySelectorAll<HTMLElement>("[data-cv]"));
    // their content only reflows when the screen size changes: other page measurements (GSAP re-measures
    // the page whenever a pinned section is set up) keep the pinned heights instead of laying out everything
    const screen = () => `${window.innerWidth}x${window.innerHeight}`;
    let pinnedFor = "";
    const pin = () => {
      pinnedFor = screen();
      // all reads, then all writes: one layout. The size given is the content box (padding and border come on
      // top of it), exactly as just measured — not `auto`: the browser's remembered size is only updated a
      // frame later and would bring back an older height, and the sections below would no longer sit where
      // ScrollTrigger measured them
      const heights = cv.map((el) => {
        const cs = getComputedStyle(el);
        return el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      });
      cv.forEach((el, i) => {
        // height only (a section's width comes from the page anyway)
        el.style.containIntrinsicSize = `none ${heights[i]}px`;
        el.classList.add("cv-skip");
      });
    };
    const unpin = () => cv.forEach((el) => el.classList.remove("cv-skip"));
    const beforeMeasure = () => {
      if (screen() !== pinnedFor) unpin();
    };
    ScrollTrigger.addEventListener("refreshInit", beforeMeasure);
    ScrollTrigger.addEventListener("refresh", pin);
    return () => {
      io.disconnect();
      ScrollTrigger.removeEventListener("refreshInit", beforeMeasure);
      ScrollTrigger.removeEventListener("refresh", pin);
      unpin();
    };
  }, []);
  return null;
}
