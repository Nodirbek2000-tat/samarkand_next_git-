"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  BadgeCheck,
  Briefcase,
  Building2,
  CheckCheck,
  ChevronDown,
  Clock,
  Handshake,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  MessageSquareReply,
  Pencil,
  Phone,
  Send,
  UserPlus,
  UserRound,
  X,
} from "lucide-react";
import { useLenis } from "@/components/providers/smooth-scroll";
import { apiFetch, ApiError, fieldError } from "@/lib/api/client";
import { formatDate, formatDateTime } from "@/lib/format";
import { resetMe, useSession, type SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type Submission = {
  id: number;
  type: "appeal" | "cooperation" | "membership";
  type_label: string;
  title: string;
  message: string;
  status: "new" | "in_progress" | "done" | "archived";
  status_label: string;
  reply: string;
  replied_at: string | null;
  created_at: string;
};

const ease = [0.16, 1, 0.3, 1] as const;

const STATUS_STYLE: Record<Submission["status"], string> = {
  new: "border-gold/50 bg-gold/15 text-ivory",
  in_progress: "border-lapis/50 bg-lapis/15 text-ivory",
  done: "border-turq/50 bg-turq/15 text-ivory",
  archived: "border-ivory/20 bg-ivory/[0.06] text-ivory/75",
};
const STATUS_DOT: Record<Submission["status"], string> = {
  new: "bg-gold",
  in_progress: "bg-lapis",
  done: "bg-turq",
  archived: "bg-ivory/40",
};
const STATUS_ORDER: Submission["status"][] = ["new", "in_progress", "done", "archived"];

const ACTIONS = [
  { href: "/feedback/appeals", icon: Send, title: "Murojaat yuborish", text: "Taklif, savol yoki muammo" },
  { href: "/about/membership", icon: UserPlus, title: "A’zolikka ariza", text: "Kengash safiga qo‘shiling" },
  { href: "/cooperation", icon: Handshake, title: "Hamkorlik taklifi", text: "Tashkilotlar uchun" },
];

/* ---------- which section is open: kept in the address (#murojaatlar), so Back and reload keep it ---------- */

const TABS = [
  { id: "umumiy", label: "Umumiy ko‘rinish", short: "Umumiy", icon: LayoutDashboard },
  { id: "murojaatlar", label: "Mening murojaatlarim", short: "Murojaatlar", icon: Inbox },
  { id: "profil", label: "Shaxsiy ma’lumotlar", short: "Profil", icon: UserRound },
] as const;
type Tab = (typeof TABS)[number]["id"];

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}
function readTab(): Tab {
  const hash = window.location.hash.slice(1);
  return TABS.find((t) => t.id === hash)?.id ?? "umumiy";
}

