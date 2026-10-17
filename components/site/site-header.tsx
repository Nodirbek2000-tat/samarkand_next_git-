"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, BookOpen, ChevronDown, LayoutDashboard, LogIn, Phone, Search, X } from "lucide-react";
import { Logo } from "@/components/logo";
import { Magnetic } from "@/components/magnetic";
import { AdminQuick } from "@/components/admin-quick";
import { ThemeToggle } from "@/components/theme-toggle";
import { useLenis } from "@/components/providers/smooth-scroll";
import { useSession, type SessionUser } from "@/lib/session";
import { useIntroDone } from "@/lib/store";
import { cn } from "@/lib/utils";
import { SITE_NAV } from "./nav";
import { PathWatcher } from "./path-watcher";

const ease = [0.16, 1, 0.3, 1] as const;
// «Made in Samarkand» electronic catalogue — the admin can change it in the site settings
const CATALOG_URL = "http://madeinsam.uz";

type Active = { group: number; href: string } | null;

/** Where am I? The most specific menu link that matches the page (/news/films/x → «Filmlar», not «Yangiliklar»). */
function findActive(pathname: string): Active {
  let best: Active = null;
  let len = 0;
  SITE_NAV.forEach((group, g) =>
    group.children.forEach((c) => {
      const href = c.href.split("#")[0];
      const hit = pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
      if (hit && href.length > len) {
        best = { group: g, href: c.href };
        len = href.length;
      }
    }),
  );
  return best;
}

/** `waitForIntro`: on the home page the header slides in only after the preloader and hero intro. */
export function SiteHeader({ phone, catalog, waitForIntro = false }: { phone?: string; catalog?: string; waitForIntro?: boolean }) {
  const catalogUrl = catalog || CATALOG_URL;
  const intro = useIntroDone();
  const ready = !waitForIntro || intro;
  const [pathname, setPathname] = useState("");
  const active = useMemo(() => findActive(pathname), [pathname]);
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

  // lock the page while a full-screen menu is open — and only release a lock we took ourselves
  // (on the home page the preloader holds its own lock until the intro has played)
  const lockedByMenu = useRef(false);
  useEffect(() => {
    if (!lenis) return;
    if (mobile || searchOpen) {
      lenis.stop();
      lockedByMenu.current = true;
    } else if (lockedByMenu.current) {
      lenis.start();
      lockedByMenu.current = false;
    }
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
        animate={ready ? { y: hidden && open === null && !mobile ? -120 : 0, opacity: 1 } : { y: -120, opacity: 0 }}
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
                  aria-current={active?.group === i ? "true" : undefined}
                  className={cn(
                    "relative flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[15px] transition-colors 2xl:px-3.5",
                    active?.group === i ? "font-bold text-turq" : "font-semibold text-ivory/85 hover:text-ivory",
                  )}
                >
                  {/* the section you are in: a soft pill + a bar under the label, sliding along when you move on */}
                  {active?.group === i && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-full bg-turq/12"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    >
                      <span className="absolute inset-x-4 -bottom-1 h-0.5 rounded-full bg-turq" />
                    </motion.span>
                  )}
                  <span className="relative">{group.label}</span>
                  <ChevronDown className={cn("relative size-4 transition-transform duration-500", open === i && "rotate-180")} />
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
            <a
              href={catalogUrl}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              title="Made in Samarkand — viloyat mahsulotlari elektron katalogi"
              aria-label="Katalog: Made in Samarkand"
              className={cn(
                "group hidden h-10 items-center gap-2 rounded-full border border-gold/45 bg-gold/10 pl-3.5 pr-1.5 text-sm font-semibold text-gold transition-colors duration-300 hover:bg-gold hover:text-ink md:inline-flex",
                // 1280–1399px: the full menu leaves room for the icon only
                "xl:max-[1399px]:w-10 xl:max-[1399px]:justify-center xl:max-[1399px]:px-0",
              )}
            >
              <BookOpen className="size-4" />
              <span className="xl:max-[1399px]:hidden">Katalog</span>
              <span className="grid size-7 place-items-center rounded-full bg-gold/15 transition-transform duration-500 ease-expo group-hover:rotate-45 group-hover:bg-ink/10 xl:max-[1399px]:hidden">
                <ArrowUpRight className="size-3.5" />
              </span>
            </a>
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
                      {SITE_NAV[open].children.map(({ label, href, desc, icon: Icon }, j) => {
                        const here = active?.group === open && active.href === href;
                        return (
                          <motion.li
                            key={href + label}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.04 * j, duration: 0.45, ease }}
                          >
                            <Link
                              href={href}
                              data-cursor="hover"
                              aria-current={here ? "page" : undefined}
                              className={cn(
                                "group flex h-full items-start gap-4 rounded-2xl p-4 transition-colors",
                                here ? "bg-turq/12 ring-1 ring-turq/45" : "hover:bg-ivory/[0.06]",
                              )}
                            >
                              <span
                                className={cn(
                                  "grid size-11 shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-expo group-hover:-rotate-6 group-hover:scale-110",
                                  here ? "bg-turq text-ink" : "bg-turq/12 text-turq",
                                )}
                              >
                                <Icon className="size-5" />
                              </span>
                              <span>
                                <span className={cn("block text-base", here ? "font-bold text-turq" : "font-semibold text-ivory")}>{label}</span>
                                {desc && <span className="mt-1 block text-sm text-ivory/70">{desc}</span>}
                                {here && (
                                  <span className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-turq">
                                    <span className="size-1.5 rounded-full bg-turq" /> Siz shu yerdasiz
                                  </span>
                                )}
                              </span>
                            </Link>
                          </motion.li>
                        );
                      })}
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
            active={active}
            catalog={catalogUrl}
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

