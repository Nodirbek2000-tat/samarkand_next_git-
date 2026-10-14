"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Counts from 0 to the numeric part of `value` when scrolled into view ("2,5+ mlrd" works too). */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useGSAP(
    () => {
      const el = ref.current;
      const match = value.match(/[\d.,]+/);
      if (!el || !match) return;
      const target = parseFloat(match[0].replace(/\s/g, "").replace(",", "."));
      const decimals = (match[0].split(/[.,]/)[1] ?? "").length;
      const prefix = value.slice(0, match.index);
      const suffix = value.slice((match.index ?? 0) + match[0].length);
      const counter = { v: 0 };
      gsap.to(counter, {
        v: target,
        duration: 2.2,
        ease: "expo.out",
        scrollTrigger: { trigger: el, start: "top 90%" },
        onUpdate: () => {
          const n = counter.v.toFixed(decimals).replace(".", ",");
          el.textContent = prefix + n + suffix;
        },
      });
    },
    { dependencies: [value] },
  );
  return (
    <span ref={ref} className={className}>
      {value}
    </span>
  );
}
