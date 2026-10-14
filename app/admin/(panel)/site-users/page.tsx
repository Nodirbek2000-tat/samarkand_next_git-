import { redirect } from "next/navigation";

// merged into the single "Foydalanuvchilar" section
export const instant = false;

export default function AdminSiteUsers() {
  redirect("/admin/users?role=user");
}
