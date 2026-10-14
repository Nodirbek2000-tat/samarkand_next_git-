"use client";

import { useSyncExternalStore } from "react";

/** Shared, mutable state read every frame by the WebGL scene (no React re-renders). */
export const sceneState = {
  /** 0 → 1 while the hero is pinned and scrolled through */
  progress: 0,
  /** normalised pointer, -1 → 1 */
  mouseX: 0,
  mouseY: 0,
  /** 0 → 1 cinematic intro, driven by GSAP after the preloader */
  intro: 0,
};

let introDone = false;
const listeners = new Set<() => void>();

export const introStore = {
  get: () => introDone,
  set(value: boolean) {
    introDone = value;
    listeners.forEach((l) => l());
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};

export function useIntroDone() {
  return useSyncExternalStore(introStore.subscribe, introStore.get, () => false);
}
