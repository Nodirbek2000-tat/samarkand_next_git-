import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Reveal } from "@/components/site/reveal";
import { ShareBar } from "@/components/site/share-bar";
import { FilmCard } from "@/components/site/cards";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { ProfileSkeleton } from "@/components/site/person-profile";
import { api } from "@/lib/api/server";
import { youtubeEmbed } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/news/films/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const f = await api.film(slug);
  return { title: f ? `${f.title} — Filmlar` : "Film" };
}

export default function FilmPage({ params }: PageProps<"/news/films/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Film params={params} />
    </Suspense>
  );
}

async function Film({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [f, all] = await Promise.all([api.film(slug), api.films({ page_size: 4 })]);
  if (!f) notFound();
  const embed = youtubeEmbed(f.video_url);
  const others = (all?.results ?? []).filter((x) => x.id !== f.id).slice(0, 3);

  return (
    <>
      <Container className="pb-10 pt-28 md:pt-32">
        <Link href="/news/films" className="mb-10 inline-flex items-center gap-2 text-base font-semibold text-turq" data-cursor="hover">
          <ArrowLeft className="size-5" /> Barcha filmlar
        </Link>
        <Reveal>
          <p className="text-lg font-semibold text-turq">{f.company}</p>
          <h1 className="mt-3 max-w-5xl font-display text-[clamp(1.5rem,3.2vw,3rem)] [overflow-wrap:anywhere] font-bold leading-[1.02] tracking-[-0.03em]">{f.title}</h1>
          {f.owner_name && <p className="mt-4 text-xl text-ivory/80">{f.owner_name}</p>}
        </Reveal>
        <Reveal className="mt-12 overflow-hidden rounded-[2.2rem] border border-ivory/10 bg-black">
          {f.video_file ? (
            <video src={f.video_file} poster={f.cover ?? undefined} controls preload="metadata" playsInline className="aspect-video w-full bg-black" />
          ) : embed ? (
            <iframe src={embed} title={f.title} className="aspect-video w-full" allow="accelerometer; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
          ) : (
            <a href={f.video_url} target="_blank" rel="noreferrer" className="flex aspect-video items-center justify-center gap-3 text-xl font-semibold text-white">
              <ExternalLink className="size-6" /> Videoni ochish
            </a>
          )}
        </Reveal>
        <div className="mx-auto mt-14 max-w-4xl">
          <RichText html={f.description} />
          <ShareBar title={f.title} className="mt-12" />
        </div>
      </Container>
      {others.length > 0 && (
        <section className="bg-ink-2 py-10">
          <Container>
            <SectionTitle kicker="Yana" title="Boshqa" highlight="filmlar" />
            <div className="grid gap-5 md:grid-cols-3">
              {others.map((o) => (
                <FilmCard key={o.id} film={o} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
