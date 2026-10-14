"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef } from "react";

/**
 * Thin progress line at the very top while a page is loading.
 * Starts on any internal link click, finishes when the URL actually changes.
 * Drives the DOM directly (no React state) so it costs nothing while idle.
 */
export function NavProgress() {
  const bar = useRef<HTMLDivElement>(null);
  const value = useRef(0);
  const active = useRef(false);
  const trickle = useRef<number | undefined>(undefined);
  const safety = useRef<number | undefined>(undefined);

  const set = (v: number) => {
    value.current = v;
    if (bar.current) bar.current.style.transform = `scaleX(${v})`;
  };

  const done = useCallback(() => {
    if (!active.current || !bar.current) return;
    active.current = false;
    window.clearInterval(trickle.current);
    window.clearTimeout(safety.current);
    const el = bar.current;
    set(1);
    window.setTimeout(() => (el.style.opacity = "0"), 200);
    window.setTimeout(() => {
      if (active.current) return;
      el.style.transition = "none";
      set(0);
    }, 600);
  }, []);

  const start = useCallback(() => {
    if (active.current || !bar.current) return;
    active.current = true;
    const el = bar.current;
    el.style.transition = "none";
    el.style.opacity = "1";
    set(0);
    void el.offsetWidth; // commit the reset before animating
    el.style.transition = "transform 0.35s cubic-bezier(0.16,1,0.3,1), opacity 0.3s ease";
    set(0.3);
    trickle.current = window.setInterval(() => set(value.current + (0.92 - value.current) * 0.1), 250);
    safety.current = window.setTimeout(done, 12000);
  }, [done]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // same page / #hash
      start();
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [start]);

  return (
    <>
      <div ref={bar} className="nav-progress" style={{ transform: "scaleX(0)", opacity: 0 }} aria-hidden />
      <Suspense fallback={null}>
        <RouteDone onChange={done} />
      </Suspense>
    </>
  );
}

function RouteDone({ onChange }: { onChange: () => void }) {
  const pathname = usePathname();
  const search = useSearchParams();
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange();
  }, [pathname, search, onChange]);
  return null;
}
