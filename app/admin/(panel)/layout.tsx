import { Suspense } from "react";
import { AdminShell } from "@/components/admin/admin-shell";

// The panel waits for the signed-in user (client-side) by design — exempt it from instant-navigation checks.
export const instant = false;

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="min-h-svh bg-ink" />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
