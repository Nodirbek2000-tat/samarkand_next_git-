"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { isLite } from "@/lib/perf";
import { CITIES, SAMARKAND, distanceKm } from "@/lib/silk-road";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const loadGlobe = () => import("@/components/three/globe-scene");
const GlobeScene = dynamic(loadGlobe, { ssr: false, loading: () => null });
/** what the 3D globe downloads — fetched ahead so it is ready when the visitor arrives */
const GLOBE_FILES = ["/textures/earth/day-2k.webp", "/textures/earth/night-2k.webp", "/textures/earth/clouds.webp"];

const ROUTES = CITIES.map((c) => ({ ...c, km: distanceKm(SAMARKAND, c) })).sort((a, b) => a.km - b.km);

export function SilkRoad() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(false);
  // The picture of the globe is there at once. The live WebGL globe (three.js + NASA textures) is
  // fetched about three screens ahead, mounted one screen ahead and fades in over the picture when its
  // first frame is drawn. Older computers keep the picture: no 3D at all.
  const [seen, setSeen] = useState(false);
  const [ready, setReady] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const el = root.current;
    if (!el || isLite()) return;
    let warmed = false;
    const warm = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting || warmed) return;
        warmed = true;
        warm.disconnect();
        loadGlobe();
        GLOBE_FILES.forEach((url) => fetch(url).catch(() => {}));
      },
      { rootMargin: "300% 0px" },
    );
    const io = new IntersectionObserver(
      ([e]) => {
        setActive(e.isIntersecting);
        if (e.isIntersecting) setSeen(true);
      },
      { rootMargin: "100% 0px" },
    );
    warm.observe(el);
    io.observe(el);
    return () => {
      warm.disconnect();
      io.disconnect();
    };
  }, []);

  useGSAP(
    () => {
      gsap.to(progress, {
        current: 1,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true },
      });
      gsap.from("[data-route]", {
        opacity: 0,
        x: -40,
        stagger: 0.06,
        duration: 1,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-routes]", start: "top 80%" },
      });
      gsap.utils.toArray<HTMLElement>("[data-km]").forEach((el) => {
        const v = { n: 0 };
        gsap.to(v, {
          n: Number(el.dataset.km),
          duration: 2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => (el.textContent = Math.round(v.n).toLocaleString("ru-RU")),
        });
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} id="ipak-yoli" className="relative overflow-hidden bg-ink px-5 py-20 md:px-10 md:py-40">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgb(59_91_255/0.18),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-[1600px] items-center gap-10 lg:grid-cols-12">
        <div className="order-2 lg:order-1 lg:col-span-5">
          <div className="mb-8 flex items-center gap-4 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
            <span className="text-turq">07</span>
            <span className="h-px w-16 bg-ivory/20" />
            Hamkorlik
          </div>
          <h2 className="font-display text-[clamp(2rem,3.5vw,4.5rem)] font-semibold uppercase leading-[0.95] tracking-[-0.03em]">
            Ipak yo‘li
            <br />
            <span className="text-gradient">chorrahasida</span>
          </h2>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-ivory/85">
            Asrlar davomida Samarqand Sharq va G‘arbni bog‘lagan. Bugun u yana — investitsiya, eksport va xalqaro
            hamkorlik uchun ochiq.
          </p>

          <ul data-routes className="mt-10 divide-y divide-ivory/10 border-y border-ivory/10">
            {ROUTES.map((c) => (
              <li
                key={c.name}
                data-route
                data-cursor="hover"
                className="group flex items-center justify-between py-3.5 transition-colors duration-300 hover:text-turq"
              >
                <span className="flex items-center gap-3">
                  <span className="size-1.5 rounded-full bg-turq shadow-[0_0_12px_#2ee8d6] transition-transform duration-500 group-hover:scale-150" />
                  <span className="font-display text-lg font-medium">
                    Samarqand <span className="text-ivory/60">→</span> {c.name}
                  </span>
                </span>
                <span className="font-mono text-sm text-ivory/80">
                  <span data-km={c.km}>0</span> km
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative order-1 aspect-square w-full lg:order-2 lg:col-span-7">
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-turq)_14%,transparent),transparent_70%)]" />
          {/* the poster is the live globe's own picture (scripts/render-globe-poster.mjs); phones frame it a bit smaller */}
          <div className={cn("absolute inset-0 transition-opacity duration-700 max-md:scale-[0.907]", ready && "opacity-0")}>
            <Image src="/images/globe/day.webp" alt="" fill sizes="(min-width: 1024px) 55vw, 92vw" className="only-day object-contain" />
            <Image src="/images/globe/night.webp" alt="" fill sizes="(min-width: 1024px) 55vw, 92vw" className="only-night object-contain" />
          </div>
          {seen ? (
            <div className={cn("absolute inset-0 opacity-0 transition-opacity duration-700", ready && "opacity-100")}>
              <GlobeScene active={active} progress={progress} theme={theme} onReady={() => setReady(true)} />
            </div>
          ) : null}
          <div className="glass pointer-events-none absolute bottom-[12%] left-[6%] rounded-2xl px-4 py-3 font-mono text-[12px] uppercase tracking-[0.15em] text-ivory">
            <span className="text-gold">●</span> Samarqand — Buyuk Ipak yo‘li markazi
          </div>
        </div>
      </div>
    </section>
  );
}
