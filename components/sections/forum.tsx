"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Award, CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { useLenis } from "@/components/providers/smooth-scroll";
import { Roll } from "@/components/roll";
import { CATEGORIES, CHAMPIONS, FORUM, sortByCategory, type ForumCategory } from "@/lib/forum-data";
import { CatChip, NominationCard, PagerButton } from "@/components/forum/ui";

// One behaviour on every screen: the section stays in place and each scroll step is one forum, 2023 → 2024 → 2025.
// Inside a forum the visitor filters by category and flips the cards with ‹ › — the page itself does not scroll.
const WIDE = "(min-width: 1280px)"; // title on the left, cards on the right
const TABLET = "(min-width: 768px)";
const TALL = "(min-height: 860px)";
/** too short to hold the stage (phones in landscape): the section simply scrolls, years stay clickable */
const FITS = "(min-height: 600px)";
const ease = [0.16, 1, 0.3, 1] as const;

// every forum, its nominations grouped by category
const YEARS = FORUM.map((y) => ({ ...y, nominations: sortByCategory(y.nominations) }));

export function Forum() {
  const root = useRef<HTMLElement>(null);
  const trigger = useRef<ScrollTrigger | null>(null);
  const lastYear = useRef(0);
  const lenis = useLenis();
  const [pinned, setPinned] = useState(false);
  const [wide, setWide] = useState(false);
  const [perView, setPerView] = useState(1); // cards on screen at once
  const [view, setView] = useState(0); // which group of cards (‹ ›)
  const [yi, setYi] = useState(0);
  const [cat, setCat] = useState<ForumCategory | "all">("all");

  const y = YEARS[yi];
  const winners = y.nominations.reduce((s, n) => s + n.winners.length, 0);
  const cats = useMemo(() => {
    const counts = new Map<ForumCategory, number>();
    y.nominations.forEach((n) => counts.set(n.cat, (counts.get(n.cat) ?? 0) + 1));
    return [...counts];
  }, [y]);
  const shown = cat === "all" ? y.nominations : y.nominations.filter((n) => n.cat === cat);
  const views = Math.max(1, Math.ceil(shown.length / perView));
  const onScreen = shown.slice(view * perView, view * perView + perView);
  const from = view * perView + 1;
  const to = Math.min(shown.length, (view + 1) * perView);

  const showYear = (i: number) => {
    lastYear.current = i;
    setYi(i);
    setCat("all");
    setView(0);
  };
  const pickYear = (i: number) => {
    const st = trigger.current;
    // pinned: the year follows the scroll, so a click scrolls to that year
    if (st) return lenis?.scrollTo(st.start + ((i + 0.5) / YEARS.length) * (st.end - st.start), { duration: 1.2 });
    showYear(i);
  };
  const pickCat = (c: ForumCategory | "all") => {
    setCat(c);
    setView(0);
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ wide: WIDE, tablet: TABLET, tall: TALL, fits: FITS }, (ctx) => {
        const { wide, tablet, tall, fits } = ctx.conditions as Record<"wide" | "tablet" | "tall" | "fits", boolean>;
        setWide(wide);
        setPerView(wide ? (tall ? 4 : 2) : tablet && tall ? 2 : 1);
        setView(0);
        if (!fits) return;
        setPinned(true);
        trigger.current = ScrollTrigger.create({
          trigger: "[data-forum-stage]",
          start: "top top",
          end: () => `+=${YEARS.length * 80}%`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const i = Math.min(YEARS.length - 1, Math.floor(self.progress * YEARS.length));
            if (i !== lastYear.current) showYear(i);
            gsap.set("[data-forum-bar]", { scaleY: self.progress });
            gsap.set("[data-forum-bar-x]", { scaleX: self.progress });
          },
        });
        // re-created on a resize: keep the refresh order = page order (see components/providers/smooth-scroll)
        ScrollTrigger.sort();
        return () => {
          trigger.current = null;
          setPinned(false);
        };
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

  // the stage changes height when the layout switches: the pinned scenes below must re-measure
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    let t = 0;
    let last = el.offsetHeight;
    const ro = new ResizeObserver(() => {
      if (el.offsetHeight === last) return;
      last = el.offsetHeight;
      clearTimeout(t);
      t = window.setTimeout(() => ScrollTrigger.refresh(), 200);
    });
    ro.observe(el);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, []);

  return (
    <section ref={root} id="forum" className="relative bg-ink-2">
      <div
        data-forum-stage
        className={cn(
          "relative flex overflow-x-clip px-5 md:px-10",
          pinned ? "h-svh pb-5" : "py-20",
          pinned && (wide ? "items-center pt-24" : "flex-col justify-center pt-20"),
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_30%,color-mix(in_oklab,var(--color-gold)_10%,transparent),transparent_55%)]" />

        <div className={cn("relative mx-auto grid w-full max-w-[1600px]", wide ? "grid-cols-12 items-center gap-12" : "gap-5 md:gap-7")}>
          {/* title + years */}
          <div className={cn(wide && "col-span-4")}>
            <div
              className={cn(
                "flex items-center gap-4 font-mono uppercase tracking-[0.22em] text-mist",
                wide ? "mb-8 text-[12.5px]" : "mb-3 text-[11.5px]",
              )}
            >
              <span className="text-turq">06</span>
              <span className="h-px w-12 bg-ivory/20" />
              Sanoatchilar forumi
            </div>
            <h2
              data-forum-title
              data-no-reveal
              className={cn(
                "font-display font-semibold uppercase tracking-[-0.03em]",
                wide ? "text-[min(4.5rem,4vw)]" : "text-[clamp(1.85rem,8.4vw,3.6rem)]",
                "leading-[0.95]", // after the size: tailwind-merge drops a leading-* that precedes a text-* size
              )}
            >
              <span className="block overflow-hidden">
                <span className="block">Eng ilg‘orlar</span>
              </span>
              <span className="block overflow-hidden">
                <span className="text-gradient block">e’tirofi</span>
              </span>
            </h2>
            {wide && (
              <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/85">
                Har yili forumda lokalizatsiya, kooperatsiya va eksport masalalari muhokama qilinadi, viloyatning eng
                ilg‘or korxonalari taqdirlanadi.
              </p>
            )}

            {wide ? (
              <div className="relative mt-10 flex gap-5">
                <div className="relative w-px shrink-0 bg-ivory/10">
                  <div data-forum-bar className="absolute inset-0 origin-top scale-y-0 bg-gradient-to-b from-turq to-gold" />
                </div>
                <div className="flex flex-col gap-1">
                  {YEARS.map((yr, i) => (
                    <button
                      key={yr.year}
                      type="button"
                      data-cursor="hover"
                      aria-pressed={i === yi}
                      onClick={() => pickYear(i)}
                      className={cn("flex items-baseline gap-4 py-2 text-left transition-colors duration-500", i === yi ? "text-ivory" : "text-ivory/55 hover:text-ivory")}
                    >
                      <span className={cn("font-display font-semibold tabular-nums transition-[font-size] duration-500", i === yi ? "text-4xl" : "text-2xl")}>
                        {yr.year}
                      </span>
                      <span className="font-mono text-[11.5px] uppercase tracking-[0.15em] text-mist">{yr.nominations.length} nominatsiya</span>
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
                      data-cursor="hover"
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
                    <div data-forum-bar-x className="h-full origin-left scale-x-0 bg-gradient-to-r from-turq to-gold" />
                  </div>
                )}
              </div>
            )}

            {wide && (
              <Link
                href="/business-environment/forum"
                data-cursor="hover"
                className="mt-8 inline-flex items-center gap-2 font-mono text-[12.5px] uppercase tracking-[0.18em] text-gold"
              >
                <Roll>Barcha forumlar</Roll> <ArrowUpRight className="size-4" />
              </Link>
            )}
          </div>

          {/* the forum on screen */}
          <div className={cn("relative min-w-0", wide && "col-span-8")}>
            <div
              className={cn(
                "pointer-events-none absolute -right-2 select-none font-display font-bold leading-none tracking-[-0.06em] text-ivory/[0.04]",
                wide ? "-top-32 text-[15vw]" : "-top-10 text-[30vw]",
              )}
            >
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={y.year}
                  className="block"
                  initial={{ y: "40%", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-40%", opacity: 0 }}
                  transition={{ duration: 0.8, ease }}
                >
                  {y.year}
                </motion.span>
              </AnimatePresence>
            </div>

            {wide ? (
              <div className="relative flex flex-wrap items-center gap-3">
                <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ivory">
                  <CalendarDays className="size-4 text-turq" /> {y.date}
                </span>
                <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ivory">
                  <Award className="size-4 text-gold" /> {y.resultsYear}-yil yakunlari · {y.nominations.length} nominatsiya ·{" "}
                  {winners} g‘olib
                </span>
                <Link
                  href={`/business-environment/forum/${y.year}`}
                  data-cursor="hover"
                  className="ml-auto inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-[0.18em] text-ivory/80 hover:text-gold"
                >
                  <Roll>To‘liq natijalar</Roll> <ArrowUpRight className="size-4" />
                </Link>
              </div>
            ) : (
              <div className="relative flex items-center gap-3 text-[13px] text-ivory/80">
                <CalendarDays className="size-4 shrink-0 text-turq" />
                <span className="min-w-0 truncate">
                  {y.date} · {winners} g‘olib
                </span>
                <Link href={`/business-environment/forum/${y.year}`} className="ml-auto inline-flex shrink-0 items-center gap-1 font-semibold text-gold">
                  To‘liq <ArrowUpRight className="size-4" />
                </Link>
              </div>
            )}

            {/* categories: a filter, one row (slides sideways when it must) */}
            <div className="relative mt-4 flex gap-2 overflow-x-auto pb-1 [mask-image:linear-gradient(to_right,#000_90%,transparent)] [scrollbar-width:none] xl:mt-5">
              <CatChip active={cat === "all"} onClick={() => pickCat("all")} label="Hammasi" count={y.nominations.length} small />
              {cats.map(([c, count]) => (
                <CatChip key={c} active={cat === c} onClick={() => pickCat(c)} label={CATEGORIES[c].label} count={count} color={CATEGORIES[c].color} small />
              ))}
            </div>

            <AnimatePresence mode="wait">
              <motion.ul
                key={`${y.year}-${cat}-${view}`}
                className={cn("relative mt-4 grid gap-3 [perspective:1200px]", perView > 1 && "grid-cols-2")}
                exit={{ opacity: 0, y: -24, transition: { duration: 0.25 } }}
              >
                {onScreen.map((n, i) => (
                  <motion.li
                    key={n.title}
                    initial={{ opacity: 0, y: 40, rotateX: -20 }}
                    animate={{ opacity: 1, y: 0, rotateX: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.7, ease }}
                  >
                    <NominationCard n={n} index={y.nominations.indexOf(n)} compact />
                  </motion.li>
                ))}
              </motion.ul>
            </AnimatePresence>

            {/* the rest of this forum, without scrolling the page */}
            {views > 1 && (
              <div className="mt-4 flex items-center justify-end gap-3">
                <span className="mr-auto font-mono text-[12px] uppercase tracking-[0.16em] text-mist">
                  {from === to ? from : `${from}–${to}`} / {shown.length} nominatsiya
                </span>
                <PagerButton label="Oldingi nominatsiyalar" disabled={view === 0} onClick={() => setView((v) => v - 1)}>
                  <ChevronLeft className="size-5" />
                </PagerButton>
                <PagerButton label="Keyingi nominatsiyalar" disabled={view >= views - 1} onClick={() => setView((v) => v + 1)}>
                  <ChevronRight className="size-5" />
                </PagerButton>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* every first-place / winning company, as a marquee */}
      <div className="relative overflow-hidden border-y border-ivory/10 py-8">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink-2 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink-2 to-transparent" />
        <div className="marquee-track flex w-max items-center gap-14 pr-14" style={{ "--marquee-speed": "90s" } as React.CSSProperties}>
          {[...CHAMPIONS, ...CHAMPIONS].map((b, i) => (
            <span
              key={i}
              aria-hidden={i >= CHAMPIONS.length}
              className="whitespace-nowrap font-display text-2xl font-semibold uppercase tracking-tight text-ivory/60 transition-colors duration-300 hover:text-gold md:text-3xl"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
