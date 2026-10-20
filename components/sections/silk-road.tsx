"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { isLite } from "@/lib/perf";
import { introStore } from "@/lib/store";
import { CITIES, SAMARKAND, distanceKm } from "@/lib/silk-road";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const loadGlobe = () => import("@/components/three/globe-scene");
const GlobeScene = dynamic(loadGlobe, { ssr: false, loading: () => null });
/** what the 3D globe downloads (desktop maps — phones keep the picture) — fetched ahead */
const GLOBE_FILES = ["/textures/earth/day-2k.webp", "/textures/earth/night-2k.webp", "/textures/earth/clouds.webp"];
/** a moment counts as calm when nobody has scrolled for this long (a reading pause, not a brief stop mid-scroll) */
const CALM_MS = 1200;

/** one formatter for every counter frame; the text is only written when the number changes */
const FMT = new Intl.NumberFormat("ru-RU");

const ROUTES = CITIES.map((c) => ({ ...c, km: distanceKm(SAMARKAND, c) })).sort((a, b) => a.km - b.km);

export function SilkRoad() {
  const root = useRef<HTMLElement>(null);
  const progress = useRef(0);
  const [active, setActive] = useState(false);
  // The picture of the globe is there at once. The live WebGL globe (three.js + NASA textures) only on
  // capable computers: prepared in calm moments after the intro (download + start-up, then the GPU upload
  // on mount), so none of that lands in the middle of someone's scroll; it fades in over the picture
  // once its first frame is drawn and only draws continuously while on screen. Phones and older
  // computers keep the picture: no 3D at all.
  const [seen, setSeen] = useState(false);
  const [ready, setReady] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const el = root.current;
    if (!el || isLite() || window.matchMedia("(max-width: 767px)").matches) return;

    let warmed = false;
    const warm = () => {
      if (warmed) return;
      warmed = true;
      loadGlobe();
      GLOBE_FILES.forEach((url) => fetch(url).catch(() => {}));
    };
    const mount = () => {
      warm();
      setSeen(true);
    };

    // calm moments: step 1 downloads and starts three.js, step 2 mounts the globe (shaders + maps go to the GPU)
    let lastScroll = performance.now();
    const onScroll = () => (lastScroll = performance.now());
    window.addEventListener("scroll", onScroll, { passive: true });
    let step = 0;
    let timer = 0;
    const tick = () => {
      // light mode may have been switched on by the preloader's frame probe: keep the picture then
      if (isLite() || step > 1) return;
      if (performance.now() - lastScroll < CALM_MS) {
        timer = window.setTimeout(tick, CALM_MS);
        return;
      }
      const run = () => {
        if (performance.now() - lastScroll < CALM_MS) return void (timer = window.setTimeout(tick, CALM_MS));
        if (step++ === 0) warm();
        else mount();
        timer = window.setTimeout(tick, 1500);
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(run, { timeout: 2000 });
      else run();
    };
    // after the intro has played (≈2 s), so it never competes with the first screen
    let started = false;
    const startCalm = () => {
      if (started || !introStore.get()) return;
      started = true;
      timer = window.setTimeout(tick, 2500);
    };
    const offIntro = introStore.subscribe(startCalm);
    startCalm();

    // fallbacks for a visitor who never pauses: fetch three screens ahead, mount one screen ahead
    const near = new IntersectionObserver(([e]) => e.isIntersecting && !isLite() && warm(), { rootMargin: "300% 0px" });
    const close = new IntersectionObserver(([e]) => e.isIntersecting && !isLite() && mount(), { rootMargin: "100% 0px" });
    // draw continuously only while it is actually on screen
    const visible = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    near.observe(el);
    close.observe(el);
    visible.observe(el);
    return () => {
      offIntro();
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
      near.disconnect();
      close.disconnect();
      visible.disconnect();
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
        let shown = -1;
        gsap.to(v, {
          n: Number(el.dataset.km),
          duration: 2,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          onUpdate: () => {
            const n = Math.round(v.n);
            if (n === shown) return;
            shown = n;
            el.textContent = FMT.format(n);
          },
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
