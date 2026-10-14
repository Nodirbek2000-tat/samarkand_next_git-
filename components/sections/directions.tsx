"use client";

import { useRef } from "react";
import { Handshake, ShieldCheck, TrendingUp, Factory, HeartHandshake, ArrowUpRight } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";

const ITEMS = [
  {
    icon: Handshake,
    title: "Hokimiyat va biznes muloqoti",
    text: "Tadbirkorlar va davlat organlari o‘rtasida ochiq, muntazam va natijaga yo‘naltirilgan muloqot maydoni.",
    tag: "Muloqot",
    hue: "#2ee8d6",
  },
  {
    icon: ShieldCheck,
    title: "Tadbirkorlar huquqlarini himoya qilish",
    text: "Ishbilarmonlar manfaatlarini himoya qilish, muammolarni tizimli hal etish va huquqiy ko‘mak.",
    tag: "Himoya",
    hue: "#3b5bff",
  },
  {
    icon: TrendingUp,
    title: "Investitsiyalarni qo‘llab-quvvatlash",
    text: "Mintaqaga investitsiyalar jalb qilish, yangi loyihalarni boshlash va kengaytirishda hamkorlik.",
    tag: "Investitsiya",
    hue: "#f3c46b",
  },
  {
    icon: Factory,
    title: "Sanoat kooperatsiyasi",
    text: "Lokalizatsiya, importni o‘rnini bosish va eksport uchun korxonalar o‘rtasida kooperatsiya.",
    tag: "Sanoat",
    hue: "#ff7847",
  },
  {
    icon: HeartHandshake,
    title: "Ijtimoiy loyihalar",
    text: "Shahar muhitini obodonlashtirish, yoshlar va ilm-fan tashabbuslarini moliyalashtirish.",
    tag: "Jamiyat",
    hue: "#2ee8d6",
  },
];

function Pattern({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" stroke={color} strokeWidth="0.7" className="size-full" aria-hidden>
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
      <circle cx="100" cy="100" r="12" fill={color} fillOpacity="0.2" />
    </svg>
  );
}

export function Directions() {
  const root = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const el = track.current!;
        const distance = () => el.scrollWidth - window.innerWidth;
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: "none",
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

      mm.add("(max-width: 1023px)", () => {
        gsap.utils.toArray<HTMLElement>("[data-dir-card]").forEach((card) => {
          gsap.from(card, {
            y: 60,
            opacity: 0,
            duration: 1.1,
            ease: "expo.out",
            scrollTrigger: { trigger: card, start: "top 88%" },
          });
        });
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  const tilt = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    gsap.to(el, { rotateY: px * 10, rotateX: -py * 10, duration: 0.6, ease: "power3" });
  };
  const untilt = (e: React.PointerEvent<HTMLElement>) =>
    gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 1, ease: "elastic.out(1, 0.4)" });

  return (
    <section ref={root} id="yonalishlar" className="relative overflow-hidden bg-ink-2 lg:h-svh">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgb(59_91_255/0.18),transparent_60%)]" />

      <div
        ref={track}
        className="relative flex h-full flex-col gap-6 px-5 py-28 md:px-10 lg:w-max lg:flex-row lg:items-center lg:gap-8 lg:py-0"
      >
        <div className="flex shrink-0 flex-col justify-center lg:w-[38vw] lg:pr-10">
          <div className="mb-10 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
            <span className="text-turq">03</span>
            <span className="h-px w-16 bg-ivory/20" />
            Faoliyat yo‘nalishlari
          </div>
          <h2 className="font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-7xl">
            Kuchli
            <br />
            va barqaror
            <br />
            <span className="text-gradient">biznes uchun</span>
          </h2>
          <p className="mt-8 max-w-md text-ivory/80">
            Kengash mintaqa tadbirkorlarini biznes muhitini birga rivojlantirish, ishbilarmonlar manfaatlarini himoya
            qilish va ijtimoiy ahamiyatli loyihalarni amalga oshirish uchun birlashtiradi.
          </p>
        </div>

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
              className="pointer-events-none absolute -right-24 -top-24 size-80 opacity-40 transition-opacity duration-700 group-hover:opacity-80"
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
            <div className="relative mt-16 [transform:translateZ(40px)] lg:mt-0">
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
        <div className="hidden w-[10vw] shrink-0 lg:block" />
      </div>

      <div className="absolute inset-x-10 bottom-10 hidden h-px bg-ivory/10 lg:block">
        <div data-dir-progress className="h-full origin-left scale-x-0 bg-gradient-to-r from-turq via-gold to-ember" />
      </div>
    </section>
  );
}
