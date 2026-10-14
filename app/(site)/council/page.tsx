import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Award, Calendar, ShieldCheck, UserRound, Users } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { boardToPerson, PersonCard } from "@/components/site/cards";
import { Container, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Kengash — Yangi Samarqand" };

export default async function CouncilHub() {
  const [members, board, recognitions] = await Promise.all([api.councilMembers(), api.boardMembers(), api.recognitions()]);
  const sections = [
    { href: "/council/members", icon: Users, title: "Kengash a’zolari", value: members?.length ?? 0, text: "Viloyatning yetakchi tadbirkorlari" },
    { href: "/council/management", icon: ShieldCheck, title: "Boshqaruv", value: board?.length ?? 0, text: "Rais va uning o‘rinbosarlari" },
    { href: "/council/leadership", icon: UserRound, title: "Rahbariyat", value: null, text: "Fond ijroiya apparati" },
    { href: "/council/meetings", icon: Calendar, title: "Yig‘ilishlar", value: null, text: "Hokim ishtirokidagi muloqot" },
    { href: "/council/recognition", icon: Award, title: "E’tirof", value: recognitions?.length ?? 0, text: "Davlat mukofotlari va unvonlar" },
  ];

  return (
    <>
      <PageHero
        kicker="Kengash"
        title="Jamoat maslahat"
        highlight="kengashi"
        description="Kengash Fondning Vasiylik kengashi vakolatlariga ega va viloyat tadbirkorlari bilan hokimiyat o‘rtasidagi muloqot maydoni hisoblanadi."
        crumbs={[{ label: "Kengash" }]}
      />
      <Container className="py-10 md:py-14">
        <Reveal stagger={0.08} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {sections.map(({ href, icon: Icon, title, value, text }) => (
            <Link
              key={href}
              href={href}
              data-reveal-item
              data-cursor="hover"
              className="group flex min-h-[260px] flex-col justify-between rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-1.5 hover:border-turq/50"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-12 place-items-center rounded-2xl bg-turq/12 text-turq">
                  <Icon className="size-6" />
                </span>
                <ArrowUpRight className="size-5 text-ivory/50 transition-transform duration-500 group-hover:rotate-45 group-hover:text-turq" />
              </div>
              <div>
                {value ? <p className="font-display text-5xl font-semibold text-turq">{value}</p> : null}
                <p className="mt-2 font-display text-xl font-semibold">{title}</p>
                <p className="mt-1 text-base text-ivory/75">{text}</p>
              </div>
            </Link>
          ))}
        </Reveal>
      </Container>

      {board && board.length > 0 && (
        <section className="bg-ink-2 py-10 md:py-14">
          <Container>
            <SectionTitle kicker="Boshqaruv" title="Kengash" highlight="Boshqaruvi" action={{ label: "Barchasi", href: "/council/management" }} />
            <Reveal stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
              {board.map((m) => (
                <div key={m.id} data-reveal-item>
                  <PersonCard person={boardToPerson(m)} href={`/council/management/${m.slug}`} badge={m.role === "chairman" ? "Rais" : undefined} />
                </div>
              ))}
            </Reveal>
          </Container>
        </section>
      )}
    </>
  );
}
