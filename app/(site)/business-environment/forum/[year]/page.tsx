import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, CalendarDays, Camera, MapPin } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Container, GridSkeleton, RichText } from "@/components/site/ui";
import { ForumResults } from "@/components/forum/forum-results";
import { countWinners, editionCategories, getForumEdition, getForumEditions, type ForumEditionView } from "@/lib/forum";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/business-environment/forum/[year]">): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `Sanoatchilar forumi — ${year}`,
    description: `Samarqand viloyati sanoatchilar forumi ${year}: barcha nominatsiyalar va g‘oliblar, kategoriyalar bo‘yicha.`,
  };
}

export default function ForumYearPage({ params }: PageProps<"/business-environment/forum/[year]">) {
  return (
    <Suspense
      fallback={
        <Container className="pt-44">
          <GridSkeleton />
        </Container>
      }
    >
      <ForumYear params={params} />
    </Suspense>
  );
}

async function ForumYear({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const y = Number(year);
  if (!Number.isInteger(y)) notFound();
  const [e, all] = await Promise.all([getForumEdition(y), getForumEditions()]);
  if (!e) notFound();

  const at = all.findIndex((x) => x.year === e.year);
  const prev = at > 0 ? all[at - 1] : null;
  const next = at >= 0 && at < all.length - 1 ? all[at + 1] : null;
  const stats = [
    { value: e.nominations.length, label: "nominatsiya" },
    { value: countWinners(e), label: "taqdirlangan" },
    { value: editionCategories(e).length, label: "kategoriya" },
  ];

  return (
    <>
      <section className="relative overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pb-14 md:pt-36">
        <span className="pointer-events-none absolute -right-[4vw] top-14 select-none font-display text-[40vw] font-bold leading-none tracking-tighter text-gold/[0.07] md:top-10 md:text-[26vw]">
          {e.year}
        </span>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(70%_120%_at_100%_0%,color-mix(in_oklab,var(--color-gold)_12%,transparent),transparent_70%)]" />
        <Container className="relative px-0 md:px-0">
          <Link
            href="/business-environment/forum"
            data-cursor="hover"
            className="mb-8 inline-flex items-center gap-2 text-base font-semibold text-gold transition-colors hover:text-ivory md:mb-10"
          >
            <ArrowLeft className="size-5" /> Barcha forumlar
          </Link>
          <Reveal>
            <p className="font-mono text-[12.5px] uppercase tracking-[0.2em] text-gold">{e.resultsYear}-yil sanoat rivoji yakunlari</p>
            <h1 className="mt-4 font-display font-bold uppercase leading-[0.92] tracking-[-0.035em]">
              <span className="block text-[clamp(1.9rem,5.4vw,4.6rem)]">Sanoatchilar forumi</span>
              <span className="text-gradient block text-[clamp(3.4rem,11vw,9rem)]">{e.year}</span>
            </h1>
            <div className="mt-7 flex flex-wrap gap-3 text-base">
              {e.date && (
                <span className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold">
                  <CalendarDays className="size-5 text-turq" /> {e.date}
                </span>
              )}
              {e.location && (
                <span className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold">
                  <MapPin className="size-5 text-gold" /> {e.location}
                </span>
              )}
              {e.gallerySlug && (
                <Link
                  href={`/gallery/${e.gallerySlug}`}
                  className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold transition-colors hover:text-gold"
                >
                  <Camera className="size-5 text-gold" /> Fotohisobot
                </Link>
              )}
            </div>
          </Reveal>

          <Reveal stagger={0.08} className="mt-10 grid max-w-3xl grid-cols-3 border-l border-t border-ivory/10">
            {stats.map((s) => (
              <div key={s.label} data-reveal-item className="border-b border-r border-ivory/10 px-4 py-5 md:px-7 md:py-6">
                <p className="font-display text-4xl font-semibold tracking-tight text-gold md:text-5xl">{s.value}</p>
                <p className="mt-2 text-sm text-ivory/80 md:text-base">{s.label}</p>
              </div>
            ))}
          </Reveal>

          {all.length > 1 && (
            <nav className="mt-8 flex flex-wrap gap-2" aria-label="Forum yillari">
              {all.map((x) => (
                <Link
                  key={x.year}
                  href={`/business-environment/forum/${x.year}`}
                  aria-current={x.year === e.year ? "page" : undefined}
                  className={cn(
                    "rounded-full border px-5 py-2 font-display text-[15px] font-semibold tabular-nums transition-colors md:py-2.5 md:text-base",
                    x.year === e.year ? "border-gold bg-gold text-ink" : "border-ivory/15 hover:border-gold hover:text-gold",
                  )}
                >
                  <span className="hidden sm:inline">Forum </span>
                  {x.year}
                </Link>
              ))}
            </nav>
          )}
        </Container>
      </section>

      {e.intro && (
        <Container className="pb-10">
          <Reveal className="max-w-4xl">
            <RichText html={e.intro} />
          </Reveal>
        </Container>
      )}

      <section className="bg-ink-2 pb-16 md:pb-24">
        <Container>
          <ForumResults nominations={e.nominations} />
        </Container>
      </section>

      {(prev || next) && (
        <Container className="grid gap-4 py-12 md:grid-cols-2 md:py-16">
          {prev ? <EditionLink e={prev} dir="prev" /> : <span className="hidden md:block" />}
          {next && <EditionLink e={next} dir="next" />}
        </Container>
      )}
    </>
  );
}

function EditionLink({ e, dir }: { e: ForumEditionView; dir: "prev" | "next" }) {
  const Arrow = dir === "prev" ? ArrowLeft : ArrowRight;
  return (
    <Link
      href={`/business-environment/forum/${e.year}`}
      data-cursor="hover"
      className={cn(
        "group relative flex items-center gap-6 overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink-2 p-7 transition-colors duration-500 hover:border-gold/50 md:p-9",
        dir === "next" && "flex-row-reverse text-right",
      )}
    >
      <span className="grid size-14 shrink-0 place-items-center rounded-full border border-ivory/15 transition-[transform,border-color,color] duration-500 ease-expo group-hover:border-gold group-hover:text-gold">
        <Arrow className={cn("size-5 transition-transform duration-500", dir === "prev" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1")} />
      </span>
      <span className="min-w-0">
        <span className="block font-mono text-[12px] uppercase tracking-[0.18em] text-mist">
          {dir === "prev" ? "Oldingi forum" : "Keyingi forum"} · {e.resultsYear}-yil yakunlari
        </span>
        <span className="mt-1 block font-display text-3xl font-semibold tracking-tight md:text-4xl">Forum {e.year}</span>
        <span className="mt-1 block text-sm text-ivory/75">
          {e.nominations.length} nominatsiya · {countWinners(e)} taqdirlangan
        </span>
      </span>
    </Link>
  );
}
