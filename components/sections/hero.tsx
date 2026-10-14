"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";
import { sceneState, useIntroDone } from "@/lib/store";
import { useTheme } from "@/lib/theme";
import { Magnetic } from "@/components/magnetic";
import { ButtonLink } from "@/components/ui/button";
import { useLenis } from "@/components/providers/smooth-scroll";

const RegistanScene = dynamic(() => import("@/components/three/registan-scene"), {
  ssr: false,
  loading: () => null,
});

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const intro = useIntroDone();
  const lenis = useLenis();
  const [active, setActive] = useState(true);
  const theme = useTheme();

  // pause the render loop entirely once the hero is off screen
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // scroll-driven: pin the hero and fly the camera through the central portal
  useGSAP(
    () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root.current,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 1,
          onUpdate: (self) => (sceneState.progress = self.progress),
        },
      });
      tl.to(
        "[data-hero-copy]",
        { yPercent: -40, opacity: 0, filter: "blur(12px)", ease: "power2.in", duration: 0.5 },
        0,
      )
        .to("[data-hero-meta]", { opacity: 0, y: 30, duration: 0.3 }, 0)
        .to("[data-hero-flash]", { opacity: 1, ease: "power2.in", duration: 0.2 }, 0.62)
        .to("[data-hero-flash]", { opacity: 0, ease: "power1.out", duration: 0.18 }, 0.82)
        .to("[data-hero-ink]", { opacity: 0.55, ease: "none", duration: 0.15 }, 0.85);
      return () => {
        sceneState.progress = 0;
      };
    },
    { scope: root },
  );

  // cinematic intro once the preloader curtain lifts
  useGSAP(
    () => {
      if (!intro) {
        gsap.set("[data-reveal]", { autoAlpha: 0 });
        return;
      }
      gsap.to(sceneState, { intro: 1, duration: 3.4, ease: "power3.inOut" });

      const split = SplitText.create("[data-hero-title]", { type: "chars,lines", mask: "lines" });
      const tl = gsap.timeline({ delay: 0.35 });
      tl.set("[data-reveal]", { autoAlpha: 1 })
        .from(split.chars, {
          yPercent: 120,
          rotate: 10,
          duration: 1.4,
          ease: "expo.out",
          stagger: { each: 0.035, from: "start" },
        })
        .from("[data-hero-gradient]", { yPercent: 115, skewY: 6, duration: 1.6, ease: "expo.out" }, 0.25)
        .from("[data-hero-line]", { scaleX: 0, transformOrigin: "left", duration: 1.4, ease: "expo.inOut" }, 0.2)
        .from("[data-hero-fade]", { y: 30, autoAlpha: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 }, 0.6);
      ScrollTrigger.refresh();
    },
    { scope: root, dependencies: [intro] },
  );

  return (
    <section ref={root} id="top" className="relative h-svh min-h-[640px] w-full overflow-hidden bg-ink">
      <div className="absolute inset-0">
        <RegistanScene active={active} theme={theme} />
      </div>

      {/* readability gradients */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,color-mix(in_oklab,var(--color-ink)_55%,transparent)_100%)]" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-ink via-ink/75 to-transparent md:h-[58%] md:via-ink/55" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-[62%] bg-gradient-to-r from-ink/80 via-ink/40 to-transparent md:block" />

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-10 md:px-10 md:pb-14">
        <div data-hero-copy>
          <div data-reveal className="invisible">
            <h1 className="font-display font-bold uppercase leading-[0.86] tracking-[-0.04em] [filter:drop-shadow(0_8px_40px_rgb(3_5_11/0.9))]">
              <span
                data-hero-title
                className="block whitespace-nowrap text-[min(18vw,20svh)] md:text-[min(10.6vw,19svh)]"
              >
                Yangi
              </span>
              {/* gradient line animates as one block: background-clip:text breaks on split chars */}
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-gradient className="text-gradient sheen block text-[10.4vw] md:text-[min(10.6vw,19svh)]">
                  Samarqand
                </span>
              </span>
            </h1>

            <div
              data-hero-line
              className="my-5 h-px w-full bg-gradient-to-r from-turq/70 via-ivory/20 to-transparent md:my-7"
            />

            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <p data-hero-fade className="text-legible max-w-xl text-balance text-base font-medium leading-relaxed text-ivory md:text-lg">
                Samarqand viloyati tadbirkorlarining jamoat maslahat kengashi. Biz biznes yetakchilarini birlashtiramiz,
                sanoat va investitsiyalarni rivojlantiramiz, mintaqa kelajagini birga quramiz.
              </p>
              <div data-hero-fade className="flex flex-wrap items-center gap-3">
                <Magnetic>
                  <ButtonLink
                    href="#kengash"
                    size="lg"
                    onClick={(e) => (e.preventDefault(), lenis?.scrollTo("#kengash", { duration: 1.8 }))}
                  >
                    Kengash haqida <ArrowUpRight />
                  </ButtonLink>
                </Magnetic>
                <Magnetic>
                  <ButtonLink
                    href="#yonalishlar"
                    size="lg"
                    variant="ghost"
                    onClick={(e) => (e.preventDefault(), lenis?.scrollTo("#yonalishlar", { duration: 1.8 }))}
                  >
                    Yo‘nalishlar
                  </ButtonLink>
                </Magnetic>
              </div>
            </div>
          </div>
        </div>

        <div data-hero-meta className="mt-10 hidden md:block">
          <div
            data-reveal
            className="text-legible invisible flex items-center justify-center font-mono text-[12px] uppercase tracking-[0.18em] text-ivory/80"
          >
            <span data-hero-fade className="flex items-center gap-3">
              <span className="relative block h-10 w-px overflow-hidden bg-ivory/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_1.8s_ease-in-out_infinite] bg-turq" />
              </span>
              Aylantiring — darvozadan o‘ting
              <ArrowDown className="size-3" />
            </span>
          </div>
        </div>
      </div>

      <div
        data-hero-flash
        className="pointer-events-none absolute inset-0 z-20 bg-[radial-gradient(circle_at_50%_60%,#fff7e0_0%,#f3c46b_25%,var(--color-ink)_75%)] opacity-0"
      />
      <div data-hero-ink className="pointer-events-none absolute inset-0 z-20 bg-ink opacity-0" />
    </section>
  );
}
