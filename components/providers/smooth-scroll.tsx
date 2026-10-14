"use client";

import { createContext, useContext, useEffect, useState } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { sceneState } from "@/lib/store";

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

    const instance = new Lenis({
      lerp: reduce ? 1 : 0.12, // snappier: less "floaty" lag on slower machines
      smoothWheel: !reduce,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.4,
      autoRaf: false,
    });
    if (startStopped) instance.stop(); // released when the preloader finishes

    instance.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onPointer = (e: PointerEvent) => {
      sceneState.mouseX = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.mouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });

    // Lenis is an external DOM system that can only exist after mount; expose it to consumers.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLenis(instance);
    return () => {
      window.removeEventListener("pointermove", onPointer);
      gsap.ticker.remove(tick);
      instance.destroy();
    };
  }, [startStopped]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
