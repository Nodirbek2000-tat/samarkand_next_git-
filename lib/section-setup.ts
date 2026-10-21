"use client";

import { useEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { introStore } from "@/lib/store";

/**
 * Bosh sahifa bo'limlarining animatsiyalari navbat bilan tayyorlanadi.
 *
 * Ilgari har bir bo'lim o'z animatsiyalarini (ScrollTrigger, SplitText, gsap.set…) sahifa ochilgan zahoti
 * React'ning bitta bosqichida qurardi: zaif qurilmada bu bir necha soniyalik bitta qotish edi (CPU ×4 da
 * 2–2,8 s) — va preloader shu qotishni ko'rib, o'rtacha kompyuterni ham "zaif" deb belgilardi.
 *
 * Endi: hero darhol tayyorlanadi, qolganlari esa intro tugagach, brauzer bo'sh paytlarida yuqoridan
 * pastga bittadan (har biri alohida qisqa vazifa — orada kadrlar va bosishlar o'tadi). Foydalanuvchi
 * biror bo'limga yaqinlashsa (2 ekran qolganda), u va undan oldingilar darhol tayyorlanadi. Tartib
 * yuqoridan pastga saqlanadi: pin qilingan bo'lim o'z joyini olgach, pastdagilar o'lchanadi.
 */

type ContextSafe = <T extends (...args: never[]) => unknown>(fn: T) => T;
export type SectionSetup = (context: gsap.Context, contextSafe: ContextSafe) => void | (() => void);

type Job = { el: Element; run: () => void; done: boolean; top?: number };

/** a moment after the curtain lifts the hero plays its intro — the queue starts once that has played */
const AFTER_INTRO_MS = 3200;
/** quiet moments only: the queue waits while the page is being scrolled */
const SCROLL_QUIET_MS = 250;
/** sections closer than this are prepared at once */
const NEAR = "200% 0px";

const queue: Job[] = [];
let open = false;
let pumping = false;
let jumped = false;
let near: IntersectionObserver | null = null;
let lastScroll = 0;

const absTop = (el: Element) => el.getBoundingClientRect().top + window.scrollY;

const byPosition = (a: Job, b: Job) => (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);

function run(job: Job) {
  if (job.done) return;
  job.done = true;
  near?.unobserve(job.el);
  const t0 = performance.now();
  try {
    job.run();
  } catch (e) {
    console.error(e);
  }
  // visible in the browser's performance panel (and to the field measurements): which setup cost what
  const where = job.el.id || `${job.el.closest("section[id]")?.id ?? ""}/${job.el.tagName.toLowerCase()}`;
  performance.measure(`setup ${where}`, { start: t0, end: performance.now() });
  // where a section stood once its triggers measured themselves (checked when the queue is through)
  if (job.el.tagName === "SECTION") job.top = absTop(job.el);
}

/** a job and every unfinished one above it, top to bottom */
function runUpTo(job: Job) {
  for (const j of queue) {
    if (j === job) break;
    if (!j.done) run(j);
  }
  run(job);
}

/**
 * Created top to bottom, every trigger measured itself with everything above it in place — the page needs no
 * second full measurement (one costs a long freeze on a weak phone). Only if a section has moved since its
 * setup (something above changed its height afterwards) is it measured again, once the scrolling stops.
 */
function finish() {
  ScrollTrigger.sort();
  const moved = jumped || queue.some((j) => j.top !== undefined && Math.abs(absTop(j.el) - j.top) > 1);
  jumped = false;
  if (moved) ScrollTrigger.refresh(true);
}

/** one job per idle moment (at most ~0.5 s apart), each in its own task */
function pump() {
  if (pumping || !open) return;
  pumping = true;
  const step = () => {
    // someone is scrolling: try again when the page is still (sections that come near are set up at once)
    if (performance.now() - lastScroll < SCROLL_QUIET_MS) {
      window.setTimeout(next, SCROLL_QUIET_MS);
      return;
    }
    const job = queue.find((j) => !j.done);
    if (!job) {
      pumping = false;
      finish();
      return;
    }
    run(job);
    next();
  };
  // Safari has no requestIdleCallback: a short timer keeps the jobs apart there
  const next = () =>
    typeof window.requestIdleCallback === "function"
      ? window.requestIdleCallback(step, { timeout: 500 })
      : window.setTimeout(step, 30);
  next();
}

function observer() {
  near ??= new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        const job = queue.find((j) => j.el === e.target);
        if (!job || job.done) continue;
        if (queue.some((j) => j !== job && j.done && byPosition(job, j) < 0)) jumped = true;
        runUpTo(job);
      }
    },
    { rootMargin: NEAR },
  );
  return near;
}

let opening = false;
function openWhenReady() {
  if (open || opening) return;
  opening = true;
  window.addEventListener("scroll", () => (lastScroll = performance.now()), { passive: true });
  const start = () => {
    window.setTimeout(() => {
      open = true;
      pump();
    }, AFTER_INTRO_MS);
  };
  if (introStore.get()) start();
  else {
    const off = introStore.subscribe(() => {
      if (!introStore.get()) return;
      off();
      start();
    });
  }
}

/**
 * Everything still waiting, now, top to bottom — call before jumping down the page (a button that scrolls to
 * a section): a pinned section set up during the jump would push the destination further down.
 */
export function flushSetups() {
  queue.filter((j) => !j.done).forEach(run);
}

/** Prepare `run` for `el` in the queue (or at once when `el` comes near). Returns a cancel function. */
export function scheduleSetup(el: Element, runIt: () => void) {
  const job: Job = { el, run: runIt, done: false };
  queue.push(job);
  queue.sort(byPosition);
  observer().observe(el);
  openWhenReady();
  if (open) pump();
  return () => {
    job.done = true;
    near?.unobserve(el);
    const i = queue.indexOf(job);
    if (i >= 0) queue.splice(i, 1);
  };
}

/**
 * Like useGSAP for a home-page section, but the setup runs from the queue (see above) instead of during
 * the page's first render. The callback gets the same (context, contextSafe); everything it creates is
 * reverted when the section unmounts.
 */
export function useSectionSetup(scope: RefObject<HTMLElement | null>, setup: SectionSetup) {
  useEffect(() => {
    const el = scope.current;
    if (!el) return;
    let ctx: gsap.Context | null = null;
    const cancel = scheduleSetup(el, () => {
      ctx = gsap.context(setup as (self: gsap.Context) => void, el);
    });
    return () => {
      cancel();
      ctx?.revert();
    };
    // the first render's setup, like useGSAP without dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
