"use client";

import { useEffect, useRef } from "react";
import { canDrawOffMainThread, isLite } from "@/lib/perf";
import { globeMaps } from "@/lib/silk-road";
import { sceneState } from "@/lib/store";
import type { GlobeInit, GlobeMsg } from "./globe-core";

type Host = { post(msg: GlobeMsg): void; dispose(): void };
type Props = {
  /** on screen: draw continuously (otherwise the globe rests) */
  active: boolean;
  /** scroll progress of the section, 0 → 1 */
  progress: React.RefObject<number>;
  theme: "light" | "dark";
  onReady?: () => void;
  /** the device can't keep a smooth frame rate (or can't draw at all): the page shows the picture */
  onSlow?: () => void;
};

/**
 * The page side of the live globe (globe-core.ts). Where the browser allows it the canvas is handed to a Web
 * Worker, which loads three.js, decodes the maps, compiles the shaders and draws every frame — the page's
 * own thread only measures the box and passes on the scroll and the pointer. Elsewhere the same code runs
 * on the page.
 */
export default function GlobeView({ active, progress, theme, onReady, onSlow }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const host = useRef<Host | null>(null);
  const latest = useRef({ active, night: theme === "dark", onReady, onSlow });

  useEffect(() => {
    latest.current = { active, night: theme === "dark", onReady, onSlow };
  });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const phone = window.matchMedia("(max-width: 767px)").matches;
    const size = () => ({
      width: Math.max(1, el.clientWidth),
      height: Math.max(1, el.clientHeight),
      dpr: Math.min(window.devicePixelRatio || 1, phone && isLite() ? 1.25 : 1.5),
    });
    const init = (): GlobeInit => ({
      ...size(),
      phone,
      night: latest.current.night,
      maps: globeMaps(phone).map((url) => new URL(url, window.location.href).href),
      // high-density screens smooth the edges by themselves: multisampling there only costs frames
      antialias: (window.devicePixelRatio || 1) < 1.5,
      progress: progress.current ?? 0,
    });
    const events = {
      ready: () => latest.current.onReady?.(),
      slow: () => latest.current.onSlow?.(),
    };
    let gone = false;
    const canvasIn = () => {
      const canvas = document.createElement("canvas");
      canvas.style.cssText = "display:block;width:100%;height:100%";
      el.appendChild(canvas);
      return canvas;
    };
    const attach = (h: Host) => {
      host.current = h;
      // whatever changed while it was starting
      h.post({ type: "theme", night: latest.current.night });
      h.post({ type: "active", value: latest.current.active });
    };
    const onPage = (canvas: HTMLCanvasElement) =>
      import("./globe-core").then(({ startGlobe }) => {
        if (gone) return;
        const globe = startGlobe(canvas, init(), { ...events, unsupported: events.slow });
        attach({ post: (m) => globe.handle(m), dispose: () => globe.handle({ type: "dispose" }) });
      }, events.slow);

    if (canDrawOffMainThread()) {
      const canvas = canvasIn();
      const offscreen = canvas.transferControlToOffscreen();
      const worker = new Worker(new URL("./globe.worker.ts", import.meta.url), { type: "module" });
      // the worker couldn't get a WebGL context on its canvas: draw on the page instead
      const fallBack = () => {
        worker.terminate();
        canvas.remove();
        host.current = null;
        if (!gone) onPage(canvasIn());
      };
      worker.onmessage = (e: MessageEvent<string>) => {
        if (e.data === "ready") events.ready();
        else if (e.data === "slow") events.slow();
        else if (e.data === "unsupported") fallBack();
      };
      worker.onerror = fallBack;
      worker.postMessage({ type: "init", canvas: offscreen, init: init() }, [offscreen]);
      attach({ post: (m) => worker.postMessage(m), dispose: () => worker.terminate() });
    } else {
      onPage(canvasIn());
    }

    const ro = new ResizeObserver(() => host.current?.post({ type: "size", ...size() }));
    ro.observe(el);
    return () => {
      gone = true;
      ro.disconnect();
      host.current?.dispose();
      host.current = null;
      el.replaceChildren();
    };
    // started once; later changes arrive as messages
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => host.current?.post({ type: "active", value: active }), [active]);
  useEffect(() => host.current?.post({ type: "theme", night: theme === "dark" }), [theme]);

  // while on screen: the scroll progress and the pointer, once per frame and only when they change
  useEffect(() => {
    if (!active) return;
    let id = 0;
    let p = NaN;
    let x = NaN;
    let y = NaN;
    const tick = () => {
      const np = progress.current ?? 0;
      if (np !== p || sceneState.mouseX !== x || sceneState.mouseY !== y) {
        p = np;
        x = sceneState.mouseX;
        y = sceneState.mouseY;
        host.current?.post({ type: "input", progress: p, x, y });
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [active, progress]);

  return <div ref={box} className="absolute inset-0" />;
}
