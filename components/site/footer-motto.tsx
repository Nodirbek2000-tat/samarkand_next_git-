"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { MOTTOS } from "@/lib/mottos";
import { cn } from "@/lib/utils";

const EVERY_MS = 3800;

/**
 * Above the giant "SAMARQAND": the council's mottos flip over one another, each in its own colour — on their
 * own while the footer is on screen, or at once when the pointer comes over (a tap on phones).
 */
export function FooterMotto() {
  const ref = useRef<HTMLButtonElement>(null);
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(false);
  const next = () => setI((v) => (v + 1) % MOTTOS.length);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((v) => (v + 1) % MOTTOS.length), EVERY_MS);
    return () => clearTimeout(t);
  }, [visible, i]);

  const motto = MOTTOS[i];
  const Icon = motto.icon;

  return (
    <button
      ref={ref}
      type="button"
      data-cursor="hover"
      onPointerEnter={(e) => e.pointerType === "mouse" && next()}
      onClick={next}
      aria-label={`Kengash shiori: ${motto.text}. Keyingisi`}
      className="mx-auto mt-16 flex w-full max-w-[1600px] items-center gap-4 border-t border-ivory/10 pt-8 text-left md:gap-6"
    >
      <span className="hidden shrink-0 font-mono text-[12px] uppercase tracking-[0.18em] text-mist sm:block">Shiorimiz</span>
      <span className="relative block h-[2.4em] flex-1 overflow-hidden sm:h-[1.2em] font-display text-[clamp(1.1rem,4.2vw,3.25rem)] font-semibold uppercase leading-[1.2] tracking-[-0.02em]">
        <AnimatePresence initial={false}>
          {/* phones: the sentence takes two lines; wider screens keep it on one */}
          <m.span
            key={i}
            className="absolute inset-0 flex items-center gap-3 sm:whitespace-nowrap md:gap-5"
            initial={{ y: "100%", rotateX: -70, opacity: 0 }}
            animate={{ y: "0%", rotateX: 0, opacity: 1 }}
            exit={{ y: "-100%", rotateX: 70, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <Icon className="size-[0.8em] shrink-0" style={{ color: motto.color }} />
            <span className={cn("line-clamp-2 sm:truncate", motto.gradient && "text-gradient")} style={motto.gradient ? undefined : { color: motto.color }}>
              {motto.text}
            </span>
          </m.span>
        </AnimatePresence>
      </span>
      <span aria-hidden className="hidden shrink-0 gap-1.5 md:flex">
        {MOTTOS.map((mt, k) => (
          <span
            key={k}
            className={cn("h-1.5 rounded-full transition-all duration-500", k === i ? "w-6" : "w-1.5 bg-ivory/25")}
            style={k === i ? { background: mt.color } : undefined}
          />
        ))}
      </span>
    </button>
  );
}
