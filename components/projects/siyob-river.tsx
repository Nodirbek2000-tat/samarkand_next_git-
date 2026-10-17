"use client";

import { useRef } from "react";
import { ArrowLeft, Droplets, Landmark, Mountain, Plane, Trees, Waves, Wheat, type LucideIcon } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Container, SectionTitle } from "@/components/site/ui";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

// «Siyob haqida» — from the project's founding document: where the river starts, what it passes, where it ends.

const INTRO =
  "Siyob — Samarqand shahri, Samarqand va Pastdarg‘om tumanlari hududidan oqib o‘tadigan kichik daryo. U qadimiy kanal hisoblanadi va shahar hamda Samarqand tumani iqtisodiyotida muhim o‘rin tutadi.";

const FACTS = [
  { value: "20–23 km", label: "daryoning uzunligi (turli baholarga ko‘ra)" },
  { value: "3 hudud", label: "Samarqand shahri, Samarqand va Pastdarg‘om tumanlari" },
  { value: "3 ariq", label: "Obimashhad, Obirahmat va Obisiyob shu daryodan boshlanadi" },
];

type Stop = {
  kicker: string;
  title: string;
  note: string;
  icon: LucideIcon;
  /** position on the schematic map (viewBox W×H) and where its caption sits */
  at: [number, number];
  side: "top" | "bottom";
  align?: "start" | "end";
};

// east → north-west, the way the water runs
const STOPS: Stop[] = [
  { kicker: "Boshlanishi", title: "Eshkak eshish kanali", note: "Shaharning eng sharqiy qismida", icon: Droplets, at: [1110, 318], side: "top", align: "end" },
  { kicker: "Sharq", title: "Cho‘ponota", note: "Tepalikning janub tomonidan oqadi", icon: Mountain, at: [945, 290], side: "bottom" },
  { kicker: "Shahar shimoli", title: "Afrosiyob", note: "Shimoliy chekkasidan o‘tadi, uchta ariq shu yerda boshlanadi", icon: Landmark, at: [770, 246], side: "top" },
  { kicker: "Shimoli-g‘arb", title: "Xalqaro aeroport", note: "Aeroportning janub tomonidan o‘tadi", icon: Plane, at: [595, 256], side: "bottom" },
  { kicker: "Tuman", title: "Samarqand tumani", note: "Shimoliy va shimoli-g‘arbiy dalalarni sug‘oradi", icon: Wheat, at: [425, 204], side: "top" },
  { kicker: "Tuman", title: "Pastdarg‘om tumani", note: "Bir necha kilometr oqib o‘tadi", icon: Trees, at: [255, 166], side: "bottom" },
  { kicker: "Quyilishi", title: "Qoradaryo", note: "Zarafshonning janubiy tarmog‘iga quyiladi", icon: Waves, at: [100, 112], side: "top", align: "start" },
];

const W = 1200;
const H = 440;
type Pt = [number, number];

