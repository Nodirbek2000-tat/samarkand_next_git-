"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { gpuWhileMoving } from "@/lib/gpu-while-moving";
import { StarMark } from "@/components/logo";

/** Pinned scene: the word is a window cut out of the dark; scrolling flies the camera through it. */
export function ZoomReveal() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({
        // phones fly through the word in a shorter scroll
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: () => (window.innerWidth < 768 ? "+=110%" : "+=170%"),
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo("[data-zoom-mask]", { scale: 1 }, { scale: 38, ease: "power3.in", duration: 1 }, 0)
        .to("[data-zoom-cap]", { opacity: 0, y: -40, duration: 0.25 }, 0)
        .to("[data-zoom-overlay]", { opacity: 0, duration: 0.2 }, 0.78)
        .fromTo("[data-zoom-inner]", { scale: 1.4, rotate: -8 }, { scale: 1, rotate: 0, ease: "none", duration: 1 }, 0)
        .from("[data-zoom-after] > *", { opacity: 0, y: 60, stagger: 0.05, duration: 0.2 }, 0.82);
      // the word mask (scaled up to 38×) and the colour field behind it are not re-drawn every frame
      const q = gsap.utils.selector(root);
      return gpuWhileMoving(tl, [q("[data-zoom-mask]")[0], q("[data-zoom-inner]")[0]]);
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative h-svh overflow-hidden bg-ink">
      {/* what lives "inside" the word */}
      <div data-zoom-inner className="absolute inset-0">
        <div className="absolute inset-0 bg-[conic-gradient(from_200deg_at_50%_50%,#2ee8d6,#3b5bff,#ff7847,#f3c46b,#2ee8d6)]" />
        <div className="orb absolute left-1/2 top-1/2 size-[90vmax] -translate-x-1/2 -translate-y-1/2 opacity-80" />
        <svg viewBox="0 0 400 400" className="spin-slower absolute left-1/2 top-1/2 size-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-30" fill="none" stroke="#03050b" strokeWidth="0.6" aria-hidden>
          {Array.from({ length: 16 }).map((_, i) => (
            <rect key={i} x="60" y="60" width="280" height="280" transform={`rotate(${i * 5.625} 200 200)`} />
          ))}
        </svg>
      </div>

      <div data-zoom-after className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-[#03050b]">
        <StarMark className="size-16" />
        <p className="mt-6 font-display text-4xl font-bold uppercase leading-[0.95] tracking-[-0.03em] md:text-7xl">
          Kelajak bugundan
          <br />
          boshlanadi
        </p>
        <p className="mt-5 font-mono text-[13px] uppercase tracking-[0.2em]">Yangi Samarqand · Yangi davr</p>
      </div>

      {/* dark plate with the word cut out */}
      <div data-zoom-overlay className="pointer-events-none absolute inset-0">
        <svg data-zoom-mask className="absolute inset-0 size-full origin-center" preserveAspectRatio="xMidYMid meet" viewBox="0 0 1600 900" aria-hidden>
          <defs>
            <mask id="zoom-word" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="9600" height="8900">
              <rect x="-4000" y="-4000" width="9600" height="8900" fill="white" />
              <text
                x="800"
                y="520"
                textAnchor="middle"
                fill="black"
                style={{ font: "700 250px var(--font-unbounded)", letterSpacing: "-12px" }}
              >
                KELAJAK
              </text>
            </mask>
          </defs>
          <rect x="-4000" y="-4000" width="9600" height="8900" style={{ fill: "var(--color-ink)" }} mask="url(#zoom-word)" />
        </svg>
      </div>

      <div data-zoom-cap className="pointer-events-none absolute inset-x-0 bottom-12 text-center font-mono text-[12.5px] uppercase tracking-[0.22em] text-ivory/80">
        Aylantiring — kelajakka kiring
      </div>
    </section>
  );
}
