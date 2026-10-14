"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Vertical timeline whose spine draws itself and lights each year as you scroll. */
export function Timeline({ items }: { items: { title: string; body: string }[] }) {
  const root = useRef<HTMLOListElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        "[data-spine]",
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 70%", end: "bottom 60%", scrub: true },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-tl-item]").forEach((item) => {
        gsap
          .timeline({ scrollTrigger: { trigger: item, start: "top 72%", toggleActions: "play none none reverse" } })
          .to(item.querySelector("[data-dot]"), {
            scale: 1,
            backgroundColor: "var(--color-turq)",
            boxShadow: "0 0 0 8px color-mix(in oklab, var(--color-turq) 18%, transparent)",
            duration: 0.5,
            ease: "back.out(3)",
          })
          .from(item.querySelector("[data-year]"), { xPercent: -20, opacity: 0, duration: 0.9, ease: "expo.out" }, 0)
          .from(item.querySelector("[data-body]"), { y: 30, opacity: 0, duration: 0.9, ease: "expo.out" }, 0.1);
      });
    },
    { scope: root },
  );

  return (
    <ol ref={root} className="relative ml-2 md:ml-0">
      <span className="absolute left-[7px] top-0 h-full w-0.5 bg-ivory/10 md:left-1/2 md:-translate-x-1/2" />
      <span data-spine className="absolute left-[7px] top-0 h-full w-0.5 origin-top bg-gradient-to-b from-turq via-lapis to-gold md:left-1/2 md:-translate-x-1/2" />
      {items.map((item, i) => (
        <li
          key={item.title + i}
          data-tl-item
          className="relative grid gap-4 pb-10 pl-10 last:pb-0 md:grid-cols-2 md:gap-16 md:pl-0"
        >
          <span data-dot className="absolute left-0 top-3 size-4 scale-75 rounded-full border-2 border-turq bg-ink md:left-1/2 md:-translate-x-1/2" />
          <p
            data-year
            className={
              "font-display text-6xl font-bold leading-none tracking-tight text-turq md:text-8xl " +
              (i % 2 ? "md:order-2" : "md:text-right")
            }
          >
            {item.title}
          </p>
          <p data-body className={"text-xl leading-relaxed text-ivory/90 md:pt-3 " + (i % 2 ? "md:order-1 md:text-right" : "")}>
            {item.body}
          </p>
        </li>
      ))}
    </ol>
  );
}
