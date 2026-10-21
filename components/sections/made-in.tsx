"use client";

import { useRef } from "react";
import { ArrowUpRight, BookOpen, Languages, Factory, BadgeCheck, MapPin, Users } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { useSectionSetup } from "@/lib/section-setup";
import { gpuWhileMoving } from "@/lib/gpu-while-moving";
import { Magnetic } from "@/components/magnetic";
import { Roll } from "@/components/roll";

const FIELDS = [
  { icon: Factory, label: "Tashkil etilgan sana va assortiment" },
  { icon: Users, label: "Xodimlar soni" },
  { icon: MapPin, label: "Joylashuv va aloqa" },
  { icon: BadgeCheck, label: "Sifat sertifikatlari" },
];

const SECTORS = [
  "Oziq-ovqat sanoati",
  "Elektrotexnika",
  "Farmatsevtika",
  "Mebel sanoati",
  "Qurilish materiallari",
  "To‘qimachilik",
  "Metallga ishlov berish",
  "Qishloq xo‘jaligi eksporti",
];

export function MadeIn() {
  const root = useRef<HTMLElement>(null);

  useSectionSetup(
    root,
    () => {
      const mm = gsap.matchMedia();
      // the huge "406" and the girih ring scale with the scroll: GPU textures while they move, sharp at rest
      const q = gsap.utils.selector(root);
      mm.add("(min-width: 768px)", () => {
        const tl = gsap.timeline({
          scrollTrigger: { trigger: "[data-mi-stage]", start: "top top", end: "+=140%", pin: true, scrub: 1 },
        });
        tl.fromTo("[data-mi-num]", { scale: 0.35, opacity: 0.2 }, { scale: 1, opacity: 1, ease: "power2.out", duration: 0.5 })
          .fromTo("[data-mi-ring]", { rotate: -90, scale: 0.6 }, { rotate: 90, scale: 1.15, ease: "none", duration: 1 }, 0)
          .from("[data-mi-chip]", { opacity: 0, y: 40, stagger: 0.04, duration: 0.3 }, 0.35)
          .to("[data-mi-num]", { yPercent: -18, duration: 0.5 }, 0.5);
        return gpuWhileMoving(tl, [...q("[data-mi-num]"), ...q("[data-mi-ring]")]);
      });
      // phones: no pin (shorter page) — the number and the girih ring are scrubbed by the page scroll instead
      mm.add("(max-width: 767px)", () => {
        const num = gsap.fromTo(
          "[data-mi-num]",
          { scale: 0.4, opacity: 0.2, rotate: -6 },
          {
            scale: 1,
            opacity: 1,
            rotate: 0,
            ease: "power2.out",
            scrollTrigger: { trigger: "[data-mi-stage]", start: "top 90%", end: "center 55%", scrub: 1 },
          },
        );
        const ring = gsap.fromTo(
          "[data-mi-ring]",
          { rotate: -120, scale: 0.6 },
          {
            rotate: 120,
            scale: 1.25,
            ease: "none",
            scrollTrigger: { trigger: "[data-mi-stage]", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
        gsap.from("[data-mi-chip]", {
          opacity: 0,
          y: 30,
          stagger: 0.05,
          scrollTrigger: { trigger: "[data-mi-chips]", start: "top 85%" },
        });
        const stopNum = gpuWhileMoving(num, q("[data-mi-num]"));
        const stopRing = gpuWhileMoving(ring, q("[data-mi-ring]"));
        return () => {
          stopNum();
          stopRing();
        };
      });

      gsap.from("[data-mi-field]", {
        opacity: 0,
        y: 50,
        rotateX: -30,
        stagger: 0.08,
        duration: 1.1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-mi-fields]", start: "top 85%" },
      });
      return () => mm.revert();
    },
  );

  return (
    <section ref={root} id="made-in" className="relative bg-ink">
      <div data-mi-stage className="relative flex min-h-[78svh] flex-col items-center justify-center overflow-hidden px-5 py-16 md:min-h-svh md:px-10 md:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(243_196_107/0.16),transparent_60%)]" />
        <svg
          data-mi-ring
          viewBox="0 0 400 400"
          className="pointer-events-none absolute size-[110vmin] opacity-30"
          fill="none"
          strokeWidth="0.5"
          style={{ stroke: "var(--color-gold)" }}
          aria-hidden
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x="80" y="80" width="240" height="240" transform={`rotate(${i * 3.75} 200 200)`} strokeOpacity={0.3 + (i % 3) * 0.2} />
          ))}
          <circle cx="200" cy="200" r="196" style={{ stroke: "var(--color-turq)" }} />
        </svg>

        <div className="relative mb-6 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
          <span className="text-turq">05</span>
          <span className="h-px w-16 bg-ivory/20" />
          Made in Samarkand
        </div>
        <div
          data-mi-num
          className="text-gradient relative font-display text-[36vw] font-bold leading-[0.8] tracking-[-0.06em] md:text-[30vw]"
        >
          406
        </div>
        <p className="relative mt-4 max-w-2xl text-balance text-center font-display text-2xl font-medium leading-snug md:text-4xl">
          korxona — bitta katalogda. Samarqandda ishlab chiqarilgan mahsulotlarni butun dunyo bilsin.
        </p>

        <div data-mi-chips className="relative mt-8 flex max-w-4xl flex-wrap justify-center gap-2 md:mt-12 md:gap-2.5">
          {SECTORS.map((s) => (
            <span
              key={s}
              data-mi-chip
              className="glass rounded-full px-3 py-1.5 font-mono text-[11.5px] uppercase tracking-[0.12em] text-ivory/90 md:px-4 md:py-2 md:text-[12px]"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid max-w-[1600px] gap-6 px-5 pb-20 md:px-10 md:pb-40 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h3 className="font-display text-4xl font-semibold uppercase leading-tight tracking-tight md:text-5xl">
            Viloyatda <span className="text-gold">6 mingdan ortiq</span> sanoat korxonasi bor
          </h3>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/85">
            Lekin bozorda ular haqida ma’lumot kam — iste’molchilar bunday ishlab chiqarishlar borligini bilmaydi.
            Katalog shu muammoni hal qilish uchun yaratildi.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ivory/90">
              <BookOpen className="size-4 text-turq" /> 500 nusxada chop etilgan
            </span>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm text-ivory/90">
              <Languages className="size-4 text-turq" /> 3 tilda, elektron va bosma
            </span>
          </div>
          <Magnetic className="mt-10">
            <a
              href="https://madeinsam.uz"
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="group inline-flex h-14 items-center gap-3 rounded-full bg-gold pl-7 pr-2 font-mono text-[12.5px] uppercase tracking-[0.18em] text-ink"
            >
              <Roll>Katalogni ochish</Roll>
              <span className="grid size-10 place-items-center rounded-full bg-ink text-gold transition-transform duration-500 ease-expo group-hover:rotate-45">
                <ArrowUpRight className="size-4" />
              </span>
            </a>
          </Magnetic>
        </div>

        <div data-mi-fields className="grid grid-cols-2 gap-3 [perspective:1000px] md:gap-4 lg:col-span-7">
          {FIELDS.map(({ icon: Icon, label }, i) => (
            <div
              key={label}
              data-mi-field
              className="group relative overflow-hidden rounded-3xl border border-ivory/10 bg-ink-2 p-5 transition-colors duration-500 hover:border-gold/50 md:p-7"
            >
              <div className="absolute inset-0 translate-y-full bg-gradient-to-t from-gold/15 to-transparent transition-transform duration-700 ease-expo group-hover:translate-y-0" />
              <div className="relative flex items-center justify-between">
                <Icon className="size-6 text-gold" />
                <span className="font-mono text-[12px] text-mist">0{i + 1}</span>
              </div>
              <p className="relative mt-8 font-display text-base font-semibold leading-snug md:mt-14 md:text-xl">{label}</p>
              <p className="relative mt-2 hidden text-sm text-ivory/75 sm:block">Har bir korxona bo‘yicha katalogda</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
