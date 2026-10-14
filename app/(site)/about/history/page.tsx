import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Timeline } from "@/components/site/timeline";
import { byGroup } from "@/components/site/blocks";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Tashkil topish tarixi — Yangi Samarqand" };

export default async function HistoryPage() {
  const page = await api.page("about-history");
  const timeline = byGroup(page?.blocks, "timeline");

  return (
    <>
      <PageHero
        kicker="Tarix"
        title="Tashkil topish"
        highlight="tarixi"
        description={page?.subtitle}
        crumbs={[{ label: "Biz haqimizda", href: "/about" }, { label: "Tarix" }]}
        accent="gold"
      />
      <Container className="py-10 md:py-14">
        <Reveal className="mx-auto max-w-3xl">
          <RichText html={page?.body ?? ""} className="text-[1.3rem]" />
        </Reveal>
      </Container>
      {timeline.length > 0 && (
        <section className="bg-ink-2 py-10 md:py-16">
          <Container>
            <SectionTitle kicker="Muhim sanalar" title="Yillar" highlight="davomida" />
            <Timeline items={timeline} />
          </Container>
        </section>
      )}
    </>
  );
}