export function Cabinet() {
  const router = useRouter();
  const lenis = useLenis();
  const user = useSession();
  const tab = useSyncExternalStore(subscribeHash, readTab, () => "umumiy" as Tab);
  const [items, setItems] = useState<Submission[] | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const top = useRef<HTMLDivElement>(null);

  // session expired elsewhere → back to the login page (but not while we are signing out on purpose)
  useEffect(() => {
    if (user === null && !loggingOut) router.replace("/kirish?next=/kabinet");
  }, [user, loggingOut, router]);

  useEffect(() => {
    if (!user) return;
    apiFetch<Submission[]>("account/submissions")
      .then(setItems)
      .catch(() => setItems([]));
  }, [user]);

  const go = (next: Tab) => {
    if (next !== tab) {
      window.history.pushState(null, "", next === "umumiy" ? window.location.pathname : `#${next}`);
      window.dispatchEvent(new HashChangeEvent("hashchange"));
    }
    // a long list may have left the panel's top above the screen
    const el = top.current;
    if (el && el.getBoundingClientRect().top < 0) lenis?.scrollTo(el, { offset: -110 });
  };

  const logout = async () => {
    setLoggingOut(true);
    try {
      await apiFetch("auth/logout", { method: "POST" });
    } catch {}
    resetMe();
    router.replace("/");
  };

  if (!user) {
    return (
      <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
        <div className="hidden h-[460px] animate-pulse rounded-[2rem] bg-ivory/[0.05] lg:block" />
        <div className="h-[460px] animate-pulse rounded-[2rem] bg-ivory/[0.05]" />
      </div>
    );
  }

  const name = [user.first_name, user.last_name].join(" ").trim() || user.full_name;
  const counts = {
    total: items?.length ?? 0,
    replied: items?.filter((i) => i.reply).length ?? 0,
    open: items?.filter((i) => i.status === "new" || i.status === "in_progress").length ?? 0,
  };

  return (
    <div ref={top} className="grid items-start gap-6 lg:grid-cols-[290px_1fr]">
      {/* ---------- left menu (desktop) ---------- */}
      <motion.aside
        initial={{ opacity: 0, x: -24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease }}
        className="hidden rounded-[2rem] border border-ivory/10 bg-ink-2 p-3 lg:sticky lg:top-28 lg:block"
      >
        <div className="flex items-center gap-3 p-3">
          <Avatar name={name} />
          <span className="min-w-0">
            <span className="line-clamp-2 font-display text-lg font-semibold leading-tight [overflow-wrap:anywhere]">{name}</span>
            <span className="block truncate text-sm text-ivory/60">
              {user.telegram?.username ? `@${user.telegram.username}` : user.telegram?.phone || user.email || user.username}
            </span>
          </span>
        </div>

        <nav aria-label="Kabinet bo‘limlari" className="mt-1">
          <p className="px-3 pb-1.5 pt-3 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory/50">Kabinet</p>
          <ul className="space-y-1">
            {TABS.map(({ id, label, icon: Icon }) => {
              const on = tab === id;
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => go(id)}
                    aria-current={on ? "page" : undefined}
                    className={cn(
                      "relative flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left font-semibold transition-colors",
                      on ? "bg-turq/12 text-ivory" : "text-ivory/75 hover:bg-ivory/[0.05] hover:text-ivory",
                    )}
                  >
                    {on && (
                      <motion.span layoutId="cabinet-rail" className="absolute inset-y-2.5 left-0 w-[3px] rounded-full bg-turq" />
                    )}
                    <Icon className={cn("size-5 shrink-0", on ? "text-turq" : "text-ivory/55")} />
                    <span className="flex-1">{label}</span>
                    {id === "murojaatlar" && counts.total > 0 && (
                      <span className="rounded-full bg-ivory/10 px-2 py-0.5 text-xs tabular-nums text-ivory/80">
                        {counts.total}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          <p className="px-3 pb-1.5 pt-5 font-mono text-[11px] uppercase tracking-[0.18em] text-ivory/50">Amallar</p>
          <ul className="space-y-1">
            {ACTIONS.map(({ href, icon: Icon, title }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group flex items-center gap-3 rounded-2xl px-3 py-3 font-semibold text-ivory/75 transition-colors hover:bg-ivory/[0.05] hover:text-ivory"
                >
                  <Icon className="size-5 shrink-0 text-ivory/55 group-hover:text-turq" />
                  <span className="flex-1">{title}</span>
                  <ArrowUpRight className="size-4 text-ivory/35 transition-transform group-hover:rotate-45 group-hover:text-turq" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-3 border-t border-ivory/10 pt-3">
          <LogoutButton onClick={logout} busy={loggingOut} />
        </div>
      </motion.aside>

      {/* ---------- top bar (phones / tablets) ---------- */}
      <div className="space-y-4 lg:hidden">
        <div className="flex items-center gap-3 rounded-[1.6rem] border border-ivory/10 bg-ink-2 p-3">
          <Avatar name={name} />
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 font-display text-lg font-semibold leading-tight [overflow-wrap:anywhere]">{name}</span>
            {user.telegram?.username && <span className="block truncate text-sm text-ivory/60">@{user.telegram.username}</span>}
          </span>
          <button
            type="button"
            onClick={logout}
            disabled={loggingOut}
            aria-label="Chiqish"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-ember/40 text-ember disabled:opacity-60"
          >
            {loggingOut ? <Loader2 className="size-5 animate-spin" /> : <LogOut className="size-5" />}
          </button>
        </div>
        <nav aria-label="Kabinet bo‘limlari" className="grid grid-cols-3 gap-1 rounded-2xl border border-ivory/10 bg-ink-2 p-1">
          {TABS.map(({ id, short, icon: Icon }) => {
            const on = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => go(id)}
                aria-current={on ? "page" : undefined}
                className={cn(
                  "relative flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors",
                  on ? "text-ivory" : "text-ivory/65",
                )}
              >
                {on && (
                  <motion.span
                    layoutId="cabinet-pill"
                    className="absolute inset-0 rounded-xl bg-turq/15"
                    transition={{ duration: 0.4, ease }}
                  />
                )}
                <Icon className={cn("relative size-4", on && "text-turq")} />
                <span className="relative">{short}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* ---------- the open section ---------- */}
      <div className="min-w-0">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease }}
          >
            {tab === "umumiy" && <Overview user={user} name={name} items={items} counts={counts} go={go} />}
            {tab === "murojaatlar" && <Submissions items={items} />}
            {tab === "profil" && <Profile user={user} name={name} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Avatar({ name, size = "md" }: { name: string; size?: "md" | "lg" }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-turq to-lapis font-display font-bold text-white",
        size === "lg" ? "size-16 text-2xl" : "size-12 text-xl",
      )}
    >
      {name.slice(0, 1).toUpperCase()}
    </span>
  );
}

function LogoutButton({ onClick, busy }: { onClick: () => void; busy: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 font-semibold text-ember transition-colors hover:bg-ember/10 disabled:opacity-60"
    >
      {busy ? <Loader2 className="size-5 animate-spin" /> : <LogOut className="size-5" />} Chiqish
    </button>
  );
}

function Panel({
  kicker,
  title,
  aside,
  children,
  className,
}: {
  kicker?: string;
  title: string;
  aside?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[2rem] border border-ivory/10 bg-ink-2 p-5 md:p-7", className)}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {kicker && <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-turq">{kicker}</p>}
          <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">{title}</h2>
        </div>
        {aside}
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

/* ---------- Umumiy ko‘rinish ---------- */

function Overview({
  user,
  name,
  items,
  counts,
  go,
}: {
  user: SessionUser;
  name: string;
  items: Submission[] | null;
  counts: { total: number; replied: number; open: number };
  go: (tab: Tab) => void;
}) {
  const first = user.first_name || name.split(" ")[0];
  const missing = [
    !user.email && "email",
    user.telegram && !user.telegram.company && "kompaniya",
    user.telegram && !user.telegram.position && "lavozim",
  ].filter(Boolean) as string[];
  const stats = [
    { label: "Jami murojaatlar", value: counts.total, icon: Inbox, tone: "text-ivory" },
    { label: "Javob berilgan", value: counts.replied, icon: CheckCheck, tone: "text-turq" },
    { label: "Ko‘rib chiqilmoqda", value: counts.open, icon: Clock, tone: "text-gold" },
  ];

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[2rem] border border-ivory/10 bg-ink-2 p-6 md:p-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-turq)_20%,transparent),transparent_70%)]" />
        <p className="relative font-mono text-[13px] uppercase tracking-[0.18em] text-turq">Shaxsiy kabinet</p>
        <h2 className="relative mt-1 font-display text-3xl font-semibold [overflow-wrap:anywhere] md:text-4xl">
          Assalomu alaykum, {first}!
        </h2>
        <p className="relative mt-2 max-w-xl text-base text-ivory/70">
          Murojaatlaringiz holati va Kengash javoblari shu yerda jamlanadi.
        </p>
        <dl className="relative mt-6 grid grid-cols-3 gap-3">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex flex-col rounded-2xl border border-ivory/10 bg-ink/60 p-3 md:p-4">
              <Icon className={cn("size-5", tone)} />
              {/* the label is read first, the number is shown first */}
              <dt className="order-last mt-1 text-xs leading-snug text-ivory/65 md:text-sm">{label}</dt>
              <dd className={cn("mt-3 font-display text-3xl font-semibold tabular-nums md:text-4xl", tone)}>
                {items === null ? "–" : value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* phones: compact rows; wider screens: three cards */}
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {ACTIONS.map(({ href, icon: Icon, title, text }) => (
          <Link
            key={href}
            href={href}
            className="group flex h-full items-center gap-4 rounded-[1.6rem] border border-ivory/10 bg-ink-2 p-4 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-turq/50 sm:flex-col sm:items-start sm:gap-3 sm:p-5"
          >
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-turq/12 text-turq transition-transform duration-500 group-hover:rotate-6">
              <Icon className="size-6" />
            </span>
            <span className="min-w-0 flex-1 sm:flex-none">
              <span className="block font-display text-lg font-semibold">{title}</span>
              <span className="mt-0.5 block text-sm text-ivory/70 sm:mt-3">{text}</span>
            </span>
            <ArrowRight className="size-5 shrink-0 text-ivory/40 sm:hidden" />
          </Link>
        ))}
      </div>

      {missing.length > 0 && (
        <div className="flex flex-col gap-4 rounded-[1.6rem] border border-gold/30 bg-gold/[0.07] p-5 sm:flex-row sm:items-center">
          <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-gold/15 text-gold">
            <Pencil className="size-5" />
          </span>
          <p className="flex-1 text-base text-ivory/80">
            <b className="text-ivory">Profilingizni to‘ldiring:</b> {missing.join(", ")} kiritilmagan — Kengash siz bilan tezroq
            bog‘lanadi.
          </p>
          <button
            type="button"
            onClick={() => go("profil")}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-ivory px-5 font-semibold text-ink"
          >
            To‘ldirish <ArrowRight className="size-4" />
          </button>
        </div>
      )}

      <Panel
        kicker="Tarix"
        title="So‘nggi murojaatlar"
        aside={
          items && items.length > 3 ? (
            <button
              type="button"
              onClick={() => go("murojaatlar")}
              className="inline-flex items-center gap-1.5 font-semibold text-turq hover:underline"
            >
              Barchasi ({items.length}) <ArrowRight className="size-4" />
            </button>
          ) : undefined
        }
      >
        {items === null ? (
          <ListSkeleton rows={2} />
        ) : items.length === 0 ? (
          <NoSubmissions />
        ) : (
          <ul className="space-y-3">
            {items.slice(0, 3).map((item) => (
              <li key={`${item.type}-${item.id}`}>
                <button
                  type="button"
                  onClick={() => go("murojaatlar")}
                  className="flex w-full items-center gap-4 rounded-2xl border border-ivory/10 bg-ink p-4 text-left transition-colors hover:border-turq/40"
                >
                  <span className={cn("size-3 shrink-0 rounded-full", STATUS_DOT[item.status])} aria-hidden />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{item.title}</span>
                    <span className="mt-0.5 block text-sm text-ivory/65">
                      {item.type_label} · {formatDate(item.created_at)}
                    </span>
                  </span>
                  {item.reply && <MessageSquareReply className="size-5 shrink-0 text-turq" aria-label="Javob bor" />}
                  <span
                    className={cn(
                      "hidden shrink-0 rounded-full border px-3 py-1 text-sm font-semibold sm:inline",
                      STATUS_STYLE[item.status],
                    )}
                  >
                    {item.status_label}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/* ---------- Mening murojaatlarim ---------- */

function Submissions({ items }: { items: Submission[] | null }) {
  const [filter, setFilter] = useState<Submission["status"] | "all">("all");
  const chips = useMemo(() => {
    if (!items) return [];
    return STATUS_ORDER.map((status) => {
      const list = items.filter((i) => i.status === status);
      return { status, label: list[0]?.status_label ?? "", count: list.length };
    }).filter((c) => c.count > 0);
  }, [items]);
  const shown = items && filter !== "all" ? items.filter((i) => i.status === filter) : items;
  const firstReplied = shown?.findIndex((x) => x.reply) ?? -1;

  return (
    <Panel
      kicker="Tarix"
      title="Mening murojaatlarim"
      aside={
        items && items.length > 0 ? (
          <p className="text-base text-ivory/75">
            Jami <b className="text-ivory">{items.length}</b> · javob berilgan{" "}
            <b className="text-turq">{items.filter((i) => i.reply).length}</b>
          </p>
        ) : undefined
      }
    >
      {chips.length > 1 && (
        <div className="-mt-1 mb-5 flex flex-wrap gap-2">
          {[{ status: "all" as const, label: "Hammasi", count: items?.length ?? 0 }, ...chips].map((c) => (
            <button
              key={c.status}
              type="button"
              onClick={() => setFilter(c.status)}
              aria-pressed={filter === c.status}
              className={cn(
                "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                filter === c.status
                  ? "border-turq bg-turq/15 text-ivory"
                  : "border-ivory/15 text-ivory/70 hover:border-turq/60 hover:text-ivory",
              )}
            >
              {c.status !== "all" && <span className={cn("size-2 rounded-full", STATUS_DOT[c.status])} aria-hidden />}
              {c.label}
              <span className="tabular-nums text-ivory/50">{c.count}</span>
            </button>
          ))}
        </div>
      )}
      {shown === null ? (
        <ListSkeleton rows={3} />
      ) : shown.length === 0 ? (
        <NoSubmissions />
      ) : (
        <ul className="space-y-3">
          {shown.map((item, i) => (
            <SubmissionRow key={`${filter}-${item.type}-${item.id}`} item={item} index={i} defaultOpen={i === firstReplied} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function ListSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="h-20 animate-pulse rounded-2xl bg-ivory/[0.05]" />
      ))}
    </div>
  );
}

function NoSubmissions() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ivory/20 px-6 py-12 text-center">
      <Inbox className="size-12 text-ivory/40" />
      <p className="mt-4 font-display text-xl font-semibold">Hali murojaat yubormagansiz</p>
      <p className="mt-2 max-w-md text-base text-ivory/75">
        Kabinetga kirgan holda yuborgan murojaatlaringiz shu yerda saqlanadi, javoblar esa Telegram orqali ham keladi.
      </p>
      <Link
        href="/feedback/appeals"
        className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ivory px-6 font-semibold text-ink"
      >
        <Send className="size-4" /> Birinchi murojaat
      </Link>
    </div>
  );
}

function SubmissionRow({ item, index, defaultOpen }: { item: Submission; index: number; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <motion.li
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 8) * 0.05, duration: 0.6, ease }}
      className={cn("overflow-hidden rounded-2xl border bg-ink transition-colors", open ? "border-turq/40" : "border-ivory/10")}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-4 p-4 text-left md:p-5"
      >
        <span className={cn("size-3 shrink-0 rounded-full", STATUS_DOT[item.status])} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-semibold">{item.title}</span>
          <span className="mt-0.5 block text-sm text-ivory/65">
            {item.type_label} · {formatDate(item.created_at)}
          </span>
        </span>
        {item.reply && <MessageSquareReply className="size-5 shrink-0 text-turq" aria-label="Javob bor" />}
        <span
          className={cn(
            "hidden shrink-0 rounded-full border px-3 py-1 text-sm font-semibold sm:inline",
            STATUS_STYLE[item.status],
          )}
        >
          {item.status_label}
        </span>
        <ChevronDown className={cn("size-5 shrink-0 text-ivory/60 transition-transform duration-500", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            transition={{ duration: 0.45, ease }}
            className="overflow-hidden"
          >
            <div className="space-y-4 border-t border-ivory/10 p-4 md:p-5">
              <span
                className={cn(
                  "inline-block rounded-full border px-3 py-1 text-sm font-semibold sm:hidden",
                  STATUS_STYLE[item.status],
                )}
              >
                {item.status_label}
              </span>
              {item.message && <p className="whitespace-pre-line text-base leading-relaxed text-ivory/85">{item.message}</p>}
              {item.reply ? (
                <div className="rounded-2xl border border-turq/30 bg-turq/10 p-4 md:p-5">
                  <p className="flex items-center gap-2 text-sm font-semibold text-turq">
                    <MessageSquareReply className="size-4" /> Kengash javobi
                    {item.replied_at && <span className="font-normal text-ivory/65">· {formatDateTime(item.replied_at)}</span>}
                  </p>
                  <p className="mt-2 whitespace-pre-line text-base leading-relaxed">{item.reply}</p>
                </div>
              ) : (
                <p className="text-sm text-ivory/65">Javob tayyor bo‘lishi bilan shu yerda va Telegram’da ko‘rinadi.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.li>
  );
}

/* ---------- Shaxsiy ma’lumotlar ---------- */

function Profile({ user, name }: { user: SessionUser; name: string }) {
  const [editing, setEditing] = useState(false);
  const tg = user.telegram;
  const empty = <span className="font-normal text-ivory/50">kiritilmagan</span>;

  return (
    <Panel
      kicker="Profil"
      title="Shaxsiy ma’lumotlar"
      aside={
        !editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full border border-ivory/15 px-5 font-semibold transition-colors hover:border-turq hover:text-turq"
          >
            <Pencil className="size-4" /> Tahrirlash
          </button>
        ) : undefined
      }
    >
      <div className="flex items-center gap-4 rounded-2xl border border-ivory/10 bg-ink p-4">
        <Avatar name={name} size="lg" />
        <span className="min-w-0">
          <span className="block break-words font-display text-xl font-semibold leading-tight sm:text-2xl">{name}</span>
          {tg?.username && <span className="block truncate text-base text-ivory/70">@{tg.username}</span>}
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <ProfileForm key="form" user={user} onDone={() => setEditing(false)} />
        ) : (
          <motion.dl
            key="view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 grid gap-3 text-base md:grid-cols-2"
          >
            {tg?.phone && (
              <Row icon={Phone} label="Telefon">
                {tg.phone}
                <span className="ml-2 inline-flex items-center gap-1 text-sm font-normal text-turq">
                  <BadgeCheck className="size-4" /> tasdiqlangan
                </span>
              </Row>
            )}
            {tg?.username && (
              <Row icon={AtSign} label="Telegram">
                @{tg.username}
              </Row>
            )}
            <Row icon={Mail} label="Email">
              {user.email || empty}
            </Row>
            {tg && (
              <>
                <Row icon={Building2} label="Kompaniya">
                  {tg.company || empty}
                </Row>
                <Row icon={Briefcase} label="Lavozim">
                  {tg.position || empty}
                </Row>
              </>
            )}
          </motion.dl>
        )}
      </AnimatePresence>
    </Panel>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-ivory/10 p-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-turq/12 text-turq">
        <Icon className="size-5" />
      </span>
      <div className="min-w-0">
        <dt className="text-sm text-ivory/60">{label}</dt>
        <dd className="break-words font-semibold">{children}</dd>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-ivory/20 bg-ink px-4 py-3 text-base text-ivory outline-none transition-colors placeholder:text-ivory/40 focus:border-turq";

function ProfileForm({ user, onDone }: { user: SessionUser; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<unknown>(null);

  const fields = [
    { name: "first_name", label: "Ism", value: user.first_name, required: true },
    { name: "last_name", label: "Familiya", value: user.last_name },
    { name: "email", label: "Email", value: user.email, type: "email" },
    ...(user.telegram
      ? [
          { name: "company", label: "Kompaniya", value: user.telegram.company },
          { name: "position", label: "Lavozim", value: user.telegram.position },
        ]
      : []),
  ];

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await apiFetch("account/profile", { method: "PATCH", body: Object.fromEntries(new FormData(e.currentTarget).entries()) });
      resetMe();
      onDone();
    } catch (err) {
      setError(err);
      setBusy(false);
    }
  };

  return (
    <motion.form
      key="form"
      onSubmit={submit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-4 space-y-4"
    >
      <div className="grid gap-4 md:grid-cols-2">
        {fields.map((f) => {
          const err = fieldError(error, f.name);
          return (
            <label key={f.name} className="block">
              <span className="mb-1.5 block text-sm font-semibold">
                {f.label}
                {f.required && <span className="text-ember"> *</span>}
              </span>
              <input
                name={f.name}
                type={f.type ?? "text"}
                defaultValue={f.value}
                required={f.required}
                maxLength={255}
                className={cn(inputCls, err && "border-ember")}
              />
              {err && <span className="mt-1 block text-sm font-semibold text-ember">{err}</span>}
            </label>
          );
        })}
      </div>
      {error instanceof ApiError && !fields.some((f) => fieldError(error, f.name)) && (
        <p className="text-sm font-semibold text-ember" role="alert">
          {error.message}
        </p>
      )}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={busy}
          className="flex h-12 items-center justify-center gap-2 rounded-xl bg-ivory px-8 font-semibold text-ink disabled:opacity-70"
        >
          {busy && <Loader2 className="size-4 animate-spin" />} Saqlash
        </button>
        <button
          type="button"
          onClick={onDone}
          className="flex h-12 items-center gap-2 rounded-xl border border-ivory/15 px-5 font-semibold"
        >
          <X className="size-4" /> Bekor qilish
        </button>
      </div>
    </motion.form>
  );
}
