import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { AnnouncementCard } from "@/components/site/cards";
import { Container, EmptyState, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "E’lonlar va tadbirlar — Yangi Samarqand" };

export default async function AnnouncementsPage() {
  const [upcoming, past] = await Promise.all([
    api.announcements({ when: "upcoming", page_size: 20 }),
    api.announcements({ when: "past", page_size: 20 }),
  ]);
  const up = upcoming?.results ?? [];
  const old = past?.results ?? [];

  return (
    <>
      <PageHero
        kicker="E’lonlar"
        title="Tadbirlar va"
        highlight="e’lonlar"
        description="Kengash yig‘ilishlari, forumlar, seminarlar va boshqa tadbirlar haqida oldindan xabardor bo‘ling."
        crumbs={[{ label: "Media", href: "/news" }, { label: "E’lonlar" }]}
        compact
      />
      <Container className="pb-12">
        <SectionTitle kicker="Yaqinlashayotgan" title="Kelgusi" highlight="tadbirlar" />
        {up.length ? (
          <Reveal stagger={0.08} className="grid gap-5 lg:grid-cols-2">
            {up.map((a) => (
              <div key={a.id} data-reveal-item>
                <AnnouncementCard item={a} />
              </div>
            ))}
          </Reveal>
        ) : (
          <EmptyState title="Hozircha rejalashtirilgan tadbirlar yo‘q" text="Yangi tadbirlar e’lon qilinishi bilan shu yerda paydo bo‘ladi." />
        )}
      </Container>
      {old.length > 0 && (
        <section className="bg-ink-2 py-10">
          <Container>
            <SectionTitle kicker="Arxiv" title="O‘tgan" highlight="tadbirlar" />
            <Reveal stagger={0.06} className="grid gap-5 lg:grid-cols-2">
              {old.map((a) => (
                <div key={a.id} data-reveal-item>
                  <AnnouncementCard item={a} />
                </div>
              ))}
            </Reveal>
          </Container>
        </section>
      )}
    </>
  );
}
