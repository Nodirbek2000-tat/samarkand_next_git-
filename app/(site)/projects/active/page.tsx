import type { Metadata } from "next";
import { ProjectsListing } from "@/components/site/projects-listing";

export const metadata: Metadata = { title: "Amaldagi loyihalar — Yangi Samarqand" };

export default function ProjectsActivePage() {
  return (
    <ProjectsListing
      kicker="Amaldagi loyihalar"
      title="Hozir"
      highlight="davom etmoqda"
      crumbs={[{ label: "Loyihalar", href: "/projects" }, { label: "Amaldagi" }]}
      filter={{ status: "active" }}
      introKey="projects-active"
    />
  );
}
