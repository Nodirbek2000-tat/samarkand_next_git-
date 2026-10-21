"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSectionSetup } from "@/lib/section-setup";
import { heavyEffects } from "@/lib/heavy-effects";

const ITEMS = ["Muloqot", "Huquqlar himoyasi", "Investitsiyalar", "Sanoat kooperatsiyasi", "Ijtimoiy loyihalar", "Eksport", "Startaplar"];

/** The star between the words is drawn once (StarSprite) and reused: 28 full copies with their own gradients
 * were ~300 elements and 16 KB of the page. */
function StarSprite() {
  return (
    // not display:none — a gradient inside a hidden SVG is not painted in Chrome
    <svg width="0" height="0" className="absolute" aria-hidden>
      <defs>
        <linearGradient id="marquee-star-g" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0" style={{ stopColor: "var(--color-turq)" }} />
          <stop offset="1" style={{ stopColor: "var(--color-gold)" }} />
        </linearGradient>
        <symbol id="marquee-star" viewBox="0 0 48 48">
          <g fill="none" stroke="url(#marquee-star-g)" strokeWidth="1.6">
            <rect x="10" y="10" width="28" height="28" />
            <rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)" />
            <circle cx="24" cy="24" r="6.5" />
          </g>
          <circle cx="24" cy="24" r="2" style={{ fill: "var(--color-gold)" }} />
        </symbol>
      </defs>
    </svg>
  );
}

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  // two identical halves (the track slides by -50%): the seven words are already wider than any screen
  const list = [...ITEMS, ...ITEMS];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`marquee-track flex shrink-0 items-center gap-10 pr-10 ${reverse ? "marquee-reverse" : ""}`}
        style={{ "--marquee-speed": reverse ? "26s" : "20s" } as React.CSSProperties}
      >
        {list.map((t, i) => (
          <span key={i} className="flex items-center gap-10">
            <span
              className={`font-display text-5xl font-bold uppercase tracking-tight md:text-8xl ${outline ? "text-outline" : "text-ivory"}`}
            >
              {t}
            </span>
            <svg className="size-8 shrink-0 md:size-12" aria-hidden>
              <use href="#marquee-star" />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  const root = useRef<HTMLElement>(null);

  // skew with scroll velocity — reads Lenis-driven ScrollTrigger, no extra listeners (not on weak machines)
  useSectionSetup(
    root,
    () =>
      heavyEffects(() => {
        const skew = gsap.quickTo("[data-skew]", "skewX", { duration: 0.6, ease: "power3" });
        ScrollTrigger.create({
          trigger: root.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            skew(gsap.utils.clamp(-12, 12, self.getVelocity() / -250));
          },
          onLeave: () => skew(0),
          onLeaveBack: () => skew(0),
        });
      }, root.current),
  );

  return (
    // a <section>, so it pauses off screen like the others (components/offscreen-pause.tsx)
    <section ref={root} data-cv aria-label="Kengash qadriyatlari" className="relative overflow-hidden border-y border-ivory/10 bg-ink py-10 md:py-14">
      <StarSprite />
      <div data-skew className="marquee-skew flex flex-col gap-4 md:gap-6">
        <Row />
        <Row reverse outline />
      </div>
    </section>
  );
}
