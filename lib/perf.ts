/**
 * "Yengil rejim" (`<html data-lite>`): eski/zaif kompyuter, kam xotira yoki sekin internet.
 * Sahifa to'liq ishlaydi, faqat og'ir bezaklar o'chadi: silliq scroll, uchqunlar, 3D globus (o'rniga rasm; telefonda
 * globus uchun o'z tekshiruvi bor — globeAllowed),
 * eshik ko'zgusidagi blur, katta rasm versiyalari. CSS `html[data-lite]` orqali, JS `isLite()` orqali biladi.
 *
 * Plain module (no "use client"): the server layout inlines LITE_SCRIPT, components import the helpers.
 */
const ATTR = "data-lite";
/** sessionStorage: the frame probe found this machine slow — later pages start light at once */
const LITE_KEY = "ys-lite";

/**
 * Runs in <head> before first paint: what the browser already knows — data saver, 2G/3G,
 * ≤4 GB memory, ≤4 CPU threads, or an earlier probe verdict in this tab. Slow machines that pass this
 * are caught by the frame probe (Preloader).
 */
export const LITE_SCRIPT = `(function(){try{var n=navigator,c=n.connection||{},m=n.deviceMemory,h=n.hardwareConcurrency;if(sessionStorage.getItem("${LITE_KEY}")||c.saveData||/2g|3g/.test(c.effectiveType||"")||(m&&m<=4)||(h&&h<=4))document.documentElement.setAttribute("${ATTR}","")}catch(e){}})()`;

const listeners = new Set<() => void>();

export function isLite() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(ATTR);
}

/** Switch lite on for the rest of the visit (CSS reacts at once; subscribers adjust what they can). */
export function enableLite() {
  if (isLite()) return;
  document.documentElement.setAttribute(ATTR, "");
  try {
    sessionStorage.setItem(LITE_KEY, "1");
  } catch {}
  listeners.forEach((cb) => cb());
}

export function onLite(cb: () => void) {
  listeners.add(cb);
  return () => void listeners.delete(cb);
}

/** sessionStorage: the live globe could not keep up on this device — the picture stays for the visit */
const GLOBE_OFF_KEY = "ys-globe-off";

/**
 * May the live 3D globe run here? Computers: whenever the page is not in light mode. Phones: a phone's
 * memory or core count says little about one small WebGL scene, so the Earth turns there too unless a data
 * saver, a 2G/3G link or the preloader's frame probe says otherwise — and the globe watches its own frames
 * and hands back to the picture if the phone can't keep up (`globeTooSlow`).
 */
export function globeAllowed() {
  if (typeof window === "undefined" || typeof WebGL2RenderingContext === "undefined") return false;
  let probedSlow = false;
  try {
    if (sessionStorage.getItem(GLOBE_OFF_KEY)) return false;
    probedSlow = !!sessionStorage.getItem(LITE_KEY);
  } catch {}
  if (!window.matchMedia("(max-width: 767px)").matches) return !isLite();
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  return !probedSlow && !c?.saveData && !/2g|3g/.test(c?.effectiveType ?? "");
}

export function globeTooSlow() {
  try {
    sessionStorage.setItem(GLOBE_OFF_KEY, "1");
  } catch {}
}

/**
 * Watches real frame times while something light is animating (the preloader): if the median frame
 * takes longer than `budget` ms, this machine can't carry the heavy effects. Returns a stop function
 * that gives the verdict.
 */
export function probeFrames(budget = 24) {
  // a machine drawing only ~15 frames a second gives few samples: 10 are enough for a median
  const gaps: number[] = [];
  const start = performance.now();
  let last = 0;
  let id = requestAnimationFrame(function tick(t) {
    if (last) gaps.push(t - last);
    last = t;
    id = requestAnimationFrame(tick);
  });
  return () => {
    cancelAnimationFrame(id);
    // fewer than 10 frames in over a second is itself the verdict: under 10 frames a second
    if (gaps.length < 10) return performance.now() - start > 1000;
    const sorted = gaps.sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length / 2)] > budget;
  };
}
