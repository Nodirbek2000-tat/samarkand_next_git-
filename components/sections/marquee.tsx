"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { heavyEffects } from "@/lib/heavy-effects";
import { StarMark } from "@/components/logo";

const ITEMS = ["Muloqot", "Huquqlar himoyasi", "Investitsiyalar", "Sanoat kooperatsiyasi", "Ijtimoiy loyihalar", "Eksport", "Startaplar"];

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
            <StarMark className="size-8 md:size-12" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Marquee() {
  const root = useRef<HTMLElement>(null);

  // skew with scroll velocity — reads Lenis-driven ScrollTrigger, no extra listeners (not on weak machines)
  useGSAP(
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
    { scope: root },
  );

  return (
    // a <section>, so it pauses off screen like the others (components/offscreen-pause.tsx)
    <section ref={root} aria-label="Kengash qadriyatlari" className="relative overflow-hidden border-y border-ivory/10 bg-ink py-10 md:py-14">
      <div data-skew className="marquee-skew flex flex-col gap-4 md:gap-6">
        <Row />
        <Row reverse outline />
      </div>
    </section>
  );
}
