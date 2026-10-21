"use client";

import { useEffect } from "react";
import { isLite } from "@/lib/perf";
import { introStore } from "@/lib/store";

/**
 * Real-user speed measurement. When the visitor leaves (or hides) the page, one small anonymous report goes to
 * /api/vitals: what kind of device it was and how the page behaved on it — main content shown (LCP), freezes
 * while it loaded, response to taps (INP), layout shifts, scroll smoothness and the heaviest piece of work.
 * Admin panel → «Sayt tezligi» shows the summary. No personal data: no address, no account, no cookies.
 */

type Entry = PerformanceEntry & {
  value?: number;
  hadRecentInput?: boolean;
  interactionId?: number;
  blockingDuration?: number;
  scripts?: { duration: number; sourceURL?: string; sourceFunctionName?: string; invoker?: string }[];
};

function browserName() {
  const ua = navigator.userAgent;
  for (const [re, name] of [
    [/YaBrowser\/(\d+)/, "Yandex"],
    [/Edg\/(\d+)/, "Edge"],
    [/OPR\/(\d+)/, "Opera"],
    [/SamsungBrowser\/(\d+)/, "Samsung"],
    [/Firefox\/(\d+)/, "Firefox"],
    [/Chrome\/(\d+)/, "Chrome"],
    [/Version\/(\d+).*Safari/, "Safari"],
  ] as const) {
    const m = re.exec(ua);
    if (m) return `${name} ${m[1]}`;
  }
  return "";
}

function observe(type: string, cb: (e: Entry) => void, extra: Record<string, unknown> = {}) {
  try {
    const po = new PerformanceObserver((list) => list.getEntries().forEach((e) => cb(e as Entry)));
    po.observe({ type, buffered: true, ...extra });
    return () => po.disconnect();
  } catch {
    return () => {};
  }
}

export function Vitals() {
  useEffect(() => {
    // the admin panel is not measured; neither are automated test browsers
    if (window.location.pathname.startsWith("/admin") || navigator.webdriver) return;

    const page = window.location.pathname;
    let lcp = 0;
    let cls = 0;
    let inp = 0;
    let tbt = 0;
    let longest = 0;
    let readyMs: number | null = null;
    let worst: Entry | null = null;
    let frames = 0;
    let janky = 0;
    let worstFrame = 0;

    const offs = [
      observe("largest-contentful-paint", (e) => (lcp = e.startTime)),
      observe("layout-shift", (e) => {
        if (!e.hadRecentInput) cls += e.value ?? 0;
      }),
      observe(
        "event",
        (e) => {
          if (e.interactionId) inp = Math.max(inp, e.duration);
        },
        { durationThreshold: 40 },
      ),
      observe("longtask", (e) => {
        longest = Math.max(longest, e.duration);
        // the freezes while the page opens (first 20 s)
        if (e.startTime < 20000) tbt += Math.max(0, e.duration - 50);
      }),
      observe("long-animation-frame", (e) => {
        if (!worst || e.duration > worst.duration) worst = e;
      }),
    ];

    // home: the moment the preloader's curtain lifts
    const markReady = () => {
      if (introStore.get() && readyMs === null) readyMs = performance.now();
    };
    markReady();
    const offIntro = introStore.subscribe(markReady);

    // scroll smoothness: frame times only while the page is actually moving
    let raf = 0;
    let lastScroll = 0;
    let lastFrame = 0;
    const tick = (t: number) => {
      if (lastFrame) {
        const gap = t - lastFrame;
        frames++;
        if (gap > 50) janky++;
        worstFrame = Math.max(worstFrame, gap);
      }
      lastFrame = t;
      raf = t - lastScroll < 300 ? requestAnimationFrame(tick) : 0;
      if (!raf) lastFrame = 0;
    };
    const onScroll = () => {
      lastScroll = performance.now();
      if (!raf) raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // which work made the longest frame: one of the page's own section setups if it overlaps one,
    // otherwise the script file and what started it
    const culprit = () => {
      const w = worst as Entry | null;
      if (!w) return "";
      const setup = performance
        .getEntriesByType("measure")
        .find(
          (m) => m.name.startsWith("setup ") && m.startTime < w.startTime + w.duration && m.startTime + m.duration > w.startTime,
        );
      if (setup) return setup.name;
      const s = [...(w.scripts ?? [])].sort((a, b) => b.duration - a.duration)[0];
      if (!s) return "render";
      const file = (s.sourceURL ?? "").replace(/^.*\//, "").replace(/\?.*$/, "");
      return `${file || "?"} · ${s.invoker ?? s.sourceFunctionName ?? ""}`.slice(0, 200);
    };

    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      // a finger is the main pointer (or the screen is touch-first and narrow)
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrowTouch = navigator.maxTouchPoints > 0 && window.innerWidth < 768;
      const c = (navigator as Navigator & { connection?: { effectiveType?: string } }).connection;
      const n = navigator as Navigator & { deviceMemory?: number };
      const round = (v: number) => Math.round(v);
      const report = {
        page,
        device: coarse || narrowTouch ? (window.innerWidth < 768 ? "phone" : "tablet") : "desktop",
        browser: browserName(),
        lite: isLite(),
        cores: navigator.hardwareConcurrency || null,
        memory: n.deviceMemory ?? null,
        net: c?.effectiveType ?? "",
        width: window.innerWidth,
        lcp_ms: lcp ? round(lcp) : null,
        ready_ms: readyMs === null ? null : round(readyMs),
        inp_ms: inp ? round(inp) : null,
        cls: Math.round(cls * 1000) / 1000,
        tbt_ms: round(tbt),
        longest_ms: round(longest),
        frames,
        janky,
        worst_frame_ms: round(worstFrame),
        culprit: culprit(),
        globe: document.getElementById("ipak-yoli")?.dataset.globe ?? "",
      };
      const body = JSON.stringify(report);
      if (!navigator.sendBeacon?.("/api/vitals", new Blob([body], { type: "application/json" }))) {
        fetch("/api/vitals", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
          () => {},
        );
      }
    };
    const onHide = () => document.visibilityState === "hidden" && send();
    document.addEventListener("visibilitychange", onHide);
    window.addEventListener("pagehide", send);

    return () => {
      offs.forEach((off) => off());
      offIntro();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onHide);
      window.removeEventListener("pagehide", send);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
