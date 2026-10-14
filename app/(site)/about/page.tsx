import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { byGroup, NumberedList, settingsStats, StatsStrip } from "@/components/site/blocks";
import { StarMark } from "@/components/logo";
import { api } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Biz haqimizda — Yangi Samarqand",
  description: "«Yangi Samarqand» tadbirkorlar jamoat fondi: missiya, maqsadlar, vizyon va qadriyatlar.",
};

const LINKS = [
  { href: "/about/history", title: "Tashkil topish tarixi", text: "2021-yildan bugungacha bosib o‘tilgan yo‘l" },
  { href: "/about/membership", title: "A’zolik", text: "Shartlar, badallar va ariza topshirish" },
  { href: "/council/members", title: "Kengash a’zolari", text: "Viloyatning yetakchi tadbirkorlari" },
  { href: "/council/management", title: "Boshqaruv", text: "Kengash Boshqaruvi tarkibi" },
];

export default async function AboutPage() {
  const [page, settings] = await Promise.all([api.page("about"), api.settings()]);
  const principles = byGroup(page?.blocks, "principles");
  const values = byGroup(page?.blocks, "values");

  return (
    <>
      <PageHero
        kicker="Biz haqimizda"
        title="Tadbirkorlar"
        highlight="jamoat kengashi"
        description={page?.subtitle || "Tadbirkorlikni jadal rivojlantirish sari birgamiz."}
        crumbs={[{ label: "Biz haqimizda" }]}
      />

      <Container className="py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <RichText html={page?.body ?? ""} className="text-[1.3rem] md:text-[1.45rem]" />
          </Reveal>
          <Reveal className="relative hidden lg:col-span-4 lg:col-start-9 lg:block" delay={0.15}>
            <div className="relative aspect-square">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-turq/20 via-lapis/15 to-gold/20 blur-2xl" />
              <StarMark className="spin-slow relative size-full opacity-90" />
            </div>
          </Reveal>
        </div>
      </Container>

      {principles.length > 0 && (
        <section className="bg-ink-2 py-10 md:py-14">
          <Container>
            <SectionTitle index="01" kicker="Tamoyillar" title="Shior, missiya" highlight="va maqsadlar" />
            <Reveal stagger={0.1} className="grid gap-5 md:grid-cols-2">
              {principles.map((p, i) => (
                <article
                  key={p.title}
                  data-reveal-item
                  className={
                    "group relative overflow-hidden rounded-[2rem] border border-ivory/10 p-8 transition-colors duration-700 hover:border-turq/40 md:p-10 " +
                    (i === 0 ? "bg-gradient-to-br from-turq/15 via-ink to-gold/10 md:col-span-2" : "bg-ink")
                  }
                >
                  <span className="font-mono text-[13px] uppercase tracking-[0.2em] text-turq">{p.title}</span>
                  <p className={i === 0 ? "mt-6 font-display text-3xl font-semibold leading-tight md:text-5xl" : "mt-5 text-xl leading-relaxed text-ivory/90"}>
                    {p.body}
                  </p>
                  <span className="pointer-events-none absolute -bottom-10 -right-6 font-display text-[9rem] font-bold leading-none text-ivory/[0.04] transition-transform duration-700 group-hover:-translate-y-3">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </article>
              ))}
            </Reveal>
          </Container>
        </section>
      )}

      {values.length > 0 && (
        <Container className="py-10 md:py-14">
          <SectionTitle index="02" kicker="Qadriyatlar" title="Bizni birlashtiradigan" highlight="qadriyatlar" />
          <NumberedList items={values} />
        </Container>
      )}

      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <StatsStrip stats={settingsStats(settings)} />
          <Reveal stagger={0.08} className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                data-reveal-item
                data-cursor="hover"
                className="group flex flex-col justify-between rounded-[1.6rem] border border-ivory/10 bg-ink p-7 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-1 hover:border-turq/50"
              >
                <ArrowUpRight className="size-6 self-end text-turq transition-transform duration-500 group-hover:rotate-45" />
                <div className="mt-10">
                  <p className="font-display text-xl font-semibold">{l.title}</p>
                  <p className="mt-2 text-base text-ivory/75">{l.text}</p>
                </div>
              </Link>
            ))}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
