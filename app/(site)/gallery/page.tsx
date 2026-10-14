import type { Metadata } from "next";
import { Suspense } from "react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { GalleryCard } from "@/components/site/cards";
import { Container, EmptyState, GridSkeleton, Pagination } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Fotohisobotlar — Yangi Samarqand" };

export default function GalleryPage({ searchParams }: PageProps<"/gallery">) {
  return (
    <>
      <PageHero
        kicker="Fotohisobotlar"
        title="Tadbirlar"
        highlight="suratlarda"
        description="Kengash yig‘ilishlari, forumlar va loyihalardan fotolavhalar."
        crumbs={[{ label: "Media", href: "/news" }, { label: "Fotohisobotlar" }]}
        compact
        accent="gold"
      />
      <Container className="pb-14">
        <Suspense fallback={<GridSkeleton />}>
          <Galleries searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function Galleries({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await api.galleries({ page, page_size: 12 });
  const items = data?.results ?? [];
  if (!items.length) return <EmptyState title="Fotohisobotlar tez orada joylanadi" />;
  return (
    <>
      <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((g) => (
          <div key={g.id} data-reveal-item>
            <GalleryCard gallery={g} />
          </div>
        ))}
      </Reveal>
      <Pagination page={data?.page ?? 1} pages={data?.pages ?? 1} href={(p) => `/gallery?page=${p}`} />
    </>
  );
}
