"use client";

import { createContext, useContext } from "react";
import type { SessionUser } from "@/lib/session";

export const AdminContext = createContext<{ user: SessionUser; refreshCounts: () => void } | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used inside the admin shell");
  return ctx;
}
