"use client";

import { useRef } from "react";
import { Award, Handshake, HeartHandshake, Lightbulb, Sprout, ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { followPointer, leavePointer, spotlightAt } from "@/lib/pointer";
import { useCoverflow, SwipeHint } from "@/components/coverflow";

// the council's five official directions (client document, also the "values" on /about)
const ITEMS = [
  {
    icon: HeartHandshake,
    title: "Ta’lim, sog‘liqni saqlash va kambag‘allikni qisqartirish",
    text: "Tadbirkorlarning ta’lim, sog‘liqni saqlash va kambag‘allikni qisqartirishga qo‘shayotgan homiylik hissasini ommalashtirish, samarali ijtimoiy loyihalar va ijobiy tajribani tarqatish.",
    tag: "Jamiyat",
    hue: "var(--color-turq)",
  },
  {
    icon: Lightbulb,
    title: "Innovatsiyalar va yoshlar startaplari",
    text: "Innovatsiyalar, samarali g‘oyalar va yoshlar startaplarini aniqlash, ularni tijoratlashtirishgacha yetkazish va moliyalashtirish manbalarini topish.",
    tag: "Innovatsiya",
    hue: "var(--color-lapis)",
  },
  {
    icon: Sprout,
    title: "Kichik, individual va yoshlar tadbirkorligi",
    text: "Kichik, individual va yoshlar tadbirkorligini rivojlantirishga ko‘maklashish: hamkorlik, homiylik va «Ustoz–shogird» mentorlik tamoyillari.",
    tag: "Ko‘mak",
    hue: "var(--color-gold)",
  },
  {
    icon: Handshake,
    title: "Hamkorlik, birdamlik va qo‘shma loyihalar",
    text: "O‘z ehtiyojlari uchun mahalliy korxonalar mahsuloti va xizmatlaridan foydalanish, istiqbolli loyihalarda birga ishtirok etish, muammolarni hamjihatlikda hal qilish.",
    tag: "Hamkorlik",
    hue: "var(--color-ember)",
  },
  {
    icon: Award,
    title: "Salmoqli hissa qo‘shganlarni e’tirof etish",
    text: "O‘n minglab ish o‘rinlari yaratgan tadbirkorlar, faol jamoat arboblari, soha yetakchilari, zamonaviy boshqaruv, IT va sun’iy intellektni joriy etganlarni e’tirof etish va rag‘batlantirish.",
    tag: "E’tirof",
    hue: "var(--color-turq)",
  },
];

function Pattern({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" strokeWidth="0.7" className="size-full" style={{ stroke: color }} aria-hidden>
      {Array.from({ length: 3 }).map((_, ring) =>
        Array.from({ length: 8 }).map((_, i) => (
          <rect
            key={`${ring}-${i}`}
            x={100 - 30 - ring * 22}
            y={100 - 30 - ring * 22}
            width={60 + ring * 44}
            height={60 + ring * 44}
            transform={`rotate(${i * 11.25} 100 100)`}
            opacity={0.9 - ring * 0.25}
          />
        )),
      )}
      <circle cx="100" cy="100" r="96" />
      <circle cx="100" cy="100" r="12" fillOpacity="0.2" style={{ fill: color }} />
    </svg>
  );
}

export function Directions() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);
  useCoverflow(rail, "(max-width: 1023px)");

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        // force3D: the long track stays one GPU layer (no 2D↔3D switch and full repaint at the pin's ends)
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });

        gsap.utils.toArray<HTMLElement>("[data-dir-card]").forEach((card) => {
          gsap.fromTo(
            card.querySelector("[data-dir-art]"),
            { rotate: -45, scale: 0.7 },
            {
              rotate: 45,
              scale: 1.1,
              ease: "none",
              scrollTrigger: {
                trigger: card,
                containerAnimation: tween,
                start: "left right",
                end: "right left",
                scrub: true,
              },
            },
          );
        });

        gsap.to("[data-dir-progress]", {
          scaleX: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: () => `+=${distance()}`, scrub: true },
        });
      });

      // phones/tablets: the cards are a swipe carousel (coverflow owns each card's transform),
      // so the entrance flies the whole row in and the patterns spin with the page scroll
      mm.add("(max-width: 1023px)", () => {
        gsap.from(rail.current, {
          xPercent: 45,
          rotate: 4,
          opacity: 0,
          duration: 1.4,
          ease: "expo.out",
          scrollTrigger: { trigger: rail.current, start: "top 88%" },
        });
        gsap.fromTo(
          "[data-dir-art]",
          { rotate: -60, scale: 0.75 },
          {
            rotate: 60,
            scale: 1.1,
            ease: "none",
            scrollTrigger: { trigger: rail.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  // mouse-only tilt + spotlight on the pinned desktop row (touch would fight the carousel swipe)
  const tilt = (e: React.PointerEvent<HTMLElement>) => window.innerWidth >= 1024 && followPointer(e, spotlightAt, 10);
  const untilt = (e: React.PointerEvent<HTMLElement>) => window.innerWidth >= 1024 && leavePointer(e);

  return (
    <section ref={root} id="yonalishlar" className="relative overflow-hidden bg-ink-2 lg:h-svh">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(59_91_255/0.18),transparent_60%)]" />

      <div
        ref={track}
        className="relative flex h-full flex-col gap-4 px-5 py-20 md:px-10 lg:w-max lg:flex-row lg:items-center lg:gap-8 lg:py-0"
      >
        <div className="flex shrink-0 flex-col justify-center lg:w-[38vw] lg:pr-10">
          <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist lg:mb-10">
            <span className="text-turq">03</span>
            <span className="h-px w-16 bg-ivory/20" />
            Faoliyat yo‘nalishlari
          </div>
          <h2 className="font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-7xl lg:text-[min(4.5rem,4.6vw)]">
            Kuchli
            <br />
            va barqaror
            <br />
            <span className="text-gradient">biznes uchun</span>
          </h2>
          <p className="mt-6 max-w-md text-ivory/80 lg:mt-8">
            Kengash mintaqa tadbirkorlarini biznes muhitini birga rivojlantirish, ishbilarmonlar manfaatlarini himoya
            qilish va ijtimoiy ahamiyatli loyihalarni amalga oshirish uchun birlashtiradi.
          </p>
        </div>

        {/* below lg: one swipeable row; on lg the wrapper dissolves (contents) into the pinned track */}
        <div ref={rail} className="rail-lg lg:contents">
          {ITEMS.map(({ icon: Icon, title, text, tag, hue }, i) => (
            <article
              key={title}
              data-dir-card
              data-cursor="hover"
              onPointerMove={tilt}
              onPointerLeave={untilt}
              className="group relative flex shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink p-8 [transform-style:preserve-3d] lg:h-[68vh] lg:w-[min(30vw,460px)]"
            >
              <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div
                data-dir-art
                className="pointer-events-none absolute -right-24 -top-24 size-80 opacity-40 transition-opacity duration-700 will-change-transform group-hover:opacity-80"
              >
                <Pattern color={hue} />
              </div>
              <div className="relative flex items-center justify-between">
                <span className="font-display text-7xl font-bold text-ivory/10 transition-colors duration-700 group-hover:text-ivory/25">
                  0{i + 1}
                </span>
                <span className="rounded-full border border-ivory/15 px-3 py-1 font-mono text-[11.5px] uppercase tracking-[0.25em] text-ivory/85">
                  {tag}
                </span>
              </div>
              <div className="relative mt-10 lg:mt-0">
                <span
                  className="mb-6 grid size-14 place-items-center rounded-2xl"
                  style={{ background: `color-mix(in oklab, ${hue} 18%, transparent)`, color: hue }}
                >
                  <Icon className="size-6" />
                </span>
                <h3 className="font-display text-2xl font-semibold leading-tight md:text-3xl">{title}</h3>
                <p className="mt-4 text-sm leading-relaxed text-ivory/80">{text}</p>
                <span className="mt-8 inline-flex items-center gap-2 font-mono text-[11.5px] uppercase tracking-[0.25em] text-ivory/85 transition-colors group-hover:text-turq">
                  Batafsil <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:rotate-45" />
                </span>
              </div>
            </article>
          ))}
        </div>
        <SwipeHint className="lg:hidden" />
        <div className="hidden w-[10vw] shrink-0 lg:block" />
      </div>

      <div className="absolute inset-x-10 bottom-10 hidden h-px bg-ivory/10 lg:block">
        <div data-dir-progress className="h-full origin-left scale-x-0 bg-gradient-to-r from-turq via-gold to-ember" />
      </div>
    </section>
  );
}
