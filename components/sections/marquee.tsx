"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { isLite } from "@/lib/perf";
import { StarMark } from "@/components/logo";

const ITEMS = ["Muloqot", "Huquqlar himoyasi", "Investitsiyalar", "Sanoat kooperatsiyasi", "Ijtimoiy loyihalar", "Eksport", "Startaplar"];

function Row({ reverse = false, outline = false }: { reverse?: boolean; outline?: boolean }) {
  const list = [...ITEMS, ...ITEMS];
  return (
    <div className="flex overflow-hidden">
      <div
        className={`marquee-track flex shrink-0 items-center gap-10 pr-10 ${reverse ? "marquee-reverse" : ""}`}
        style={{ "--marquee-speed": reverse ? "52s" : "40s" } as React.CSSProperties}
      >
        {[...list, ...list].map((t, i) => (
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
  const root = useRef<HTMLDivElement>(null);

  // skew with scroll velocity — reads Lenis-driven ScrollTrigger, no extra listeners (not on weak machines)
  useGSAP(
    () => {
      if (isLite()) return;
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
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative overflow-hidden border-y border-ivory/10 bg-ink py-10 md:py-14">
      <div data-skew className="flex flex-col gap-4 will-change-transform md:gap-6">
        <Row />
        <Row reverse outline />
      </div>
    </div>
  );
}
