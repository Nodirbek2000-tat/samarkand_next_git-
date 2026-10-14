import type { Metadata } from "next";
import { Clock, FileCheck2, MessageSquareText, ShieldCheck } from "lucide-react";
import { PageHero } from "@/components/site/page-hero";
import { Reveal } from "@/components/site/reveal";
import { APPEAL_FIELDS, PublicForm } from "@/components/site/public-form";
import { Container } from "@/components/site/ui";

export const metadata: Metadata = {
  title: "Murojaat yuborish — Yangi Samarqand",
  description: "Kengashga murojaat, taklif, savol yoki shikoyat yuboring.",
};

const STEPS = [
  { icon: MessageSquareText, title: "Murojaat yuborasiz", text: "Formani to‘ldiring — bu 2 daqiqadan ko‘p vaqt olmaydi." },
  { icon: FileCheck2, title: "Ro‘yxatga olinadi", text: "Murojaat Kengash ijroiya apparatiga darhol yetib boradi." },
  { icon: Clock, title: "Ko‘rib chiqiladi", text: "Mas’ul xodim masalani o‘rganadi va siz bilan bog‘lanadi." },
  { icon: ShieldCheck, title: "Maxfiylik", text: "Shaxsiy ma’lumotlaringiz uchinchi shaxslarga berilmaydi." },
];

export default function AppealsPage() {
  return (
    <>
      <PageHero
        kicker="Murojaat"
        title="Taklif yoki"
        highlight="savolingiz bormi?"
        description="Murojaat, taklif yoki shikoyatingizni yuboring — Kengash uni ko‘rib chiqadi va siz bilan bog‘lanadi."
        crumbs={[{ label: "Aloqa", href: "/feedback/contacts" }, { label: "Murojaat" }]}
        compact
      />
      <Container className="pb-14">
        <div className="grid gap-10 lg:grid-cols-12">
          <Reveal stagger={0.08} as="ol" className="space-y-4 lg:col-span-4">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} data-reveal-item className="flex gap-5 rounded-[1.6rem] border border-ivory/10 bg-ink-2 p-6">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-turq/12 text-turq">
                  <Icon className="size-6" />
                </span>
                <span>
                  <span className="block font-mono text-sm text-turq">0{i + 1}</span>
                  <span className="mt-1 block text-lg font-semibold">{title}</span>
                  <span className="mt-1 block text-base text-ivory/75">{text}</span>
                </span>
              </li>
            ))}
          </Reveal>
          <div className="lg:col-span-8">
            <PublicForm endpoint="appeals" fields={APPEAL_FIELDS} submitLabel="Murojaat yuborish" />
          </div>
        </div>
      </Container>
    </>
  );
}
