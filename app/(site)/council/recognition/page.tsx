import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Award, Crown, FileText, GraduationCap, Medal, Star } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import { awardKind, getRecognitions, type AwardKind } from "@/lib/recognition";
import { RECOGNITION_INTRO, TEACHERS_DAY, type RecognitionItem } from "@/lib/recognition-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Yutuqlarni e’tirof etish — Yangi Samarqand",
  description: "Davlat mukofotlari, faxriy unvonlar va Kengash e’tirofi bilan taqdirlangan Samarqand tadbirkorlari.",
};

const KIND: Record<AwardKind, { icon: typeof Award; badge: string; label: string; color: string }> = {
  order: { icon: Star, badge: "from-[#f6d77b] to-[#b8862b] text-[#3a2600]", label: "Orden", color: "var(--color-gold)" },
  medal: { icon: Medal, badge: "from-[#eef1f5] to-[#9aa4b2] text-[#1d2430]", label: "Medal", color: "var(--color-mist)" },
  title: { icon: Crown, badge: "from-turq to-lapis text-white", label: "Faxriy unvon", color: "var(--color-turq)" },
  academy: { icon: GraduationCap, badge: "from-lapis to-ember text-white", label: "Akademiya a’zoligi", color: "var(--color-lapis)" },
  other: { icon: Award, badge: "from-gold to-ember text-ink", label: "E’tirof", color: "var(--color-ember)" },
};
const KIND_ORDER: AwardKind[] = ["order", "medal", "title", "academy", "other"];

