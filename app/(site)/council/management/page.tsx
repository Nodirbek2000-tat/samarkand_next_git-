import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { boardToPerson, PersonCard } from "@/components/site/cards";
import { Container, EmptyState } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Boshqaruv — Yangi Samarqand" };

export default async function ManagementPage() {
  const board = await api.boardMembers();
  const chair = board?.find((b) => b.role === "chairman");
  const rest = board?.filter((b) => b !== chair) ?? [];

  return (
    <>
      <PageHero
        kicker="Boshqaruv"
        title="Kengash"
        highlight="Boshqaruvi"
        description="Boshqaruv Kengash yig‘ilishlarini tayyorlaydi, loyihalarni ko‘rib chiqadi va qarorlar ijrosini nazorat qiladi."
        crumbs={[{ label: "Kengash", href: "/council" }, { label: "Boshqaruv" }]}
        compact
      />
      <Container className="pb-14">
        {!board?.length && <EmptyState title="Ma’lumot tez orada joylanadi" />}
        {chair && (
          <Reveal className="mb-6 grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <PersonCard person={boardToPerson(chair)} href={`/council/management/${chair.slug}`} badge="Boshqaruv raisi" />
            </div>
            <div className="flex flex-col justify-end rounded-[2rem] bg-gradient-to-br from-turq/15 via-ink-2 to-gold/15 p-8 md:p-12 lg:col-span-8">
              <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-turq">Boshqaruv raisi</p>
              <p className="mt-6 font-display text-4xl font-semibold leading-tight md:text-6xl">{chair.full_name}</p>
              <p className="mt-4 max-w-2xl text-xl text-ivory/85">{chair.workplace}</p>
            </div>
          </Reveal>
        )}
        <Reveal stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((m) => (
            <div key={m.id} data-reveal-item>
              <PersonCard person={boardToPerson(m)} href={`/council/management/${m.slug}`} />
            </div>
          ))}
        </Reveal>
      </Container>
    </>
  );
}
