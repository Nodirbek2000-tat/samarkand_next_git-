import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { CalendarDays, ExternalLink, Eye } from "lucide-react";
import { ArticleLayout, Pill } from "@/components/site/article";
import { NewsCard } from "@/components/site/cards";
import { PhotoGrid } from "@/components/site/lightbox";
import { ProfileSkeleton } from "@/components/site/person-profile";
import { ViewTracker } from "@/components/site/view-tracker";
import { api } from "@/lib/api/server";
import { formatDate, stripHtml } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/news/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const n = await api.newsItem(slug);
  return n ? { title: `${n.title} — Yangiliklar`, description: n.excerpt || stripHtml(n.body) } : { title: "Yangilik" };
}

export default function NewsItemPage({ params }: PageProps<"/news/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <NewsItem params={params} />
    </Suspense>
  );
}

async function NewsItem({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [n, latest] = await Promise.all([api.newsItem(slug), api.news({ page_size: 4 })]);
  if (!n) notFound();
  const others = (latest?.results ?? []).filter((x) => x.id !== n.id).slice(0, 3);

  return (
    <>
      <ViewTracker path={`news/${n.slug}`} />
      <ArticleLayout
        back={{ href: "/news", label: "Barcha yangiliklar" }}
        pills={<Pill>{n.category_label}</Pill>}
        title={n.title}
        lead={n.excerpt}
        meta={
          <>
            <span className="flex items-center gap-2">
              <CalendarDays className="size-5 text-turq" /> {formatDate(n.published_at)}
            </span>
            {n.views > 0 && (
              <span className="flex items-center gap-2">
                <Eye className="size-5" /> {n.views} marta o‘qildi
              </span>
            )}
          </>
        }
        cover={n.cover}
        seed={n.slug}
        body={n.body}
        aside={
          others.length > 0 && (
            <div className="sticky top-32 space-y-5">
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-mist">So‘nggi yangiliklar</p>
              {others.map((o) => (
                <NewsCard key={o.id} item={o} />
              ))}
            </div>
          )
        }
      >
        {n.images.length > 0 && <PhotoGrid images={n.images} className="mt-14" />}
        {n.source_url && (
          <a href={n.source_url} target="_blank" rel="noreferrer" className="mt-10 inline-flex items-center gap-2 font-semibold text-turq">
            <ExternalLink className="size-5" /> Manba
          </a>
        )}
      </ArticleLayout>
    </>
  );
}
