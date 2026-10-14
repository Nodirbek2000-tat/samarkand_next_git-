import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, Camera, MapPin } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { Container, GridSkeleton, RichText } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import type { Winner } from "@/lib/api/types";
import { cn } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/business-environment/forum/[year]">): Promise<Metadata> {
  const { year } = await params;
  return { title: `Sanoatchilar forumi — ${year}` };
}

export default function ForumYearPage({ params }: PageProps<"/business-environment/forum/[year]">) {
  return (
    <Suspense fallback={<Container className="pt-44"><GridSkeleton /></Container>}>
      <ForumYear params={params} />
    </Suspense>
  );
}

const MEDAL: Record<string, string> = {
  "1": "from-[#f6d77b] to-[#b8862b] text-[#3a2600]",
  "2": "from-[#eef1f5] to-[#9aa4b2] text-[#1d2430]",
  "3": "from-[#f0b48a] to-[#9b5a2e] text-[#2c1405]",
  winner: "from-turq to-lapis text-white",
  special: "from-lapis to-ember text-white",
};
const SHORT: Record<string, string> = { "1": "I", "2": "II", "3": "III", winner: "★", special: "✦" };

function WinnerRow({ w }: { w: Winner }) {
  return (
    <li className="flex items-start gap-4 rounded-2xl p-3 transition-colors hover:bg-ivory/[0.05]">
      <span className={cn("grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-base font-bold shadow-md", MEDAL[w.level] ?? MEDAL.winner)}>
        {SHORT[w.level] ?? "★"}
      </span>
      <span>
        <span className="block text-lg font-semibold leading-snug">{w.name}</span>
        <span className="block text-sm text-ivory/70">{[w.level_label, w.note].filter(Boolean).join(" · ")}</span>
      </span>
    </li>
  );
}

async function ForumYear({ params }: { params: Promise<{ year: string }> }) {
  const { year } = await params;
  const [e, all] = await Promise.all([api.forumEdition(year), api.forum()]);
  if (!e) notFound();

  return (
    <>
      <section className="relative overflow-hidden px-5 pb-10 pt-28 md:px-10 md:pt-32">
        <span className="pointer-events-none absolute -right-[5vw] top-16 select-none font-display text-[38vw] font-bold leading-none tracking-tighter text-gold/[0.07] md:text-[28vw]">
          {e.year}
        </span>
        <Container className="relative px-0 md:px-0">
          <Link href="/business-environment/forum" data-cursor="hover" className="mb-10 inline-flex items-center gap-2 text-base font-semibold text-gold">
            <ArrowLeft className="size-5" /> Barcha forumlar
          </Link>
          <Reveal>
            <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-gold">{e.results_year}-yil sanoat rivoji yakunlari</p>
            <h1 className="mt-5 max-w-[16ch] font-display text-[clamp(1.6rem,3.8vw,3.4rem)] [overflow-wrap:anywhere] font-bold leading-[0.95] tracking-[-0.03em]">{e.title}</h1>
            <div className="mt-8 flex flex-wrap gap-3 text-lg">
              {e.dates && <span className="glass rounded-full px-5 py-2.5 font-semibold">{e.dates}</span>}
              {e.location && (
                <span className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold">
                  <MapPin className="size-5 text-gold" /> {e.location}
                </span>
              )}
              {e.gallery_slug && (
                <Link href={`/gallery/${e.gallery_slug}`} className="glass inline-flex items-center gap-2 rounded-full px-5 py-2.5 font-semibold hover:text-gold">
                  <Camera className="size-5 text-gold" /> Fotohisobot
                </Link>
              )}
            </div>
          </Reveal>
          {all && all.length > 1 && (
            <nav className="mt-10 flex flex-wrap gap-2" aria-label="Forum yillari">
              {all.map((x) => (
                <Link
                  key={x.year}
                  href={`/business-environment/forum/${x.year}`}
                  className={cn(
                    "rounded-full border px-5 py-2.5 text-base font-semibold transition-colors",
                    x.year === e.year ? "border-gold bg-gold text-ink" : "border-ivory/15 hover:border-gold hover:text-gold",
                  )}
                >
                  Forum {x.year}
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

      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <Reveal stagger={0.08} className="grid gap-5 lg:grid-cols-2">
            {e.nominations.map((n, i) => (
              <article key={n.id} data-reveal-item className="rounded-[2rem] border border-ivory/10 bg-ink p-6 md:p-8">
                <div className="flex items-start gap-4">
                  <span className="font-display text-4xl font-bold leading-none text-gold/50">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="font-display text-xl font-semibold leading-snug md:text-2xl">{n.title}</h2>
                </div>
                <ul className="mt-6 space-y-1 border-t border-ivory/10 pt-4">
                  {n.winners.map((w) => (
                    <WinnerRow key={w.id} w={w} />
                  ))}
                </ul>
              </article>
            ))}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
