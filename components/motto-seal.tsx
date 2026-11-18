"use client";

import { useId, useRef, type CSSProperties } from "react";
import { m, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import type { Motto } from "@/lib/mottos";

/**
 * A round stamp with a motto written around its edge: it pops out of nowhere the first time its section comes
 * into view and then keeps turning (CSS, on the compositor). Position it with `className` (it is absolute).
 */
export function MottoSeal({ motto, className, delay = 0.25 }: { motto: Motto; className?: string; delay?: number }) {
  const id = `seal-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const Icon = motto.icon;
  // the outer box is what is watched: an element scaled to 0 has no area, and the browser never reports it in view
  const box = useRef<HTMLDivElement>(null);
  const seen = useInView(box, { once: true, margin: "0px 0px -20% 0px" });
  return (
    <div
      ref={box}
      role="img"
      aria-label={motto.text}
      className={cn("motto-seal group absolute z-10 size-[96px] md:size-36", className)}
      style={{ "--c": motto.color } as CSSProperties}
    >
      <m.div
        className="size-full"
        initial={{ scale: 0, rotate: -140, opacity: 0 }}
        animate={seen ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
        transition={{ type: "spring", stiffness: 150, damping: 12, delay }}
      >
        <svg viewBox="0 0 100 100" className="motto-seal-ring size-full overflow-visible" aria-hidden>
          <defs>
            <path id={id} d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
          </defs>
          <circle cx="50" cy="50" r="49" className="motto-seal-disc" />
          <circle cx="50" cy="50" r="29" fill="none" stroke="var(--c)" strokeOpacity="0.35" strokeDasharray="1.5 2.5" />
          <text className="motto-seal-text">
            {/* textLength spreads every motto evenly around the ring, the ✦ marks where it starts again */}
            <textPath href={`#${id}`} textLength="236" lengthAdjust="spacing">
              {`${motto.text.toLocaleUpperCase("uz")} ✦`}
            </textPath>
          </text>
        </svg>
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-[40%] place-items-center rounded-full bg-[var(--c)] text-white shadow-lg transition-transform duration-500 ease-expo group-hover:rotate-12 group-hover:scale-110">
            <Icon className="size-[48%]" strokeWidth={2.2} />
          </span>
        </span>
      </m.div>
    </div>
  );
}
