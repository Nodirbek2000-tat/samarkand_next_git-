import { ResourceListRoute } from "@/components/admin/routes";

// Client-rendered admin screen (needs the signed-in session) — not an instant-navigation target.
export const instant = false;

export default function AdminResourcePage() {
  return <ResourceListRoute />;
}
