"use client";

import { useEffect } from "react";
import { gsap, SplitText } from "@/lib/gsap";
import { isLite, onLite } from "@/lib/perf";
import { scheduleSetup } from "@/lib/section-setup";

/**
 * Bosh sahifadagi barcha bo'lim sarlavhalari (h2) bir xil "kino" uslubida chiqadi: har bir qator
 * niqob ostidan ko'tarilib, ozgina burilishdan tekislanadi. O'z animatsiyasi bor sarlavhalar
 * (`data-no-reveal`) tegilmaydi. Faqat transform — har sarlavha uchun bir marta ishlaydi.
 *
 * Yengillik: sarlavhalar bo'limlar bilan bir navbatda (lib/section-setup) qatorlarga bo'linadi — bo'sh
 * paytda yoki ekranga yaqinlashganda, sahifa ochilishida emas; yengil rejimda — umuman yo'q.
 */
export function HeadingReveal() {
  useEffect(() => {
    if (isLite() || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const splits: SplitText[] = [];
    const prepare = (h2: Element) => {
      // light mode may have been switched on by the preloader's frame probe after this was set up
      if (isLite()) return;
      const split = SplitText.create(h2, {
        type: "lines",
        mask: "lines",
        onSplit: (self) => {
          // clip only vertically (the line rises from below): wide words must never be cut at the sides,
          // and a little margin keeps Q/J tails visible
          (self.masks as HTMLElement[]).forEach((m) => {
            m.style.overflow = "visible clip";
            m.style.overflowClipMargin = "0.12em";
          });
          gsap.from(self.lines, {
            yPercent: 115,
            rotate: 3,
            transformOrigin: "0% 100%",
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: { trigger: h2, start: "top 88%", once: true },
            // the masks were only needed for the entrance: plain text again afterwards (resizes rewrap freely)
            onComplete: () => self.revert(),
          });
        },
      });
      splits.push(split);
    };
    // split while it is still below the screen (hidden under its masks), rise when it scrolls in
    const cancels = Array.from(document.querySelectorAll("main section h2:not([data-no-reveal])"), (h2) =>
      scheduleSetup(h2, () => prepare(h2)),
    );
    const offLite = onLite(() => cancels.forEach((cancel) => cancel()));
    return () => {
      offLite();
      cancels.forEach((cancel) => cancel());
      splits.forEach((s) => s.revert());
    };
  }, []);
  return null;
}
