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
/** sessionStorage: `?lite=1` / `?lite=0` in the address pins the mode for this tab (testing and support) */
const FORCE_KEY = "ys-lite-force";

/**
 * Runs in <head> before first paint: what the browser already knows — data saver, 2G/3G,
 * ≤4 GB memory, ≤4 CPU threads, or an earlier probe verdict in this tab. Slow machines that pass this
 * are caught by the frame probe (Preloader). `?lite=1` / `?lite=0` pins either mode for the tab.
 */
export const LITE_SCRIPT = `(function(){try{var s=sessionStorage,q=/[?&]lite=([01])/.exec(location.search);if(q)s.setItem("${FORCE_KEY}",q[1]);var f=s.getItem("${FORCE_KEY}"),n=navigator,c=n.connection||{},m=n.deviceMemory,h=n.hardwareConcurrency;if(f==="1"||(f!=="0"&&(s.getItem("${LITE_KEY}")||c.saveData||/2g|3g/.test(c.effectiveType||"")||(m&&m<=4)||(h&&h<=4))))document.documentElement.setAttribute("${ATTR}","")}catch(e){}})()`;

/** the mode was pinned with `?lite=0` — the probe leaves it alone */
function forcedFull() {
  try {
    return sessionStorage.getItem(FORCE_KEY) === "0";
  } catch {
    return false;
  }
}

const listeners = new Set<() => void>();

export function isLite() {
  return typeof document !== "undefined" && document.documentElement.hasAttribute(ATTR);
}

/** Switch lite on for the rest of the visit (CSS reacts at once; subscribers adjust what they can). */
export function enableLite() {
  if (isLite() || forcedFull()) return;
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

/** The browser can hand a canvas to a Web Worker and draw there (the globe then never touches the page's thread). */
export function canDrawOffMainThread() {
  return (
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "transferControlToOffscreen" in HTMLCanvasElement.prototype
  );
}

/**
 * May the live 3D globe run here? It turns on every device that can draw it off the page's own thread
 * (a Web Worker — then even a weak machine's scrolling is untouched), and elsewhere wherever the page is not
 * in light mode. Never on a data saver or a 2G/3G link (the maps are a download), and the globe watches its
 * own frames: if the device can't keep up it hands back to the picture for the visit (`globeTooSlow`).
 */
export function globeAllowed() {
  if (typeof window === "undefined" || typeof WebGL2RenderingContext === "undefined") return false;
  try {
    if (sessionStorage.getItem(GLOBE_OFF_KEY)) return false;
  } catch {}
  const c = (navigator as Navigator & { connection?: { saveData?: boolean; effectiveType?: string } }).connection;
  if (c?.saveData || /2g|3g/.test(c?.effectiveType ?? "")) return false;
  return canDrawOffMainThread() || !isLite();
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
