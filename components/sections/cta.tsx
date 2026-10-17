"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, Clock, Mail, MapPin, Phone } from "lucide-react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { Magnetic } from "@/components/magnetic";
import { Roll } from "@/components/roll";
import { cn } from "@/lib/utils";

const EMAIL = "info@yangisamarqand.uz";

const CONTACTS = [
  { icon: Phone, label: "+998 66 233 00 01", href: "tel:+998662330001" },
  { icon: Mail, label: EMAIL, href: `mailto:${EMAIL}` },
  { icon: MapPin, label: "Samarqand shahri", href: undefined },
  { icon: Clock, label: "Du–Ju · 9:00–18:00", href: undefined },
];

const TOPICS = ["Murojaat", "Taklif", "A’zolik", "Hamkorlik"];

function Field({
  name,
  label,
  type = "text",
  textarea = false,
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  textarea?: boolean;
  required?: boolean;
}) {
  const cls =
    "peer w-full rounded-2xl border border-ivory/15 bg-ink/60 px-5 pb-3 pt-7 text-base text-ivory outline-none transition-colors duration-300 placeholder:text-transparent focus:border-turq focus:bg-ink/80";
  return (
    <label className="relative block">
      {textarea ? (
        <textarea name={name} required={required} placeholder={label} rows={4} className={cn(cls, "resize-none")} />
      ) : (
        <input name={name} type={type} required={required} placeholder={label} className={cls} />
      )}
      <span className="pointer-events-none absolute left-5 top-2.5 font-mono text-[11px] uppercase tracking-[0.15em] text-turq transition-all duration-300 peer-placeholder-shown:top-[1.15rem] peer-placeholder-shown:text-[14px] peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-placeholder-shown:text-ivory/60 peer-focus:top-2.5 peer-focus:font-mono peer-focus:text-[11px] peer-focus:uppercase peer-focus:tracking-[0.15em] peer-focus:text-turq">
        {label}
        {required && " *"}
      </span>
    </label>
  );
}

