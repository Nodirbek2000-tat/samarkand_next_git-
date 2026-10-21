"use client";

import { LazyMotion } from "motion/react";

const features = () => import("./motion-features").then((m) => m.default);

/**
 * The public site's components use the light `m` elements; the animation features arrive as a separate file
 * right after the first render instead of being parsed on the page's critical path (the admin panel keeps
 * the full `motion`).
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <LazyMotion features={features}>{children}</LazyMotion>;
}
