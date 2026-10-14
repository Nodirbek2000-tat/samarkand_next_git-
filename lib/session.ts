"use client";

import { useSyncExternalStore } from "react";

export type SessionUser = {
  id: number;
  username: string;
  full_name: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_superuser: boolean;
  last_login: string | null;
  telegram: { phone: string; username: string; company: string; position: string } | null;
};

type Me = { authenticated: boolean; user: SessionUser | null };

let cached: Promise<Me> | null = null;
let current: Me | null = null;
const listeners = new Set<() => void>();

export function fetchMe(force = false): Promise<Me> {
  if (!cached || force) {
    cached = fetch("/api/auth/me", { credentials: "same-origin", headers: { Accept: "application/json" } })
      .then((r) => (r.ok ? r.json() : { authenticated: false, user: null }))
      .catch(() => ({ authenticated: false, user: null }))
      .then((me: Me) => {
        current = me;
        listeners.forEach((l) => l());
        return me;
      });
  }
  return cached;
}

/** Forget the cached session (after login/logout) and notify every subscriber. */
export function resetMe() {
  cached = null;
  fetchMe(true);
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!cached) fetchMe();
  return () => {
    listeners.delete(listener);
  };
}

/** Current visitor (Telegram user or staff). `undefined` while loading. */
export function useSession(): SessionUser | null | undefined {
  const me = useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
  return me === null ? undefined : me.user;
}
