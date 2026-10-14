"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Award, CalendarDays } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const YEARS = [
  {
    year: "2023",
    date: "30–31 may 2023",
    results: "2022-yil yakunlari",
    count: 8,
    winners: [
      { n: "Ishlab chiqarishni lokalizatsiya qilish", w: "AZIA METALL PROF" },
      { n: "Sanoat kooperatsiyasi", w: "STEKLOPLASTIK" },
      { n: "Eng yirik investitsiya loyihasi", w: "BAHT SAMARKAND TEKS" },
      { n: "Eng namunali brend", w: "SAG · Sam Antep Gilam" },
    ],
  },
  {
    year: "2024",
    date: "16–17 may 2024",
    results: "2023-yil yakunlari",
    count: 12,
    winners: [
      { n: "Ishlab chiqarishni lokalizatsiya qilish", w: "NBA ALLIANZ" },
      { n: "Sanoat kooperatsiyasi", w: "MITAN YOG‘DU ELEKTRIK" },
      { n: "Oziq-ovqat sanoati", w: "MAROQAND GOLD OIL EXTRACTION" },
      { n: "Sanoat mahsulotlari eksportyori", w: "BRADJUS" },
    ],
  },
  {
    year: "2025",
    date: "17–18 aprel 2025",
    results: "2024-yil yakunlari",
    count: 4,
    winners: [
      { n: "Sanoat kooperatsiyasi", w: "SAM FERRE" },
      { n: "Ishlab chiqarishni lokalizatsiya qilish", w: "AZIA METALL PROF" },
      { n: "Sanoat mahsulotlari eksporti", w: "NAVOBOD NASLLI PARRANDA" },
      { n: "Eng namunali brend", w: "AGROMIR · BLISS, MEVA JUICE" },
    ],
  },
];

const BRANDS = [
  "AZIA METALL PROF",
  "SAG",
  "AGROMIR",
  "SIYOB GROUP",
  "SXF GROUP",
  "SAM FERRE",
  "STEKLOPLASTIK",
  "MITAN YOG‘DU ELEKTRIK",
  "BAHT SAMARKAND TEKS",
  "NBA ALLIANZ",
  "BRADJUS",
  "SHARQ SANOAT",
  "SOF EXPO SAMARKAND",
  "GULOBOD MEBEL",
];

export function Forum() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px)", () => {
        ScrollTrigger.create({
          trigger: "[data-forum-stage]",
          start: "top top",
          end: `+=${YEARS.length * 80}%`,
          pin: true,
          scrub: true,
          onUpdate: (self) => {
            const i = Math.min(YEARS.length - 1, Math.floor(self.progress * YEARS.length));
            setActive((prev) => (prev === i ? prev : i));
            gsap.set("[data-forum-bar]", { scaleY: self.progress });
          },
        });
      });
      gsap.from("[data-forum-title] > span > span", {
        yPercent: 110,
        stagger: 0.1,
        duration: 1.2,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-forum-title]", start: "top 85%" },
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const y = YEARS[active];

  return (
    <section ref={root} id="forum" className="relative bg-ink-2">
      <div data-forum-stage className="relative overflow-hidden px-5 py-24 md:px-10 lg:flex lg:h-svh lg:items-center lg:py-0">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,rgb(46_232_214/0.12),transparent_55%)]" />

        <div className="relative mx-auto grid w-full max-w-[1600px] gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
              <span className="text-turq">06</span>
              <span className="h-px w-16 bg-ivory/20" />
              Sanoatchilar forumi
            </div>
            <h2
              data-forum-title
              className="font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-7xl"
            >
              <span className="block overflow-hidden">
                <span className="block">Eng yaxshilar</span>
              </span>
              <span className="block overflow-hidden">
                <span className="text-gradient block">e’tirofi</span>
              </span>
            </h2>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/85">
              Har yili forumda lokalizatsiya, kooperatsiya va eksport muammolari muhokama qilinadi, eng namunali
              korxonalar taqdirlanadi.
            </p>

            {/* year selector + progress */}
            <div className="mt-10 flex items-stretch gap-6">
              <div className="relative hidden w-px bg-ivory/10 lg:block">
                <div data-forum-bar className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-turq to-gold" />
              </div>
              <div className="flex gap-2 lg:flex-col">
                {YEARS.map((yr, i) => (
                  <button
                    key={yr.year}
                    type="button"
                    data-cursor="hover"
                    onClick={() => setActive(i)}
                    className={cn(
                      "rounded-full border px-5 py-2.5 text-left font-mono text-[13px] tracking-[0.15em] transition-all duration-500 lg:border-transparent lg:px-0 lg:py-1 lg:text-left",
                      i === active ? "border-turq text-turq lg:text-2xl" : "border-ivory/15 text-ivory/60 lg:text-base",
                    )}
                  >
                    Forum {yr.year}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="relative lg:col-span-7">
            <div className="pointer-events-none absolute -right-4 -top-24 select-none font-display text-[38vw] font-bold leading-none tracking-[-0.06em] text-ivory/[0.04] lg:-top-40 lg:text-[18vw]">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={y.year}
                  className="block"
                  initial={{ y: "40%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-40%", opacity: 0 }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {y.year}
                </motion.span>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={y.year}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative"
              >
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ivory">
                    <CalendarDays className="size-4 text-turq" /> {y.date}
                  </span>
                  <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ivory">
                    <Award className="size-4 text-gold" /> {y.results} · {y.count} nominatsiya
                  </span>
                </div>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {y.winners.map((w, i) => (
                    <motion.li
                      key={w.n + w.w}
                      initial={{ opacity: 0, y: 30, rotateX: -20 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: 0.08 * i, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                      className="group relative overflow-hidden rounded-3xl border border-ivory/10 bg-ink/80 p-6 backdrop-blur transition-colors duration-500 hover:border-gold/50"
                    >
                      <div className="absolute -right-10 -top-10 size-32 rounded-full bg-gold/10 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />
                      <div className="relative flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.15em] text-gold">
                        <Medal /> I darajali diplom
                      </div>
                      <p className="relative mt-5 text-sm text-ivory/80">{w.n}</p>
                      <p className="relative mt-2 font-display text-xl font-semibold leading-tight">{w.w}</p>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* winners marquee */}
      <div className="relative overflow-hidden border-y border-ivory/10 py-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-2 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-2 to-transparent" />
        <div className="marquee-track flex w-max items-center gap-14 pr-14" style={{ "--marquee-speed": "60s" } as React.CSSProperties}>
          {[...BRANDS, ...BRANDS].map((b, i) => (
            <span
              key={i}
              className="whitespace-nowrap font-display text-2xl font-semibold uppercase tracking-tight text-ivory/40 transition-colors duration-300 hover:text-gold md:text-3xl"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Medal() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden>
      <circle cx="12" cy="14" r="7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 3l4 5 4-5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 10.5l1.1 2.2 2.4.3-1.8 1.7.5 2.4-2.2-1.2-2.2 1.2.5-2.4-1.8-1.7 2.4-.3z" fill="currentColor" />
    </svg>
  );
}
