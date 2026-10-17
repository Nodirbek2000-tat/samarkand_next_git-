"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, animate, useMotionValue, useMotionValueEvent } from "motion/react";
import { introStore } from "@/lib/store";
import { enableLite, probeFrames } from "@/lib/perf";
import { useLenis } from "@/components/providers/smooth-scroll";
import { StarMark } from "@/components/logo";

const WORD = "SAMARQAND".split("");
const ease = [0.16, 1, 0.3, 1] as const;
const PETALS = 12;
/** however slow the network, the page opens after this (images then arrive progressively) */
const MAX_WAIT = 3500;

/** Wait for what the first screen needs: fonts, the hero photo and the gate's door/gilding images. */
function heroAssetsReady(): Promise<unknown> {
  const hero = document.getElementById("top");
  const jobs: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve()];
  if (hero) {
    hero.querySelectorAll("img").forEach((img) => {
      if (img.checkVisibility?.() !== false) jobs.push(img.decode().catch(() => {}));
    });
    const urls = new Set<string>();
    // the gilding glow only breathes after the intro: it may arrive while the curtain lifts
    hero.querySelectorAll<HTMLElement>("*:not(.gate-gild)").forEach((el) => {
      for (const m of getComputedStyle(el).backgroundImage.matchAll(/url\("?([^")]+)"?\)/g)) urls.add(m[1]);
    });
    urls.forEach((src) => {
      const img = new Image();
      img.src = src;
      jobs.push(img.decode().catch(() => {}));
    });
  }
  return Promise.race([Promise.all(jobs), new Promise((r) => setTimeout(r, MAX_WAIT))]);
}

export function Preloader() {
  const lenis = useLenis();
  const [done, setDone] = useState(false);
  const count = useMotionValue(0);
  const root = useRef<HTMLDivElement>(null);
  const digits = useRef<(HTMLSpanElement | null)[]>([]);

  // one style write per frame: --p drives the petals and the progress line in CSS, the odometer rolls its strips
  useMotionValueEvent(count, "change", (v) => {
    root.current?.style.setProperty("--p", (v / 100).toFixed(3));
    const n = Math.round(v);
    [Math.floor(n / 100), Math.floor(n / 10) % 10, n % 10].forEach((d, i) => {
      const strip = digits.current[i];
      if (strip) strip.style.transform = `translateY(${-d}em)`;
    });
  });

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let alive = true;
    // while the counter runs, watch how this machine keeps up: a slow one gets the light version
    // of the page before the hero choreography starts
    const verdict = probeFrames();
    // honest progress: run to 86% while the first screen loads, finish only when it is really there
    const toward86 = new Promise((resolve) =>
      animate(count, 86, { duration: reduce ? 0.2 : 1.1, ease: [0.65, 0, 0.35, 1], onComplete: () => resolve(null) }),
    );
    Promise.all([toward86, heroAssetsReady()]).then(() => {
      if (!alive) return;
      if (verdict()) enableLite();
      animate(count, 100, {
        duration: reduce ? 0.1 : 0.45,
        ease: [0.65, 0, 0.35, 1],
        onComplete: () => setTimeout(() => alive && setDone(true), reduce ? 0 : 160),
      });
    });
    return () => {
      alive = false;
      verdict();
    };
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
          ref={root}
          className="fixed inset-0 z-[90] flex flex-col justify-between overflow-hidden bg-ink p-6 md:p-10"
          style={{ "--p": 0 } as CSSProperties}
          // the curtain lifts as one GPU layer (transform), not a per-frame clip-path repaint
          exit={{ y: "-100%" }}
          transition={{ duration: 1.1, ease }}
        >
          <div className="pointer-events-none absolute left-1/2 top-1/2 size-[90vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-turq)_12%,transparent),transparent_65%)]" />

          <div className="relative flex items-start justify-between font-mono text-[11.5px] uppercase tracking-[0.2em] text-mist">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, ease }}>
              Yangi Samarqand
            </motion.span>
          </div>

          <div className="relative flex flex-col items-center gap-6 md:gap-8">
            {/* girih rosette: each of the 12 petals lights up as loading passes it */}
            <motion.div
              className="relative grid size-40 place-items-center md:size-48"
              initial={{ scale: 0.4, opacity: 0, rotate: -90 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ duration: 1, ease }}
            >
              <svg viewBox="0 0 200 200" className="preload-rosette absolute inset-0 size-full" fill="none" aria-hidden>
                <circle cx="100" cy="100" r="98" className="preload-orbit" />
                {Array.from({ length: PETALS }).map((_, i) => (
                  <path
                    key={i}
                    d="M100 6 C111 22 111 42 100 56 C89 42 89 22 100 6Z"
                    transform={`rotate(${(i * 360) / PETALS} 100 100)`}
                    className="preload-petal"
                    style={{ "--i": i } as CSSProperties}
                  />
                ))}
              </svg>
              <StarMark className="size-14 md:size-16" />
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
              <div className="preload-line h-full origin-left bg-gradient-to-r from-turq via-gold to-ember" />
            </div>
            {/* odometer: each digit is a 0–9 strip that rolls into place */}
            <span className="odo font-display text-5xl font-light tabular-nums md:text-7xl" aria-label="Yuklanmoqda">
              {[0, 1, 2].map((k) => (
                <span key={k} className="odo-col" aria-hidden>
                  <span
                    ref={(el) => {
                      digits.current[k] = el;
                    }}
                    className="odo-strip"
                  >
                    {Array.from({ length: 10 }).map((_, d) => (
                      <span key={d}>{d}</span>
                    ))}
                  </span>
                </span>
              ))}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
