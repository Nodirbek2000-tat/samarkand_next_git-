"use client";

import { useRef } from "react";
import { Check, Crown } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { flushSetups, useSectionSetup } from "@/lib/section-setup";
import { followPointer, leavePointer } from "@/lib/pointer";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useCoverflow, SwipeHint } from "@/components/coverflow";
import { Roll } from "@/components/roll";

const TIERS = [
  { name: "YaTT va jismoniy shaxslar", fee: "5", note: "Yakka tartibdagi tadbirkorlar", accent: "var(--color-turq)" },
  { name: "Kichik korxonalar", fee: "10", note: "Yillik savdo 10 mlrd so‘mgacha", accent: "var(--color-lapis)" },
  { name: "O‘rta korxonalar", fee: "25", note: "Yillik savdo 10 mlrd so‘mdan ortiq", accent: "var(--color-ember)" },
  { name: "Yirik korxonalar", fee: "50", note: "Yillik savdo 100 mlrd so‘mdan ortiq", accent: "var(--color-gold)", featured: true },
];

const BENEFITS = [
  "Mintaqaning nufuzli tadbirkorlar hamjamiyati a’zosi bo‘lish",
  "Gaz, elektr, suv, kadastr xizmatlarini yaxshilash bo‘yicha takliflar bilan chiqish",
  "Kengash yig‘ilishlarida o‘z biznesingiz muammolarini ko‘tarish va yechim taklif qilish",
  "A’zo-tadbirkorlarning ilg‘or tajribasi bilan tanishish, g‘oyalar almashish",
  "Treninglar, seminarlar, xorijiy investorlar bilan uchrashuvlarda ishtirok etish",
];

