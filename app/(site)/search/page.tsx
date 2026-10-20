import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowUpRight, Search } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Highlight, kindIcon } from "@/components/site/search-ui";
import { Container, EmptyState, GridSkeleton } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import { cleanQuery, groupByKind, mergeResults, MIN_QUERY, searchPages } from "@/lib/site-search";
import { cn } from "@/lib/utils";

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

const href = (q: string, kind?: string) => `/search?q=${encodeURIComponent(q)}${kind ? `&kind=${encodeURIComponent(kind)}` : ""}`;

async function Results({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const q = cleanQuery(typeof sp.q === "string" ? sp.q : "");
  const ready = q.length >= MIN_QUERY;
  const data = ready ? await api.search(q) : null;
  const all = ready ? mergeResults(searchPages(q), data?.results ?? []) : [];
  const groups = groupByKind(all);
  const kind = typeof sp.kind === "string" && groups.some((g) => g.kind === sp.kind) ? sp.kind : undefined;
  const shown = kind ? groups.filter((g) => g.kind === kind) : groups;

  return (
    <>
      <form action="/search" className="glass mb-8 flex h-16 max-w-3xl items-center gap-3 rounded-full pl-6 pr-2" role="search">
        <Search className="size-6 shrink-0 text-turq" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Yangiliklar, loyihalar, a’zolar…"
          className="h-full w-full min-w-0 bg-transparent text-xl outline-none placeholder:text-ivory/45"
          aria-label="Qidiruv so‘zi"
          enterKeyHint="search"
          maxLength={100}
        />
        <button type="submit" className="shrink-0 rounded-full bg-ivory px-6 py-3 font-semibold text-ink">
          Qidirish
        </button>
      </form>
      {!ready ? (
        <EmptyState title="Qidiruv so‘zini kiriting" text="Kamida 2 ta harf." />
      ) : all.length === 0 ? (
        <EmptyState title={`«${q}» bo‘yicha hech narsa topilmadi`} text="Boshqa so‘z bilan urinib ko‘ring." />
      ) : (
        <>
          <p className="text-lg text-ivory/80">
            «<span className="font-semibold text-ivory">{q}</span>» bo‘yicha {all.length} ta natija
          </p>
          {groups.length > 1 && (
            <nav aria-label="Natija turlari" className="mt-5 flex flex-wrap gap-2">
              {[
                { kind: undefined, label: "Hammasi", count: all.length },
                ...groups.map((g) => ({ kind: g.kind, label: g.kind, count: g.items.length })),
              ].map((chip) => (
                <Link
                  key={chip.label}
                  href={href(q, chip.kind)}
                  scroll={false}
                  aria-current={chip.kind === kind ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    chip.kind === kind
                      ? "border-turq bg-turq/15 text-ivory"
                      : "border-ivory/15 text-ivory/75 hover:border-turq/60 hover:text-ivory",
                  )}
                >
                  {chip.label}
                  <span className="tabular-nums text-ivory/55">{chip.count}</span>
                </Link>
              ))}
            </nav>
          )}
          <div className="mt-10 space-y-12">
            {shown.map(({ kind: k, items }) => {
              const Icon = kindIcon(k);
              return (
                <section key={k} aria-label={k}>
                  <h2 className="flex items-center gap-2 font-mono text-[13px] uppercase tracking-[0.18em] text-turq">
                    <Icon className="size-4" /> {k} <span className="text-ivory/50">· {items.length}</span>
                  </h2>
                  <Reveal stagger={0.05} as="ul" className="mt-3 divide-y divide-ivory/10 border-y border-ivory/10">
                    {items.map((r) => (
                      <li key={r.url + r.title} data-reveal-item>
                        <Link href={r.url} className="group flex items-start justify-between gap-6 py-6">
                          <span className="min-w-0">
                            <span className="block font-display text-2xl font-semibold leading-snug [overflow-wrap:anywhere] group-hover:text-turq">
                              <Highlight text={r.title} q={q} />
                            </span>
                            {r.text && (
                              <span className="mt-2 block text-base text-ivory/75">
                                <Highlight text={r.text} q={q} />
                              </span>
                            )}
                          </span>
                          <ArrowUpRight className="mt-2 size-6 shrink-0 text-ivory/50 transition-transform group-hover:rotate-45 group-hover:text-turq" />
                        </Link>
                      </li>
                    ))}
                  </Reveal>
                </section>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
