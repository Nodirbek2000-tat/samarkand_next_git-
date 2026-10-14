import type { Metadata } from "next";
import { ProjectsListing } from "@/components/site/projects-listing";

export const metadata: Metadata = { title: "Loyihalar — Yangi Samarqand" };

export default function ProjectsPage() {
  return (
    <ProjectsListing
      kicker="Loyihalar"
      title="Kengash"
      highlight="tashabbuslari"
      description="Samarqand viloyati tadbirkorlari ishtirokida amalga oshirilayotgan ijtimoiy, ilmiy va ishbilarmonlik tashabbuslari."
      crumbs={[{ label: "Loyihalar" }]}
      filter={{}}
      showFilters
    />
  );
}
