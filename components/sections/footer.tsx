"use client";

import { useRef } from "react";
import { ArrowUp } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Logo } from "@/components/logo";
import { useLenis } from "@/components/providers/smooth-scroll";

const COLS = [
  { title: "Kengash", links: ["Biz haqimizda", "Boshqaruv", "Kengash a’zolari", "Yutuqlarni e’tirof etish"] },
  { title: "Loyihalar", links: ["Ijtimoiy loyihalar", "Ilmiy ishlanmalar", "Yoshlar startaplari", "Biznes klublar"] },
  { title: "Biznes muhit", links: ["Media loyihalar", "Sanoatchilar forumi", "Made in Samarkand", "Hamkorlik"] },
];

export function Footer() {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      gsap.from("[data-giant] span", {
        yPercent: 100,
        ease: "none",
        stagger: 0.04,
        scrollTrigger: { trigger: "[data-giant]", start: "top bottom", end: "bottom bottom", scrub: true },
      });
    },
    { scope: root },
  );

  return (
    <footer ref={root} className="relative overflow-hidden border-t border-ivory/10 bg-ink px-5 pt-20 md:px-10">
      <div className="mx-auto grid max-w-[1600px] gap-12 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/85">
            «Yangi Samarqand» mintaqalarni ijtimoiy-iqtisodiy rivojlantirishga ko‘maklashish bo‘yicha tadbirkorlar
            jamoat fondi. Samarqand viloyati tadbirkorlarining jamoat maslahat kengashi.
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title} className="md:col-span-2">
            <h4 className="font-mono text-[11.5px] uppercase tracking-[0.2em] text-turq">{c.title}</h4>
            <ul className="mt-5 space-y-3">
              {c.links.map((l) => (
                <li key={l}>
                  <span className="text-sm text-ivory/80">{l}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex md:col-span-2 md:justify-end">
          <button
            type="button"
            data-cursor="hover"
            onClick={() => lenis?.scrollTo("top", { duration: 2.4 })}
            className="group grid size-16 place-items-center rounded-full border border-ivory/15 transition-colors hover:border-turq hover:text-turq"
            aria-label="Yuqoriga"
          >
            <ArrowUp className="size-5 transition-transform duration-500 ease-expo group-hover:-translate-y-1" />
          </button>
        </div>
      </div>

      <div
        data-giant
        aria-hidden
        className="mx-auto mt-20 flex max-w-[1600px] justify-between overflow-hidden font-display text-[10.5vw] font-bold uppercase leading-[0.8] tracking-[-0.05em]"
      >
        {"SAMARQAND".split("").map((ch, i) => (
          <span key={i} className="text-gradient inline-block">
            {ch}
          </span>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-2 border-t border-ivory/10 py-6 font-mono text-[11.5px] uppercase tracking-[0.25em] text-mist md:flex-row">
        <span>© 2026 Yangi Samarqand</span>
        <span>Ming yillik meros · Yangi davr</span>
      </div>
    </footer>
  );
}
