"use client";

import type { gsap } from "@/lib/gsap";

/**
 * Zoomed layers of a scrubbed timeline: while it moves they are GPU textures (the photo, SVG mask or
 * gradient is NOT re-drawn every frame — that is what stutters on older computers); once it rests they
 * are drawn again at full sharpness. Adding the hint while zoomed in rasters the layer at that scale,
 * so it stays crisp. Returns a cleanup for the pending timer.
 */
export function gpuWhileMoving(tl: gsap.core.Timeline, layers: (Element | null | undefined)[], restMs = 240) {
  const els = layers.filter((el): el is HTMLElement | SVGElement => el instanceof HTMLElement || el instanceof SVGElement);
  let rest = 0;
  tl.eventCallback("onUpdate", () => {
    els.forEach((el) => (el.style.willChange = "transform"));
    window.clearTimeout(rest);
    rest = window.setTimeout(() => els.forEach((el) => (el.style.willChange = "")), restMs);
  });
  return () => window.clearTimeout(rest);
}
