import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { byGroup } from "@/components/site/blocks";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { Logo, StarMark } from "@/components/logo";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Korporativ elementlar — Yangi Samarqand" };

export default async function CorporatePage() {
  const page = await api.page("about-corporate");
  const elements = byGroup(page?.blocks, "elements");
  const colors = byGroup(page?.blocks, "colors");

  return (
    <>
      <PageHero
        kicker="Brend"
        title="Korporativ"
        highlight="elementlar"
        description={page?.subtitle}
        crumbs={[{ label: "Biz haqimizda", href: "/about" }, { label: "Korporativ elementlar" }]}
        accent="lapis"
      />

      <Container className="py-10 md:py-14">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <Reveal className="relative mx-auto grid aspect-square w-full max-w-[520px] place-items-center rounded-[3rem] border border-ivory/10 bg-ink-2">
            <div className="absolute inset-10 rounded-full bg-gradient-to-br from-turq/25 via-lapis/20 to-gold/25 blur-3xl" />
            <StarMark className="spin-slow relative size-2/3" />
          </Reveal>
          <Reveal delay={0.1}>
            <Logo className="scale-150 origin-left" />
            <RichText html={page?.body ?? ""} className="mt-12" />
          </Reveal>
        </div>
      </Container>

      {elements.length > 0 && (
        <section className="bg-ink-2 py-10 md:py-14">
          <Container>
            <SectionTitle kicker="Asosiy elementlar" title="Nom, shior" highlight="va belgi" />
            <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-3">
              {elements.map((e) => (
                <article key={e.title} data-reveal-item className="rounded-[1.8rem] border border-ivory/10 bg-ink p-8">
                  <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-turq">{e.title}</p>
                  <p className="mt-5 text-xl leading-relaxed">{e.body}</p>
                </article>
              ))}
            </Reveal>
          </Container>
        </section>
      )}

      {colors.length > 0 && (
        <Container className="py-10 md:py-14">
          <SectionTitle kicker="Ranglar" title="Brend" highlight="palitrasi" />
          <Reveal stagger={0.1} className="grid gap-5 md:grid-cols-3">
            {colors.map((c) => {
              const hex = c.body.match(/#[0-9a-f]{6}/i)?.[0] ?? "#007f78";
              return (
                <article key={c.title} data-reveal-item className="overflow-hidden rounded-[1.8rem] border border-ivory/10">
                  <div className="aspect-[4/3] transition-transform duration-700 hover:scale-[1.03]" style={{ background: hex }} />
                  <div className="bg-ink-2 p-6">
                    <p className="font-display text-2xl font-semibold">{c.title}</p>
                    <p className="mt-2 text-base text-ivory/80">{c.body}</p>
                  </div>
                </article>
              );
            })}
          </Reveal>
        </Container>
      )}
    </>
  );
}
