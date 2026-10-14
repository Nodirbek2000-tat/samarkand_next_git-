import type { Metadata } from "next";
import { Mail, Phone } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { leaderToPerson, PersonCard } from "@/components/site/cards";
import { Container, EmptyState } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Rahbariyat — Yangi Samarqand" };

export default async function LeadershipPage() {
  const leaders = await api.leaders();
  return (
    <>
      <PageHero
        kicker="Rahbariyat"
        title="Fond"
        highlight="ijroiya apparati"
        description="Kengash qarorlarini amalga oshiradigan va tadbirkorlar bilan kundalik ishlaydigan jamoa."
        crumbs={[{ label: "Kengash", href: "/council" }, { label: "Rahbariyat" }]}
        compact
        accent="lapis"
      />
      <Container className="pb-14">
        {!leaders?.length ? (
          <EmptyState title="Ma’lumot tez orada joylanadi" text="Rahbariyat tarkibi administrator tomonidan qo‘shiladi." />
        ) : (
          <Reveal stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {leaders.map((l) => (
              <div key={l.id} data-reveal-item className="flex flex-col gap-3">
                <PersonCard person={leaderToPerson(l)} />
                {(l.phone || l.email) && (
                  <div className="flex flex-wrap gap-2">
                    {l.phone && (
                      <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold hover:text-turq">
                        <Phone className="size-4 text-turq" /> {l.phone}
                      </a>
                    )}
                    {l.email && (
                      <a href={`mailto:${l.email}`} className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold hover:text-turq">
                        <Mail className="size-4 text-turq" /> Email
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))}
          </Reveal>
        )}
      </Container>
    </>
  );
}
