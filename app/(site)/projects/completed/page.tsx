import type { Metadata } from "next";
import { ProjectsListing } from "@/components/site/projects-listing";

export const metadata: Metadata = { title: "Amalga oshirilgan loyihalar — Yangi Samarqand" };

export default function ProjectsCompletedPage() {
  return (
    <ProjectsListing
      kicker="Amalga oshirilgan"
      title="Yakunlangan"
      highlight="loyihalar"
      crumbs={[{ label: "Loyihalar", href: "/projects" }, { label: "Amalga oshirilgan" }]}
      filter={{ status: "completed" }}
      introKey="projects-completed"
      accent="gold"
    />
  );
}
