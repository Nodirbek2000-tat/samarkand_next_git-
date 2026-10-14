import { Dashboard } from "@/components/admin/dashboard";

// Client-rendered admin screen (needs the signed-in session) — not an instant-navigation target.
export const instant = false;

export default function AdminHome() {
  return <Dashboard />;
}
