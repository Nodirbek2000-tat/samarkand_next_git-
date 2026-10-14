import type { Metadata } from "next";
import { ArrowUpRight, BadgeCheck, Factory, MapPin, Users } from "lucide-react";
import { CountUp } from "@/components/site/count-up";
import { Reveal } from "@/components/site/reveal";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { Magnetic } from "@/components/magnetic";
import { api } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Made in Samarkand — Yangi Samarqand",
  description: "Samarqand viloyatida ishlab chiqarilgan mahsulotlar katalogi: 406 korxona, 500 nusxa, 3 til.",
};

const FIELDS = [
  { icon: Factory, label: "Tashkil etilgan sana va mahsulot assortimenti" },
  { icon: Users, label: "Xodimlar soni va savdo bo‘limi kontaktlari" },
  { icon: MapPin, label: "Joylashuv, elektron pochta va ijtimoiy tarmoqlar" },
  { icon: BadgeCheck, label: "Sifat sertifikatlari, xomashyo va materiallar" },
];

export default async function MadeInSamarkandPage() {
  const [project, settings] = await Promise.all([api.project("made-in-samarkand-catalog"), api.settings()]);
  const url = project?.website_url || settings?.catalog_url || "http://madeinsam.uz";
  const stats = project?.stats ?? [];

  return (
    <>
      <section className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden px-5 pb-12 pt-28 text-center">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,color-mix(in_oklab,var(--color-gold)_22%,transparent),transparent_60%)]" />
        <svg viewBox="0 0 400 400" className="spin-slower pointer-events-none absolute size-[120vmin] opacity-25" fill="none" stroke="var(--color-gold)" strokeWidth="0.5" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x="80" y="80" width="240" height="240" transform={`rotate(${i * 3.75} 200 200)`} />
          ))}
          <circle cx="200" cy="200" r="196" stroke="var(--color-turq)" />
        </svg>
        <Reveal className="relative">
          <p className="font-mono text-[13px] uppercase tracking-[0.22em] text-gold">Kengash loyihasi · Katalog</p>
          <CountUp value="406" className="text-gradient mt-4 block font-display text-[36vw] font-bold leading-[0.8] tracking-[-0.06em] md:text-[24vw]" />
          <h1 className="mx-auto mt-6 max-w-3xl text-balance font-display text-3xl font-semibold leading-tight md:text-5xl">
            korxona — bitta katalogda. <span className="text-gold">Made in Samarkand</span>
          </h1>
          <Magnetic className="mt-10">
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              className="group inline-flex h-16 items-center gap-4 rounded-full bg-gold pl-8 pr-2 text-lg font-semibold text-ink"
            >
              Elektron katalogni ochish
              <span className="grid size-12 place-items-center rounded-full bg-ink text-gold transition-transform duration-500 group-hover:rotate-45">
                <ArrowUpRight className="size-5" />
              </span>
            </a>
          </Magnetic>
        </Reveal>
      </section>

      {stats.length > 0 && (
        <Container className="pb-12">
          <Reveal stagger={0.1} className="grid gap-5 md:grid-cols-3">
            {stats.map((s) => (
              <div key={s.label} data-reveal-item className="rounded-[2rem] border border-ivory/10 bg-ink-2 p-8 text-center">
                <CountUp value={s.value} className="font-display text-7xl font-bold text-gold" />
                <p className="mt-3 text-lg text-ivory/85">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      )}

      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <SectionTitle kicker="Katalog tarkibi" title="Har bir korxona" highlight="haqida" />
          <Reveal stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FIELDS.map(({ icon: Icon, label }) => (
              <div key={label} data-reveal-item className="group rounded-[1.8rem] border border-ivory/10 bg-ink p-7 transition-colors duration-500 hover:border-gold/50">
                <span className="grid size-14 place-items-center rounded-2xl bg-gold/15 text-gold transition-transform duration-700 ease-expo group-hover:-rotate-6 group-hover:scale-110">
                  <Icon className="size-7" />
                </span>
                <p className="mt-10 text-lg font-semibold leading-snug">{label}</p>
              </div>
            ))}
          </Reveal>
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
