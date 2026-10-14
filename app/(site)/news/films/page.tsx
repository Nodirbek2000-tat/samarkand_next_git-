import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { FilmCard } from "@/components/site/cards";
import { Container, EmptyState, GridSkeleton, Pagination } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Filmlar — Yangi Samarqand" };

export default function FilmsPage({ searchParams }: PageProps<"/news/films">) {
  return (
    <>
      <PageHero
        kicker="Filmlar"
        title="Kompaniyalar"
        highlight="haqida filmlar"
        description="Viloyat tadbirkorlari va ishlab chiqarish korxonalari haqidagi video hikoyalar."
        crumbs={[{ label: "Media", href: "/news" }, { label: "Filmlar" }]}
        compact
        accent="ember"
      />
      <Container className="pb-14">
        <Suspense fallback={<GridSkeleton />}>
          <FilmsList searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function FilmsList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await api.films({ page, page_size: 12 });
  const items = data?.results ?? [];
  if (!items.length) return <EmptyState title="Filmlar tez orada joylanadi" />;
  return (
    <>
      <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((f) => (
          <div key={f.id} data-reveal-item>
            <FilmCard film={f} />
          </div>
        ))}
      </Reveal>
      <Pagination page={data?.page ?? 1} pages={data?.pages ?? 1} href={(p) => `/news/films?page=${p}`} />
    </>
  );
}
