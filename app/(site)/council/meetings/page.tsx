import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Camera, MapPin } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { Container, EmptyState, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import { dayMonth } from "@/lib/format";

export const metadata: Metadata = { title: "Kengash yig‘ilishlari — Yangi Samarqand" };

export default async function MeetingsPage() {
  const [page, meetings] = await Promise.all([api.page("meetings"), api.meetings()]);
  const list = meetings?.results ?? [];

  return (
    <>
      <PageHero
        kicker="Yig‘ilishlar"
        title="Muloqot"
        highlight="natija beradi"
        description={page?.subtitle}
        crumbs={[{ label: "Kengash", href: "/council" }, { label: "Yig‘ilishlar" }]}
      />
      <Container className="py-10 md:py-14">
        <div className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <RichText html={page?.body ?? ""} />
          </Reveal>
          <Reveal className="lg:col-span-4 lg:col-start-9" delay={0.1}>
            <div className="sticky top-32 rounded-[2rem] bg-gradient-to-br from-turq/15 via-ink-2 to-lapis/10 p-8">
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-turq">Doimiy ishtirokchilar</p>
              <ul className="mt-6 space-y-3 text-lg">
                {["Viloyat hokimi", "Soliq boshqarmasi", "Elektr tarmoqlari", "Gaz ta’minoti", "Suvoqova", "Kadastr xizmati"].map((x) => (
                  <li key={x} className="flex items-center gap-3">
                    <span className="size-2 rotate-45 bg-turq" /> {x}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </Container>

      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <SectionTitle kicker="Sana va joylar" title="O‘tkazilgan" highlight="yig‘ilishlar" />
          {list.length === 0 ? (
            <EmptyState title="Yig‘ilishlar ro‘yxati tez orada joylanadi" />
          ) : (
            <Reveal stagger={0.08} as="ol" className="space-y-4">
              {list.map((m) => {
                const d = dayMonth(m.date);
                return (
                  <li key={m.id} data-reveal-item className="grid gap-6 rounded-[1.8rem] border border-ivory/10 bg-ink p-6 md:grid-cols-[180px_1fr] md:p-9">
                    <div>
                      <p className="font-display text-6xl font-bold leading-none text-turq">{d?.day}</p>
                      <p className="mt-2 text-lg font-semibold capitalize">
                        {d?.month} {d?.year}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-display text-2xl font-semibold leading-snug">{m.title}</h3>
                      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-base text-ivory/75">
                        {m.host_company && (
                          <span className="flex items-center gap-2">
                            <Building2 className="size-4 text-turq" /> {m.host_company}
                          </span>
                        )}
                        {m.location && (
                          <span className="flex items-center gap-2">
                            <MapPin className="size-4 text-turq" /> {m.location}
                          </span>
                        )}
                      </div>
                      {m.agenda && <RichText html={m.agenda} className="mt-5 text-lg" />}
                      {m.outcome && (
                        <div className="mt-5 rounded-2xl border-l-4 border-gold bg-gold/10 p-5">
                          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-gold">Natija</p>
                          <RichText html={m.outcome} className="text-lg" />
                        </div>
                      )}
                      {m.gallery_slug && (
                        <Link href={`/gallery/${m.gallery_slug}`} className="mt-5 inline-flex items-center gap-2 font-semibold text-turq">
                          <Camera className="size-5" /> Fotohisobot
                        </Link>
                      )}
                    </div>
                  </li>
                );
              })}
            </Reveal>
          )}
        </Container>
      </section>
    </>
  );
}
