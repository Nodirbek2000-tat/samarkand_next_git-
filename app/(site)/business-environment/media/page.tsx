import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { FilmCard, ProjectCard } from "@/components/site/cards";
import { Container, EmptyState, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Media loyihalar — Yangi Samarqand" };

export default async function MediaPage() {
  const [projects, films] = await Promise.all([api.projects({ category: "media" }), api.films({ page_size: 12 })]);
  const media = projects?.results ?? [];
  const filmList = films?.results ?? [];

  return (
    <>
      <PageHero
        kicker="Media loyihalar"
        title="Mahalliy brendlar"
        highlight="ekranda"
        description="Viloyat ishlab chiqaruvchilari va ularning mahsulotlarini professional video formatda ommalashtirish."
        crumbs={[{ label: "Biznes muhit" }, { label: "Media loyihalar" }]}
        accent="ember"
        compact
      />
      <Container className="pb-12">
        {media.length ? (
          <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {media.map((p) => (
              <div key={p.id} data-reveal-item>
                <ProjectCard project={p} />
              </div>
            ))}
          </Reveal>
        ) : (
          <EmptyState title="Media loyihalar tez orada qo‘shiladi" />
        )}
      </Container>
      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <SectionTitle kicker="Filmlar" title="Kompaniyalar" highlight="haqida filmlar" action={{ label: "Barcha filmlar", href: "/news/films" }} />
          {filmList.length ? (
            <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filmList.map((f) => (
                <div key={f.id} data-reveal-item>
                  <FilmCard film={f} />
                </div>
              ))}
            </Reveal>
          ) : (
            <EmptyState title="Filmlar tez orada joylanadi" text="Administrator panel orqali YouTube havolasi bilan qo‘shiladi." />
          )}
        </Container>
      </section>
    </>
  );
}
