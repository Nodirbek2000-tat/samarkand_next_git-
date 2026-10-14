"use client";

import { useRef } from "react";
import { Check, Crown } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { useLenis } from "@/components/providers/smooth-scroll";

const TIERS = [
  { name: "YaTT va jismoniy shaxslar", fee: "5", note: "Yakka tartibdagi tadbirkorlar", accent: "#2ee8d6" },
  { name: "Kichik korxonalar", fee: "10", note: "Yillik savdo 10 mlrd so‘mgacha", accent: "#3b5bff" },
  { name: "O‘rta korxonalar", fee: "25", note: "Yillik savdo 10 mlrd so‘mdan ortiq", accent: "#ff7847" },
  { name: "Yirik korxonalar", fee: "50", note: "Yillik savdo 100 mlrd so‘mdan ortiq", accent: "#f3c46b", featured: true },
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
  const lenis = useLenis();

  useGSAP(
    () => {
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
      gsap.from("[data-benefit]", {
        opacity: 0,
        y: 24,
        stagger: 0.07,
        duration: 0.9,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-benefits]", start: "top 85%" },
      });
    },
    { scope: root },
  );

  const move = (e: React.PointerEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--px", `${px * 100}%`);
    el.style.setProperty("--py", `${py * 100}%`);
    el.style.setProperty("--angle", `${px * 180 + py * 90}deg`);
    gsap.to(el, { rotateY: (px - 0.5) * 16, rotateX: -(py - 0.5) * 16, duration: 0.5, ease: "power3" });
  };
  const leave = (e: React.PointerEvent<HTMLElement>) =>
    gsap.to(e.currentTarget, { rotateX: 0, rotateY: 0, duration: 1.2, ease: "elastic.out(1, 0.4)" });

  return (
    <section ref={root} id="azolik" className="relative overflow-hidden bg-ink px-5 py-28 md:px-10 md:py-40">
      <div className="pointer-events-none absolute right-0 top-0 size-[600px] rounded-full bg-gold/10 blur-[160px]" />
      <div className="relative mx-auto max-w-[1600px]">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
              <span className="text-turq">08</span>
              <span className="h-px w-16 bg-ivory/20" />
              Kengashga a’zolik
            </div>
            <h2 className="font-display text-5xl font-semibold uppercase leading-[0.95] tracking-[-0.03em] md:text-8xl">
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

        <div data-tiers className="grid gap-4 [perspective:1400px] sm:grid-cols-2 xl:grid-cols-4">
          {TIERS.map((t) => (
            <article
              key={t.name}
              data-tier
              data-cursor="hover"
              onPointerMove={move}
              onPointerLeave={leave}
              className="group relative isolate flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink-2 p-8 [transform-style:preserve-3d]"
              style={{ "--accent": t.accent } as React.CSSProperties}
            >
              {/* holographic foil */}
              <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-0 mix-blend-color-dodge transition-opacity duration-500 group-hover:opacity-60"
                style={{
                  background:
                    "conic-gradient(from var(--angle, 0deg) at var(--px, 50%) var(--py, 50%), #2ee8d6, #3b5bff, #ff7847, #f3c46b, #2ee8d6)",
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 -z-10"
                style={{ background: `radial-gradient(circle at 50% 120%, color-mix(in oklab, ${t.accent} 35%, transparent), transparent 60%)` }}
              />
              <div className="flex items-start justify-between [transform:translateZ(30px)]">
                <span
                  className="rounded-full border px-3 py-1 font-mono text-[11.5px] uppercase tracking-[0.15em]"
                  style={{ borderColor: t.accent, color: t.accent }}
                >
                  {t.featured ? "Premium" : "A’zolik"}
                </span>
                {t.featured && <Crown className="size-5 text-gold" />}
              </div>
              <div className="[transform:translateZ(50px)]">
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
              onClick={() => lenis?.scrollTo("#aloqa", { duration: 1.8 })}
              className="mt-8 inline-flex h-12 items-center rounded-full bg-ivory px-6 font-mono text-[12.5px] uppercase tracking-[0.18em] text-ink transition-colors hover:bg-gold"
            >
              Ariza yuborish
            </button>
          </div>
          <ul data-benefits className="grid gap-3 sm:grid-cols-2 lg:col-span-8">
            {BENEFITS.map((b) => (
              <li
                key={b}
                data-benefit
                className="flex items-start gap-4 rounded-2xl border border-ivory/10 bg-ink-2/60 p-5 leading-relaxed text-ivory/90"
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
