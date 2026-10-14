import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowUpRight, Camera, Clock, MapPin, Users } from "lucide-react";
import { ArticleLayout, Pill } from "@/components/site/article";
import { ProfileSkeleton } from "@/components/site/person-profile";
import { api } from "@/lib/api/server";
import { formatDateTime, stripHtml } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/announcements/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const a = await api.announcement(slug);
  return a ? { title: `${a.title} — E’lonlar`, description: a.excerpt || stripHtml(a.body) } : { title: "E’lon" };
}

export default function AnnouncementPage({ params }: PageProps<"/announcements/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <Announcement params={params} />
    </Suspense>
  );
}

async function Announcement({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const a = await api.announcement(slug);
  if (!a) notFound();

  const facts = [
    a.event_date && { icon: Clock, label: "Boshlanishi", value: formatDateTime(a.event_date) },
    a.ends_at && { icon: Clock, label: "Tugashi", value: formatDateTime(a.ends_at) },
    a.location && { icon: MapPin, label: "Manzil", value: a.location },
    a.participants && { icon: Users, label: "Ishtirokchilar", value: `${a.participants} kishi` },
  ].filter(Boolean) as { icon: typeof Clock; label: string; value: string }[];

  return (
    <ArticleLayout
      back={{ href: "/announcements", label: "Barcha e’lonlar" }}
      pills={
        <>
          <Pill>{a.kind_label}</Pill>
          <Pill className={a.is_upcoming ? "border-turq/40 text-turq" : ""}>{a.is_upcoming ? "Yaqinda" : "O‘tgan"}</Pill>
        </>
      }
      title={a.title}
      lead={a.excerpt}
      cover={a.cover}
      seed={a.slug}
      body={a.body}
      aside={
        <div className="sticky top-32 space-y-4 rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7">
          {facts.map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-turq/12 text-turq">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block text-sm text-ivory/65">{label}</span>
                <span className="block text-lg font-semibold">{value}</span>
              </span>
            </div>
          ))}
          {a.registration_url && a.is_upcoming && (
            <a href={a.registration_url} target="_blank" rel="noreferrer" className="mt-4 flex h-14 items-center justify-center gap-2 rounded-2xl bg-turq font-semibold text-ink">
              Ro‘yxatdan o‘tish <ArrowUpRight className="size-5" />
            </a>
          )}
          {a.gallery_slug && (
            <Link href={`/gallery/${a.gallery_slug}`} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-ivory/15 font-semibold hover:border-turq hover:text-turq">
              <Camera className="size-5" /> Fotohisobot
            </Link>
          )}
        </div>
      }
    />
  );
}
