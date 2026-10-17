import { BotPage } from "@/components/admin/bot-page";

// Client-rendered admin screen (needs the signed-in session) — not an instant-navigation target.
export const instant = false;

export default function AdminBot() {
  return <BotPage />;
}
