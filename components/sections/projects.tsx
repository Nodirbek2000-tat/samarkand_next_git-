"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useCoverflow, SwipeHint } from "@/components/coverflow";

const PROJECTS = [
  {
    title: "Siyob kanali",
    kind: "Ijtimoiy loyiha",
    meta: "Obodonlashtirish",
    text: "Qadimiy Siyob kanali sohilini turizm va sayr yo‘laklari uchun kompleks obodonlashtirish.",
    colors: ["#2ee8d6", "#0b3d91", "#03050b"],
  },
  {
    title: "Made in Samarkand",
    kind: "Katalog",
    meta: "406 korxona",
    text: "Samarqand viloyatida ishlab chiqarilgan mahsulotlarning bosma va elektron katalogi.",
    colors: ["#f3c46b", "#ff7847", "#1a0b03"],
  },
  {
    title: "Yoshlar startaplari",
    kind: "Innovatsiya",
    meta: "30 loyiha · 2024",
    text: "Yoshlar startaplari va ilmiy ishlanmalarni Kengash qarori bilan moliyalashtirish.",
    colors: ["#3b5bff", "#2ee8d6", "#020418"],
  },
  {
    title: "Uz Made",
    kind: "Media loyiha",
    meta: "Video seriya",
    text: "Importni o‘rnini bosuvchi va eksportbop mahsulotlar haqida video loyiha.",
    colors: ["#ff7847", "#7a1fff", "#0d0314"],
  },
  {
    title: "Sanoatchilar forumi",
    kind: "Biznes muhit",
    meta: "Har yili",
    text: "Lokalizatsiya, kooperatsiya va eksport masalalari muhokama qilinadigan viloyat forumi.",
    colors: ["#f3c46b", "#2ee8d6", "#04110f"],
  },
  {
    title: "Biznes klublar",
    kind: "HR · Buxgalterlar",
    meta: "Professional hamjamiyat",
    text: "HR-mutaxassislar hamda buxgalterlar, auditorlar va soliq maslahatchilari klublari.",
    colors: ["#2ee8d6", "#f3c46b", "#03050b"],
  },
];

function Art({ colors, index }: { colors: string[]; index: number }) {
  const [a, b, c] = colors;
  return (
    <div className="relative size-full overflow-hidden" style={{ background: c }}>
      <div
        className="absolute -inset-1/4 animate-[spin_14s_linear_infinite]"
        style={{
          // soft colour fields drawn by gradients — no blur filter on the spinning layer
          background: `radial-gradient(circle at ${30 + index * 7}% 32%, ${a} 0%, transparent 46%), radial-gradient(circle at 70% 58%, ${b} 0%, transparent 48%), radial-gradient(circle at 38% 78%, ${a} 0%, transparent 40%)`,
        }}
      />
      <svg viewBox="0 0 200 200" className="absolute inset-0 size-full mix-blend-overlay" fill="none" stroke="#fff" strokeWidth="0.6" aria-hidden>
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x="40" y="40" width="120" height="120" transform={`rotate(${i * 9} 100 100)`} />
        ))}
        <path d="M60 200 V120 A40 40 0 0 1 100 70 A40 40 0 0 1 140 120 V200" strokeWidth="1.4" />
      </svg>
      <span className="absolute bottom-4 left-4 font-mono text-[11.5px] uppercase tracking-[0.2em] text-white/80">
        Yangi Samarqand · 0{index + 1}
      </span>
    </div>
  );
}

