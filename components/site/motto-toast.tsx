"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence, m } from "motion/react";
import { X } from "lucide-react";
import { MOTTOS } from "@/lib/mottos";
import { cn } from "@/lib/utils";

/** the first one comes after a while of reading, the second much later — never more per visit */
const DELAYS_MS = [14_000, 70_000];
const VISIBLE_MS = 7000;
const KEY = "motto-toasts";

type Seen = { count: number; last: number };

function readSeen(): Seen {
  try {
    const v = JSON.parse(sessionStorage.getItem(KEY) ?? "null");
    if (v && typeof v.count === "number") return v;
  } catch {}
  return { count: 0, last: -1 };
}

function writeSeen(v: Seen) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(v));
  } catch {}
}

/**
 * Inner pages: while someone reads, a card with one of the council's mottos slides in at the bottom corner
 * out of nowhere, stays a few seconds and leaves by itself. At most twice a visit (sessionStorage), a different
 * motto each time.
 */
export function MottoToast() {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    const seen = readSeen();
    if (seen.count >= DELAYS_MS.length) return;
    const t = setTimeout(() => {
      // a motto other than the last one shown
      let i = Math.floor(Math.random() * MOTTOS.length);
      if (i === seen.last) i = (i + 1) % MOTTOS.length;
      writeSeen({ count: seen.count + 1, last: i });
      setIndex(i);
    }, DELAYS_MS[seen.count]);
    return () => clearTimeout(t);
  }, [index === null]); // eslint-disable-line react-hooks/exhaustive-deps -- schedule the next one once this one has gone

  useEffect(() => {
    if (index === null) return;
    const t = setTimeout(() => setIndex(null), VISIBLE_MS);
    return () => clearTimeout(t);
  }, [index]);

  const motto = index === null ? null : MOTTOS[index];
  const Icon = motto?.icon;

  return (
    <div aria-live="polite" className="pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex sm:bottom-6 sm:left-6 sm:right-auto">
      <AnimatePresence>
        {motto && Icon && (
          <m.div
            key={index}
            initial={{ opacity: 0, x: -60, rotate: -6, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95, transition: { duration: 0.35 } }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="panel pointer-events-auto relative flex w-full max-w-sm items-center gap-4 overflow-hidden rounded-3xl p-4 pr-12"
            style={{ "--c": motto.color } as CSSProperties}
          >
            <span className="absolute inset-y-0 left-0 w-1.5 bg-[var(--c)]" />
            <m.span
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 220, damping: 12, delay: 0.15 }}
              className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--c)] text-white"
            >
              <Icon className="size-6" />
            </m.span>
            <span className="min-w-0">
              <span className="block font-mono text-[11px] uppercase tracking-[0.18em] text-mist">Kengash shiori</span>
              <span
                className={cn("mt-1 block font-display text-lg font-semibold leading-tight", motto.gradient && "text-gradient")}
                style={motto.gradient ? undefined : { color: motto.color }}
              >
                {motto.text}
              </span>
            </span>
            <button
              type="button"
              aria-label="Yopish"
              onClick={() => setIndex(null)}
              className="absolute right-3 top-3 grid size-8 place-items-center rounded-full text-mist transition-colors hover:bg-ivory/10 hover:text-ivory"
            >
              <X className="size-4" />
            </button>
            {/* how long it stays */}
            <m.span
              className="absolute bottom-0 left-0 h-0.5 w-full origin-left bg-[var(--c)] opacity-60"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: VISIBLE_MS / 1000, ease: "linear" }}
            />
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}
