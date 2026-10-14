import type { Metadata } from "next";
import { ProjectsListing } from "@/components/site/projects-listing";

export const metadata: Metadata = { title: "Biznes klublar — Yangi Samarqand" };

export default function ProjectsClubsPage() {
  return (
    <ProjectsListing
      kicker="Biznes klublar"
      title="Professional"
      highlight="hamjamiyatlar"
      description="HR-mutaxassislar hamda buxgalterlar, auditorlar va soliq maslahatchilari klublari."
      crumbs={[{ label: "Loyihalar", href: "/projects" }, { label: "Biznes klublar" }]}
      filter={{ category: "club" }}
      accent="lapis"
    />
  );
}
