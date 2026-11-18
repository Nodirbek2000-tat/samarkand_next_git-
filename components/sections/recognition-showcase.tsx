"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowUpRight, Award, ChevronLeft, ChevronRight, Crown, GraduationCap, Medal, Star } from "lucide-react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { useSectionSetup } from "@/lib/section-setup";
import { awardKind, RECOGNITIONS, RECOGNITION_INTRO, type AwardKind, type RecognitionItem } from "@/lib/recognition-data";
import { cn } from "@/lib/utils";
import { Roll } from "@/components/roll";
import { useLenis } from "@/components/providers/smooth-scroll";
import { PagerButton } from "@/components/forum/ui";
import { MottoSeal } from "@/components/motto-seal";
import { DEVOTEE } from "@/lib/mottos";

// The state awards, honorary titles and the council's own honours, year by year — it behaves like the forum
// above it: the section stays in place and each scroll step is one year; inside a year ‹ › flips the people.
const YEARS = [...new Set(RECOGNITIONS.map((r) => r.year))]
  .sort((a, b) => a - b)
  .map((year) => ({ year, people: RECOGNITIONS.filter((r) => r.year === year) }));
const WIDE = "(min-width: 1280px)";
const TABLET = "(min-width: 768px)";
const TALL = "(min-height: 860px)";
/** too short to hold the stage (phones in landscape): the section simply scrolls, the years stay clickable */
const FITS = "(min-height: 600px)";
const ease = [0.16, 1, 0.3, 1] as const;

const KIND: Record<AwardKind, { icon: typeof Award; badge: string; color: string }> = {
  order: { icon: Star, badge: "from-[#f6d77b] to-[#b8862b] text-[#3a2600]", color: "var(--color-gold)" },
  medal: { icon: Medal, badge: "from-[#eef1f5] to-[#9aa4b2] text-[#1d2430]", color: "var(--color-mist)" },
  title: { icon: Crown, badge: "from-turq to-lapis text-white", color: "var(--color-turq)" },
  academy: { icon: GraduationCap, badge: "from-lapis to-ember text-white", color: "var(--color-lapis)" },
  other: { icon: Award, badge: "from-gold to-ember text-ink", color: "var(--color-ember)" },
};

