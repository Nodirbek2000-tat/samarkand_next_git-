import type { Metadata } from "next";
import { Check, Crown } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { byGroup } from "@/components/site/blocks";
import { PublicForm } from "@/components/site/public-form";
import { Container, RichText, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "A’zolik — Yangi Samarqand",
  description: "Kengashga a’zolik shartlari, tavsiya etilgan yillik badallar va ariza topshirish.",
};

const ACCENTS = ["#007f78", "#2340d4", "#cf4d14", "#a5620b"];

export default async function MembershipPage() {
  const page = await api.page("membership");
  const tiers = byGroup(page?.blocks, "tiers");
  const benefits = byGroup(page?.blocks, "benefits");
  const honorary = byGroup(page?.blocks, "honorary")[0];

  return (
    <>
      <PageHero
        kicker="A’zolik"
        title="Jamoaga"
        highlight="qo‘shiling"
        description={page?.subtitle}
        crumbs={[{ label: "Biz haqimizda", href: "/about" }, { label: "A’zolik" }]}
        accent="gold"
      />

      <Container className="py-10 md:py-14">
        <Reveal className="mx-auto max-w-4xl">
          <RichText html={page?.body ?? ""} className="text-[1.3rem]" />
        </Reveal>
      </Container>

      {tiers.length > 0 && (
        <section className="bg-ink-2 py-10 md:py-14">
          <Container>
            <SectionTitle index="01" kicker="Badallar" title="Tavsiya etilgan" highlight="yillik badallar" />
            <Reveal stagger={0.1} className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {tiers.map((t, i) => {
                const [amount, unit] = t.body.split(/\s(?=mln|mlrd)/);
                return (
                  <article
                    key={t.title}
                    data-reveal-item
                    className="group relative flex min-h-[340px] flex-col justify-between overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink p-8 transition-transform duration-700 ease-expo hover:-translate-y-2"
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-60 transition-opacity duration-700 group-hover:opacity-100"
                      style={{ background: `radial-gradient(circle at 50% 120%, color-mix(in oklab, ${ACCENTS[i % 4]} 30%, transparent), transparent 65%)` }}
                    />
                    <span className="relative font-mono text-[13px] font-semibold uppercase tracking-[0.18em]" style={{ color: ACCENTS[i % 4] }}>
                      {i === tiers.length - 1 ? "Premium" : `Toifa ${i + 1}`}
                    </span>
                    <div className="relative">
                      <p className="font-display text-6xl font-bold tracking-tight">{amount}</p>
                      <p className="mt-1 text-lg text-ivory/80">{unit ?? ""} · yiliga</p>
                      <p className="mt-6 text-lg font-semibold leading-snug">{t.title}</p>
                    </div>
                  </article>
                );
              })}
            </Reveal>
          </Container>
        </section>
      )}

      <Container className="py-10 md:py-14">
        <div className="grid gap-10 lg:grid-cols-12">
          {benefits.length > 0 && (
            <div className="lg:col-span-7">
              <SectionTitle index="02" kicker="Afzalliklar" title="A’zo bo‘lish" highlight="nima beradi" />
              <Reveal stagger={0.07} as="ul" className="grid gap-3">
                {benefits.map((b) => (
                  <li key={b.title} data-reveal-item className="flex items-start gap-4 rounded-2xl border border-ivory/10 bg-ink-2 p-5 text-lg leading-relaxed">
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-turq/15 text-turq">
                      <Check className="size-5" />
                    </span>
                    {b.title}
                  </li>
                ))}
              </Reveal>
            </div>
          )}
          {honorary && (
            <Reveal className="lg:col-span-4 lg:col-start-9 lg:pt-48" delay={0.1}>
              <article className="rounded-[2rem] border border-gold/40 bg-gradient-to-br from-gold/15 via-ink-2 to-ink-2 p-8">
                <Crown className="size-9 text-gold" />
                <h3 className="mt-6 font-display text-3xl font-semibold">{honorary.title}</h3>
                <p className="mt-4 text-lg leading-relaxed text-ivory/90">{honorary.body}</p>
              </article>
            </Reveal>
          )}
        </div>
      </Container>

      <section id="ariza" className="bg-ink-2 py-10 md:py-14">
        <Container>
          <SectionTitle index="03" kicker="Ariza" title="A’zolikka" highlight="ariza topshirish" text="Arizangizni qoldiring — Kengash ijroiya apparati siz bilan bog‘lanadi." />
          <PublicForm
            endpoint="member-applications"
            submitLabel="Ariza yuborish"
            successTitle="Arizangiz qabul qilindi"
            successText="Kengash ijroiya apparati tez orada siz bilan bog‘lanadi."
            fields={[
              { name: "full_name", label: "F.I.Sh.", required: true },
              { name: "company", label: "Kompaniya" },
              { name: "position", label: "Lavozim" },
              {
                name: "size",
                label: "A’zolik toifasi",
                type: "select",
                required: true,
                defaultValue: "small",
                options: [
                  { value: "individual", label: "YaTT / jismoniy shaxs" },
                  { value: "small", label: "Kichik korxona" },
                  { value: "medium", label: "O‘rta korxona" },
                  { value: "large", label: "Yirik korxona" },
                  { value: "honorary", label: "Faxriy a’zolik" },
                ],
              },
              { name: "phone", label: "Telefon", type: "tel", required: true, placeholder: "+998 90 123 45 67" },
              { name: "email", label: "Email", type: "email" },
              { name: "industry", label: "Faoliyat sohasi", full: true },
              { name: "message", label: "Qo‘shimcha ma’lumot", type: "textarea", maxLength: 3000 },
            ]}
          />
        </Container>
      </section>
    </>
  );
}
