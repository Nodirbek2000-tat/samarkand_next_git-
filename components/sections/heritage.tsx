"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/* Procedural line-art skylines built from Timurid primitives. */
const BASE = 260;

function portal(x: number, w: number, h: number) {
  const ow = w * 0.5;
  const s = h * 0.45;
  const r = ow * 0.62;
  const apex = s + ow * 0.6;
  return [
    `M${x - w / 2} ${BASE} V${BASE - h} H${x + w / 2} V${BASE}`,
    `M${x - ow / 2} ${BASE} V${BASE - s} A${r} ${r} 0 0 1 ${x} ${BASE - apex} A${r} ${r} 0 0 1 ${x + ow / 2} ${BASE - s} V${BASE}`,
    `M${x - w / 2 + 6} ${BASE - h + 12} H${x + w / 2 - 6}`,
  ];
}
function dome(x: number, r: number, y: number) {
  return [
    `M${x - r} ${BASE - y} V${BASE - y + 26} M${x + r} ${BASE - y} V${BASE - y + 26}`,
    `M${x - r} ${BASE - y} C${x - r * 1.25} ${BASE - y - r * 0.9} ${x - r * 0.3} ${BASE - y - r * 1.5} ${x} ${BASE - y - r * 1.7} C${x + r * 0.3} ${BASE - y - r * 1.5} ${x + r * 1.25} ${BASE - y - r * 0.9} ${x + r} ${BASE - y}`,
    `M${x} ${BASE - y - r * 1.7} V${BASE - y - r * 1.7 - 12}`,
  ];
}
function minaret(x: number, h: number) {
  return [
    `M${x - 6} ${BASE} L${x - 4} ${BASE - h} H${x + 4} L${x + 6} ${BASE}`,
    `M${x - 8} ${BASE - h} H${x + 8} M${x - 5} ${BASE - h} Q${x} ${BASE - h - 14} ${x + 5} ${BASE - h}`,
    `M${x - 5} ${BASE - h * 0.35} H${x + 5} M${x - 4.5} ${BASE - h * 0.65} H${x + 4.5}`,
  ];
}
function tower(x: number, w: number, h: number) {
  return [`M${x - w / 2} ${BASE} V${BASE - h} H${x + w / 2} V${BASE}`, `M${x - w / 2} ${BASE - h + 20} H${x + w / 2}`];
}

const SKYLINES: string[][] = [
  // Registon
  [...portal(90, 90, 150), ...portal(250, 110, 180), ...portal(410, 90, 150), ...minaret(35, 170), ...minaret(465, 170), ...dome(170, 30, 120), ...dome(330, 30, 120)],
  // Shohi Zinda — a street of small domed mausoleums
  [...portal(70, 60, 100), ...dome(70, 22, 100), ...portal(160, 70, 120), ...dome(160, 26, 120), ...portal(255, 60, 110), ...dome(255, 22, 110), ...portal(350, 80, 135), ...dome(350, 30, 135), ...portal(445, 60, 100), ...dome(445, 22, 100)],
  // Modern gates — station & airport
  [`M20 ${BASE} H480`, `M40 ${BASE} V160 Q250 40 460 160 V${BASE}`, ...Array.from({ length: 9 }, (_, i) => `M${80 + i * 42} ${BASE} V${150 - Math.sin((i / 8) * Math.PI) * 60}`), ...portal(250, 90, 120)],
  // Eternal city — new quarter
  [...tower(60, 50, 160), ...tower(120, 40, 120), ...portal(250, 120, 170), ...dome(250, 34, 170), ...tower(380, 46, 140), ...tower(440, 40, 190), ...minaret(170, 150), ...minaret(330, 150)],
  // Imam Bukhari complex
  [...portal(250, 130, 190), ...dome(250, 46, 190), ...dome(130, 30, 110), ...dome(370, 30, 110), ...tower(130, 80, 110), ...tower(370, 80, 110), ...minaret(50, 200), ...minaret(450, 200)],
];

const PLACES = [
  { name: "Registon", kicker: "Yurak", text: "Samarqandning ko‘p asrlik tarixi va me’morchiligining yuragi." },
  { name: "Shohi Zinda", kicker: "Ziyorat", text: "Samarqandning eng muqaddas ziyoratgohlaridan biri." },
  { name: "Zamonaviy darvoza", kicker: "Dunyo", text: "Samarqandning dunyoga ochilgan zamonaviy darvozasi." },
  { name: "Abadiy shahar", kicker: "Kelajak", text: "Turizm, biznes va investitsiyalar uchun yangi makon." },
  { name: "Imom Buxoriy majmuasi", kicker: "Ma’naviyat", text: "Ma’naviy meros va mamlakat kelajagining ramzi." },
];

const TINTS = ["#2ee8d6", "#f3c46b", "#3b5bff", "#ff7847", "#2ee8d6"];

export function Heritage() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-place]");
      cards.forEach((card, i) => {
        const paths = card.querySelectorAll<SVGPathElement>("path");
        paths.forEach((p) => {
          const len = p.getTotalLength();
          gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
        });
        gsap.to(paths, {
          strokeDashoffset: 0,
          duration: 2.4,
          ease: "power2.inOut",
          stagger: 0.04,
          scrollTrigger: { trigger: card, start: "top 70%" },
        });

        if (i < cards.length - 1) {
          gsap.to(card.querySelector("[data-place-inner]"), {
            scale: 0.9,
            opacity: 0.35,
            filter: "blur(4px)",
            ease: "none",
            scrollTrigger: {
              trigger: cards[i + 1],
              start: "top bottom",
              end: "top 15%",
              scrub: true,
            },
          });
        }
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="meros" className="relative bg-ink px-5 pb-32 md:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-16 flex flex-col justify-between gap-6 pt-10 md:flex-row md:items-end">
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
            <article key={p.name} data-place className="sticky top-20 h-[78svh] pt-4 md:top-24" style={{ zIndex: i + 1 }}>
              <div
                data-place-inner
                className="relative flex h-full origin-top flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink-2 p-7 md:p-12"
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-60"
                  style={{
                    background: `radial-gradient(ellipse at 70% 110%, color-mix(in oklab, ${TINTS[i]} 30%, transparent), transparent 60%)`,
                  }}
                />
                <div className="relative flex items-start justify-between gap-6">
                  <div>
                    <span className="font-mono text-[12.5px] uppercase tracking-[0.2em]" style={{ color: TINTS[i] }}>
                      0{i + 1} — {p.kicker}
                    </span>
                    <h3 className="mt-4 font-display text-4xl font-semibold uppercase tracking-tight md:text-7xl">{p.name}</h3>
                  </div>
                  <p className="hidden max-w-xs text-right text-ivory/80 md:block">{p.text}</p>
                </div>

                <svg
                  viewBox="0 0 500 270"
                  className="relative mx-auto h-[45%] w-full max-w-4xl md:h-[60%]"
                  fill="none"
                  stroke={TINTS[i]}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  {SKYLINES[i].map((d, k) => (
                    <path key={k} d={d} />
                  ))}
                  <path d={`M0 ${BASE} H500`} stroke="rgb(244 239 228 / 0.25)" />
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
