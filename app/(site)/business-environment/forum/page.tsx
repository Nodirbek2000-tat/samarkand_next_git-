import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { StatsStrip } from "@/components/site/blocks";
import { Container, EmptyState, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Sanoatchilar forumi — Yangi Samarqand",
  description: "Samarqand viloyati sanoatchilar forumi: yillar bo‘yicha nominatsiyalar va g‘oliblar.",
};

export default async function ForumPage() {
  const [editions, project] = await Promise.all([api.forum(), api.project("forum-overview")]);
  const list = editions ?? [];
  const nominations = list.reduce((s, e) => s + e.nominations_count, 0);
  const winners = list.reduce((s, e) => s + e.winners_count, 0);

  return (
    <>
      <PageHero
        kicker="Sanoatchilar forumi"
        title="Eng yaxshilar"
        highlight="e’tirofi"
        description={project?.summary}
        crumbs={[{ label: "Biznes muhit" }, { label: "Sanoatchilar forumi" }]}
        accent="gold"
      />

      {list.length > 0 && (
        <Container className="-mt-6 mb-12">
          <StatsStrip
            stats={[
              { value: String(list.length), label: "forum o‘tkazildi" },
              { value: String(nominations), label: "nominatsiya" },
              { value: String(winners), label: "taqdirlangan korxona va shaxs" },
              { value: String(list[list.length - 1]?.year ?? ""), label: "ilk forum yili" },
            ]}
          />
        </Container>
      )}

      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <SectionTitle kicker="Yillar bo‘yicha" title="Forum" highlight="g‘oliblari" />
          {list.length === 0 ? (
            <EmptyState title="Forum natijalari tez orada joylanadi" />
          ) : (
            <Reveal stagger={0.1} className="grid gap-5 lg:grid-cols-3">
              {list.map((e, i) => (
                <Link
                  key={e.id}
                  href={`/business-environment/forum/${e.year}`}
                  data-reveal-item
                  data-cursor="view"
                  data-cursor-label="Ochish"
                  className="group relative flex min-h-[420px] flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink p-8 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-2 hover:border-gold/50"
                >
                  <span className="pointer-events-none absolute -right-6 -top-10 font-display text-[11rem] font-bold leading-none tracking-tighter text-gold/10 transition-transform duration-[1.2s] ease-expo group-hover:-translate-x-4 group-hover:scale-105">
                    {e.year}
                  </span>
                  <div className="relative flex items-center justify-between">
                    <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-semibold text-gold">
                      {i === 0 ? "So‘nggi forum" : `${e.results_year}-yil yakunlari`}
                    </span>
                    <ArrowUpRight className="size-6 text-ivory/50 transition-transform duration-500 group-hover:rotate-45 group-hover:text-gold" />
                  </div>
                  <div className="relative">
                    <p className="font-display text-7xl font-bold tracking-tight">{e.year}</p>
                    <p className="mt-3 flex items-center gap-2 text-lg text-ivory/80">
                      <CalendarDays className="size-5 text-gold" /> {e.dates}
                    </p>
                    <div className="mt-6 flex gap-8 border-t border-ivory/10 pt-5">
                      <div>
                        <p className="font-display text-3xl font-semibold text-gold">{e.nominations_count}</p>
                        <p className="text-sm text-ivory/70">nominatsiya</p>
                      </div>
                      <div>
                        <p className="font-display text-3xl font-semibold text-gold">{e.winners_count}</p>
                        <p className="text-sm text-ivory/70">g‘olib</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </Reveal>
          )}
        </Container>
      </section>

      {project?.body && (
        <Container className="py-10 md:py-14">
          <Reveal className="mx-auto max-w-4xl">
            <RichText html={project.body} />
          </Reveal>
        </Container>
      )}
    </>
  );
}