function MobileMenu({
  active,
  catalog,
  phone,
  user,
  onClose,
  onSearch,
}: {
  active: Active;
  catalog: string;
  phone?: string;
  user: SessionUser | null;
  onClose: () => void;
  onSearch: () => void;
}) {
  const staff = !!user?.is_staff;
  // the section you are in stays open until the visitor picks another one (the route may only be known a moment
  // after the menu opens, so this follows it instead of being fixed when the menu mounts)
  const [picked, setPicked] = useState<number | null | undefined>(undefined);
  const expanded = picked === undefined ? (active?.group ?? 0) : picked;
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
      <motion.a
        href={catalog}
        target="_blank"
        rel="noreferrer"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6, ease }}
        className="mb-6 flex items-center gap-4 rounded-2xl border border-gold/40 bg-gold/10 p-4"
      >
        <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-gold text-ink">
          <BookOpen className="size-6" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-lg font-bold text-gold">Made in Samarkand</span>
          <span className="block text-[15px] text-ivory/75">Elektron katalog · 406 korxona</span>
        </span>
        <ArrowUpRight className="size-6 shrink-0 text-gold" />
      </motion.a>
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
              onClick={() => setPicked(expanded === i ? null : i)}
              className={cn(
                "flex w-full items-center justify-between py-5 text-left font-display text-2xl",
                active?.group === i ? "font-bold text-turq" : "font-semibold",
              )}
              aria-expanded={expanded === i}
            >
              <span className="flex items-center gap-3">
                {active?.group === i && <span className="size-2 rounded-full bg-turq" aria-hidden />}
                {group.label}
              </span>
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
                  {group.children.map(({ label, href, icon: Icon }) => {
                    const here = active?.group === i && active.href === href;
                    return (
                      <li key={href + label}>
                        <Link
                          href={href}
                          onClick={onClose}
                          aria-current={here ? "page" : undefined}
                          className={cn(
                            "flex items-center gap-3 rounded-xl py-3 pl-1 text-lg",
                            here ? "bg-turq/12 pl-3 font-bold text-turq" : "text-ivory/90",
                          )}
                        >
                          <Icon className="size-5 text-turq" /> {label}
                          {here && <span className="ml-auto mr-3 font-mono text-[11px] uppercase tracking-[0.16em]">Shu yerda</span>}
                        </Link>
                      </li>
                    );
                  })}
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
