"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, animate, useMotionValue, useTransform } from "motion/react";
import { introStore } from "@/lib/store";
import { useLenis } from "@/components/providers/smooth-scroll";
import { StarMark } from "@/components/logo";

const WORD = "SAMARQAND".split("");
const ease = [0.16, 1, 0.3, 1] as const;

export function Preloader() {
  const lenis = useLenis();
  const [done, setDone] = useState(false);
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => String(Math.round(v)).padStart(3, "0"));
  const width = useTransform(count, (v) => `${v}%`);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const controls = animate(count, 100, {
      duration: reduce ? 0.4 : 1.4,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => setTimeout(() => setDone(true), reduce ? 0 : 120),
    });
    return () => controls.stop();
  }, [count]);

  useEffect(() => {
    if (!done) return;
    lenis?.start();
    // let the curtain start lifting before the hero choreography kicks in
    const t = setTimeout(() => introStore.set(true), 450);
    return () => clearTimeout(t);
  }, [done, lenis]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[90] flex flex-col justify-between overflow-hidden bg-ink p-6 md:p-10"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-turq)_12%,transparent),transparent_65%)]" />

          <div className="relative flex items-start justify-between font-mono text-[11.5px] uppercase tracking-[0.2em] text-mist">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }}>
              Yangi Samarqand
            </motion.span>
          </div>

          <div className="relative flex flex-col items-center gap-8">
            <motion.div
              initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1, ease }}
            >
              <StarMark className="size-16 md:size-20" />
            </motion.div>
            <div className="flex overflow-hidden font-display text-[10.5vw] font-bold leading-[0.9] tracking-tight md:text-[8vw]">
              {WORD.map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ y: "110%", rotate: 8 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ delay: 0.1 + i * 0.04, duration: 0.8, ease }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
            <motion.p
              className="font-mono text-[11.5px] uppercase tracking-[0.25em] text-turq"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              Ming yillik meros · Yangi davr
            </motion.p>
          </div>

          <div className="relative flex items-end justify-between gap-6">
            <div className="h-px flex-1 self-center bg-ivory/10">
              <motion.div className="h-full bg-gradient-to-r from-turq via-gold to-ember" style={{ width }} />
            </div>
            <motion.span className="font-display text-5xl font-light tabular-nums md:text-7xl">{rounded}</motion.span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
