/**
 * "Yengil rejim" (`<html data-lite>`): eski/zaif kompyuter, kam xotira yoki sekin internet.
 * Sahifa to'liq ishlaydi, faqat og'ir bezaklar o'chadi: silliq scroll, uchqunlar, 3D globus (o'rniga rasm),
 * eshik ko'zgusidagi blur, katta rasm versiyalari. CSS `html[data-lite]` orqali, JS `isLite()` orqali biladi.
 *
 * Plain module (no "use client"): the server layout inlines LITE_SCRIPT, components import the helpers.
 */
const ATTR = "data-lite";

/**
 * Runs in <head> before first paint: what the browser already knows — data saver, 2G/3G,
 * ≤4 GB memory, ≤4 CPU threads. Slow machines that pass this are caught by the frame probe (Preloader).
 */
export const LITE_SCRIPT = `(function(){try{var n=navigator,c=n.connection||{},m=n.deviceMemory,h=n.hardwareConcurrency;if(c.saveData||/2g|3g/.test(c.effectiveType||"")||(m&&m<=4)||(h&&h<=4))document.documentElement.setAttribute("${ATTR}","")}catch(e){}})()`;

const listeners = new Set<() => void>();

export function isLite() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(ATTR);
}

/** Switch lite on for the rest of the visit (CSS reacts at once; subscribers adjust what they can). */
export function enableLite() {
  if (isLite()) return;
  document.documentElement.setAttribute(ATTR, "");
  listeners.forEach((cb) => cb());
}

export function onLite(cb: () => void) {
  listeners.add(cb);
  return () => void listeners.delete(cb);
}

/**
 * Watches real frame times while something light is animating (the preloader): if the median frame
 * takes longer than `budget` ms, this machine can't carry the heavy effects. Returns a stop function
 * that gives the verdict.
 */
export function probeFrames(budget = 24) {
  const gaps: number[] = [];
  let last = 0;
  let id = requestAnimationFrame(function tick(t) {
    if (last) gaps.push(t - last);
    last = t;
    id = requestAnimationFrame(tick);
  });
  return () => {
    cancelAnimationFrame(id);
    if (gaps.length < 20) return false;
    const sorted = gaps.sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] > budget;
  };
}
