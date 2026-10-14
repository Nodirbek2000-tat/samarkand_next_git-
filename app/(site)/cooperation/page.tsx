import type { Metadata } from "next";
import Image from "next/image";
import { ArrowUpRight, Globe2, Handshake } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { PublicForm } from "@/components/site/public-form";
import { Container, EmptyState, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";
import type { Partner } from "@/lib/api/types";
import { initials } from "@/lib/format";

export const metadata: Metadata = {
  title: "Hamkorlik — Yangi Samarqand",
  description: "Mahalliy va xalqaro hamkorlar, hamkorlik taklifini yuborish.",
};

function PartnerCard({ p }: { p: Partner }) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-4">
        <span className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded-2xl bg-turq/10 font-display text-xl font-bold text-turq">
          {p.logo ? <Image src={p.logo} alt={p.name} fill sizes="64px" className="object-contain p-2" /> : initials(p.name)}
        </span>
        {p.website && <ArrowUpRight className="size-5 text-ivory/50 transition-transform group-hover:rotate-45 group-hover:text-turq" />}
      </div>
      <h3 className="mt-6 font-display text-xl font-semibold leading-snug">{p.name}</h3>
      {p.country && <p className="mt-1 text-sm font-semibold text-turq">{p.country}</p>}
      {p.description && <p className="mt-3 text-base leading-relaxed text-ivory/80">{p.description}</p>}
    </>
  );
  const cls =
    "group block h-full rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-1 hover:border-turq/50";
  return p.website ? (
    <a href={p.website} target="_blank" rel="noreferrer" className={cls} data-cursor="hover">
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function CooperationPage() {
  const [page, partners] = await Promise.all([api.page("cooperation"), api.partners()]);
  const domestic = (partners ?? []).filter((p) => p.kind === "domestic");
  const international = (partners ?? []).filter((p) => p.kind === "international");

  return (
    <>
      <PageHero
        kicker="Hamkorlik"
        title="Birgalikda"
        highlight="kuchlimiz"
        description={page?.subtitle}
        crumbs={[{ label: "Biznes muhit" }, { label: "Hamkorlik" }]}
        accent="lapis"
      />
      {page?.body && (
        <Container className="py-10">
          <Reveal className="max-w-4xl">
            <RichText html={page.body} />
          </Reveal>
        </Container>
      )}

      <section id="mahalliy" className="scroll-mt-28 py-10 md:py-12">
        <Container>
          <SectionTitle index="01" kicker="Mahalliy hamkorlar" title="O‘zbekistondagi" highlight="hamkorlar" />
          {domestic.length ? (
            <Reveal stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {domestic.map((p) => (
                <div key={p.id} data-reveal-item>
                  <PartnerCard p={p} />
                </div>
              ))}
            </Reveal>
          ) : (
            <EmptyState title="Ro‘yxat tez orada joylanadi" />
          )}
        </Container>
      </section>

      <section id="xalqaro" className="scroll-mt-28 bg-ink-2 py-10 md:py-12">
        <Container>
          <SectionTitle index="02" kicker="Xalqaro hamkorlik" title="Xalqaro" highlight="hamkorlar" />
          {international.length ? (
            <Reveal stagger={0.08} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {international.map((p) => (
                <div key={p.id} data-reveal-item>
                  <PartnerCard p={p} />
                </div>
              ))}
            </Reveal>
          ) : (
            <EmptyState
              title="Xalqaro hamkorlikka ochiqmiz"
              text="Xorijiy tashkilotlar va investorlar bilan hamkorlik takliflarini quyidagi forma orqali yuboring."
            />
          )}
        </Container>
      </section>

      <section id="taklif" className="scroll-mt-28 py-10 md:py-14">
        <Container>
          <SectionTitle
            index="03"
            kicker="Taklif"
            title="Hamkorlik"
            highlight="taklifi"
            text="Tashkilotingiz Kengash bilan hamkorlik qilmoqchi bo‘lsa — ma’lumotlarni qoldiring."
          />
          <div className="grid gap-8 lg:grid-cols-12">
            <Reveal className="space-y-4 lg:col-span-4">
              {[
                { icon: Handshake, title: "Mahalliy hamkorlik", text: "Davlat organlari, uyushmalar, ta’lim muassasalari va korxonalar bilan qo‘shma loyihalar." },
                { icon: Globe2, title: "Xalqaro hamkorlik", text: "Xorijiy tadbirkorlar, investorlar va tashkilotlar bilan tajriba almashish va investitsiyalar." },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7">
                  <Icon className="size-8 text-turq" />
                  <p className="mt-5 font-display text-xl font-semibold">{title}</p>
                  <p className="mt-2 text-base leading-relaxed text-ivory/80">{text}</p>
                </div>
              ))}
            </Reveal>
            <div className="lg:col-span-8">
              <PublicForm
                endpoint="cooperation-requests"
                submitLabel="Taklif yuborish"
                successTitle="Taklifingiz qabul qilindi"
                fields={[
                  {
                    name: "kind",
                    label: "Hamkorlik turi",
                    type: "select",
                    required: true,
                    defaultValue: "domestic",
                    options: [
                      { value: "domestic", label: "Mahalliy hamkorlik" },
                      { value: "international", label: "Xalqaro hamkorlik" },
                    ],
                  },
                  { name: "organization", label: "Tashkilot nomi", required: true },
                  { name: "contact_person", label: "Aloqa uchun shaxs", required: true },
                  { name: "phone", label: "Telefon", type: "tel" },
                  { name: "email", label: "Email", type: "email" },
                  { name: "country", label: "Davlat" },
                  { name: "website", label: "Veb-sayt", type: "url", placeholder: "https://", full: true },
                  { name: "proposal", label: "Hamkorlik taklifi", type: "textarea", required: true },
                ]}
              />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
