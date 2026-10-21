import { VitalsPage } from "@/components/admin/vitals-page";

// Client-rendered admin screen (needs the signed-in session) — not an instant-navigation target.
export const instant = false;

export default function AdminVitals() {
  return <VitalsPage />;
}
