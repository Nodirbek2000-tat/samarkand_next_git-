import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { NewsCard } from "@/components/site/cards";
import { Container, EmptyState, GridSkeleton, Pagination } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Yangiliklar — Yangi Samarqand",
  description: "Samarqand viloyati tadbirkorlar kengashi yangiliklari.",
};

const CATEGORIES = [
  { value: "", label: "Barchasi" },
  { value: "council", label: "Kengash" },
  { value: "projects", label: "Loyihalar" },
  { value: "forum", label: "Forum" },
  { value: "business", label: "Biznes" },
  { value: "cooperation", label: "Hamkorlik" },
  { value: "events", label: "Tadbirlar" },
];

export default function NewsPage({ searchParams }: PageProps<"/news">) {
  return (
    <>
      <PageHero
        kicker="Yangiliklar"
        title="Kengash"
        highlight="hayotidan"
        description="Yig‘ilishlar, forumlar, loyihalar va tadbirkorlar yutuqlari haqida so‘nggi xabarlar."
        crumbs={[{ label: "Media" }, { label: "Yangiliklar" }]}
        compact
      />
      <Container className="pb-14">
        <Suspense fallback={<GridSkeleton />}>
          <NewsList searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function NewsList({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const data = await api.news({ page, category, page_size: 10 });
  const items = data?.results ?? [];
  const href = (p: number) => `/news?${new URLSearchParams({ ...(category && { category }), page: String(p) })}`;

  return (
    <>
      <nav className="mb-12 flex flex-wrap gap-2" aria-label="Turkumlar">
        {CATEGORIES.map((c) => (
          <Link
            key={c.value}
            href={c.value ? `/news?category=${c.value}` : "/news"}
            data-cursor="hover"
            className={cn(
              "rounded-full border px-5 py-2.5 text-base font-semibold transition-colors",
              category === c.value ? "border-ivory bg-ivory text-ink" : "border-ivory/15 hover:border-turq hover:text-turq",
            )}
          >
            {c.label}
          </Link>
        ))}
      </nav>
      {items.length === 0 ? (
        <EmptyState title="Bu turkumda hozircha yangilik yo‘q" />
      ) : (
        <>
          <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item, i) => (
              <div key={item.id} data-reveal-item className={cn(page === 1 && i === 0 && "md:col-span-2 xl:col-span-3")}>
                <NewsCard item={item} featured={page === 1 && i === 0} />
              </div>
            ))}
          </Reveal>
          <Pagination page={data?.page ?? 1} pages={data?.pages ?? 1} href={href} />
        </>
      )}
    </>
  );
}
