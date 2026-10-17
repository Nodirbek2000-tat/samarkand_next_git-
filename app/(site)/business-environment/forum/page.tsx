import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { StatsStrip } from "@/components/site/blocks";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import { countWinners, editionCategories, getForumEditions, type ForumEditionView } from "@/lib/forum";
import { CATEGORIES, CATEGORY_ORDER, type ForumCategory } from "@/lib/forum-data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sanoatchilar forumi — Yangi Samarqand",
  description: "Samarqand viloyati sanoatchilar forumi: yillar va kategoriyalar bo‘yicha nominatsiyalar va g‘oliblar.",
};

export default async function ForumPage() {
  const [editions, project] = await Promise.all([getForumEditions(), api.project("forum-overview")]);
  const latest = editions.at(-1);
  const nominations = editions.reduce((s, e) => s + e.nominations.length, 0);
  const winners = editions.reduce((s, e) => s + countWinners(e), 0);

  return (
    <>
      <PageHero
        kicker="Sanoatchilar forumi"
        title="Eng ilg‘orlar"
        highlight="e’tirofi"
        description={
          project?.summary ||
          "Har yili forumda lokalizatsiya, kooperatsiya va eksport masalalari muhokama qilinadi, viloyatning eng ilg‘or korxonalari taqdirlanadi."
        }
        crumbs={[{ label: "Biznes muhit" }, { label: "Sanoatchilar forumi" }]}
        accent="gold"
      />

      {editions.length > 0 && (
        <Container className="-mt-6 mb-12">
          <StatsStrip
            stats={[
              { value: String(editions.length), label: "forum o‘tkazildi" },
              { value: String(nominations), label: "nominatsiya" },
              { value: String(winners), label: "taqdirlangan korxona va shaxs" },
              { value: String(editions[0].year), label: "ilk forum yili" },
            ]}
          />
        </Container>
      )}

      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <SectionTitle kicker="Yillar bo‘yicha" title="Forum" highlight="natijalari" />
          <Reveal stagger={0.1} className="grid gap-5 lg:grid-cols-3">
            {editions.map((e) => (
              <EditionCard key={e.year} e={e} latest={e === latest} />
            ))}
          </Reveal>
        </Container>
      </section>

      {editions.length > 0 && (
        <section className="py-12 md:py-16">
          <Container>
            <SectionTitle
              kicker="Kategoriyalar bo‘yicha"
              title="Yil sayin"
              highlight="g‘oliblar"
              text="Har bir yo‘nalishda birinchi o‘rinni olgan korxonalar — bir qarashda."
            />
            <CategoryTable editions={editions} />
          </Container>
        </section>
      )}

      {project?.body && (
        <Container className="pb-12 md:pb-16">
          <Reveal className="mx-auto max-w-4xl">
            <RichText html={project.body} />
          </Reveal>
        </Container>
      )}

      <Container className="pb-12 md:pb-16">
        <Reveal>
          <Link
            href="/council/recognition"
            data-cursor="hover"
            className="group flex flex-col justify-between gap-4 rounded-[2rem] border border-ivory/10 bg-ink-2 p-7 transition-colors duration-500 hover:border-gold/50 md:flex-row md:items-center md:p-9"
          >
            <span>
              <span className="block font-mono text-[12px] uppercase tracking-[0.18em] text-mist">Tadbirkorlar e’tirofi</span>
              <span className="mt-2 block font-display text-2xl font-semibold md:text-3xl">Davlat mukofotlari va faxriy unvonlar</span>
              <span className="mt-1 block text-ivory/75">Orden, medal va unvonlar bilan taqdirlangan Kengash a’zolari.</span>
            </span>
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-ivory/15 transition-[transform,border-color,color] duration-500 group-hover:rotate-45 group-hover:border-gold group-hover:text-gold">
              <ArrowUpRight className="size-5" />
            </span>
          </Link>
        </Reveal>
      </Container>
    </>
  );
}

