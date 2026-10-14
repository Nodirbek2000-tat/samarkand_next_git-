"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { useLenis } from "@/components/providers/smooth-scroll";

/** Reset smooth scroll and re-measure scroll-driven animations on every client-side navigation. */
export function RouteEffects() {
  return (
    <Suspense fallback={null}>
      <Effects />
    </Suspense>
  );
}

function Effects() {
  const pathname = usePathname();
  const lenis = useLenis();

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true, force: true });
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 120);
    return () => window.clearTimeout(id);
  }, [pathname, lenis]);

  return null;
}
