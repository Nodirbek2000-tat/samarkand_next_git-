"use client";

import { useRef } from "react";
import { Network, LineChart, Landmark, ShieldCheck } from "lucide-react";
import { gsap, SplitText } from "@/lib/gsap";
import { useSectionSetup } from "@/lib/section-setup";
import { heavyEffects } from "@/lib/heavy-effects";
import { followPointer, spotlightAt } from "@/lib/pointer";

// the council's official goals (client document; the same text sits on /about)
const CARDS = [
  {
    icon: Network,
    title: "Kooperatsiya",
    text: "Viloyat korxonalari o‘rtasida kooperatsion aloqalarni rivojlantirish.",
  },
  {
    icon: LineChart,
    title: "Zamonaviy boshqaruv",
    text: "Tadbirkorlik subyektlarida zamonaviy boshqaruv tamoyillarini joriy etish.",
  },
  {
    icon: Landmark,
    title: "Sifatli davlat xizmati",
    text: "Davlat muassasalari tomonidan biznesga sifatli xizmat ko‘rsatilishiga erishish.",
  },
  {
    icon: ShieldCheck,
    title: "Huquqlar himoyasi",
    text: "Tadbirkorlarning qonuniy huquqlarini himoya qilish.",
  },
];

export function Manifesto() {
  const root = useRef<HTMLElement>(null);

  useSectionSetup(
    root,
    () => {
      gsap.from("[data-card]", {
        y: 80,
        opacity: 0,
        rotateX: -25,
        transformOrigin: "50% 100%",
        duration: 1.3,
        ease: "expo.out",
        stagger: 0.1,
        scrollTrigger: { trigger: "[data-cards]", start: "top 85%" },
      });

      // weak machines: the text is simply there (lighting dozens of words per frame and turning the ring
      // with the scroll repaint the screen on every frame)
      return heavyEffects(() => {
        SplitText.create("[data-manifesto]", {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.12 },
              {
                opacity: 1,
                ease: "none",
                stagger: 0.1,
                scrollTrigger: { trigger: "[data-manifesto]", start: "top 80%", end: "bottom 45%", scrub: true },
              },
            ),
        });
        gsap.to("[data-ring]", {
          rotate: 180,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true },
        });
      }, root.current);
    },
  );

  const onMove = (e: React.PointerEvent<HTMLElement>) => followPointer(e, spotlightAt);

  return (
    <section ref={root} id="kengash" data-cv className="relative overflow-hidden bg-ink px-5 py-20 md:px-10 md:py-44">
      <svg
        data-ring
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -right-40 top-10 size-[640px] opacity-[0.12] md:-right-20"
        fill="none"
        strokeWidth="0.6"
        style={{ stroke: "var(--color-turq)" }}
        aria-hidden
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="100" y="100" width="200" height="200" transform={`rotate(${i * 7.5} 200 200)`} />
        ))}
        <circle cx="200" cy="200" r="190" />
        <circle cx="200" cy="200" r="60" />
      </svg>

      <div className="relative mx-auto max-w-[1600px]">
        <div className="mb-14 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
          <span className="text-turq">01</span>
          <span className="h-px w-16 bg-ivory/20" />
          Kengash haqida
        </div>

        <p
          data-manifesto
          className="max-w-[22ch] font-display text-[9vw] font-medium leading-[1.02] tracking-[-0.03em] md:max-w-[26ch] md:text-[5.2vw]"
        >
          Biz mintaqaning biznes va investitsiya muhitini <span className="font-accent text-turq">yaxshilashga</span>, jamiyatda
          tadbirkorlar nufuzini <span className="font-accent text-gold">mustahkamlashga</span> va korxonalarning barqaror
          rivojlanishiga hissa qo‘shamiz.
        </p>

        {/* the council's slogan */}
        <p className="mt-10 flex flex-wrap items-baseline gap-x-4 gap-y-1 md:mt-12">
          <span className="font-mono text-[12px] uppercase tracking-[0.22em] text-mist">Shior</span>
          <span className="font-accent text-2xl text-gold md:text-3xl">Tadbirkorlikni jadal rivojlantirish sari birgamiz.</span>
        </p>

        <p className="mt-14 font-mono text-[12px] uppercase tracking-[0.22em] text-mist md:mt-20">Maqsadlarimiz</p>
        <div data-cards className="mt-5 grid gap-4 [perspective:1200px] sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map(({ icon: Icon, title, text }, i) => (
            <article
              key={title}
              data-card
              data-cursor="hover"
              onPointerMove={onMove}
              className="group relative overflow-hidden rounded-3xl border border-ivory/10 bg-ink-2 p-7 transition-colors duration-700 hover:border-turq/40"
            >
              <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="relative flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl border border-ivory/10 bg-ink-3 text-turq transition-transform duration-700 ease-expo group-hover:-rotate-12 group-hover:scale-110">
                  <Icon className="size-5" />
                </span>
                <span className="font-mono text-[12.5px] text-mist">0{i + 1}</span>
              </div>
              <h3 className="relative mt-10 font-display text-xl font-semibold">{title}</h3>
              <p className="relative mt-3 text-sm leading-relaxed text-ivory/80">{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
