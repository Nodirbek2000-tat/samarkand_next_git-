import type { Metadata } from "next";
import { ProjectsListing } from "@/components/site/projects-listing";

export const metadata: Metadata = { title: "Yoshlar startaplari — Yangi Samarqand" };

export default function ProjectsStartupPage() {
  return (
    <ProjectsListing
      kicker="Yoshlar startaplari"
      title="Yoshlar"
      highlight="startaplari"
      description="Kengash qarori bilan yoshlar startaplarini moliyalashtirish va amalga oshirishgacha kuzatib borish."
      crumbs={[{ label: "Loyihalar", href: "/projects" }, { label: "Startaplar" }]}
      filter={{ category: "startup" }}
      accent="ember"
    />
  );
}
