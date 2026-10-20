"use client";

import type { gsap } from "@/lib/gsap";

type Layer = Element | null | undefined;

/**
 * Zoomed or sliding layers of a scrubbed timeline: while it moves they are GPU textures (the photo, SVG
 * mask or gradient is NOT re-drawn every frame — that is what stutters on older computers); once it rests
 * they are drawn again at full sharpness. Adding the hint while zoomed in rasters the layer at that scale,
 * so it stays crisp.
 *
 * `layers` may be a function of the timeline's time: only what is on screen at that moment is promoted
 * (a long pinned story would otherwise hold a dozen full-screen textures at once).
 * Returns a cleanup for the pending timer and the hints.
 */
export function gpuWhileMoving(tl: gsap.core.Animation, layers: Layer[] | ((time: number) => Layer[]), restMs = 500) {
  const pick = typeof layers === "function" ? layers : () => layers;
  let on = new Set<HTMLElement | SVGElement>();
  const apply = (next: Set<HTMLElement | SVGElement>) => {
    on.forEach((el) => !next.has(el) && (el.style.willChange = ""));
    next.forEach((el) => !on.has(el) && (el.style.willChange = "transform"));
    on = next;
  };
  let rest = 0;
  tl.eventCallback("onUpdate", () => {
    apply(new Set(pick(tl.time()).filter((el): el is HTMLElement | SVGElement => el instanceof HTMLElement || el instanceof SVGElement)));
    window.clearTimeout(rest);
    rest = window.setTimeout(() => apply(new Set()), restMs);
  });
  return () => {
    window.clearTimeout(rest);
    apply(new Set());
  };
}