export function RecognitionShowcase() {
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const lastYear = useRef(0);
  const lenis = useLenis();
  const [pinned, setPinned] = useState(false);
  const [wide, setWide] = useState(false);
  const [perView, setPerView] = useState(1);
  const [view, setView] = useState(0);
  const [yi, setYi] = useState(0);

  const y = YEARS[yi];
  const views = Math.max(1, Math.ceil(y.people.length / perView));
  const onScreen = useMemo(() => y.people.slice(view * perView, view * perView + perView), [y, view, perView]);
  const from = view * perView + 1;
  const to = Math.min(y.people.length, (view + 1) * perView);

  const showYear = (i: number) => {
    lastYear.current = i;
    setYi(i);
    setView(0);
  };
  const pickYear = (i: number) => {
    const st = trigger.current;
    // pinned: the year follows the scroll, so a click scrolls to that year
    if (st) return lenis?.scrollTo(st.start + ((i + 0.5) / YEARS.length) * (st.end - st.start), { duration: 1.2 });
    showYear(i);
  };

  // the layout this screen gets, known before the pin is measured (as in the forum above)
  useEffect(() => {
    const q = (media: string) => window.matchMedia(media).matches;
    const isWide = q(WIDE);
    /* eslint-disable react-hooks/set-state-in-effect */
    setWide(isWide);
    setPerView(isWide ? (q(TALL) ? 4 : 2) : q(TABLET) && q(TALL) ? 2 : 1);
    setPinned(q(FITS));
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useSectionSetup(root, () => {
    const mm = gsap.matchMedia();
    mm.add({ wide: WIDE, tablet: TABLET, tall: TALL, fits: FITS }, (ctx) => {
      const { wide, tablet, tall, fits } = ctx.conditions as Record<"wide" | "tablet" | "tall" | "fits", boolean>;
      setWide(wide);
      setPerView(wide ? (tall ? 4 : 2) : tablet && tall ? 2 : 1);
      setView(0);
      if (!fits) return;
      setPinned(true);
      let bar: Element | null = null;
      let setBar: ((v: number) => void) | null = null;
      trigger.current = ScrollTrigger.create({
        trigger: "[data-rec-stage]",
        start: "top top",
        end: () => `+=${YEARS.length * 70}%`,
        pin: true,
        scrub: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const i = Math.min(YEARS.length - 1, Math.floor(self.progress * YEARS.length));
          if (i !== lastYear.current) showYear(i);
          const el = root.current?.querySelector(wide ? "[data-rec-bar]" : "[data-rec-bar-x]") ?? null;
          if (el !== bar) {
            bar = el;
            setBar = el ? (gsap.quickSetter(el, wide ? "scaleY" : "scaleX") as (v: number) => void) : null;
          }
          setBar?.(self.progress);
        },
      });
      ScrollTrigger.sort();
      return () => {
        trigger.current = null;
        setPinned(false);
      };
    });
    gsap.from("[data-rec-title] > span > span", {
      yPercent: 110,
      stagger: 0.1,
      duration: 1.2,
      ease: "expo.out",
      scrollTrigger: { trigger: "[data-rec-title]", start: "top 85%" },
    });
    return () => mm.revert();
  });

  return (
    <section ref={root} id="etirof" className="relative border-t border-ivory/10 bg-ink-2">
      <div
        data-rec-stage
        className={cn(
          "relative flex overflow-x-clip px-5 md:px-10",
          pinned ? "h-svh pb-5" : "py-20",
          pinned && (wide ? "items-center pt-24" : "flex-col justify-center pt-20"),
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_30%,color-mix(in_oklab,var(--color-turq)_8%,transparent),transparent_55%)]" />
        {/* tablets: the pinned cards fill the corner, so it sits out between md and xl */}
        <MottoSeal motto={DEVOTEE} className="bottom-4 right-4 md:hidden xl:block xl:bottom-8 xl:right-10" />

        <div
          className={cn(
            "relative mx-auto grid w-full max-w-[1600px]",
            wide ? "grid-cols-12 items-center gap-12" : "gap-5 md:gap-7",
          )}
        >
          {/* title + years */}
          <div className={cn(wide && "col-span-4")}>
            <div
              className={cn(
                "flex items-center gap-4 font-mono uppercase tracking-[0.22em] text-mist",
                wide ? "mb-8 text-[12.5px]" : "mb-3 text-[11.5px]",
              )}
            >
              <span className="text-turq">★</span>
              <span className="h-px w-12 bg-ivory/20" />
              Davlat mukofotlari
            </div>
            <h2
              data-rec-title
              data-no-reveal
              className={cn(
                "font-display font-semibold uppercase tracking-[-0.03em]",
                wide ? "text-[min(4.5rem,4vw)]" : "text-[clamp(1.85rem,8.4vw,3.6rem)]",
                "leading-[0.95]",
              )}
            >
              <span className="block overflow-hidden">
                <span className="block">Eng ilg‘orlar</span>
              </span>
              <span className="block overflow-hidden">
                <span className="text-gradient block">e’tirofi</span>
              </span>
            </h2>
            {wide && <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/85">{RECOGNITION_INTRO.subtitle}</p>}

            {wide ? (
              <div className="relative mt-10 flex gap-5">
                <div className="relative w-px shrink-0 bg-ivory/10">
                  <div data-rec-bar className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-turq to-gold" />
                </div>
                <div className="flex flex-col gap-1">
                  {YEARS.map((yr, i) => (
                    <button
                      key={yr.year}
                      type="button"
                      aria-pressed={i === yi}
                      onClick={() => pickYear(i)}
                      className={cn(
                        "flex items-baseline gap-4 py-2 text-left transition-colors duration-500",
                        i === yi ? "text-ivory" : "text-ivory/55 hover:text-ivory",
                      )}
                    >
                      <span
                        className={cn(
                          "origin-bottom-left font-display text-4xl font-semibold tabular-nums transition-transform duration-500",
                          i !== yi && "scale-[0.667]",
                        )}
                      >
                        {yr.year}
                      </span>
                      <span className="font-mono text-[11.5px] uppercase tracking-[0.15em] text-mist">
                        {yr.people.length} ta mukofot
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-5">
                <div className="flex gap-2">
                  {YEARS.map((yr, i) => (
                    <button
                      key={yr.year}
                      type="button"
                      aria-pressed={i === yi}
                      onClick={() => pickYear(i)}
                      className={cn(
                        "flex-1 rounded-full border py-2 font-display text-lg font-semibold tabular-nums transition-colors duration-500 md:flex-none md:px-7",
                        i === yi ? "border-gold bg-gold/10 text-ivory" : "border-ivory/15 text-ivory/55",
                      )}
                    >
                      {yr.year}
                    </button>
                  ))}
                </div>
                {pinned && (
                  <div className="mt-3 h-px bg-ivory/10">
                    <div data-rec-bar-x className="h-full origin-left scale-x-0 bg-gradient-to-r from-turq to-gold" />
                  </div>
                )}
              </div>
            )}

            {wide && (
              <Link
                href="/council/recognition"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[12.5px] uppercase tracking-[0.18em] text-gold"
              >
                <Roll>Barcha e’tiroflar</Roll> <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>

          {/* the year on screen */}
          <div className={cn("relative min-w-0", wide && "col-span-8")}>
            <div
              className={cn(
                "pointer-events-none absolute -right-2 select-none font-display font-bold leading-none tracking-[-0.06em] text-ivory/[0.04]",
                wide ? "-top-32 text-[15vw]" : "-top-10 text-[30vw]",
              )}
            >
              <AnimatePresence initial={false}>
                <m.span
                  key={y.year}
                  className="absolute right-0 top-0"
                  initial={{ y: "40%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-40%", opacity: 0 }}
                  transition={{ duration: 0.8, ease }}
                >
                  {y.year}
                </m.span>
              </AnimatePresence>
            </div>

            {!wide && (
              <div className="relative mb-3 flex items-center gap-3 text-[13px] text-ivory/80">
                <Award className="size-4 shrink-0 text-gold" />
                <span className="min-w-0 truncate">
                  {y.year}-yil · {y.people.length} ta mukofot
                </span>
                <Link
                  href="/council/recognition"
                  className="ml-auto inline-flex shrink-0 items-center gap-1 font-semibold text-gold"
                >
                  Barchasi <ArrowUpRight className="size-4" />
                </Link>
              </div>
            )}

            <AnimatePresence mode="wait">
              <m.ul
                key={`${y.year}-${view}`}
                className={cn("relative grid gap-3", perView > 1 && "grid-cols-2")}
                exit={{ opacity: 0, y: -24, transition: { duration: 0.25 } }}
              >
                {onScreen.map((r, i) => (
                  <m.li
                    key={r.fullName + r.award}
                    initial={{ opacity: 0, y: 32 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.7, ease }}
                  >
                    <Person r={r} />
                  </m.li>
                ))}
              </m.ul>
            </AnimatePresence>

            {/* the rest of this year, without scrolling the page */}
            {views > 1 && (
              <div className="mt-4 flex items-center justify-end gap-3">
                <span className="mr-auto font-mono text-[12px] uppercase tracking-[0.16em] text-mist">
                  {from === to ? from : `${from}–${to}`} / {y.people.length} mukofot
                </span>
                <PagerButton label="Oldingilar" disabled={view === 0} onClick={() => setView((v) => v - 1)}>
                  <ChevronLeft className="size-5" />
                </PagerButton>
                <PagerButton label="Keyingilar" disabled={view >= views - 1} onClick={() => setView((v) => v + 1)}>
                  <ChevronRight className="size-5" />
                </PagerButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Person({ r }: { r: RecognitionItem }) {
  const { icon: Icon, badge, color } = KIND[awardKind(r.award)];
  const initials = r.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <article
      className="relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-ivory/10 bg-ink p-5 md:p-6"
      style={{ "--c": color } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--c)_16%,transparent),transparent_65%)]" />
      <div className="relative flex flex-1 items-start gap-4">
        <span
          aria-hidden
          className="grid size-12 shrink-0 place-items-center rounded-full border border-ivory/15 bg-ink-2 font-display text-base font-semibold tracking-tight"
        >
          {initials}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold leading-snug">{r.fullName}</h3>
          {r.company && <p className="mt-1 line-clamp-2 text-sm leading-snug text-ivory/75">{r.company}</p>}
        </div>
      </div>
      <div className="relative mt-4 flex items-center gap-3 border-t border-ivory/10 pt-4">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full bg-gradient-to-br shadow-md", badge)}>
          <Icon className="size-4" />
        </span>
        <span
          className="text-sm font-semibold leading-snug"
          style={{ color: "color-mix(in oklab, var(--c) 70%, var(--color-ivory))" }}
        >
          {r.award}
        </span>
      </div>
    </article>
  );
}