export default async function RecognitionPage() {
  const [page, items] = await Promise.all([api.page("recognition"), getRecognitions()]);
  // the CMS text: what comes before its first sub-heading introduces the project, the rest closes the page
  const [introHtml, ...restHtml] = (page?.body ?? "").split(/(?=<h2)/);

  const years = [...new Set(items.map((r) => r.year))].sort((a, b) => a - b);
  const people = new Set(items.map((r) => r.fullName)).size;
  const byKind = KIND_ORDER.map((k) => {
    const list = items.filter((r) => awardKind(r.award) === k);
    const names = [...new Set(list.map((r) => r.award))];
    // one award name for the whole kind («Do‘stlik» ordeni) reads better than the generic label
    return { k, count: list.length, label: names.length === 1 && names[0].length < 24 ? names[0] : KIND[k].label };
  }).filter((x) => x.count);

  return (
    <>
      <PageHero
        kicker="E’tirof"
        title="Yutuqlarni"
        highlight="e’tirof etish"
        description={page?.subtitle || RECOGNITION_INTRO.subtitle}
        crumbs={[{ label: "Kengash", href: "/council" }, { label: "E’tirof" }]}
        accent="gold"
      />

      {/* the project in two lines + the honours at a glance */}
      <Container className="grid gap-8 pb-12 lg:grid-cols-12 lg:gap-12 md:pb-16">
        <Reveal className="lg:col-span-5">
          {introHtml.trim() ? (
            <RichText html={introHtml} className="text-lg" />
          ) : (
            <div className="space-y-4 text-lg leading-relaxed text-ivory/85">
              {RECOGNITION_INTRO.paragraphs.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}
        </Reveal>
        <Reveal stagger={0.08} className="grid grid-cols-2 gap-3 self-start lg:col-span-7 xl:grid-cols-3">
          <div data-reveal-item className="flex flex-col justify-between rounded-[1.6rem] border border-gold/30 bg-gradient-to-br from-gold/15 via-ink-2 to-ink-2 p-6 xl:row-span-2">
            <Award className="size-8 text-gold" />
            <div>
              <p className="font-display text-6xl font-semibold tracking-tight text-gold">{people}</p>
              <p className="mt-2 text-sm text-ivory/80">taqdirlangan tadbirkor</p>
            </div>
          </div>
          {byKind.map(({ k, count, label }) => {
            const { icon: Icon, badge } = KIND[k];
            return (
              <div key={k} data-reveal-item className="flex flex-col justify-between gap-4 rounded-[1.6rem] border border-ivory/10 bg-ink-2 p-6">
                <span className={cn("grid size-11 place-items-center rounded-full bg-gradient-to-br shadow-md", badge)}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-display text-4xl font-semibold tracking-tight">{count}</p>
                  <p className="mt-1 text-sm leading-snug text-ivory/80">{label}</p>
                </div>
              </div>
            );
          })}
        </Reveal>
      </Container>

      {/* year by year: the document, then the people it honoured */}
      <section className="bg-ink-2 py-12 md:py-16">
        <Container>
          <SectionTitle kicker="Yillar bo‘yicha" title="Taqdirlangan" highlight="tadbirkorlar" />
          <div className="space-y-14 md:space-y-20">
            {years.map((year) => {
              const ofYear = items.filter((r) => r.year === year);
              const groups = [...new Set(ofYear.map((r) => r.basis))].map((basis) => ({
                basis,
                list: ofYear.filter((r) => r.basis === basis),
              }));
              return (
                <div key={year} className="grid gap-6 lg:grid-cols-12 lg:gap-10">
                  <div className="lg:col-span-3">
                    <div className="flex items-baseline gap-4 lg:sticky lg:top-28 lg:block">
                      <p className="font-display text-5xl font-bold leading-none tracking-tight text-gold md:text-8xl">{year}</p>
                      <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-mist lg:mt-3">
                        {ofYear.length} ta e’tirof
                      </p>
                    </div>
                  </div>
                  <div className="space-y-8 lg:col-span-9">
                    {groups.map((g) => (
                      <div key={g.basis}>
                        <p className="mb-4 flex items-start gap-2.5 text-[15px] leading-snug text-ivory/80">
                          <FileText className="mt-0.5 size-4 shrink-0 text-gold" />
                          <span>
                            {g.basis}
                            {g.list[0].reason && <span className="text-ivory/60"> — {g.list[0].reason}</span>}
                          </span>
                        </p>
                        <Reveal stagger={0.08} className="grid gap-4 md:grid-cols-2">
                          {g.list.map((r) => (
                            <PersonCard key={r.fullName + r.award} r={r} />
                          ))}
                        </Reveal>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Container>
      </section>

      {/* the rest of the CMS text (e.g. the Teachers' Day honours), or the official list when the CMS is silent */}
      <section className="py-12 md:py-16">
        <Container>
          {restHtml.join("").trim() ? (
            <Reveal className="mx-auto max-w-4xl">
              <RichText html={restHtml.join("")} />
            </Reveal>
          ) : (
            <TeachersDay />
          )}
          <Reveal className="mt-12 md:mt-16">
            <Link
              href="/business-environment/forum"
              data-cursor="hover"
              className="group flex flex-col justify-between gap-4 rounded-[2rem] border border-ivory/10 bg-ink-2 p-7 transition-colors duration-500 hover:border-gold/50 md:flex-row md:items-center md:p-9"
            >
              <span>
                <span className="block font-mono text-[12px] uppercase tracking-[0.18em] text-mist">Korxonalar e’tirofi</span>
                <span className="mt-2 block font-display text-2xl font-semibold md:text-3xl">Sanoatchilar forumi — eng ilg‘orlar</span>
                <span className="mt-1 block text-ivory/75">Forum nominatsiyalari va g‘oliblari, yillar va kategoriyalar bo‘yicha.</span>
              </span>
              <span className="grid size-14 shrink-0 place-items-center rounded-full border border-ivory/15 transition-[transform,border-color,color] duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:text-gold">
                <ArrowUpRight className="size-5" />
              </span>
            </Link>
          </Reveal>
        </Container>
      </section>
    </>
  );
}

function PersonCard({ r }: { r: RecognitionItem }) {
  const kind = awardKind(r.award);
  const { icon: Icon, badge, color } = KIND[kind];
  const initials = r.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("");
  return (
    <article
      data-reveal-item
      className="group relative flex flex-col overflow-hidden rounded-[1.8rem] border border-ivory/10 bg-ink p-6 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-1 hover:border-[color:var(--c)] md:p-7"
      style={{ "--c": color } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--c)_18%,transparent),transparent_65%)]" />
      <div className="relative flex items-start gap-4">
        {r.photo ? (
          // eslint-disable-next-line @next/next/no-img-element -- CMS photo of any size; a plain lazy img is enough here
          <img src={r.photo} alt="" loading="lazy" className="size-16 shrink-0 rounded-full object-cover ring-2 ring-[color:var(--c)]" />
        ) : (
          <span
            aria-hidden
            className="grid size-16 shrink-0 place-items-center rounded-full border border-ivory/15 bg-ink-2 font-display text-lg font-semibold tracking-tight"
          >
            {initials}
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-display text-xl font-semibold leading-snug md:text-[1.35rem]">{r.fullName}</h3>
          {r.company && <p className="mt-1.5 text-[15px] leading-snug text-ivory/75">{r.company}</p>}
        </div>
      </div>
      <div className="relative mt-6 flex items-center gap-3 border-t border-ivory/10 pt-5">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br shadow-md", badge)}>
          <Icon className="size-4" />
        </span>
        <span className="text-[15px] font-semibold leading-snug" style={{ color: "color-mix(in oklab, var(--c) 70%, var(--color-ivory))" }}>
          {r.award}
        </span>
      </div>
    </article>
  );
}

function TeachersDay() {
  return (
    <Reveal className="grid gap-8 rounded-[2rem] border border-ivory/10 bg-ink-2 p-7 md:p-10 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <p className="font-mono text-[12px] uppercase tracking-[0.18em] text-gold">{TEACHERS_DAY.date}</p>
        <h2 className="mt-3 font-display text-2xl font-semibold leading-tight md:text-3xl">Ustoz va murabbiylar kuni munosabati bilan</h2>
        <p className="mt-4 leading-relaxed text-ivory/80">{TEACHERS_DAY.text}</p>
      </div>
      <ol className="grid content-start gap-3 sm:grid-cols-2 lg:col-span-7">
        {TEACHERS_DAY.names.map((n, i) => (
          <li key={n} className="flex items-center gap-3 rounded-2xl border border-ivory/10 bg-ink px-4 py-3">
            <span className="font-mono text-[12px] text-mist">{String(i + 1).padStart(2, "0")}</span>
            <span className="font-semibold">{n}</span>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}