/** A smooth line through the points (Catmull-Rom → cubic Bézier). */
function smooth(pts: Pt[]) {
  const r = (v: number) => Math.round(v * 10) / 10;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const [p0, p1, p2, p3] = [pts[i - 1] ?? pts[i], pts[i], pts[i + 1], pts[i + 2] ?? pts[i + 1]];
    d += ` C${r(p1[0] + (p2[0] - p0[0]) / 6)},${r(p1[1] + (p2[1] - p0[1]) / 6)} ${r(p2[0] - (p3[0] - p1[0]) / 6)},${r(p2[1] - (p3[1] - p1[1]) / 6)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/** The river meanders a little between the stops instead of running straight. */
const RIVER = smooth(
  STOPS.flatMap(({ at }, i) => {
    const next = STOPS[i + 1]?.at;
    if (!next) return [at];
    const [dx, dy] = [next[0] - at[0], next[1] - at[1]];
    const len = Math.hypot(dx, dy);
    const k = (i % 2 ? 1 : -1) * 11;
    return [at, [(at[0] + next[0]) / 2 + (-dy / len) * k, (at[1] + next[1]) / 2 + (dx / len) * k] as Pt];
  }),
);
const QORADARYO = smooth([
  [70, 0],
  [92, 56],
  [100, 112],
  [86, 200],
  [64, 300],
  [58, H],
]);
// when the drawn line reaches each stop (share of the way from source to mouth)
const SPAN = STOPS[0].at[0] - STOPS[STOPS.length - 1].at[0];
const REACH = STOPS.map(({ at }) => (STOPS[0].at[0] - at[0]) / SPAN);

export function SiyobRiver() {
  const map = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = map.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const mm = gsap.matchMedia();
      // the map only exists from xl; below that the vertical route uses the ordinary reveal
      mm.add("(min-width: 1280px)", () => {
        const river = el.querySelectorAll<SVGPathElement>("[data-river]");
        const len = river[0].getTotalLength();
        const draw = 2.4;
        gsap.set(river, { strokeDasharray: len, strokeDashoffset: len });
        const tl = gsap.timeline({ scrollTrigger: { trigger: el, start: "top 72%", once: true } });
        tl.from("[data-qoradaryo]", { opacity: 0, duration: 1 }, 0)
          .to(river, { strokeDashoffset: 0, duration: draw, ease: "power1.inOut" }, 0)
          .from("[data-flow]", { opacity: 0, duration: 0.8 }, draw - 0.3);
        el.querySelectorAll("[data-stop]").forEach((stop, i) => {
          tl.from(stop.querySelector("[data-dot]"), { scale: 0, duration: 0.6, ease: "back.out(2.2)" }, REACH[i] * draw);
          tl.from(stop.querySelector("[data-caption]"), { opacity: 0, y: STOPS[i].side === "top" ? 10 : -10, duration: 0.7, ease: "expo.out" }, REACH[i] * draw + 0.1);
        });
      });
      return () => mm.revert();
    },
    { scope: map },
  );

  return (
    <Container className="mt-12">
      <section className="rounded-[2.2rem] border border-ivory/10 bg-ink-2 p-6 md:p-10 xl:p-12">
        <SectionTitle kicker="Siyob haqida" title="Shahar bo‘ylab oqadigan" highlight="qadimiy kanal" />

        <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
          <Reveal className="lg:col-span-4">
            <p className="text-lg leading-relaxed text-ivory/85 md:text-xl">{INTRO}</p>
          </Reveal>
          <Reveal stagger={0.08} className="grid gap-3 sm:grid-cols-3 lg:col-span-8 lg:self-start">
            {FACTS.map((f) => (
              <div key={f.value} data-reveal-item className="rounded-2xl border border-ivory/10 bg-ink p-5">
                <p className="whitespace-nowrap font-display text-2xl font-bold tracking-tight text-turq xl:text-3xl">{f.value}</p>
                <p className="mt-2 text-[15px] leading-snug text-ivory/75">{f.label}</p>
              </div>
            ))}
          </Reveal>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-ivory/10 pt-6 font-mono text-[12px] uppercase tracking-[0.16em] text-mist">
          <span>Daryo yo‘li · sxema</span>
          <span className="flex items-center gap-2 text-turq">
            <ArrowLeft className="size-4" /> Sharqdan shimoli-g‘arbga oqadi
          </span>
        </div>

        {/* xl+: a schematic map, drawn from the source to the mouth */}
        <div ref={map} className="relative mt-6 hidden pt-10 xl:block">
          <div className="relative aspect-[1200/440]">
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="siyob-water" x1="1" y1="1" x2="0" y2="0">
                  <stop offset="0" style={{ stopColor: "var(--color-turq)" }} />
                  <stop offset="1" style={{ stopColor: "var(--color-lapis)" }} />
                </linearGradient>
              </defs>
              <path data-qoradaryo d={QORADARYO} fill="none" stroke="var(--color-lapis)" strokeOpacity={0.22} strokeWidth={26} strokeLinecap="round" />
              <text x={34} y={330} transform="rotate(-90 34 330)" className="fill-mist font-mono text-[12px] uppercase tracking-[0.3em]">
                Qoradaryo
              </text>
              <path data-river d={RIVER} fill="none" stroke="var(--color-turq)" strokeOpacity={0.16} strokeWidth={24} strokeLinecap="round" />
              <path data-river d={RIVER} fill="none" stroke="url(#siyob-water)" strokeWidth={7} strokeLinecap="round" />
              <path data-flow d={RIVER} fill="none" className="river-flow stroke-ivory" strokeOpacity={0.75} strokeWidth={2.2} strokeDasharray="1 14" strokeLinecap="round" />
            </svg>

            {STOPS.map((s, i) => (
              <div key={s.title} data-stop className="absolute" style={{ left: `${(s.at[0] / W) * 100}%`, top: `${(s.at[1] / H) * 100}%` }}>
                <span
                  data-dot
                  className="absolute left-0 top-0 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-2 border-turq bg-ink-2 text-turq shadow-[0_0_0_6px_var(--color-ink-2)]"
                >
                  <s.icon className="size-5" />
                </span>
                <div
                  data-caption
                  className={cn(
                    "absolute w-48",
                    s.side === "top" ? "bottom-10" : "top-10",
                    s.align === "start" ? "left-0 translate-x-2 text-left" : s.align === "end" ? "right-0 translate-x-[15%] text-right" : "left-0 -translate-x-1/2 text-center",
                  )}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-turq">
                    {String(i + 1).padStart(2, "0")} · {s.kicker}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold leading-tight">{s.title}</p>
                  <p className="mt-1 text-sm leading-snug text-ivory/70">{s.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* below xl: the same route, top to bottom */}
        <Reveal stagger={0.07} as="ol" className="relative mt-6 xl:hidden">
          <span aria-hidden className="absolute bottom-8 left-[21px] top-8 w-1 rounded-full bg-gradient-to-b from-turq to-lapis opacity-80" />
          {STOPS.map((s, i) => (
            <li key={s.title} data-reveal-item className="relative flex gap-5 pb-7 last:pb-0">
              <span className="relative grid size-11 shrink-0 place-items-center rounded-full border-2 border-turq bg-ink-2 text-turq">
                <s.icon className="size-5" />
              </span>
              <div className="pt-0.5">
                <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-turq">
                  {String(i + 1).padStart(2, "0")} · {s.kicker}
                </p>
                <p className="mt-1 font-display text-lg font-semibold leading-tight">{s.title}</p>
                <p className="mt-1 text-[15px] leading-snug text-ivory/70">{s.note}</p>
              </div>
            </li>
          ))}
        </Reveal>
      </section>
    </Container>
  );
}
