import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, Camera, Download, FileText, Globe, PlayCircle, Send, Wallet } from "lucide-react";
import { Cover } from "@/components/site/cover";
import { PhotoGrid } from "@/components/site/lightbox";
import { Reveal } from "@/components/site/reveal";
import { StatsStrip } from "@/components/site/blocks";
import { ProjectCard } from "@/components/site/cards";
import { Container, Pill, RichText, SectionTitle } from "@/components/site/ui";
import { ProfileSkeleton } from "@/components/site/person-profile";
import { api } from "@/lib/api/server";
import { formatBytes, formatDate, stripHtml, youtubeEmbed } from "@/lib/format";

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await api.project(slug);
  return p ? { title: `${p.title} — Loyihalar`, description: p.summary || stripHtml(p.body) } : { title: "Loyiha" };
}

export default function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <ProjectDetail params={params} />
    </Suspense>
  );
}

async function ProjectDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, all] = await Promise.all([api.project(slug), api.projects()]);
  if (!p) notFound();
  const related = (all?.results ?? []).filter((x) => x.id !== p.id && (x.category === p.category || x.status === p.status)).slice(0, 3);
  const video = p.video_url ? youtubeEmbed(p.video_url) : null;
  const links = [
    p.website_url && { href: p.website_url, label: "Veb-sayt", icon: Globe },
    p.telegram_url && { href: p.telegram_url, label: "Telegram kanal", icon: Send },
    p.instagram_url && { href: p.instagram_url, label: "Instagram", icon: Camera },
    p.video_url && !video && { href: p.video_url, label: "Video", icon: PlayCircle },
  ].filter(Boolean) as { href: string; label: string; icon: typeof Globe }[];

  return (
    <article>
      <header className="relative px-5 pb-10 pt-28 md:px-10 md:pt-32">
        <Container className="px-0 md:px-0">
          <Link href="/projects" data-cursor="hover" className="mb-10 inline-flex items-center gap-2 text-base font-semibold text-turq">
            <ArrowLeft className="size-5" /> Barcha loyihalar
          </Link>
          <Reveal>
            <div className="flex flex-wrap gap-2">
              <Pill>{p.category_label}</Pill>
              <Pill className={p.status === "completed" ? "border-gold/40 text-gold" : "border-turq/40 text-turq"}>{p.status_label}</Pill>
            </div>
            <h1 className="mt-4 max-w-[26ch] font-display text-[clamp(1.6rem,3.6vw,3.25rem)] [overflow-wrap:anywhere] font-bold leading-[0.98] tracking-[-0.03em]">{p.title}</h1>
            {p.summary && <p className="mt-8 max-w-3xl text-xl leading-relaxed text-ivory/85 md:text-2xl">{p.summary}</p>}
          </Reveal>
        </Container>
      </header>

      <Container>
        <Reveal className="relative aspect-[21/9] overflow-hidden rounded-[2.2rem]">
          <Cover src={p.cover} alt={p.title} seed={p.slug} className="absolute inset-0" sizes="100vw" priority />
        </Reveal>
      </Container>

      {p.stats?.length > 0 && (
        <Container className="mt-12">
          <StatsStrip stats={p.stats} />
        </Container>
      )}

      <Container className="py-10 md:py-12">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <Reveal>
              <RichText html={p.body} />
            </Reveal>
            {(p.objectives || p.expected_results) && (
              <div className="mt-14 grid gap-5 md:grid-cols-2">
                {p.objectives && (
                  <Reveal className="rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7">
                    <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-turq">Maqsadlar</p>
                    <RichText html={p.objectives} className="mt-4 text-lg" />
                  </Reveal>
                )}
                {p.expected_results && (
                  <Reveal className="rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7" delay={0.1}>
                    <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-gold">Kutilayotgan natijalar</p>
                    <RichText html={p.expected_results} className="mt-4 text-lg" />
                  </Reveal>
                )}
              </div>
            )}
            {video && (
              <Reveal className="mt-14 overflow-hidden rounded-[1.8rem] border border-ivory/10">
                <iframe
                  src={video}
                  title={p.title}
                  className="aspect-video w-full"
                  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  loading="lazy"
                />
              </Reveal>
            )}
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-32 space-y-5">
              <div className="rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7">
                <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-mist">Loyiha haqida</p>
                <dl className="mt-5 space-y-4 text-base">
                  {p.metrics && (
                    <div>
                      <dt className="text-ivory/60">Ko‘rsatkichlar</dt>
                      <dd className="mt-1 font-semibold">{p.metrics}</dd>
                    </div>
                  )}
                  {p.budget && (
                    <div className="flex items-start gap-3">
                      <Wallet className="mt-0.5 size-5 text-turq" />
                      <div>
                        <dt className="text-ivory/60">Moliyalashtirish</dt>
                        <dd className="font-semibold">{p.budget}</dd>
                      </div>
                    </div>
                  )}
                  {p.started_on && (
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 size-5 text-turq" />
                      <div>
                        <dt className="text-ivory/60">Boshlangan</dt>
                        <dd className="font-semibold">{formatDate(p.started_on)}</dd>
                      </div>
                    </div>
                  )}
                  {p.finished_on && (
                    <div className="flex items-start gap-3">
                      <CalendarDays className="mt-0.5 size-5 text-gold" />
                      <div>
                        <dt className="text-ivory/60">Yakunlangan</dt>
                        <dd className="font-semibold">{formatDate(p.finished_on)}</dd>
                      </div>
                    </div>
                  )}
                </dl>
                {links.length > 0 && (
                  <div className="mt-6 flex flex-col gap-2">
                    {links.map(({ href, label, icon: Icon }) => (
                      <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        data-cursor="hover"
                        className="group flex items-center justify-between rounded-2xl bg-turq/10 px-5 py-4 font-semibold text-turq transition-colors hover:bg-turq hover:text-ink"
                      >
                        <span className="flex items-center gap-3">
                          <Icon className="size-5" /> {label}
                        </span>
                        <ArrowUpRight className="size-5 transition-transform group-hover:rotate-45" />
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {p.documents.length > 0 && (
                <div className="rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7">
                  <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-mist">Hujjatlar</p>
                  <ul className="mt-4 space-y-2">
                    {p.documents.map((d) => (
                      <li key={d.id}>
                        <a href={d.file} target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl p-3 hover:bg-ivory/5">
                          <FileText className="size-6 shrink-0 text-turq" />
                          <span className="flex-1">
                            <span className="block font-semibold leading-snug">{d.title}</span>
                            <span className="text-sm uppercase text-ivory/60">
                              {d.extension} {formatBytes(d.size)}
                            </span>
                          </span>
                          <Download className="size-5 text-ivory/50 group-hover:text-turq" />
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </aside>
        </div>
      </Container>

      {p.participants.length > 0 && (
        <section className="bg-ink-2 py-10 md:py-14">
          <Container>
            <SectionTitle kicker="Ishtirokchilar" title="Loyiha" highlight="tashabbuskorlari" />
            <Reveal stagger={0.05} as="ol" className="grid gap-3 md:grid-cols-2">
              {p.participants.map((x, i) => (
                <li key={x.id} data-reveal-item className="flex items-center gap-5 rounded-2xl border border-ivory/10 bg-ink p-5">
                  <span className="font-display text-3xl font-bold text-turq/70">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="block text-lg font-semibold">{x.company}</span>
                    <span className="block text-base text-ivory/75">
                      {[x.person, x.role].filter(Boolean).join(" · ")}
                    </span>
                  </span>
                </li>
              ))}
            </Reveal>
          </Container>
        </section>
      )}

      {p.images.length > 0 && (
        <Container className="py-10 md:py-14">
          <SectionTitle kicker="Fotosuratlar" title="Loyiha" highlight="suratlarda" />
          <PhotoGrid images={p.images} />
        </Container>
      )}

      {related.length > 0 && (
        <section className="border-t border-ivory/10 py-10 md:py-14">
          <Container>
            <SectionTitle kicker="Yana" title="Boshqa" highlight="loyihalar" action={{ label: "Barcha loyihalar", href: "/projects" }} />
            <Reveal stagger={0.08} className="grid gap-5 md:grid-cols-3">
              {related.map((r) => (
                <div key={r.id} data-reveal-item>
                  <ProjectCard project={r} />
                </div>
              ))}
            </Reveal>
          </Container>
        </section>
      )}
    </article>
  );
}
