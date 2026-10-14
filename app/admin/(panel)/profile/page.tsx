import { ProfilePage } from "@/components/admin/profile-page";

// Client-rendered admin screen (needs the signed-in session) — not an instant-navigation target.
export const instant = false;

export default function AdminProfile() {
  return <ProfilePage />;
}
