"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { MOTTOS, type Motto } from "@/lib/mottos";
import { cn } from "@/lib/utils";

const ease = [0.16, 1, 0.3, 1] as const;
/** how long each of the first four mottos stays before the next one rolls in */
const STEP_MS = 1700;
const LAST = MOTTOS.length - 1;

function Phrase({ motto }: { motto: Motto }) {
  return (
    <m.span className="flex flex-wrap justify-center gap-x-[0.28em]" exit={{ opacity: 0, transition: { duration: 0.35 } }}>
      {motto.text.split(" ").map((w, i) => (
        // the mask: each word rolls up from below its own line (a little room for the ‘ above capitals)
        <span key={i} className="-mb-[0.06em] inline-block overflow-hidden pb-[0.06em] pt-[0.1em]">
          <m.span
            className={cn("inline-block", motto.gradient && "text-gradient")}
            style={motto.gradient ? undefined : { color: motto.color }}
            initial={{ y: "115%", rotate: 6 }}
            animate={{ y: "0%", rotate: 0 }}
            exit={{ y: "-115%", transition: { duration: 0.45, ease: [0.7, 0, 0.84, 0] } }}
            transition={{ duration: 0.9, ease, delay: i * 0.07 }}
          >
            {w}
          </m.span>
        </span>
      ))}
    </m.span>
  );
}

/**
 * The closing headline: when it comes into view the five mottos roll through one after another, each in its
 * own colour, and it settles on the last one — "Yangi Samarqandni birga quramiz". A click plays it again.
 * Every motto sits invisibly in the same cell, so the heading keeps the height of the longest and nothing jumps.
 */
export function MottoTitle({ className }: { className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        // reduced motion: straight to the last motto, no roll-through
        setStep(matchMedia("(prefers-reduced-motion: reduce)").matches ? LAST : 0);
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (step === null || step >= LAST) return;
    const t = setTimeout(() => setStep(step + 1), STEP_MS);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <h2
      ref={ref}
      aria-label={MOTTOS[LAST].text}
      data-no-reveal
      data-cursor={step === LAST ? "hover" : undefined}
      onClick={() => step === LAST && setStep(0)}
      className={cn("grid font-display font-bold uppercase leading-[0.95] tracking-[-0.04em]", className)}
    >
      {MOTTOS.map((mt) => (
        <span key={mt.text} aria-hidden className="invisible [grid-area:1/1]">
          <span className="flex flex-wrap justify-center gap-x-[0.28em] pt-[0.1em]">{mt.text}</span>
        </span>
      ))}
      <span aria-hidden className="self-center [grid-area:1/1]">
        <AnimatePresence mode="wait">{step !== null && <Phrase key={step} motto={MOTTOS[step]} />}</AnimatePresence>
      </span>
      {/* five dots: which motto is on, filled in its colour */}
      <span aria-hidden className="mt-8 flex justify-center gap-2 [grid-area:2/1]">
        {MOTTOS.map((mt, i) => (
          <span
            key={i}
            className={cn("h-1.5 rounded-full transition-all duration-500 ease-expo", i === step ? "w-8" : "w-1.5 opacity-35")}
            style={{
              background: i !== step ? "var(--color-ivory)" : mt.gradient ? "linear-gradient(90deg, var(--grad-1), var(--grad-3))" : mt.color,
            }}
          />
        ))}
      </span>
    </h2>
  );
}