export function Projects() {
  const root = useRef<HTMLElement>(null);
  const list = useRef<HTMLUListElement>(null);
  useCoverflow(list);
  const [active, setActive] = useState<number | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 180, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 180, damping: 22, mass: 0.6 });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-row]").forEach((row) => {
          gsap.from(row, {
            clipPath: "inset(0 0 100% 0)",
            y: 40,
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: row, start: "top 90%" },
          });
        });
      });
      // phones: the list is a swipe carousel (coverflow owns each card's transform) — the whole row flies in
      mm.add("(max-width: 767px)", () => {
        gsap.from(list.current, {
          xPercent: 50,
          rotate: -4,
          opacity: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: list.current, start: "top 88%" },
        });
      });
      gsap.from("[data-proj-title] > span", {
        yPercent: 110,
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.08,
        scrollTrigger: { trigger: "[data-proj-title]", start: "top 85%" },
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="loyihalar"
      className="relative overflow-x-clip bg-ink px-5 py-20 md:px-10 md:py-40"
      onPointerMove={(e) => {
        x.set(e.clientX);
        y.set(e.clientY);
      }}
    >
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end md:gap-8">
          <div>
            <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
              <span className="text-turq">04</span>
              <span className="h-px w-16 bg-ivory/20" />
              Loyihalar
            </div>
            <h2
              data-proj-title
              data-no-reveal
              className="font-display text-[min(8.6vw,6rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em]"
            >
              <span className="block overflow-hidden">
                <span className="block">Kengash</span>
              </span>
              <span className="block overflow-hidden">
                <span className="text-gradient block">tashabbuslari</span>
              </span>
            </h2>
          </div>
          <p className="max-w-sm text-ivory/80">
            Samarqand viloyati tadbirkorlari ishtirokida amalga oshirilayotgan ijtimoiy, ilmiy va ishbilarmonlik
            tashabbuslari.
          </p>
        </div>

        <ul ref={list} className="rail md:border-t md:border-ivory/10" onPointerLeave={() => setActive(null)}>
          {PROJECTS.map((p, i) => (
            <li
              key={p.title}
              data-row
              data-cursor="view"
              data-cursor-label="Ko‘rish"
              onPointerEnter={() => setActive(i)}
              className="group relative flex flex-col-reverse justify-end overflow-hidden rounded-3xl border border-ivory/10 bg-ink-2 p-4 md:block md:overflow-visible md:rounded-none md:border-x-0 md:border-t-0 md:bg-transparent md:p-0"
            >
              <div className="absolute inset-0 origin-bottom scale-y-0 bg-ivory transition-transform duration-700 ease-expo group-hover:scale-y-100 max-md:hidden" />
              <div className="relative grid grid-cols-12 items-center gap-3 pb-1 transition-colors duration-500 md:gap-4 md:py-10 md:group-hover:text-ink">
                <span className="col-span-2 font-mono text-xs text-mist md:col-span-1 md:group-hover:text-ink/60">0{i + 1}</span>
                <h3 className="col-span-10 font-display text-3xl font-semibold uppercase tracking-tight transition-transform duration-700 ease-expo md:col-span-5 md:text-5xl md:group-hover:translate-x-4">
                  {p.title}
                </h3>
                <p className="col-span-12 text-sm text-ivory/80 md:col-span-3 md:group-hover:text-ink/70">{p.text}</p>
                <span className="col-span-8 font-mono text-[11.5px] uppercase tracking-[0.25em] text-turq md:col-span-2 md:group-hover:text-ink">
                  {p.kind}
                  <br />
                  <span className="text-ivory/65 md:group-hover:text-ink/60">{p.meta}</span>
                </span>
                <span className="col-span-4 flex justify-end md:col-span-1">
                  <span className="grid size-12 place-items-center rounded-full border border-ivory/15 transition-all duration-700 ease-expo md:group-hover:rotate-45 md:group-hover:border-ink md:group-hover:bg-ink md:group-hover:text-ivory">
                    <ArrowUpRight className="size-5" />
                  </span>
                </span>
              </div>
              <div className="relative mb-4 aspect-[16/10] overflow-hidden rounded-2xl md:hidden">
                <Art colors={p.colors} index={i} />
              </div>
            </li>
          ))}
        </ul>
        <SwipeHint className="md:hidden" />
      </div>

      {/* floating preview that follows the pointer (desktop) */}
      <motion.div
        className="pointer-events-none fixed left-0 top-0 z-30 hidden aspect-[4/5] w-[300px] md:block"
        style={{ x: sx, y: sy, translateX: "-50%", translateY: "-50%" }}
      >
        <AnimatePresence mode="popLayout">
          {active !== null && (
            <motion.div
              key={active}
              className="absolute inset-0 overflow-hidden rounded-3xl shadow-[0_40px_120px_-20px_rgb(0_0_0/0.9)]"
              initial={{ opacity: 0, scale: 0.6, rotate: -8, clipPath: "inset(50% 50% 50% 50% round 24px)" }}
              animate={{ opacity: 1, scale: 1, rotate: 0, clipPath: "inset(0% 0% 0% 0% round 24px)" }}
              exit={{ opacity: 0, scale: 0.8, rotate: 6 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              <Art colors={PROJECTS[active].colors} index={active} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
