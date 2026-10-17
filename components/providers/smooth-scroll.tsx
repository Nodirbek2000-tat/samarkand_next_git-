"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/store";
import { isLite, onLite } from "@/lib/perf";

const LenisContext = createContext<Lenis | null>(null);
export const useLenis = () => useContext(LenisContext);

/**
 * One clock for everything: Lenis is ticked by GSAP's ticker and feeds ScrollTrigger,
 * so pinned/scrubbed timelines never fight the smooth scroll. Motion is only used for
 * UI state (menus, preloader, hovers) and never listens to scroll.
 */
export function SmoothScroll({
  children,
  startStopped = false,
}: {
  children: React.ReactNode;
  /** Home keeps scrolling locked until its preloader releases it. */
  startStopped?: boolean;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    // weak machines scroll natively: no per-frame scroll easing on top of the page's own animations
    const instance = new Lenis({
      lerp: reduce ? 1 : 0.12, // snappier: less "floaty" lag on slower machines
      smoothWheel: !reduce && !isLite(),
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      autoRaf: false,
    });
    if (startStopped) instance.stop(); // released when the preloader finishes
    const offLite = onLite(() => (instance.options.smoothWheel = false));

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Every section has registered its ScrollTriggers by now (children mount first). Process them
    // top-to-bottom and measure again ONCE, when web fonts and images have both settled: a late text
    // reflow or a pin measured out of order would otherwise leave sections overlapping each other.
    // (ScrollTrigger's own refresh on "load" is switched off — each refresh re-measures every trigger.)
    ScrollTrigger.config({ autoRefreshEvents: "visibilitychange,DOMContentLoaded,resize", limitCallbacks: true, ignoreMobileResize: true });
    ScrollTrigger.sort();
    let alive = true;
    const loaded = new Promise<void>((r) => (document.readyState === "complete" ? r() : window.addEventListener("load", () => r(), { once: true })));
    Promise.all([document.fonts?.ready, loaded]).then(() => alive && ScrollTrigger.refresh());

    const onPointer = (e: PointerEvent) => {
      sceneState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Lenis is an external DOM system that can only exist after mount; expose it to consumers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);
    return () => {
      alive = false;
      offLite();
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove(tick);
      instance.destroy();
    };
  }, [startStopped]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
