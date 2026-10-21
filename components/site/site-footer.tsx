"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUp, Clock, Mail, MapPin, Phone, Send } from "lucide-react";
import { gsap, useGSAP } from "@/lib/gsap";
import { Logo } from "@/components/logo";
import { useLenis } from "@/components/providers/smooth-scroll";
import type { SiteSettings } from "@/lib/api/types";
import { SITE_NAV } from "./nav";

export function SiteFooter({ settings }: { settings: SiteSettings | null }) {
  const root = useRef<HTMLElement>(null);
  const lenis = useLenis();

  useGSAP(
    () => {
      gsap.from("[data-giant] span", {
        yPercent: 100,
        ease: "none",
        stagger: 0.04,
        scrollTrigger: { trigger: "[data-giant]", start: "top bottom", end: "bottom bottom", scrub: true },
      });
    },
    { scope: root },
  );

  const phone = settings?.phone || "+998 66 233 00 01";
  const email = settings?.email || "info@yangisamarqand.uz";

  return (
    <footer ref={root} data-cv className="relative overflow-hidden border-t border-ivory/10 bg-ink-2 px-5 pt-20 md:px-10">
      <div className="mx-auto grid max-w-[1600px] gap-12 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <Logo />
          <p className="mt-6 max-w-sm text-base leading-relaxed text-ivory/80">
            {settings?.council_name || "Samarqand viloyati tadbirkorlarining jamoat maslahat kengashi"}.{" "}
            {settings?.slogan ? `${settings.slogan}.` : ""}
          </p>
          <ul className="mt-8 space-y-3 text-base">
            <li>
              <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex items-center gap-3 hover:text-turq">
                <Phone className="size-5 text-turq" /> {phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${email}`} className="flex items-center gap-3 hover:text-turq">
                <Mail className="size-5 text-turq" /> {email}
              </a>
            </li>
            {settings?.address && (
              <li className="flex items-center gap-3">
                <MapPin className="size-5 shrink-0 text-turq" /> {settings.address}
              </li>
            )}
            {settings?.working_hours && (
              <li className="flex items-center gap-3">
                <Clock className="size-5 shrink-0 text-turq" /> {settings.working_hours}
              </li>
            )}
            {settings?.telegram && (
              <li>
                <a href={settings.telegram} target="_blank" rel="noreferrer" className="flex items-center gap-3 hover:text-turq">
                  <Send className="size-5 text-turq" /> Telegram
                </a>
              </li>
            )}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7 lg:col-start-6">
          {SITE_NAV.map((group) => (
            <div key={group.label}>
              <h4 className="font-mono text-[12px] uppercase tracking-[0.18em] text-turq">{group.label}</h4>
              <ul className="mt-5 space-y-3">
                {group.children.slice(0, 5).map((c) => (
                  <li key={c.href + c.label}>
                    <Link href={c.href} className="text-[15px] text-ivory/80 transition-colors hover:text-turq" data-cursor="hover">
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex lg:col-span-1 lg:justify-end">
          <button
            type="button"
            data-cursor="hover"
            onClick={() => lenis?.scrollTo(0, { duration: 2 })}
            className="group grid size-14 place-items-center rounded-full border border-ivory/15 transition-colors hover:border-turq hover:text-turq"
            aria-label="Yuqoriga"
          >
            <ArrowUp className="size-5 transition-transform duration-500 ease-expo group-hover:-translate-y-1" />
          </button>
        </div>
      </div>

      <div
        data-giant
        aria-hidden
        className="mx-auto mt-12 flex max-w-[1600px] justify-between overflow-hidden font-display text-[10.5vw] font-bold uppercase leading-[0.8] tracking-[-0.05em]"
      >
        {"SAMARQAND".split("").map((ch, i) => (
          <span key={i} className="text-gradient inline-block">
            {ch}
          </span>
        ))}
      </div>

      <div className="mx-auto flex max-w-[1600px] flex-col justify-between gap-2 border-t border-ivory/10 py-6 text-sm text-ivory/70 md:flex-row">
        <span>© 2021–2026 Yangi Samarqand. Barcha huquqlar himoyalangan.</span>
        <span>{settings?.org_name}</span>
      </div>
    </footer>
  );
}