function EditionCard({ e, latest }: { e: ForumEditionView; latest: boolean }) {
  return (
    <Link
      href={`/business-environment/forum/${e.year}`}
      data-reveal-item
      data-cursor="view"
      data-cursor-label="Ochish"
      className="group relative flex min-h-[400px] flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink p-8 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-2 hover:border-gold/50"
    >
      <span className="pointer-events-none absolute -right-6 -top-10 font-display text-[11rem] font-bold leading-none tracking-tighter text-gold/10 transition-transform duration-[1.2s] ease-expo group-hover:-translate-x-4 group-hover:scale-105">
        {e.year}
      </span>
      <div className="relative flex items-center justify-between">
        <span className="rounded-full bg-gold/15 px-4 py-1.5 text-sm font-semibold text-gold">
          {latest ? "So‘nggi forum" : `${e.resultsYear}-yil yakunlari`}
        </span>
        <ArrowUpRight className="size-6 text-ivory/50 transition-transform duration-500 group-hover:rotate-45 group-hover:text-gold" />
      </div>
      <div className="relative">
        <p className="font-display text-7xl font-bold tracking-tight">{e.year}</p>
        <p className="mt-3 flex items-center gap-2 text-lg text-ivory/80">
          <CalendarDays className="size-5 text-gold" /> {e.date}
        </p>
        <div className="mt-5 flex flex-wrap gap-x-3 gap-y-2">
          {editionCategories(e).map((c) => (
            <span key={c} className="inline-flex items-center gap-1.5 text-[13px] text-ivory/75">
              <span className="size-1.5 rounded-full" style={{ background: CATEGORIES[c].color }} />
              {CATEGORIES[c].label}
            </span>
          ))}
        </div>
        <div className="mt-6 flex gap-8 border-t border-ivory/10 pt-5">
          <div>
            <p className="font-display text-3xl font-semibold text-gold">{e.nominations.length}</p>
            <p className="text-sm text-ivory/70">nominatsiya</p>
          </div>
          <div>
            <p className="font-display text-3xl font-semibold text-gold">{countWinners(e)}</p>
            <p className="text-sm text-ivory/70">taqdirlangan</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Rows = categories, columns = forums: who took first place in each direction, year by year. */
function CategoryTable({ editions }: { editions: ForumEditionView[] }) {
  const rows = CATEGORY_ORDER.filter((c) => editions.some((e) => e.nominations.some((n) => n.cat === c)));
  const cell = (e: ForumEditionView, c: ForumCategory) =>
    e.nominations
      .filter((n) => n.cat === c)
      .map((n) => ({ title: n.title, official: n.official, champs: n.winners.filter((w) => w.place === 1 || w.place === "winner" || w.place === "special") }));
  const cols = { gridTemplateColumns: `minmax(170px, 0.8fr) repeat(${editions.length}, minmax(0, 1fr))` };

  return (
    <div className="overflow-hidden rounded-[2rem] border border-ivory/10">
      {/* desktop: a real grid of rows × years */}
      <div className="hidden border-b border-ivory/10 bg-ink-2 lg:grid" style={cols}>
        <span className="px-6 py-4 font-mono text-[12px] uppercase tracking-[0.18em] text-mist">Kategoriya</span>
        {editions.map((e) => (
          <Link
            key={e.year}
            href={`/business-environment/forum/${e.year}`}
            className="border-l border-ivory/10 px-6 py-4 font-display text-lg font-semibold transition-colors hover:text-gold"
          >
            Forum {e.year}
          </Link>
        ))}
      </div>
      <Reveal stagger={0.05}>
        {rows.map((c) => (
          <div key={c} data-reveal-item className="border-b border-ivory/10 last:border-b-0 lg:grid" style={cols}>
            <div className="flex items-center gap-3 bg-ink-2/60 px-6 py-4 lg:bg-transparent lg:py-5">
              <span className="size-2.5 shrink-0 rounded-full" style={{ background: CATEGORIES[c].color }} />
              <span className="font-display text-lg font-semibold">{CATEGORIES[c].label}</span>
            </div>
            {editions.map((e) => {
              const items = cell(e, c);
              return (
                <div
                  key={e.year}
                  // phones: the year on the left, the winners on the right — one compact line per forum
                  className={cn(
                    "grid grid-cols-[3.25rem_1fr] gap-3 border-t border-ivory/10 px-6 py-3 lg:block lg:border-l lg:border-t-0 lg:py-5",
                    !items.length && "max-lg:hidden",
                  )}
                >
                  <p className="pt-0.5 font-mono text-[12px] tracking-[0.1em] text-mist lg:hidden">{e.year}</p>
                  {items.length === 0 ? (
                    <span className="text-ivory/35">—</span>
                  ) : (
                    <ul className="space-y-2 lg:space-y-3">
                      {items.map((it) => (
                        <li key={it.official}>
                          {(items.length > 1 || c === "tarmoq" || c === "turizm" || c === "oav") && (
                            <span className="block text-[13px] text-ivory/65">{it.title}</span>
                          )}
                          <span className="block font-semibold leading-snug">{it.champs.map((w) => w.name).join(", ")}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </Reveal>
    </div>
  );
}
