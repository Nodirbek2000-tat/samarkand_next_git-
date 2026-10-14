import { SettingsPage } from "@/components/admin/settings-page";

// Client-rendered admin screen (needs the signed-in session) — not an instant-navigation target.
export const instant = false;

export default function AdminSettings() {
  return <SettingsPage />;
}
