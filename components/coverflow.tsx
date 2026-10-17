"use client";

import { useEffect, type RefObject } from "react";
import { ArrowRight } from "lucide-react";

/** Karusel ostidagi "suring" ishorasi (strelka yonga turtinib turadi). */
export function SwipeHint({ className = "" }: { className?: string }) {
  return (
    <p
      aria-hidden
      className={`swipe-hint flex items-center justify-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.25em] text-mist ${className}`}
    >
      Suring <ArrowRight className="size-3.5" />
    </p>
  );
}

/**
 * Telefon karuseli (gorizontal scroll-snap qatori) uchun "coverflow": markazdagi karta to'liq turadi,
 * chetga surilgan sari 3D buriladi, kichrayadi va xiralashadi. Faqat transform/opacity — barmoq bilan
 * surganda ham silliq. `query` mos kelmasa (katta ekran) hech narsa qilmaydi.
 */
export function useCoverflow(ref: RefObject<HTMLElement | null>, query = "(max-width: 767px)") {
  useEffect(() => {
    const rail = ref.current;
    if (!rail) return;
    const mq = window.matchMedia(query);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const cards = () => Array.from(rail.children) as HTMLElement[];

    const update = () => {
      raf = 0;
      if (!mq.matches) return;
      const box = rail.getBoundingClientRect();
      const mid = box.left + box.width / 2;
      for (const card of cards()) {
        const r = card.getBoundingClientRect();
        const d = Math.max(-1, Math.min(1, (r.left + r.width / 2 - mid) / box.width));
        const a = Math.abs(d);
        // pivot on the edge nearest the centre, so the neighbours stay peeking in at the screen edges
        card.style.transformOrigin = d > 0 ? "0% 50%" : "100% 50%";
        card.style.transform = reduce ? "" : `perspective(1100px) rotateY(${(-d * 24).toFixed(2)}deg) scale(${(1 - a * 0.1).toFixed(3)})`;
        card.style.opacity = (1 - a * 0.4).toFixed(3);
      }
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onChange = () => {
      if (mq.matches) return schedule();
      for (const card of cards()) {
        card.style.transform = "";
        card.style.transformOrigin = "";
        card.style.opacity = "";
      }
    };

    rail.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    mq.addEventListener("change", onChange);
    // cards swapped by a filter/tab: lay the new ones out too
    const mo = new MutationObserver(schedule);
    mo.observe(rail, { childList: true });
    schedule();
    return () => {
      mo.disconnect();
      cancelAnimationFrame(raf);
      rail.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mq.removeEventListener("change", onChange);
    };
  }, [ref, query]);
}
