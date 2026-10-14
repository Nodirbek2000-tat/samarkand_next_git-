"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/**
 * Scroll-triggered entrance for server-rendered content.
 * With `stagger`, direct children marked `data-reveal-item` animate one after another.
 */
export function Reveal({
  children,
  className,
  y = 28,
  delay = 0,
  stagger,
  start = "top 88%",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  y?: number;
  delay?: number;
  stagger?: number;
  start?: string;
  as?: "div" | "section" | "ul" | "ol" | "article" | "aside";
}) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const items = stagger ? el.querySelectorAll<HTMLElement>("[data-reveal-item]") : [el];
      if (!items.length) return;
      // transform + opacity only (compositor-friendly); each trigger fires once and is then released
      gsap.from(items, {
        y,
        opacity: 0,
        duration: 0.85,
        delay,
        ease: "expo.out",
        stagger: stagger ?? 0,
        clearProps: "transform",
        scrollTrigger: { trigger: el, start, once: true },
      });
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref as React.Ref<never>} className={cn(className)}>
      {children}
    </Tag>
  );
}
