"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, ChevronDown, LayoutDashboard, LogIn, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Magnetic } from "@/components/magnetic";
import { AdminQuick } from "@/components/admin-quick";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSession, type SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { SITE_NAV, type NavGroup } from "./nav";
import { PathWatcher } from "./path-watcher";

const ease = [0.16, 1, 0.3, 1] as const;

function isActive(pathname: string, group: NavGroup) {
  return group.children.some((c) => pathname === c.href || (c.href !== "/" && pathname.startsWith(c.href + "/")));
}

export function SiteHeader({ phone }: { phone?: string }) {
  const [pathname, setPathname] = useState("");
  const lenis = useLenis();
  const user = useSession();
  const staff = user?.is_staff ? user : null;
  const [open, setOpen] = useState<number | null>(null);
  const [mobile, setMobile] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    if (!lenis) return;
    let last = 0;
    const onScroll = ({ scroll }: { scroll: number }) => {
      setScrolled(scroll > 30);
      setHidden(scroll > last && scroll > 400);
      last = scroll;
    };
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);

  // track the route and close any open menu when it changes
  const onPath = useCallback((path: string) => {
    setPathname(path);
    setOpen(null);
    setMobile(false);
    setSearchOpen(false);
  }, []);

  useEffect(() => {
    if (!lenis) return;
    if (mobile || searchOpen) lenis.stop();
    else lenis.start();
  }, [mobile, searchOpen, lenis]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(null);
        setSearchOpen(false);
        setMobile(false);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enter = (i: number) => {
    if (closeTimer.current) window.clearTimeout(closeTimer.current);
    setOpen(i);
  };
  const leave = () => {
    closeTimer.current = window.setTimeout(() => setOpen(null), 160);
  };

  return (
    <>
      <Suspense fallback={null}>
        <PathWatcher onChange={onPath} />
      </Suspense>
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: hidden && open === null && !mobile ? -120 : 0, opacity: 1 }}
        transition={{ duration: 0.8, ease }}
        className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4"
      >
        <div
          className={cn(
            "relative mx-auto flex max-w-[1600px] items-center justify-between gap-2 rounded-[1.4rem] px-3 py-2.5 sm:gap-4 sm:px-4 transition-all duration-700 ease-expo md:px-5",
            scrolled || open !== null ? "panel" : "border border-transparent",
          )}
          onMouseLeave={leave}
        >
          <Link href="/" data-cursor="hover" aria-label="Bosh sahifa" className="shrink-0">
            <Logo responsive />
          </Link>

          <nav className="hidden items-center xl:flex" aria-label="Asosiy menyu">
            {SITE_NAV.map((group, i) => (
              <div key={group.label} onMouseEnter={() => enter(i)} className="relative">
                <Link
                  href={group.href}
                  data-cursor="hover"
                  aria-expanded={open === i}
                  className={cn(
                    "flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[15px] font-semibold transition-colors 2xl:px-3.5",
                    isActive(pathname, group) ? "text-turq" : "text-ivory/85 hover:text-ivory",
                  )}
                >
                  {group.label}
                  <ChevronDown className={cn("size-4 transition-transform duration-500", open === i && "rotate-180")} />
                </Link>
              </div>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              data-cursor="hover"
              onClick={() => setSearchOpen(true)}
              aria-label="Qidirish"
              className="hidden size-10 sm:grid place-items-center rounded-full border border-ivory/15 text-ivory transition-colors hover:border-turq hover:text-turq"
            >
              <Search className="size-[18px]" />
            </button>
            <ThemeToggle />
            {staff && <AdminQuick user={staff} className="hidden sm:block" />}
            <AccountButton user={user} />
            <Magnetic className="hidden 2xl:inline-block">
              <Link
                href="/feedback/appeals"
                data-cursor="hover"
                className="group inline-flex h-10 items-center gap-2 rounded-full bg-ivory pl-5 pr-1.5 text-sm font-semibold text-ink"
              >
                Murojaat
                <span className="grid size-7 place-items-center rounded-full bg-ink text-ivory transition-transform duration-500 ease-expo group-hover:rotate-45">
                  <ArrowUpRight className="size-3.5" />
                </span>
              </Link>
            </Magnetic>
            <button
              type="button"
              aria-label={mobile ? "Menyuni yopish" : "Menyuni ochish"}
              aria-expanded={mobile}
              onClick={() => setMobile((v) => !v)}
              className="relative grid size-10 place-items-center rounded-full border border-ivory/15 xl:hidden"
            >
              <span className={cn("absolute h-0.5 w-4 rounded bg-ivory transition-transform duration-500 ease-expo", mobile ? "rotate-45" : "-translate-y-1")} />
              <span className={cn("absolute h-0.5 w-4 rounded bg-ivory transition-transform duration-500 ease-expo", mobile ? "-rotate-45" : "translate-y-1")} />
            </button>
          </div>

          {/* mega menu */}
          <AnimatePresence>
            {open !== null && (
              <motion.div
                key="mega"
                onMouseEnter={() => enter(open)}
                initial={{ opacity: 0, y: -12, clipPath: "inset(0 0 100% 0 round 24px)" }}
                animate={{ opacity: 1, y: 0, clipPath: "inset(0 0 0% 0 round 24px)" }}
                exit={{ opacity: 0, y: -8, clipPath: "inset(0 0 100% 0 round 24px)" }}
                transition={{ duration: 0.55, ease }}
                className="panel absolute inset-x-0 top-[calc(100%+10px)] hidden overflow-hidden rounded-3xl p-6 xl:block"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={open}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    transition={{ duration: 0.35, ease }}
                    className="grid grid-cols-12 gap-6"
                  >
                    <div className="col-span-3 flex flex-col justify-between rounded-2xl bg-gradient-to-br from-turq/15 via-lapis/10 to-gold/15 p-6">
                      <div>
                        <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-turq">Bo‘lim</p>
                        <p className="mt-3 font-display text-3xl font-semibold leading-tight">{SITE_NAV[open].label}</p>
                      </div>
                      <Link
                        href={SITE_NAV[open].href}
                        className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-ivory hover:text-turq"
                      >
                        Bo‘limga o‘tish <ArrowUpRight className="size-4" />
                      </Link>
                    </div>
                    <ul className="col-span-9 grid grid-cols-3 gap-2">
                      {SITE_NAV[open].children.map(({ label, href, desc, icon: Icon }, j) => (
                        <motion.li
                          key={href + label}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.04 * j, duration: 0.45, ease }}
                        >
                          <Link
                            href={href}
                            data-cursor="hover"
                            className={cn(
                              "group flex h-full items-start gap-4 rounded-2xl p-4 transition-colors hover:bg-ivory/[0.06]",
                              pathname === href && "bg-turq/10",
                            )}
                          >
                            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-turq/12 text-turq transition-transform duration-500 ease-expo group-hover:-rotate-6 group-hover:scale-110">
                              <Icon className="size-5" />
                            </span>
                            <span>
                              <span className="block text-base font-semibold text-ivory">{label}</span>
                              {desc && <span className="mt-1 block text-sm text-ivory/70">{desc}</span>}
                            </span>
                          </Link>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.header>

      {/* mobile menu */}
      <AnimatePresence>
        {mobile && (
          <MobileMenu
            phone={phone}
            user={user ?? null}
            onClose={() => setMobile(false)}
            onSearch={() => {
              setMobile(false);
              setSearchOpen(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* search */}
      <AnimatePresence>{searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}</AnimatePresence>
    </>
  );
}

function initials(user: SessionUser) {
  const name = (user.full_name || user.telegram?.username || user.username).trim();
  return name.slice(0, 1).toUpperCase();
}

/** "Kirish" for guests, an avatar to the personal cabinet once signed in. Nothing while the session loads. */
function AccountButton({ user }: { user: SessionUser | null | undefined }) {
  if (user === undefined) return <span className="size-10" aria-hidden />;
  if (!user) {
    return (
      <Link
        href="/kirish"
        data-cursor="hover"
        className="inline-flex h-10 items-center gap-2 rounded-full border border-ivory/15 px-3 text-sm font-semibold text-ivory transition-colors hover:border-turq hover:text-turq sm:px-4"
      >
        <LogIn className="size-4" /> <span className="hidden whitespace-nowrap sm:inline">Kirish</span>
      </Link>
    );
  }
  return (
    <Link
      href="/kabinet"
      data-cursor="hover"
      title="Shaxsiy kabinet"
      aria-label="Shaxsiy kabinet"
      className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-turq to-lapis text-base font-bold text-white ring-2 ring-transparent transition hover:ring-turq/50"
    >
      {initials(user)}
    </Link>
  );
}

function MobileMenu({ phone, user, onClose, onSearch }: { phone?: string; user: SessionUser | null; onClose: () => void; onSearch: () => void }) {
  const staff = !!user?.is_staff;
  const [expanded, setExpanded] = useState<number | null>(0);
  return (
    <motion.div
      className="fixed inset-0 z-40 overflow-y-auto bg-ink px-5 pb-10 pt-24 xl:hidden"
      data-lenis-prevent
      initial={{ clipPath: "circle(0% at 95% 4%)" }}
      animate={{ clipPath: "circle(150% at 95% 4%)" }}
      exit={{ clipPath: "circle(0% at 95% 4%)" }}
      transition={{ duration: 0.8, ease }}
    >
      <button
        type="button"
        onClick={onSearch}
        className="mb-6 flex h-14 w-full items-center gap-3 rounded-2xl border border-ivory/15 bg-ivory/[0.04] px-5 text-left text-lg text-ivory/70 sm:hidden"
      >
        <Search className="size-5 text-turq" /> Saytdan qidirish…
      </button>
      <nav className="flex flex-col divide-y divide-ivory/10 border-y border-ivory/10">
        {SITE_NAV.map((group, i) => (
          <motion.div
            key={group.label}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease }}
          >
            <button
              type="button"
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="flex w-full items-center justify-between py-5 text-left font-display text-2xl font-semibold"
              aria-expanded={expanded === i}
            >
              {group.label}
              <ChevronDown className={cn("size-6 transition-transform duration-500", expanded === i && "rotate-180")} />
            </button>
            <AnimatePresence initial={false}>
              {expanded === i && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.45, ease }}
                  className="overflow-hidden"
                >
                  {group.children.map(({ label, href, icon: Icon }) => (
                    <li key={href + label}>
                      <Link href={href} onClick={onClose} className="flex items-center gap-3 py-3 pl-1 text-lg text-ivory/90">
                        <Icon className="size-5 text-turq" /> {label}
                      </Link>
                    </li>
                  ))}
                  <li className="h-3" />
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </nav>
      <div className="mt-8 flex flex-col gap-3">
        {staff && (
          <Link href="/admin" onClick={onClose} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-turq/40 bg-turq/10 font-semibold text-turq">
            <LayoutDashboard className="size-5" /> Admin panel
          </Link>
        )}
        <Link
          href={user ? "/kabinet" : "/kirish"}
          onClick={onClose}
          className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-ivory/15 font-semibold"
        >
          <LogIn className="size-5" /> {user ? "Shaxsiy kabinet" : "Kirish / Ro‘yxatdan o‘tish"}
        </Link>
        <Link href="/feedback/appeals" onClick={onClose} className="flex h-14 items-center justify-center rounded-2xl bg-ivory font-semibold text-ink">
          Murojaat yuborish
        </Link>
        {phone && (
          <a href={`tel:${phone.replace(/\s/g, "")}`} className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-ivory/15 font-semibold">
            <Phone className="size-5" /> {phone}
          </a>
        )}
      </div>
    </motion.div>
  );
}

function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => input.current?.focus(), []);

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/70 px-4 pt-[14vh] backdrop-blur-md"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault();
          if (q.trim().length >= 2) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
        }}
        initial={{ y: -30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        className="glass w-full max-w-2xl rounded-3xl p-3"
        role="search"
      >
        <div className="flex items-center gap-3 px-3">
          <Search className="size-6 shrink-0 text-turq" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Yangiliklar, loyihalar, a’zolar…"
            className="h-14 w-full bg-transparent text-xl text-ivory outline-none placeholder:text-ivory/45"
            aria-label="Sayt bo‘yicha qidirish"
          />
          <button type="button" onClick={onClose} aria-label="Yopish" className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-ivory/10">
            <X className="size-5" />
          </button>
        </div>
        <p className="px-4 pb-2 pt-1 text-sm text-ivory/60">Enter — qidirish · Esc — yopish</p>
      </motion.form>
    </motion.div>
  );
}
