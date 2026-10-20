"use client";

import { gsap } from "@/lib/gsap";

type Follow = { x: number; y: number; frame: number; rx?: (v: number) => void; ry?: (v: number) => void };
const cards = new WeakMap<HTMLElement, Follow>();

/**
 * Mouse-driven card effects (spotlight / foil position, 3D tilt) at most once per frame: one layout read,
 * style writes only on the layer that uses them, and reused tweens — instead of a forced layout, a restyle
 * of the whole card and a brand-new tween for every pointer event. Touch is ignored (it would fight swipes).
 */
export function followPointer(
  e: React.PointerEvent<HTMLElement>,
  apply: (card: HTMLElement, px: number, py: number, rect: DOMRect) => void,
  tilt = 0,
) {
  if (e.pointerType !== "mouse") return;
  const card = e.currentTarget;
  let f = cards.get(card);
  if (!f) {
    f = { x: 0, y: 0, frame: 0 };
    if (tilt) {
      f.rx = gsap.quickTo(card, "rotateX", { duration: 0.6, ease: "power3" });
      f.ry = gsap.quickTo(card, "rotateY", { duration: 0.6, ease: "power3" });
    }
    cards.set(card, f);
  }
  f.x = e.clientX;
  f.y = e.clientY;
  if (f.frame) return;
  const s = f;
  s.frame = requestAnimationFrame(() => {
    s.frame = 0;
    const r = card.getBoundingClientRect();
    const px = (s.x - r.left) / r.width;
    const py = (s.y - r.top) / r.height;
    apply(card, px, py, r);
    s.ry?.((px - 0.5) * tilt);
    s.rx?.(-(py - 0.5) * tilt);
  });
}

/** The pointer left the card: drop a pending frame and ease the tilt back. */
export function leavePointer(e: React.PointerEvent<HTMLElement>) {
  if (e.pointerType !== "mouse") return;
  const f = cards.get(e.currentTarget);
  if (!f) return;
  if (f.frame) cancelAnimationFrame(f.frame);
  f.frame = 0;
  f.rx?.(0);
  f.ry?.(0);
}

/** Moves a `.spotlight` layer inside the card to the pointer (the CSS vars live on that layer only). */
export function spotlightAt(card: HTMLElement, px: number, py: number, r: DOMRect) {
  const spot = card.querySelector<HTMLElement>(".spotlight");
  spot?.style.setProperty("--mx", `${px * r.width}px`);
  spot?.style.setProperty("--my", `${py * r.height}px`);
}
