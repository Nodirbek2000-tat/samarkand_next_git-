"use client";

import { useEffect } from "react";

/** Counts a page view once per browser session (pages themselves stay cached). */
export function ViewTracker({ path }: { path: string }) {
  useEffect(() => {
    const key = `ys-viewed:${path}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {}
    fetch(`/api/${path}?track=1`, { headers: { Accept: "application/json" } }).catch(() => {});
  }, [path]);
  return null;
}
