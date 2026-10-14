import { InboxPage } from "@/components/admin/inbox";

// Client-rendered admin screen (needs the signed-in session) — not an instant-navigation target.
export const instant = false;

export default function AdminInboxPage() {
  return <InboxPage />;
}
