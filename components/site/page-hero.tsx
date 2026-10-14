"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronRight } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export type Crumb = { label: string; href?: string };

// theme tokens, so the accent stays readable in both day and night mode
const ACCENTS = {
  turq: "var(--color-turq)",
  gold: "var(--color-gold)",
  lapis: "var(--color-lapis)",
  ember: "var(--color-ember)",
} as const;

/**
 * Compact header shared by every inner page: breadcrumbs, kicker, title and a short intro.
 * Kept light on purpose — no blur filters or scroll-scrubbed layers, just one entrance timeline.
 */
export function PageHero({
  kicker,
  title,
  highlight,
  description,
  crumbs = [],
  accent = "turq",
  children,
}: {
  kicker: string;
  title: string;
  highlight?: string;
  description?: string;
  crumbs?: Crumb[];
  accent?: keyof typeof ACCENTS;
  children?: React.ReactNode;
  /** @deprecated every hero is compact now */
  compact?: boolean;
}) {
  const root = useRef<HTMLElement>(null);
  const color = ACCENTS[accent];

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const split = SplitText.create("[data-hero-title]", { type: "words", mask: "words" });
      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from("[data-hero-crumbs]", { y: 12, opacity: 0, duration: 0.6 })
        .from(split.words, { yPercent: 110, duration: 0.9, stagger: 0.05 }, 0.05)
        .from("[data-hero-highlight]", { yPercent: 110, duration: 0.9 }, 0.2)
        .from("[data-hero-line]", { scaleX: 0, transformOrigin: "left", duration: 1.1, ease: "expo.inOut" }, 0.1)
        .from("[data-hero-fade]", { y: 16, opacity: 0, duration: 0.7, stagger: 0.06 }, 0.3)
        .from("[data-hero-ring]", { rotate: -40, scale: 0.85, opacity: 0, duration: 1.6 }, 0);
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate overflow-hidden px-5 pb-8 pt-28 md:px-10 md:pb-10 md:pt-32"
      style={{
        // a soft corner glow drawn by the gradient itself — far cheaper than a blurred element
        background: `radial-gradient(70% 140% at 100% 0%, color-mix(in oklab, ${color} 12%, transparent), transparent 70%)`,
      }}
    >
      <svg
        data-hero-ring
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -right-24 -top-10 -z-10 hidden size-[460px] opacity-[0.14] md:block"
        fill="none"
        stroke={color}
        strokeWidth="0.7"
        aria-hidden
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <rect key={i} x="90" y="90" width="220" height="220" transform={`rotate(${i * 7.5} 200 200)`} />
        ))}
        <circle cx="200" cy="200" r="196" />
      </svg>

      <div className="relative mx-auto max-w-[1600px]">
        <nav data-hero-crumbs aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 font-mono text-[12px] uppercase tracking-[0.14em] text-ivory/65">
          <Link href="/" className="transition-colors hover:text-turq">
            Bosh sahifa
          </Link>
          {crumbs.map((c) => (
            <span key={c.label} className="flex items-center gap-1.5">
              <ChevronRight className="size-3.5 text-ivory/35" />
              {c.href ? (
                <Link href={c.href} className="transition-colors hover:text-turq">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ivory">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        <div data-hero-fade className="mb-3 flex items-center gap-3 font-mono text-[12px] font-semibold uppercase tracking-[0.2em]" style={{ color }}>
          <span className="h-px w-8" style={{ background: color }} />
          {kicker}
        </div>

        <h1 className="flex max-w-[30ch] flex-wrap items-baseline gap-x-[0.28em] font-display text-[clamp(1.6rem,3.6vw,3.25rem)] font-bold uppercase leading-[1.04] tracking-[-0.03em] [overflow-wrap:anywhere]">
          <span data-hero-title>{title}</span>
          {highlight && (
            <span className="overflow-hidden pb-[0.06em]">
              <span data-hero-highlight className="text-gradient inline-block">
                {highlight}
              </span>
            </span>
          )}
        </h1>

        <div
          data-hero-line
          className="my-5 h-px w-full md:my-6"
          style={{ background: `linear-gradient(90deg, ${color}, color-mix(in oklab, var(--color-ivory) 15%, transparent), transparent)` }}
        />

        {(description || children) && (
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            {description && (
              <p data-hero-fade className="max-w-3xl text-pretty text-base leading-relaxed text-ivory/85 md:text-lg">
                {description}
              </p>
            )}
            {children && <div data-hero-fade>{children}</div>}
          </div>
        )}
      </div>
    </section>
  );
}