export function Membership() {
  const root = useRef<HTMLElement>(null);
  const tiers = useRef<HTMLDivElement>(null);
  const lenis = useLenis();
  useCoverflow(tiers);

  useSectionSetup(
    root,
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px)", () => {
        gsap.from("[data-tier]", {
          y: 120,
          rotateY: -35,
          rotateX: 12,
          opacity: 0,
          stagger: 0.12,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: "[data-tiers]", start: "top 80%" },
        });
      });
      // phones: the tiers are a swipe carousel (coverflow owns each card's transform) — the row flies in
      mm.add("(max-width: 767px)", () => {
        gsap.from(tiers.current, {
          xPercent: 50,
          rotate: 4,
          opacity: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: tiers.current, start: "top 88%" },
        });
      });
      gsap.from("[data-benefit]", {
        opacity: 0,
        y: 24,
        stagger: 0.07,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-benefits]", start: "top 85%" },
      });
      return () => mm.revert();
    },
  );

  // mouse-only foil + tilt (touch would fight the phone carousel swipe); the foil's vars live on the foil
  const move = (e: React.PointerEvent<HTMLElement>) =>
    window.innerWidth >= 768 &&
    followPointer(
      e,
      (card, px, py) => {
        const foil = card.querySelector<HTMLElement>("[data-foil]");
        foil?.style.setProperty("--px", `${px * 100}%`);
        foil?.style.setProperty("--py", `${py * 100}%`);
        foil?.style.setProperty("--angle", `${px * 180 + py * 90}deg`);
      },
      16,
    );
  const leave = (e: React.PointerEvent<HTMLElement>) => window.innerWidth >= 768 && leavePointer(e);

  return (
    <section ref={root} id="azolik" data-cv className="relative overflow-hidden bg-ink px-5 py-20 md:px-10 md:py-40">
      <div className="pointer-events-none absolute -right-60 -top-60 size-[1000px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-gold)_12%,transparent),transparent_62%)]" />
      <div className="relative mx-auto max-w-[1600px]">
        <div className="mb-6 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end md:gap-8">
          <div>
            <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
              <span className="text-turq">08</span>
              <span className="h-px w-16 bg-ivory/20" />
              Kengashga a’zolik
            </div>
            <h2 className="font-display text-[min(12.4vw,3rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-8xl">
              Jamoaga
              <br />
              <span className="text-gradient">qo‘shiling</span>
            </h2>
          </div>
          <p className="max-w-md text-lg leading-relaxed text-ivory/85">
            Fond Ustavi va maqsadlarini tan oladigan mahalliy va xorijiy yuridik hamda jismoniy shaxslar a’zo bo‘lishi
            mumkin. Tavsiya etilgan yillik badallar:
          </p>
        </div>

        <div ref={tiers} data-tiers className="rail grid gap-4 [perspective:1400px] sm:grid-cols-2 xl:grid-cols-4">
          {TIERS.map((t) => (
            <article
              key={t.name}
              data-tier
              data-cursor="hover"
              onPointerMove={move}
              onPointerLeave={leave}
              className="group relative isolate flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[2rem] md:min-h-[420px] border border-ivory/10 bg-ink-2 p-8 [transform-style:preserve-3d]"
              style={{ "--accent": t.accent } as React.CSSProperties}
            >
              {/* holographic foil */}
              <div
                data-foil
                className="tier-foil pointer-events-none absolute inset-0 -z-10 opacity-0 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-60"
                style={{
                  background:
                    "conic-gradient(from var(--angle, 0deg) at var(--px, 50%) var(--py, 50%), #34d07a, #3b5bff, #ff7847, #ff8a1f, #34d07a)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: `radial-gradient(circle at 50% 120%, color-mix(in oklab, ${t.accent} 35%, transparent), transparent 60%)` }}
              />
              <div className="flex items-start justify-between">
                <span
                  className="rounded-full border px-3 py-1 font-mono text-[11.5px] uppercase tracking-[0.15em]"
                  // text: accent pulled toward the text colour so the deep lapis stays readable on both themes
                  style={{ borderColor: t.accent, color: `color-mix(in oklab, ${t.accent} 72%, var(--color-ivory))` }}
                >
                  {t.featured ? "Premium" : "A’zolik"}
                </span>
                {t.featured && <Crown className="size-5 text-gold" />}
              </div>
              <div>
                <div className="flex items-end gap-2 font-display">
                  <span className="text-8xl font-bold leading-none tracking-tighter">{t.fee}</span>
                  <span className="mb-2 text-lg font-medium text-ivory/80">mln so‘m</span>
                </div>
                <p className="mt-1 font-mono text-[12px] uppercase tracking-[0.15em] text-ivory/70">yiliga</p>
                <h3 className="mt-8 font-display text-2xl font-semibold leading-tight">{t.name}</h3>
                <p className="mt-2 text-ivory/80">{t.note}</p>
              </div>
            </article>
          ))}
        </div>
        <SwipeHint className="md:hidden" />

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <div className="relative overflow-hidden rounded-[2rem] border border-gold/30 bg-gradient-to-br from-gold/15 via-ink-2 to-ink-2 p-8 lg:col-span-4">
            <Crown className="size-7 text-gold" />
            <h3 className="mt-6 font-display text-2xl font-semibold">Faxriy a’zolik</h3>
            <p className="mt-3 leading-relaxed text-ivory/85">
              Mamlakat va mintaqa rivojiga katta hissa qo‘shgan, faol hayot tarzini olib borayotgan pensiya yoshidagi
              fuqarolar badalsiz a’zo bo‘lishi mumkin.
            </p>
            <button
              type="button"
              data-cursor="hover"
              onClick={() => (flushSetups(), lenis?.scrollTo("#aloqa", { duration: 1.8 }))}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-ivory px-6 font-mono text-[12.5px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-gold"
            >
              <Roll>Ariza yuborish</Roll>
            </button>
          </div>
          <ul data-benefits className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {BENEFITS.map((b) => (
              <li
                key={b}
                data-benefit
                className="flex items-start gap-4 rounded-2xl border border-ivory/10 bg-ink-2/60 p-4 leading-relaxed text-ivory/90 md:p-5"
              >
                <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-turq/15 text-turq">
                  <Check className="size-4" />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