export function Cta() {
  const root = useRef<HTMLElement>(null);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [sent, setSent] = useState(false);

  useGSAP(
    () => {
      SplitText.create("[data-cta-title]", {
        type: "chars,lines",
        mask: "lines",
        autoSplit: true,
        onSplit: (self) =>
          gsap.from(self.chars, {
            yPercent: 110,
            duration: 1.2,
            ease: "expo.out",
            stagger: 0.02,
            scrollTrigger: { trigger: "[data-cta-title]", start: "top 80%" },
          }),
      });
      gsap.from("[data-cta-form]", {
        y: 100,
        opacity: 0,
        rotateX: 14,
        duration: 1.4,
        ease: "expo.out",
        scrollTrigger: { trigger: "[data-cta-form]", start: "top 85%" },
      });
      gsap.fromTo(
        "[data-orb]",
        { scale: 0.4, opacity: 0 },
        {
          scale: 1.1,
          opacity: 0.45,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top bottom", end: "center center", scrub: true },
        },
      );
    },
    { scope: root },
  );

  // No backend yet: compose the appeal into the visitor's mail client.
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = [
      `F.I.Sh.: ${f.get("name")}`,
      `Telefon: ${f.get("phone")}`,
      `Email: ${f.get("email") || "—"}`,
      `Tashkilot: ${f.get("org") || "—"}`,
      "",
      String(f.get("message")),
    ].join("\n");
    window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`${topic} — yangisamarqand`)}&body=${encodeURIComponent(body)}`;
    setSent(true);
    e.currentTarget.reset();
  };

  return (
    <section ref={root} id="aloqa" className="relative overflow-hidden bg-ink px-5 py-32 md:px-10 md:py-44">
      <div data-orb className="orb pointer-events-none absolute left-1/2 top-1/3 size-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,transparent_0%,var(--color-ink)_65%)]" />

      <div className="relative mx-auto max-w-[1600px]">
        <div className="flex flex-col items-center text-center">
          <span className="mb-10 font-mono text-[12.5px] uppercase tracking-[0.22em] text-mist">
            <span className="text-turq">10</span> — Taklif yoki savolingiz bormi?
          </span>
          <h2
            data-cta-title
            data-no-reveal
            className="font-display text-[12vw] font-bold uppercase leading-[0.9] tracking-[-0.04em] md:text-[8.5vw]"
          >
            Kelajakni
            <br />
            birga quramiz
          </h2>
          <p className="mt-8 max-w-lg text-lg text-ivory/90">
            Murojaat yoki taklif yuboring — Kengash uni ko‘rib chiqadi va siz bilan bog‘lanadi.
          </p>
        </div>

        <div className="mt-20 grid gap-6 [perspective:1400px] lg:grid-cols-12">
          <div className="flex flex-col gap-3 lg:col-span-4">
            {CONTACTS.map(({ icon: Icon, label, href }) => {
              const inner = (
                <>
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-turq/10 text-turq transition-transform duration-500 group-hover:rotate-12">
                    <Icon className="size-5" />
                  </span>
                  <span className="text-lg text-ivory">{label}</span>
                </>
              );
              return href ? (
                <a
                  key={label}
                  href={href}
                  data-cursor="hover"
                  className="glass group flex items-center gap-4 rounded-3xl p-4 transition-colors hover:border-turq/50"
                >
                  {inner}
                </a>
              ) : (
                <div key={label} className="glass group flex items-center gap-4 rounded-3xl p-4">
                  {inner}
                </div>
              );
            })}
          </div>

          <div data-cta-form className="glass relative overflow-hidden rounded-[2rem] p-6 md:p-10 lg:col-span-8">
            <AnimatePresence mode="wait">
              {sent ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className="flex min-h-[420px] flex-col items-center justify-center text-center"
                >
                  <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}>
                    <CheckCircle2 className="size-20 text-turq" />
                  </motion.div>
                  <h3 className="mt-6 font-display text-3xl font-semibold">Pochta ilovangiz ochildi</h3>
                  <p className="mt-3 max-w-md text-ivory/85">
                    Xatni yuborishni yakunlang — murojaatingiz {EMAIL} manziliga yetib boradi.
                  </p>
                  <button
                    type="button"
                    data-cursor="hover"
                    onClick={() => setSent(false)}
                    className="mt-8 rounded-full border border-ivory/20 px-6 py-3 font-mono text-[12.5px] uppercase tracking-[0.18em] hover:border-turq hover:text-turq"
                  >
                    <Roll>Yana yozish</Roll>
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid gap-4"
                >
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        data-cursor="hover"
                        onClick={() => setTopic(t)}
                        className={cn(
                          "relative rounded-full px-5 py-2.5 font-mono text-[12.5px] uppercase tracking-[0.15em] transition-colors",
                          topic === t ? "text-ink" : "text-ivory/80 hover:text-ivory",
                        )}
                      >
                        {topic === t && (
                          <motion.span layoutId="topic-pill" className="absolute inset-0 rounded-full bg-turq" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                        )}
                        <span className="relative">{t}</span>
                      </button>
                    ))}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field name="name" label="F.I.Sh." required />
                    <Field name="phone" label="Telefon" type="tel" required />
                    <Field name="email" label="Email" type="email" />
                    <Field name="org" label="Tashkilot" />
                  </div>
                  <Field name="message" label="Murojaat matni" textarea required />
                  <label className="flex items-start gap-3 text-sm text-ivory/80">
                    <input type="checkbox" required className="mt-1 size-4 accent-turq" />
                    Shaxsiy ma’lumotlarimni qayta ishlashga roziman
                  </label>
                  <div className="mt-2 flex justify-end">
                    <Magnetic>
                      <button
                        type="submit"
                        data-cursor="hover"
                        className="group relative inline-flex h-16 items-center gap-4 overflow-hidden rounded-full bg-ivory pl-8 pr-2 font-mono text-[13px] uppercase tracking-[0.2em] text-ink"
                      >
                        <span className="absolute inset-0 translate-y-full rounded-full bg-turq transition-transform duration-700 ease-expo group-hover:translate-y-0" />
                        <span className="relative">
                          <Roll>Murojaat yuborish</Roll>
                        </span>
                        <span className="relative grid size-12 place-items-center rounded-full bg-ink text-ivory transition-transform duration-500 ease-expo group-hover:rotate-45">
                          <ArrowUpRight className="size-5" />
                        </span>
                      </button>
                    </Magnetic>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
