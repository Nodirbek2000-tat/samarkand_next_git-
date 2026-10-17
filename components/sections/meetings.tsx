"use client";

import { useRef } from "react";
import { Building2, Factory, Users, ClipboardCheck } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { isLite } from "@/lib/perf";

const STEPS = [
  {
    icon: Building2,
    title: "Mezbon korxona tanlanadi",
    text: "Yig‘ilish bozor ulushi, ishlab chiqarish ko‘lami, eksporti va samarali korporativ boshqaruvi bilan ajralib turadigan a’zo-kompaniya hududida chaqiriladi.",
  },
  {
    icon: Factory,
    title: "Ishlab chiqarish bilan tanishuv",
    text: "Yig‘ilish boshlanishidan oldin ishtirokchilar mezbon kompaniyaning ishlab chiqarish faoliyati bilan tanishadi.",
  },
  {
    icon: Users,
    title: "Hokim va soha rahbarlari bilan muloqot",
    text: "Viloyat hokimi ishtirok etadi. Soliq, elektr tarmoqlari, gaz ta’minoti, suvoqova va kadastr rahbarlari — doimiy ishtirokchilar.",
  },
  {
    icon: ClipboardCheck,
    title: "Topshiriq va nazorat",
    text: "Bildirilgan muammo va takliflar bo‘yicha hokim mas’ullarga topshiriq beradi, ular bayonnomaga kiritiladi va ijrosi nazorat qilinadi.",
  },
];

export function Meetings() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // the line grows with the scroll — on weak machines it is simply there (no repaint every frame)
      if (!isLite()) {
        const path = root.current!.querySelector<SVGPathElement>("[data-path]")!;
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(path, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: "[data-steps]", start: "top 70%", end: "bottom 60%", scrub: true },
        });
      }

      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: step, start: "top 68%", toggleActions: "play none none reverse" },
        });
        tl.to(step.querySelector("[data-node]"), {
          scale: 1,
          "--lit": 1, // fill + glow in the theme's accent (globals.css .meet-node)
          duration: 0.6,
          ease: "back.out(3)",
        })
          .from(step.querySelector("[data-step-card]"), { x: 60, opacity: 0, duration: 1, ease: "expo.out" }, 0)
          .from(step.querySelector("[data-step-num]"), { yPercent: 100, opacity: 0, duration: 1, ease: "expo.out" }, 0.05);
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="yigilishlar" className="relative overflow-clip bg-ink px-5 py-20 md:px-10 md:py-40">
      <div className="pointer-events-none absolute -left-80 top-1/4 size-[900px] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-lapis)_20%,transparent),transparent_62%)]" />
      <div className="relative mx-auto grid max-w-[1600px] gap-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
              <span className="text-turq">02</span>
              <span className="h-px w-16 bg-ivory/20" />
              Kengash yig‘ilishlari
            </div>
            <h2 className="font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-7xl lg:text-[min(4.5rem,4.6vw)]">
              Muloqot
              <br />
              <span className="text-gradient">natija beradi</span>
            </h2>
            <p className="mt-8 max-w-md text-lg leading-relaxed text-ivory/85">
              Kengash a’zolari yig‘ilishlari — ishning asosiy shakllaridan biri. Har bir muammo bayonnomaga tushadi va
              ijrosi nazorat qilinadi.
            </p>
          </div>
        </div>

        <div data-steps className="relative lg:col-span-7">
          <svg className="absolute left-[23px] top-0 h-full w-2 md:left-[31px]" preserveAspectRatio="none" viewBox="0 0 2 100" aria-hidden>
            <path d="M1 0 V100" style={{ stroke: "color-mix(in oklab, var(--color-ivory) 12%, transparent)" }} strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <path data-path d="M1 0 V100" stroke="url(#meet-g)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
            <defs>
              <linearGradient id="meet-g" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" style={{ stopColor: "var(--color-turq)" }} />
                <stop offset="1" style={{ stopColor: "var(--color-gold)" }} />
              </linearGradient>
            </defs>
          </svg>

          <ol className="flex flex-col gap-10 md:gap-14">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} data-step className="relative grid grid-cols-[48px_1fr] gap-5 md:grid-cols-[64px_1fr] md:gap-8">
                <div className="flex justify-center pt-8">
                  <span data-node className="meet-node block size-4 scale-75 rounded-full border-2 border-turq" />
                </div>
                <div
                  data-step-card
                  className="group relative overflow-hidden rounded-3xl border border-ivory/10 bg-ink-2/95 p-7 md:p-9"
                >
                  <div className="pointer-events-none absolute -right-6 -top-10 overflow-hidden font-display text-[9rem] font-bold leading-none text-ivory/[0.04]">
                    <span data-step-num className="block">
                      0{i + 1}
                    </span>
                  </div>
                  <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-turq/10 text-turq">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="font-display text-2xl font-semibold md:text-3xl">{title}</h3>
                  <p className="mt-4 max-w-xl leading-relaxed text-ivory/85">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
