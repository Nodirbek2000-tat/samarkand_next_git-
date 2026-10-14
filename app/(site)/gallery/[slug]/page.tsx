import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, CalendarDays, Camera, MapPin } from "lucide-react";
import { PhotoGrid } from "@/components/site/lightbox";
import { Reveal } from "@/components/site/reveal";
import { Container, EmptyState, GridSkeleton } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import { formatDate } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/gallery/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const g = await api.gallery(slug);
  return { title: g ? `${g.title} — Fotohisobot` : "Fotohisobot" };
}

export default function GalleryDetailPage({ params }: PageProps<"/gallery/[slug]">) {
  return (
    <Suspense fallback={<Container className="pt-44"><GridSkeleton /></Container>}>
      <GalleryDetail params={params} />
    </Suspense>
  );
}

async function GalleryDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const g = await api.gallery(slug);
  if (!g) notFound();
  return (
    <Container className="pb-14 pt-28 md:pt-32">
      <Link href="/gallery" className="mb-10 inline-flex items-center gap-2 text-base font-semibold text-turq" data-cursor="hover">
        <ArrowLeft className="size-5" /> Barcha fotohisobotlar
      </Link>
      <Reveal className="mb-14 max-w-5xl">
        <h1 className="font-display text-[clamp(1.5rem,3.2vw,3rem)] [overflow-wrap:anywhere] font-bold leading-[1.02] tracking-[-0.03em]">{g.title}</h1>
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-lg text-ivory/80">
          {g.event_date && (
            <span className="flex items-center gap-2">
              <CalendarDays className="size-5 text-turq" /> {formatDate(g.event_date)}
            </span>
          )}
          {g.location && (
            <span className="flex items-center gap-2">
              <MapPin className="size-5 text-turq" /> {g.location}
            </span>
          )}
          <span className="flex items-center gap-2">
            <Camera className="size-5 text-turq" /> {g.images_count} ta surat
          </span>
        </div>
        {g.description && <p className="mt-6 text-xl leading-relaxed text-ivory/85">{g.description}</p>}
      </Reveal>
      {g.images.length ? <PhotoGrid images={g.images} /> : <EmptyState title="Suratlar tez orada yuklanadi" />}
    </Container>
  );
}
