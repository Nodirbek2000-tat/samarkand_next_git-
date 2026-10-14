import type { Metadata } from "next";
import { Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { PublicForm } from "@/components/site/public-form";
import { Container, SectionTitle } from "@/components/site/ui";
import { api } from "@/lib/api/server";

export const metadata: Metadata = { title: "Aloqa — Yangi Samarqand" };

export default async function ContactsPage() {
  const s = await api.settings();
  const items = [
    s?.phone && { icon: Phone, label: "Telefon", value: s.phone, href: `tel:${s.phone.replace(/\s/g, "")}` },
    s?.phone_secondary && { icon: Phone, label: "Qo‘shimcha telefon", value: s.phone_secondary, href: `tel:${s.phone_secondary.replace(/\s/g, "")}` },
    s?.email && { icon: Mail, label: "Email", value: s.email, href: `mailto:${s.email}` },
    s?.address && { icon: MapPin, label: "Manzil", value: s.address },
    s?.working_hours && { icon: Clock, label: "Ish vaqti", value: s.working_hours },
    s?.telegram && { icon: Send, label: "Telegram", value: "Kanalga o‘tish", href: s.telegram },
  ].filter(Boolean) as { icon: typeof Phone; label: string; value: string; href?: string }[];

  const mapSrc = s?.map_embed_url || `https://www.google.com/maps?q=${encodeURIComponent(s?.address || "Registon, Samarqand")}&output=embed`;

  return (
    <>
      <PageHero
        kicker="Aloqa"
        title="Biz bilan"
        highlight="bog‘laning"
        description="Savollaringiz bo‘lsa — qo‘ng‘iroq qiling, yozing yoki ofisimizga tashrif buyuring."
        crumbs={[{ label: "Aloqa" }]}
        compact
      />
      <Container className="pb-12">
        <Reveal stagger={0.07} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map(({ icon: Icon, label, value, href }) => {
            const inner = (
              <>
                <span className="grid size-14 place-items-center rounded-2xl bg-turq/12 text-turq transition-transform duration-500 group-hover:-rotate-6">
                  <Icon className="size-7" />
                </span>
                <span className="mt-8 block text-base text-ivory/70">{label}</span>
                <span className="mt-1 block font-display text-2xl font-semibold leading-snug">{value}</span>
              </>
            );
            const cls = "group block rounded-[1.8rem] border border-ivory/10 bg-ink-2 p-7 transition-[transform,border-color] duration-700 ease-expo hover:-translate-y-1 hover:border-turq/50";
            return href ? (
              <a key={label} href={href} data-reveal-item className={cls} data-cursor="hover" target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                {inner}
              </a>
            ) : (
              <div key={label} data-reveal-item className={cls}>
                {inner}
              </div>
            );
          })}
        </Reveal>
        <Reveal className="mt-8 overflow-hidden rounded-[2rem] border border-ivory/10">
          <iframe src={mapSrc} title="Xarita" className="h-[420px] w-full grayscale-[30%]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </Reveal>
      </Container>
      <section className="bg-ink-2 py-10 md:py-14">
        <Container>
          <SectionTitle kicker="Xabar yozish" title="Bizga" highlight="yozing" text="Javobni ish kunlari davomida qaytaramiz." />
          <PublicForm
            endpoint="appeals"
            submitLabel="Xabarni yuborish"
            successTitle="Xabaringiz yuborildi"
            extra={{ kind: "contact" }}
            fields={[
              { name: "full_name", label: "Ismingiz", required: true },
              { name: "phone", label: "Telefon", type: "tel", required: true },
              { name: "email", label: "Email", type: "email" },
              { name: "subject", label: "Mavzu" },
              { name: "message", label: "Xabar", type: "textarea", required: true },
            ]}
          />
        </Container>
      </section>
    </>
  );
}
