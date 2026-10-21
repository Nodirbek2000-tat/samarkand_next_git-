/// <reference lib="webworker" />
import { startGlobe, type Globe, type GlobeInit, type GlobeMsg } from "./globe-core";

/**
 * The globe's own thread: three.js is parsed, the maps decoded, the shaders compiled and every frame drawn
 * here, on the OffscreenCanvas the page handed over. The page only sends sizes, scroll progress and the pointer.
 */
declare const self: DedicatedWorkerGlobalScope;

let globe: Globe | null = null;

self.onmessage = (e: MessageEvent<GlobeMsg | { type: "init"; canvas: OffscreenCanvas; init: GlobeInit }>) => {
  const msg = e.data;
  if (msg.type === "init") {
    globe = startGlobe(msg.canvas, msg.init, {
      ready: () => self.postMessage("ready"),
      slow: () => self.postMessage("slow"),
      unsupported: () => self.postMessage("unsupported"),
    });
    return;
  }
  globe?.handle(msg);
  if (msg.type === "dispose") self.close();
};
