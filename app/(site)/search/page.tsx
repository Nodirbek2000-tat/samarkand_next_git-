import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, EmptyState, GridSkeleton } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Qidiruv — Yangi Samarqand", robots: { index: false } };

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <PageHero kicker="Qidiruv" title="Sayt bo‘yicha" highlight="qidiruv" crumbs={[{ label: "Qidiruv" }]} compact />
      <Container className="pb-14">
        <Suspense fallback={<GridSkeleton count={3} />}>
          <Results searchParams={searchParams} />
        </Suspense>
      </Container>
    </>
  );
}

async function Results({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = (typeof sp.q === "string" ? sp.q : "").trim().slice(0, 100);
  const data = q.length >= 2 ? await api.search(q) : null;
  const results = data?.results ?? [];

  return (
    <>
      <form action="/search" className="glass mb-12 flex h-16 max-w-3xl items-center gap-3 rounded-full px-6" role="search">
        <Search className="size-6 text-turq" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Yangiliklar, loyihalar, a’zolar…"
          className="h-full w-full bg-transparent text-xl outline-none placeholder:text-ivory/45"
          aria-label="Qidiruv so‘zi"
        />
        <button type="submit" className="rounded-full bg-ivory px-6 py-3 font-semibold text-ink">
          Qidirish
        </button>
      </form>
      {q.length < 2 ? (
        <EmptyState title="Qidiruv so‘zini kiriting" text="Kamida 2 ta harf." />
      ) : results.length === 0 ? (
        <EmptyState title={`«${q}» bo‘yicha hech narsa topilmadi`} text="Boshqa so‘z bilan urinib ko‘ring." />
      ) : (
        <>
          <p className="mb-6 text-lg text-ivory/80">
            «<span className="font-semibold text-ivory">{q}</span>» bo‘yicha {results.length} ta natija
          </p>
          <Reveal stagger={0.05} as="ul" className="divide-y divide-ivory/10 border-y border-ivory/10">
            {results.map((r) => (
              <li key={r.url} data-reveal-item>
                <Link href={r.url} data-cursor="hover" className="group flex items-start justify-between gap-6 py-6">
                  <span>
                    <span className="text-sm font-semibold uppercase tracking-wide text-turq">{r.kind}</span>
                    <span className="mt-2 block font-display text-2xl font-semibold leading-snug group-hover:text-turq">{r.title}</span>
                    {r.text && <span className="mt-2 block text-base text-ivory/75">{r.text}</span>}
                  </span>
                  <ArrowUpRight className="mt-2 size-6 shrink-0 text-ivory/50 transition-transform group-hover:rotate-45 group-hover:text-turq" />
                </Link>
              </li>
            ))}
          </Reveal>
        </>
      )}
    </>
  );
}
