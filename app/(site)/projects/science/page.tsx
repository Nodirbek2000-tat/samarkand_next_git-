import type { Metadata } from "next";
import { ProjectsListing } from "@/components/site/projects-listing";

export const metadata: Metadata = { title: "Ilmiy ishlanmalar — Yangi Samarqand" };

export default function ProjectsSciencePage() {
  return (
    <ProjectsListing
      kicker="Ilmiy ishlanmalar"
      title="Olimlarni"
      highlight="qo‘llab-quvvatlash"
      description="Olimlarning ilmiy ishlanmalarini tijoratlashtirish va amaliyotga joriy etishga ko‘maklashish."
      crumbs={[{ label: "Loyihalar", href: "/projects" }, { label: "Ilmiy ishlanmalar" }]}
      filter={{ category: "science" }}
      accent="lapis"
    />
  );
}
