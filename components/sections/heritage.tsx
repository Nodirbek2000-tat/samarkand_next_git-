"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { isLite } from "@/lib/perf";
import { gpuWhileMoving } from "@/lib/gpu-while-moving";

import { SCENES, VIEW, type FillKind } from "./heritage-art";

const PLACES = [
  { name: "Registon", kicker: "Yurak", text: "Samarqandning ko‘p asrlik tarixi va me’morchiligining yuragi." },
  { name: "Shohi Zinda", kicker: "Ziyorat", text: "Samarqandning eng muqaddas ziyoratgohlaridan biri." },
  { name: "Zamonaviy darvoza", kicker: "Dunyo", text: "Samarqandning dunyoga ochilgan zamonaviy darvozasi." },
  { name: "Abadiy shahar", kicker: "Kelajak", text: "Turizm, biznes va investitsiyalar uchun yangi makon." },
  // one line like the other titles (as in the hero journey), so the drawing below keeps the same room
  { name: "Imom al‑Buxoriy", kicker: "Ma’naviyat", text: "Imom al‑Buxoriy majmuasi — ma’naviy meros va mamlakat kelajagining ramzi." },
];

// theme tokens, not hex: deep accents on the light theme, bright ones at night
const TINTS = ["var(--color-turq)", "var(--color-gold)", "var(--color-lapis)", "var(--color-ember)", "var(--color-turq)"];

// opaque fills: "bg" (the card colour) hides whatever stands behind a building — depth without masks
const FILL: Record<FillKind, string> = {
  bg: "var(--color-ink-2)",
  tile: "color-mix(in oklab, var(--color-lapis) 20%, var(--color-ink-2))",
  dome: "color-mix(in oklab, var(--color-turq) 32%, var(--color-ink-2))",
  gold: "color-mix(in oklab, var(--color-gold) 55%, var(--color-ink-2))",
};
const FILL_ORDER: FillKind[] = ["bg", "tile", "dome", "gold"];

