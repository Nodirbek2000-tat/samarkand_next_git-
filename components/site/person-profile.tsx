import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Globe, Mail, Phone } from "lucide-react";
import { initials } from "@/lib/format";
import { Reveal } from "./reveal";
import { Container, RichText } from "./ui";

export function PersonProfile({
  name,
  photo,
  role,
  lines,
  bio,
  contacts,
  back,
}: {
  name: string;
  photo: string | null;
  role?: string;
  lines: { label: string; value: string }[];
  bio?: string;
  contacts?: { phone?: string; email?: string; website?: string };
  back: { href: string; label: string };
}) {
  return (
    <Container className="pb-14 pt-28 md:pt-32">
      <Link href={back.href} data-cursor="hover" className="mb-10 inline-flex items-center gap-2 text-base font-semibold text-turq">
        <ArrowLeft className="size-5" /> {back.label}
      </Link>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        <Reveal className="lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2.2rem] border border-ivory/10 bg-gradient-to-br from-turq/20 via-lapis/15 to-gold/20">
            {photo ? (
              <Image src={photo} alt={name} fill sizes="(min-width:1024px) 40vw, 100vw" className="object-cover" priority />
            ) : (
              <div className="absolute inset-0 grid place-items-center">
                <svg viewBox="0 0 200 200" className="absolute inset-0 size-full opacity-20" fill="none" stroke="currentColor" strokeWidth="0.5" aria-hidden>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <rect key={i} x="35" y="35" width="130" height="130" transform={`rotate(${i * 7.5} 100 100)`} />
                  ))}
                </svg>
                <span className="relative font-display text-[7rem] font-bold text-turq/80">{initials(name)}</span>
              </div>
            )}
          </div>
        </Reveal>
        <Reveal className="lg:col-span-7" delay={0.1}>
          {role && (
            <span className="inline-flex rounded-full bg-gold/15 px-4 py-1.5 text-sm font-semibold text-gold">{role}</span>
          )}
          <h1 className="mt-5 font-display text-[clamp(1.6rem,3.4vw,3.1rem)] [overflow-wrap:anywhere] font-bold leading-[1] tracking-[-0.03em]">{name}</h1>
          <dl className="mt-10 divide-y divide-ivory/10 border-y border-ivory/10">
            {lines
              .filter((l) => l.value)
              .map((l) => (
                <div key={l.label} className="grid gap-1 py-5 sm:grid-cols-[200px_1fr]">
                  <dt className="text-base text-ivory/65">{l.label}</dt>
                  <dd className="text-lg font-semibold">{l.value}</dd>
                </div>
              ))}
          </dl>
          {(contacts?.phone || contacts?.email || contacts?.website) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {contacts.phone && (
                <a href={`tel:${contacts.phone.replace(/\s/g, "")}`} className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold hover:text-turq">
                  <Phone className="size-5 text-turq" /> {contacts.phone}
                </a>
              )}
              {contacts.email && (
                <a href={`mailto:${contacts.email}`} className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold hover:text-turq">
                  <Mail className="size-5 text-turq" /> {contacts.email}
                </a>
              )}
              {contacts.website && (
                <a href={contacts.website} target="_blank" rel="noreferrer" className="glass inline-flex items-center gap-2 rounded-full px-5 py-3 font-semibold hover:text-turq">
                  <Globe className="size-5 text-turq" /> Veb-sayt
                </a>
              )}
            </div>
          )}
          {bio && <RichText html={bio} className="mt-10" />}
        </Reveal>
      </div>
    </Container>
  );
}

export function ProfileSkeleton() {
  return (
    <Container className="pb-14 pt-44">
      <div className="grid gap-12 lg:grid-cols-12">
        <div className="aspect-[4/5] animate-pulse rounded-[2.2rem] bg-ivory/[0.06] lg:col-span-5" />
        <div className="space-y-5 lg:col-span-7">
          <div className="h-16 w-3/4 animate-pulse rounded-2xl bg-ivory/[0.08]" />
          <div className="h-6 w-1/2 animate-pulse rounded bg-ivory/[0.06]" />
          <div className="h-6 w-2/3 animate-pulse rounded bg-ivory/[0.06]" />
        </div>
      </div>
    </Container>
  );
}
