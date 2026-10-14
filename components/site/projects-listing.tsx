import { PageHero, type Crumb } from "./page-hero";
import { ProjectsExplorer } from "./projects-explorer";
import { Reveal } from "./reveal";
import { Container, EmptyState, RichText } from "./ui";
import { api } from "@/lib/api/server";

/** Shared layout for /projects and its category/status sub-pages. */
export async function ProjectsListing({
  kicker,
  title,
  highlight,
  description,
  crumbs,
  filter,
  introKey,
  showFilters = false,
  accent,
}: {
  kicker: string;
  title: string;
  highlight?: string;
  description?: string;
  crumbs: Crumb[];
  filter: { category?: string; categories?: string; status?: string };
  introKey?: string;
  showFilters?: boolean;
  accent?: "turq" | "gold" | "lapis" | "ember";
}) {
  const [data, intro] = await Promise.all([api.projects(filter), introKey ? api.page(introKey) : Promise.resolve(null)]);
  const projects = data?.results ?? [];

  return (
    <>
      <PageHero
        kicker={kicker}
        title={title}
        highlight={highlight}
        description={intro?.subtitle || description}
        crumbs={crumbs}
        compact
        accent={accent}
      />
      <Container className="pb-14">
        {intro?.body && (
          <Reveal className="mb-10 max-w-4xl">
            <RichText html={intro.body} />
          </Reveal>
        )}
        {projects.length ? (
          <ProjectsExplorer projects={projects} showFilters={showFilters} />
        ) : (
          <EmptyState title="Loyihalar tez orada qo‘shiladi" />
        )}
      </Container>
    </>
  );
}
