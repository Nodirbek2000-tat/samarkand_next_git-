"use client";

import { gsap } from "@/lib/gsap";
import { isLite, onLite } from "@/lib/perf";

/**
 * Scroll effects a weak machine should not carry (word lighting, velocity skew, scrubbed SVG lines).
 * Built in their own GSAP context unless light mode is on, and undone the moment light mode is switched on
 * later (the preloader's frame probe) — without React state, so nothing re-renders. Call inside `useGSAP`
 * and return the result as (part of) its cleanup.
 */
export function heavyEffects(build: () => void, scope?: Element | null): (() => void) | undefined {
  if (isLite()) return;
  const ctx = gsap.context(build, scope ?? undefined);
  const off = onLite(() => ctx.revert());
  return () => {
    off();
    ctx.revert();
  };
}
