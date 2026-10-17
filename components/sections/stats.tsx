"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

const STATS = [
  { value: 30, suffix: "", label: "Kengashning faol a’zolari", ratio: 0.3 },
  { value: 406, suffix: "", label: "Made in Samarkand katalogidagi korxonalar", ratio: 0.68 },
  { value: 30, suffix: "", label: "2024-yilda qo‘llab-quvvatlangan startaplar", ratio: 0.45 },
  { value: 6000, suffix: "+", label: "Viloyatdagi sanoat korxonalari", ratio: 0.92 },
];

const C = 2 * Math.PI * 46;

export function Stats() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.utils.toArray<HTMLElement>("[data-stat]").forEach((el) => {
        const num = el.querySelector<HTMLElement>("[data-num]")!;
        const arc = el.querySelector<SVGCircleElement>("[data-arc]")!;
        const target = Number(num.dataset.num);
        const ratio = Number(arc.dataset.arc);
        const counter = { v: 0 };
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 85%" } });
        tl.to(counter, {
          v: target,
          duration: 2.2,
          ease: "expo.out",
          onUpdate: () => (num.textContent = Math.round(counter.v).toLocaleString("ru-RU")),
        })
          .fromTo(arc, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - ratio), duration: 2.2, ease: "expo.out" }, 0)
          .from(el.querySelectorAll("[data-stat-fade]"), { y: 20, opacity: 0, duration: 1, stagger: 0.1, ease: "expo.out" }, 0.1);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative bg-ink px-5 pb-20 md:px-10 md:pb-40">
      <div className="mx-auto grid max-w-[1600px] border-t border-l border-ivory/10 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label} data-stat className="group relative border-b border-r border-ivory/10 p-8 md:p-10">
            <svg viewBox="0 0 100 100" className="absolute right-6 top-6 size-16 -rotate-90 md:size-20" aria-hidden>
              <circle cx="50" cy="50" r="46" fill="none" style={{ stroke: "color-mix(in oklab, var(--color-ivory) 12%, transparent)" }} strokeWidth="2" />
              <circle
                data-arc={s.ratio}
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="url(#stat-g)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C}
              />
              <defs>
                <linearGradient id="stat-g" x1="0" x2="1">
                  <stop offset="0" style={{ stopColor: "var(--color-turq)" }} />
                  <stop offset="1" style={{ stopColor: "var(--color-gold)" }} />
                </linearGradient>
              </defs>
            </svg>
            <div className="mt-20 flex items-baseline font-display text-6xl font-semibold tracking-tight md:text-7xl">
              <span data-num={s.value} className="tabular-nums">
                0
              </span>
              <span className="text-turq">{s.suffix}</span>
            </div>
            <p data-stat-fade className="mt-4 max-w-[22ch] text-sm leading-relaxed text-ivory/80">
              {s.label}
            </p>
            <div className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-gradient-to-r from-turq to-gold transition-transform duration-700 ease-expo group-hover:scale-x-100" />
          </div>
        ))}
      </div>
    </section>
  );
}
