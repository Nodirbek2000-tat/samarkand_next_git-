"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, LogIn, Phone } from "lucide-react";
import { AdminQuick } from "@/components/admin-quick";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { Magnetic } from "@/components/magnetic";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSession, type SessionUser } from "@/lib/session";
import { useIntroDone } from "@/lib/store";
import { cn } from "@/lib/utils";

export const NAV = [
  { href: "#kengash", label: "Kengash" },
  { href: "#loyihalar", label: "Loyihalar" },
  { href: "#forum", label: "Forum" },
  { href: "#ipak-yoli", label: "Hamkorlik" },
  { href: "#azolik", label: "A’zolik" },
  { href: "#aloqa", label: "Aloqa" },
];

const ease = [0.16, 1, 0.3, 1] as const;

export function Header() {
  const lenis = useLenis();
  const intro = useIntroDone();
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const user = useSession();

  useEffect(() => {
    if (!lenis) return;
    let last = 0;
    const onScroll = ({ scroll }: { scroll: number }) => {
      setHidden(scroll > last && scroll > 300);
      last = scroll;
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  useEffect(() => {
    if (!lenis) return;
    if (open) lenis.stop();
    else lenis.start();
  }, [open, lenis]);

  const go = (href: string) => {
    setOpen(false);
    lenis?.scrollTo(href, { offset: 0, duration: 1.6 });
  };

  return (
    <>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={intro ? { y: hidden && !open ? -110 : 0, opacity: 1 } : { y: -100, opacity: 0 }}
        transition={{ duration: 0.9, ease }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8 md:pt-5"
      >
        <div
          className={cn(
            "mx-auto flex max-w-[1600px] items-center justify-between rounded-full px-4 py-2.5 transition-all duration-700 ease-expo md:px-6",
            // solid on purpose: the menu must stay readable over the 3D scene
            open ? "border border-transparent" : "panel",
          )}
        >
          <a href="#" data-cursor="hover" onClick={(e) => (e.preventDefault(), go("top"))} aria-label="Bosh sahifa">
            <Logo />
          </a>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                data-cursor="hover"
                onClick={(e) => (e.preventDefault(), go(item.href))}
                className="group relative overflow-hidden rounded-full px-4 py-2 font-mono text-[12.5px] uppercase tracking-[0.2em] text-ivory/85 transition-colors hover:text-ivory"
              >
                <span className="relative block transition-transform duration-500 ease-expo group-hover:-translate-y-full">
                  {item.label}
                </span>
                <span className="absolute inset-x-4 top-full block text-turq transition-transform duration-500 ease-expo group-hover:-translate-y-full">
                  {item.label}
                </span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <a
              href="tel:+998662330001"
              data-cursor="hover"
              className="hidden items-center gap-2 whitespace-nowrap font-mono text-[12.5px] tracking-[0.15em] text-ivory/85 transition-colors hover:text-turq 2xl:flex"
            >
              <Phone className="size-3.5" /> +998 66 233 00 01
            </a>
            {user?.is_staff && <AdminQuick user={user} className="hidden sm:block" />}
            <AccountLink user={user} />
            <Magnetic className="hidden sm:inline-block">
              <a
                href="#aloqa"
                data-cursor="hover"
                onClick={(e) => (e.preventDefault(), go("#aloqa"))}
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-ivory pl-5 pr-2 font-mono text-[11.5px] uppercase tracking-[0.2em] text-ink"
              >
                Murojaat
                <span className="grid size-7 place-items-center rounded-full bg-ink text-ivory transition-transform duration-500 ease-expo group-hover:rotate-45">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </a>
            </Magnetic>
            <button
              type="button"
              aria-label={open ? "Menyuni yopish" : "Menyuni ochish"}
              aria-expanded={open}
              data-cursor="hover"
              onClick={() => setOpen((v) => !v)}
              className="relative grid size-10 place-items-center rounded-full border border-ivory/15 lg:hidden"
            >
              <span className={cn("absolute h-px w-4 bg-ivory transition-transform duration-500 ease-expo", open ? "rotate-45" : "-translate-y-1")} />
              <span className={cn("absolute h-px w-4 bg-ivory transition-transform duration-500 ease-expo", open ? "-rotate-45" : "translate-y-1")} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-6 pb-10 pt-28 lg:hidden"
            initial={{ clipPath: "circle(0% at 92% 6%)" }}
            animate={{ clipPath: "circle(150% at 92% 6%)" }}
            exit={{ clipPath: "circle(0% at 92% 6%)" }}
            transition={{ duration: 0.9, ease }}
          >
            <nav className="relative flex flex-col gap-2">
              {NAV.map((item, i) => (
                <div key={item.href} className="overflow-hidden">
                  <motion.a
                    href={item.href}
                    onClick={(e) => (e.preventDefault(), go(item.href))}
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ delay: 0.15 + i * 0.06, duration: 0.8, ease }}
                    className="flex items-baseline gap-4 font-display text-5xl font-semibold uppercase tracking-tight"
                  >
                    <span className="font-mono text-xs text-turq">0{i + 1}</span>
                    {item.label}
                  </motion.a>
                </div>
              ))}
            </nav>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.5 }}
              className="relative mt-12 flex flex-col gap-1 border-t border-ivory/10 pt-6 font-mono text-xs tracking-[0.15em] text-mist"
            >
              <Link
                href={user ? "/kabinet" : "/kirish"}
                className="mb-4 inline-flex h-12 items-center justify-center gap-2 rounded-full border border-ivory/20 text-sm text-ivory"
              >
                <LogIn className="size-4" /> {user ? "Shaxsiy kabinet" : "Kirish / Ro‘yxatdan o‘tish"}
              </Link>
              <a href="tel:+998662330001">+998 66 233 00 01</a>
              <a href="mailto:info@yangisamarqand.uz">info@yangisamarqand.uz</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/** Telegram sign-in entry: "Kirish" for guests, initials → personal cabinet once signed in. */
function AccountLink({ user }: { user: SessionUser | null | undefined }) {
  if (user === undefined) return null;
  if (user) {
    const name = [user.first_name, user.last_name].join(" ").trim() || user.full_name;
    return (
      <Link
        href="/kabinet"
        data-cursor="hover"
        title="Shaxsiy kabinet"
        aria-label="Shaxsiy kabinet"
        className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-turq to-lapis text-base font-bold text-white"
      >
        {name.slice(0, 1).toUpperCase()}
      </Link>
    );
  }
  return (
    <Link
      href="/kirish"
      data-cursor="hover"
      title="Kirish / Ro‘yxatdan o‘tish"
      aria-label="Kirish"
      className="inline-flex h-10 min-w-10 items-center justify-center gap-2 rounded-full border border-ivory/15 font-mono text-[11.5px] uppercase tracking-[0.2em] text-ivory/85 transition-colors hover:border-turq hover:text-turq 2xl:px-4"
    >
      <LogIn className="size-4" />
      <span className="hidden 2xl:inline">Kirish</span>
    </Link>
  );
}
