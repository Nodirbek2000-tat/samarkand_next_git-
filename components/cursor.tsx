"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-custom-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.55, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.55, ease: "power3" });

    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, opacity: 0 });

    const move = (e: PointerEvent) => {
      gsap.to([dot.current, ring.current], { opacity: 1, duration: 0.3, overwrite: "auto" });
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const target = (e.target as HTMLElement).closest<HTMLElement>("[data-cursor]");
      const mode = target?.dataset.cursor;
      const text = target?.dataset.cursorLabel ?? "";
      if (label.current) label.current.textContent = text;
      gsap.to(ring.current, {
        scale: mode === "view" ? 2.6 : mode === "hover" ? 1.7 : 1,
        backgroundColor: mode === "view" ? "rgba(46,232,214,0.95)" : "rgba(46,232,214,0)",
        borderColor: mode ? "rgba(46,232,214,0.9)" : "rgba(244,239,228,0.45)",
        duration: 0.45,
        ease: "expo.out",
      });
      gsap.to(dot.current, { scale: mode ? 0 : 1, duration: 0.3 });
      gsap.to(label.current, { opacity: mode === "view" ? 1 : 0, duration: 0.25 });
    };

    const leave = () => gsap.to([dot.current, ring.current], { opacity: 0, duration: 0.3 });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100] hidden [@media(pointer:fine)]:block">
      <div
        ref={ring}
        className="fixed left-0 top-0 grid size-9 place-items-center rounded-full border border-ivory/45"
      >
        <span ref={label} className="font-mono text-[4px] font-bold uppercase tracking-[0.2em] text-ink opacity-0" />
      </div>
      <div ref={dot} className="fixed left-0 top-0 size-1.5 rounded-full bg-turq" />
    </div>
  );
}
