import type { Metadata } from "next";
import { Award, Medal } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import type { Recognition } from "@/lib/api/types";

export const metadata: Metadata = { title: "Yutuqlarni e’tirof etish — Yangi Samarqand" };

export default async function RecognitionPage() {
  const [page, items] = await Promise.all([api.page("recognition"), api.recognitions()]);
  const byYear = new Map<number, Recognition[]>();
  for (const r of items ?? []) byYear.set(r.year, [...(byYear.get(r.year) ?? []), r]);
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <>
      <PageHero
        kicker="E’tirof"
        title="Yutuqlarni"
        highlight="e’tirof etish"
        description={page?.subtitle}
        crumbs={[{ label: "Kengash", href: "/council" }, { label: "E’tirof" }]}
        accent="gold"
      />

      {years.length > 0 && (
        <section className="py-10 md:py-14">
          <Container>
            <SectionTitle kicker="Davlat mukofotlari" title="Taqdirlangan" highlight="tadbirkorlar" />
            <div className="space-y-16">
              {years.map((year) => (
                <div key={year} className="grid gap-8 lg:grid-cols-12">
                  <Reveal className="lg:col-span-3">
                    <p className="sticky top-32 font-display text-7xl font-bold leading-none tracking-tight text-gold md:text-8xl">{year}</p>
                  </Reveal>
                  <Reveal stagger={0.08} className="grid gap-4 md:grid-cols-2 lg:col-span-9">
                    {byYear.get(year)!.map((r) => (
                      <article
                        key={r.id}
                        data-reveal-item
                        className="group relative overflow-hidden rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-1 hover:border-gold/50"
                      >
                        <div className="flex items-center gap-3 text-gold">
                          {r.award.toLowerCase().includes("medal") ? <Medal className="size-6" /> : <Award className="size-6" />}
                          <span className="text-base font-semibold">{r.award}</span>
                        </div>
                        <h3 className="mt-5 font-display text-2xl font-semibold leading-snug">{r.full_name}</h3>
                        {r.company && <p className="mt-2 text-base text-ivory/80">{r.company}</p>}
                        {r.description && <RichText html={r.description} className="mt-4 text-base text-ivory/70" />}
                      </article>
                    ))}
                  </Reveal>
                </div>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <Reveal className="mx-auto max-w-4xl">
            <RichText html={page?.body ?? ""} />
          </Reveal>
        </Container>
      </section>
    </>
  );
}
