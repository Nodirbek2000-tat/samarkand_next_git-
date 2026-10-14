import type { Metadata } from "next";
import { ProjectsListing } from "@/components/site/projects-listing";

export const metadata: Metadata = { title: "Ijtimoiy loyihalar — Yangi Samarqand" };

export default function ProjectsSocialPage() {
  return (
    <ProjectsListing
      kicker="Ijtimoiy loyihalar"
      title="Shahar va"
      highlight="jamiyat uchun"
      description="Shahar muhitini obodonlashtirish, ta’lim va sog‘liqni saqlashni qo‘llab-quvvatlash, mahalliy ishlab chiqaruvchilarni ommalashtirish."
      crumbs={[{ label: "Loyihalar", href: "/projects" }, { label: "Ijtimoiy" }]}
      filter={{ categories: "social,catalog" }}
    />
  );
}