export function Heritage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const cards = gsap.utils.toArray<HTMLElement>("[data-place]");

      // A card's drawing is prepared about a screen before it scrolls in — measuring every line of all five
      // drawings up front made the page's first seconds heavier.
      const prepare = contextSafe!((card: HTMLElement) => {
        // fit the drawing to its own bounds, so every scene fills the card (no empty sky)
        card.querySelectorAll<SVGSVGElement>("svg[data-art]").forEach((svg) => {
          const b = (svg.firstElementChild as SVGGElement).getBBox();
          const pad = 10;
          svg.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`);
          // phones: fill the narrow card and let the far sides go, rather than a tiny strip
          svg.setAttribute("preserveAspectRatio", window.innerWidth < 768 ? "xMidYMax slice" : "xMidYMax meet");
        });
        // the drawing: outlines first, then the fine details, then the colours settle in — weak machines
        // (light mode, also when switched on after mount) and reduced motion get it finished
        if (!reduce && !isLite()) {
          const strokes = card.querySelectorAll<SVGPathElement>("[data-line], [data-detail]");
          strokes.forEach((p) => {
            const len = p.getTotalLength();
            gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
          });
          const fills = card.querySelectorAll("[data-fill]");
          gsap.set(fills, { fillOpacity: 0 });
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: "top 72%", once: true } })
            .to(card.querySelectorAll("[data-line]"), { strokeDashoffset: 0, duration: 2.2, ease: "power2.inOut", stagger: 0.05 }, 0)
            .to(card.querySelectorAll("[data-detail]"), { strokeDashoffset: 0, duration: 1.8, ease: "power1.inOut", stagger: 0.03 }, 0.6)
            .to(fills, { fillOpacity: 1, duration: 1.1, ease: "power1.out", stagger: 0.02 }, 1.3);
        }
      });
      const io = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (!e.isIntersecting) return;
            io.unobserve(e.target);
            prepare(e.target as HTMLElement);
          }),
        { rootMargin: "100% 0px" },
      );

      const stops: (() => void)[] = [];
      cards.forEach((card, i) => {
        io.observe(card);
        // the next card slides over: this one sinks and dims under an opaque shade (never see-through,
        // so the cards further back never show through it)
        // (one trigger for both; while it moves the card and its shade are GPU layers — no full-card repaint)
        if (i < cards.length - 1) {
          const inner = card.querySelector("[data-place-inner]");
          const shade = card.querySelector("[data-place-shade]");
          const sink = gsap
            .timeline({ scrollTrigger: { trigger: cards[i + 1], start: "top bottom", end: "top 15%", scrub: true } })
            .to(inner, {
              scale: 0.92,
              // phones: the covered card also tips aside, like a deck being dealt
              rotate: () => (window.innerWidth < 768 ? (i % 2 ? 4 : -4) : 0),
              ease: "none",
            })
            .to(shade, { opacity: 0.55, ease: "none" }, 0);
          stops.push(gpuWhileMoving(sink, [inner, shade]));
        }
      });
      return () => {
        io.disconnect();
        stops.forEach((stop) => stop());
      };
    },
    { scope: root },
  );

  return (
    <section ref={root} id="meros" className="relative bg-ink px-5 pb-20 md:px-10 md:pb-32">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-10 flex flex-col justify-between gap-6 pt-10 md:mb-16 md:flex-row md:items-end">
          <div>
            <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
              <span className="text-turq">09</span>
              <span className="h-px w-16 bg-ivory/20" />
              Meros va kelajak
            </div>
            <h2 className="font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-8xl">
              2750 yillik
              <br />
              <span className="text-outline">shahar</span>
            </h2>
          </div>
          <p className="max-w-sm text-ivory/80">
            Buyuk Ipak yo‘lining markazi bugun yana dunyo uchun ochilmoqda — tarix va zamonaviy biznes bir makonda.
          </p>
        </div>

        <div className="relative">
          {PLACES.map((p, i) => (
            <article key={p.name} data-place className="sticky top-16 h-[54svh] pt-4 md:top-24 md:h-[78svh]" style={{ zIndex: i + 1 }}>
              <div
                data-place-inner
                className="relative flex h-full origin-top flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink-2 p-7 md:p-12"
              >
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-1/2"
                  style={{
                    background: `radial-gradient(ellipse at 90% 0%, color-mix(in oklab, ${TINTS[i]} 14%, transparent), transparent 70%)`,
                  }}
                />
                <div data-place-shade className="pointer-events-none absolute inset-0 z-10 bg-ink opacity-0" />
                <div className="relative flex items-start justify-between gap-6">
                  <div>
                    <span
                      className="font-mono text-[12.5px] uppercase tracking-[0.2em]"
                      style={{ color: `color-mix(in oklab, ${TINTS[i]} 72%, var(--color-ivory))` }}
                    >
                      0{i + 1} — {p.kicker}
                    </span>
                    <h3 className="mt-4 font-display text-4xl font-semibold uppercase tracking-tight md:text-7xl">{p.name}</h3>
                  </div>
                  <p className="hidden max-w-xs text-right text-ivory/80 md:block">{p.text}</p>
                </div>

                <svg
                  data-art
                  viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
                  preserveAspectRatio="xMidYMax meet"
                  className="relative mt-4 min-h-0 w-full flex-1"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <g>
                    {SCENES[i].map((part, k) => (
                      <g key={k}>
                        {FILL_ORDER.map((f) =>
                          part.fills[f] ? <path key={f} data-fill d={part.fills[f]} style={{ fill: FILL[f] }} /> : null,
                        )}
                        {part.main && <path data-line d={part.main} strokeWidth={1.6} style={{ stroke: TINTS[i] }} />}
                        {part.detail && <path data-detail d={part.detail} strokeWidth={0.9} opacity={0.7} style={{ stroke: TINTS[i] }} />}
                      </g>
                    ))}
                  </g>
                </svg>

                <p className="relative text-ivory/85 md:hidden">{p.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
