"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { gpuWhileMoving } from "@/lib/gpu-while-moving";
import { useIntroDone } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { Magnetic } from "@/components/magnetic";
import { ButtonLink } from "@/components/ui/button";
import { Roll } from "@/components/roll";
import { useLenis } from "@/components/providers/smooth-scroll";
import { HeroGate } from "./hero-gate";
import { HeroIntroLight, HeroSky } from "./hero-sky";
import { HeroJourney, HeroJourneySummary } from "./hero-journey";
import { addJourney } from "./hero-journey-timeline";

/**
 * Hero: Registan on a mirror-still plaza with a carved double door set into Tilla-Kori's portal.
 * Intro: the lights of the square switch on from the gate outward (night) or the morning haze
 * burns off under a sun sweep (day); the door's gilding then breathes.
 * Scroll: the camera glides into the portal, light climbs the carving from the threshold to the
 * apex, the medallion flares, the gate strains and bursts inward — the gilded hall floods the
 * facade and the wet stone — and the camera dives through into the light.
 * Photo/door geometry per theme lives in CSS variables (.hero-stage in globals.css).
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);
  const intro = useIntroDone();
  const lenis = useLenis();
  const theme = useTheme();

  // the whole stage leans gently with the pointer
  useEffect(() => {
    const el = root.current?.querySelector<HTMLElement>("[data-hero-parallax]");
    if (!el || !window.matchMedia("(pointer: fine)").matches) return;
    const qx = gsap.quickTo(el, "xPercent", { duration: 1.2, ease: "power3" });
    const qy = gsap.quickTo(el, "yPercent", { duration: 1.2, ease: "power3" });
    const move = (e: PointerEvent) => {
      qx(-((e.clientX / window.innerWidth) * 2 - 1) * 1.1);
      qy(-((e.clientY / window.innerHeight) * 2 - 1) * 0.7);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  // scroll-driven gate sequence (rebuilt when the theme swaps the photograph)
  useGSAP(
    () => {
      const section = root.current;
      const stage = section?.querySelector<HTMLElement>(".hero-stage");
      const css = (name: string) => parseFloat(stage ? getComputedStyle(stage).getPropertyValue(name) : "");
      // close-up: the door fills the frame but never spills past it (portrait phones are width-bound)
      const Z = () => {
        const z = css("--zoom") || 4;
        if (!section || !stage) return z;
        const fitW = (0.9 * section.offsetWidth) / (css("--dw") * stage.offsetWidth);
        const fitH = (0.8 * section.offsetHeight) / (css("--dh") * stage.offsetHeight);
        return Math.min(z, fitW, fitH);
      };
      const random = gsap.utils.random;
      // how far the portal sits below the viewport's optical centre, so the camera re-centres on
      // the door while it closes in (measured unscaled: the stage box ignores the zoom layer)
      const lift = () => {
        if (!section || !stage) return 0;
        const doorY = stage.getBoundingClientRect().top - section.getBoundingClientRect().top + (css("--dt") + css("--dh") / 2) * stage.offsetHeight;
        return section.offsetHeight * 0.53 - doorY;
      };

      const tl = gsap.timeline({ paused: true });
      tl.to("[data-hero-copy]", { yPercent: -40, scale: 0.94, opacity: 0, ease: "power2.in", duration: 0.22 }, 0)
        .to("[data-hero-meta]", { opacity: 0, y: 30, duration: 0.14 }, 0)
        .to("[data-hero-shade]", { opacity: 0, duration: 0.2 }, 0)
        // 1 — the camera glides over the mirror plaza into Tilla-Kori's portal
        // (2D scale, so the browser re-rasters the door crisp instead of stretching a bitmap)
        .fromTo(
          "[data-hero-zoom]",
          { scale: 1, y: 0 },
          { scale: Z, y: lift, ease: "power2.inOut", duration: 0.36, force3D: false },
          0.02,
        )
        .fromTo("[data-hero-vignette]", { opacity: 0 }, { opacity: 1, ease: "power1.inOut", duration: 0.3 }, 0.06)
        // 2 — the door wakes: light climbs the carving from the threshold to the apex
        .fromTo(
          "[data-gate-charge]",
          { opacity: 0, "--charge": "-25%" },
          { opacity: 1, "--charge": "130%", ease: "power1.inOut", duration: 0.2 },
          0.18,
        )
        // 3 — the medallion flares, light forces the seam, the gate strains against it
        .fromTo(
          "[data-gate-lock]",
          { opacity: 0, scale: 0.2, rotate: -60 },
          { opacity: 1, scale: 1, rotate: 0, ease: "power2.out", duration: 0.07 },
          0.35,
        )
        .fromTo("[data-gate-seam]", { opacity: 0, scaleY: 0.05 }, { opacity: 1, scaleY: 1, ease: "power2.inOut", duration: 0.07 }, 0.37)
        .fromTo("[data-gate-spill]", { opacity: 0 }, { opacity: 0.3, ease: "power1.in", duration: 0.07 }, 0.37)
        .to(
          "[data-gate-shake]",
          {
            keyframes: [
              { x: -0.7, duration: 0.008 },
              { x: 0.6, duration: 0.008 },
              { x: -0.5, duration: 0.008 },
              { x: 0.4, y: -0.2, duration: 0.008 },
              { x: -0.25, y: 0, duration: 0.008 },
              { x: 0, duration: 0.01 },
            ],
            ease: "none",
          },
          0.41,
        )
        // 4 — the leaves burst inward and the gilded hall floods the portal and the wet stone
        .to("[data-gate-hall]", { opacity: 1, duration: 0.03 }, 0.455)
        .to('[data-gate-leaf="left"]', { rotationY: 82, ease: "power4.out", duration: 0.16 }, 0.46)
        .to('[data-gate-leaf="right"]', { rotationY: -82, ease: "power4.out", duration: 0.16 }, 0.46)
        .to("[data-gate-dim]", { opacity: 1, ease: "power2.out", duration: 0.12 }, 0.46)
        .to("[data-gate-seam]", { opacity: 0, duration: 0.025 }, 0.465)
        .to("[data-gate-lock]", { scale: 3.4, opacity: 0, ease: "power2.out", duration: 0.08 }, 0.455)
        .to(
          "[data-hero-zoom]",
          { keyframes: [{ y: "+=3", duration: 0.008 }, { y: "-=5", duration: 0.008 }, { y: "+=2", duration: 0.012 }], force3D: false },
          0.46,
        )
        .to("[data-gate-spill]", { opacity: 1, ease: "power2.out", duration: 0.12 }, 0.46)
        .fromTo("[data-gate-pool]", { opacity: 0, scaleY: 0.35 }, { opacity: 1, scaleY: 1, ease: "power2.out", duration: 0.14 }, 0.47)
        .fromTo(
          "[data-gate-rays]",
          { opacity: 0, scale: 0.3, rotate: -20 },
          { opacity: 1, scale: 1.25, rotate: 25, ease: "power2.out", duration: 0.32 },
          0.47,
        )
        .fromTo(
          "[data-gate-spark]",
          { opacity: 1, xPercent: -50, yPercent: -50, scale: 0.4 },
          {
            opacity: 0,
            xPercent: () => random(-4600, 4600),
            yPercent: () => random(-4200, 2400),
            scale: () => random(0.6, 2.4),
            ease: "power3.out",
            duration: 0.26,
            stagger: 0.004,
          },
          0.47,
        )
        // 5 — through the gate, into the light
        .to("[data-hero-zoom]", { scale: () => Z() * 4.6, ease: "power3.in", duration: 0.26, force3D: false }, 0.58)
        .to("[data-hero-flash]", { opacity: 1, ease: "power2.in", duration: 0.12 }, 0.7)
        .to("[data-hero-flash]", { opacity: 0, ease: "power1.out", duration: 0.14 }, 0.86);

      // 6 — out of the light: arch after arch through Khoja Daniyar, the airport and the Silk Road
      // to the Imam al-Bukhari complex, which shatters into mosaic — then the page takes over
      if (section) addJourney(tl, section, 0.84);

      // The pin is created once, after the timeline is complete, so its length is right from the first
      // layout (gate pace: 2.6 screens per timeline unit). It refreshes before every other trigger:
      // all the pinned sections below are positioned after it, so if it were measured late they would
      // slide over each other.
      // the photo, door and reflection are not re-drawn every frame while the camera moves
      const stopGpu = gpuWhileMoving(tl, [section?.querySelector("[data-hero-zoom]")]);

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        // phones: the same timeline in a shorter scroll — less thumb work, punchier transitions
        end: () => `+=${Math.round(tl.duration() * (window.innerWidth < 768 ? 150 : 260))}%`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
        refreshPriority: 1,
        animation: tl,
      });
      return stopGpu;
    },
    { scope: root },
  );

  // the theme swaps the photograph and the door geometry (CSS vars): re-measure instead of rebuilding
  // the pinned timeline — rebuilding it would re-create the pin after the sections below it.
  // Not on mount: the page measures everything once when fonts and images are in (SmoothScroll).
  const measuredTheme = useRef(theme);
  useEffect(() => {
    if (measuredTheme.current === theme) return;
    measuredTheme.current = theme;
    ScrollTrigger.refresh();
  }, [theme]);

  // cinematic intro once the preloader curtain lifts
  useGSAP(
    () => {
      if (!intro) {
        gsap.set("[data-reveal]", { autoAlpha: 0 });
        return;
      }
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // the camera swoops down onto the plaza (one composited layer: scale + a slight bank)
      gsap.fromTo(
        "[data-hero-parallax]",
        { scale: reduce ? 1 : 1.34, rotate: reduce ? 0 : -1.4, transformOrigin: "50% 62%" },
        { scale: 1, rotate: 0, duration: 3.2, ease: "expo.out" },
      );

      // the square comes alive: night — the lights switch on from the gate outward (with a flicker);
      // day — the morning haze burns off and the sun sweeps across the facades
      if (reduce) {
        gsap.set(["[data-hero-lights]", "[data-hero-haze]"], { autoAlpha: 0 });
      } else {
        gsap
          .timeline()
          .to("[data-hero-lights]", {
            keyframes: [
              { opacity: 0.6, duration: 0.06 },
              { opacity: 1, duration: 0.08 },
              { opacity: 0.72, duration: 0.05 },
              { opacity: 1, duration: 0.1 },
            ],
          })
          .fromTo("[data-hero-lights]", { "--r": "0%" }, { "--r": "180%", duration: 2.4, ease: "power2.in" }, 0.15)
          .set("[data-hero-lights]", { autoAlpha: 0 })
          .to("[data-hero-haze]", { opacity: 0, duration: 2.2, ease: "power2.inOut" }, 0)
          .fromTo("[data-hero-sweep]", { xPercent: -110, opacity: 1 }, { xPercent: 320, duration: 2.6, ease: "power2.inOut" }, 0.35)
          .set("[data-hero-sweep]", { opacity: 0 })
          // the gate answers: a burst of light and a shock ring roll out from the carved door
          .fromTo("[data-hero-flare]", { autoAlpha: 0, scale: 0.2 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: "power3.out" }, 1.15)
          .to("[data-hero-flare]", { autoAlpha: 0, scale: 1.6, duration: 1.1, ease: "power2.in" }, 1.65)
          .fromTo("[data-hero-ring]", { autoAlpha: 1, scale: 0.15 }, { autoAlpha: 0, scale: 3.4, duration: 1.6, ease: "expo.out", stagger: 0.18 }, 1.2);
      }

      const split = SplitText.create("[data-hero-title]", { type: "chars,lines", mask: "lines" });
      const tl = gsap.timeline({ delay: 0.3 });
      tl.set("[data-reveal]", { autoAlpha: 1 })
        // YANGI: the letters flip up out of the ground, from the middle outwards
        .from(split.chars, {
          yPercent: 130,
          rotationX: -95,
          transformOrigin: "50% 100%",
          transformPerspective: 600,
          duration: 1.3,
          ease: "expo.out",
          stagger: { each: 0.05, from: "center" },
        })
        // SAMARQAND slams in from oversize and settles, then a single sheen runs across it
        .from("[data-hero-gradient]", { yPercent: 110, scale: 1.45, skewY: 7, duration: 1.5, ease: "expo.out" }, 0.22)
        .fromTo("[data-hero-gradient]", { backgroundPosition: "0% 0" }, { backgroundPosition: "100% 0", duration: 2.2, ease: "power2.inOut" }, 1.1)
        .from("[data-hero-line]", { scaleX: 0, transformOrigin: "50% 50%", duration: 1.4, ease: "expo.inOut" }, 0.2)
        .from("[data-hero-fade]", { y: 30, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 }, 0.6);
    },
    { scope: root, dependencies: [intro] },
  );

  return (
    <section ref={root} id="top" data-intro={intro ? "true" : "false"} className="relative h-svh min-h-[640px] w-full overflow-hidden bg-ink">
      {/* Registan — Ulugh Beg, Tilla-Kori, Sher-Dor — with the carved door set into the middle portal */}
      <div data-hero-parallax className="hero-parallax pointer-events-none absolute -inset-[2%]">
        <div className="hero-stage">
          <div data-hero-zoom className="absolute inset-0" style={{ transformOrigin: "var(--zoom-origin)" }}>
            <Image
              src="/images/registan/day-v2.webp"
              alt="Registon maydoni: Ulug‘bek, Tillakori va Sherdor madrasalari"
              fill
              priority
              sizes="(max-aspect-ratio: 16/9) 180svh, 104vw"
              className="only-day object-cover"
            />
            <Image
              src="/images/registan/night-v2.webp"
              alt="Kechki Registon: yoritilgan madrasalar"
              fill
              sizes="(max-aspect-ratio: 16/9) 180svh, 104vw"
              className="only-night object-cover"
            />
            <HeroGate />
            <HeroSky />
            <HeroIntroLight />
            {/* intro: the gate answers with a burst of light and shock rings */}
            <div data-hero-flare className="hero-flare" aria-hidden />
            <span data-hero-ring className="hero-ring" aria-hidden />
            <span data-hero-ring className="hero-ring" aria-hidden />
          </div>
        </div>
      </div>

      {/* light touch for the copy: the title sits in the sky, the text on the plaza — the portal stays clear */}
      <div data-hero-shade className="pointer-events-none absolute inset-0">
        <div className="absolute inset-x-0 top-0 h-[48%] bg-gradient-to-b from-ink/75 via-ink/30 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-ink via-ink/55 to-transparent md:h-[30%]" />
      </div>
      {/* focus on the portal while the camera closes in */}
      <div
        data-hero-vignette
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_75%_at_50%_54%,transparent_30%,rgb(3_5_11/0.88)_100%)] opacity-0"
      />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 pb-8 pt-24 md:px-10 md:pb-9 md:pt-[6.5rem]">
        <div data-hero-copy className="text-center">
          <div data-reveal className="invisible">
            <h1 className="font-display font-bold uppercase leading-[0.86] tracking-[-0.04em] [text-shadow:0_8px_40px_rgb(3_5_11/0.75)]">
              <span data-hero-title className="block whitespace-nowrap text-[min(17vw,11svh)] md:text-[min(8.4vw,14.5svh)]">
                Yangi
              </span>
              {/* gradient line animates as one block: background-clip:text breaks on split chars */}
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-gradient className="text-gradient block text-[min(10.4vw,9svh)] md:text-[min(8.4vw,14.5svh)]">
                  Samarqand
                </span>
              </span>
            </h1>
          </div>
        </div>

        <div>
          <div data-hero-copy>
            <div data-reveal className="invisible">
              <div data-hero-line className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-turq/60 to-transparent md:mb-6" />
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-10">
                <p data-hero-fade className="text-legible max-w-xl text-balance text-base font-medium leading-relaxed text-ivory md:text-lg">
                  Samarqand viloyati tadbirkorlarining jamoat maslahat kengashi. Biz biznes yetakchilarini birlashtiramiz,
                  sanoat va investitsiyalarni rivojlantiramiz, mintaqa kelajagini birga quramiz.
                </p>
                <div data-hero-fade className="flex flex-wrap items-center gap-3 md:shrink-0">
                  <Magnetic>
                    <ButtonLink href="#kengash" size="lg" onClick={(e) => (e.preventDefault(), lenis?.scrollTo("#kengash", { duration: 1.8 }))}>
                      <Roll>Kengash haqida</Roll> <ArrowUpRight />
                    </ButtonLink>
                  </Magnetic>
                  <Magnetic className="hidden sm:block">
                    <ButtonLink
                      href="#yonalishlar"
                      size="lg"
                      variant="ghost"
                      onClick={(e) => (e.preventDefault(), lenis?.scrollTo("#yonalishlar", { duration: 1.8 }))}
                    >
                      <Roll>Yo‘nalishlar</Roll>
                    </ButtonLink>
                  </Magnetic>
                </div>
              </div>
            </div>
          </div>

          <div data-hero-meta className="mt-6 hidden md:block">
            <div data-reveal className="text-legible invisible flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.18em] text-ivory/80">
              <span data-hero-fade className="flex items-center gap-3">
                <span className="relative block h-10 w-px overflow-hidden bg-ivory/15">
                  <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-turq" />
                </span>
                Aylantiring — darvozani oching
                <ArrowDown className="size-3" />
              </span>
            </div>
          </div>
        </div>
      </div>

      <a
        href="https://commons.wikimedia.org/wiki/File:Registan_01.jpg"
        target="_blank"
        rel="noreferrer"
        className="only-day absolute bottom-2 right-3 z-10 font-mono text-[10px] text-ivory/60 hover:text-ivory"
      >
        Asos: Bernard Gagnon · CC0 · qayta ishlangan
      </a>
      <a
        href="https://commons.wikimedia.org/wiki/File:Registan,_Samarkand_at_night.jpg"
        target="_blank"
        rel="noreferrer"
        className="only-night absolute bottom-2 right-3 z-10 font-mono text-[10px] text-ivory/60 hover:text-ivory"
      >
        Asos: SpeedOfLight · CC BY 4.0 · qayta ishlangan
      </a>

      <HeroJourney />
      <HeroJourneySummary />

      <div
        data-hero-flash
        className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_55%,#fffaf0_0%,#ffd98a_28%,var(--color-ink)_78%)] opacity-0"
      />
      <div data-hero-ink className="pointer-events-none absolute inset-0 z-20 bg-ink opacity-0" />
    </section>
  );
}
