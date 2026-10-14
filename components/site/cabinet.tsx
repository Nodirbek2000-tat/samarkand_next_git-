"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  Briefcase,
  Building2,
  ChevronDown,
  Handshake,
  Inbox,
  Loader2,
  LogOut,
  Mail,
  MessageSquareReply,
  Pencil,
  Phone,
  Send,
  UserPlus,
  X,
} from "lucide-react";
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

const ACTIONS = [
  { href: "/feedback/appeals", icon: Send, title: "Murojaat yuborish", text: "Taklif, savol yoki muammo" },
  { href: "/about/membership", icon: UserPlus, title: "A’zolikka ariza", text: "Kengash safiga qo‘shiling" },
  { href: "/cooperation", icon: Handshake, title: "Hamkorlik taklifi", text: "Tashkilotlar uchun" },
];

export function Cabinet() {
  const router = useRouter();
  const user = useSession();
  const [items, setItems] = useState<Submission[] | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

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
      <div className="grid gap-6 lg:grid-cols-12">
        <div className="h-[420px] animate-pulse rounded-[2rem] bg-ivory/[0.05] lg:col-span-4" />
        <div className="h-[420px] animate-pulse rounded-[2rem] bg-ivory/[0.05] lg:col-span-8" />
      </div>
    );
  }

  const replied = items?.filter((i) => i.reply).length ?? 0;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <motion.aside
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease }}
        className="space-y-6 lg:sticky lg:top-28 lg:col-span-4"
      >
        <ProfileCard user={user} />
        <button
          type="button"
          onClick={logout}
          disabled={loggingOut}
          className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-ember/40 font-semibold text-ember transition-colors hover:bg-ember/10 disabled:opacity-60"
        >
          {loggingOut ? <Loader2 className="size-5 animate-spin" /> : <LogOut className="size-5" />} Chiqish
        </button>
      </motion.aside>

      <div className="space-y-6 lg:col-span-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {ACTIONS.map(({ href, icon: Icon, title, text }, i) => (
            <motion.div key={href} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.08, duration: 0.8, ease }}>
              <Link
                href={href}
                data-cursor="hover"
                className="group flex h-full flex-col gap-3 rounded-[1.6rem] border border-ivory/10 bg-ink-2 p-5 transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-turq/50"
              >
                <span className="grid size-12 place-items-center rounded-2xl bg-turq/12 text-turq transition-transform duration-500 group-hover:rotate-6">
                  <Icon className="size-6" />
                </span>
                <span className="font-display text-lg font-semibold">{title}</span>
                <span className="text-sm text-ivory/70">{text}</span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.9, ease }}
          className="rounded-[2rem] border border-ivory/10 bg-ink-2 p-5 md:p-8"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-[13px] uppercase tracking-[0.18em] text-turq">Tarix</p>
              <h2 className="mt-1 font-display text-2xl font-semibold md:text-3xl">Mening murojaatlarim</h2>
            </div>
            {items && items.length > 0 && (
              <p className="text-base text-ivory/75">
                Jami <b className="text-ivory">{items.length}</b> · javob berilgan <b className="text-turq">{replied}</b>
              </p>
            )}
          </div>

          <div className="mt-6">
            {items === null ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-ivory/[0.05]" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-ivory/20 px-6 py-12 text-center">
                <Inbox className="size-12 text-ivory/40" />
                <p className="mt-4 font-display text-xl font-semibold">Hali murojaat yubormagansiz</p>
                <p className="mt-2 max-w-md text-base text-ivory/75">
                  Kabinetga kirgan holda yuborgan murojaatlaringiz shu yerda saqlanadi, javoblar esa Telegram orqali ham keladi.
                </p>
                <Link href="/feedback/appeals" className="mt-6 inline-flex h-12 items-center gap-2 rounded-full bg-ivory px-6 font-semibold text-ink">
                  <Send className="size-4" /> Birinchi murojaat
                </Link>
              </div>
            ) : (
              <ul className="space-y-3">
                {items.map((item, i) => (
                  <SubmissionRow key={`${item.type}-${item.id}`} item={item} index={i} defaultOpen={i === items.findIndex((x) => x.reply)} />
                ))}
              </ul>
            )}
          </div>
        </motion.section>
      </div>
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
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-center gap-4 p-4 text-left md:p-5">
        <span className={cn("size-3 shrink-0 rounded-full", STATUS_DOT[item.status])} aria-hidden />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-lg font-semibold">{item.title}</span>
          <span className="mt-0.5 block text-sm text-ivory/65">
            {item.type_label} · {formatDate(item.created_at)}
          </span>
        </span>
        {item.reply && <MessageSquareReply className="size-5 shrink-0 text-turq" aria-label="Javob bor" />}
        <span className={cn("hidden shrink-0 rounded-full border px-3 py-1 text-sm font-semibold sm:inline", STATUS_STYLE[item.status])}>{item.status_label}</span>
        <ChevronDown className={cn("size-5 shrink-0 text-ivory/60 transition-transform duration-500", open && "rotate-180")} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.45, ease }} className="overflow-hidden">
            <div className="space-y-4 border-t border-ivory/10 p-4 md:p-5">
              <span className={cn("inline-block rounded-full border px-3 py-1 text-sm font-semibold sm:hidden", STATUS_STYLE[item.status])}>{item.status_label}</span>
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

function ProfileCard({ user }: { user: SessionUser }) {
  const [editing, setEditing] = useState(false);
  const name = [user.first_name, user.last_name].join(" ").trim() || user.full_name;
  const tg = user.telegram;

  return (
    <div className="glass relative overflow-hidden rounded-[2rem] p-6 md:p-8">
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--color-turq)_22%,transparent),transparent_70%)]" />
      <div className="relative flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-turq to-lapis font-display text-2xl font-bold text-white">
          {name.slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0">
          <span className="block font-display text-2xl font-semibold leading-tight [overflow-wrap:anywhere]">{name}</span>
          {tg?.username && <span className="block truncate text-base text-ivory/70">@{tg.username}</span>}
        </span>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label="Ma’lumotlarni tahrirlash"
            className="ml-auto grid size-11 shrink-0 place-items-center rounded-full border border-ivory/15 hover:border-turq hover:text-turq"
          >
            <Pencil className="size-4" />
          </button>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {editing ? (
          <ProfileForm key="form" user={user} onDone={() => setEditing(false)} />
        ) : (
          <motion.dl key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative mt-6 space-y-4 text-base">
            {tg?.phone && (
              <Row icon={Phone} label="Telefon">
                {tg.phone}
                <span className="ml-2 inline-flex items-center gap-1 text-sm text-turq">
                  <BadgeCheck className="size-4" /> tasdiqlangan
                </span>
              </Row>
            )}
            <Row icon={Mail} label="Email">
              {user.email || <span className="text-ivory/50">kiritilmagan</span>}
            </Row>
            {tg && (
              <>
                <Row icon={Building2} label="Kompaniya">
                  {tg.company || <span className="text-ivory/50">kiritilmagan</span>}
                </Row>
                <Row icon={Briefcase} label="Lavozim">
                  {tg.position || <span className="text-ivory/50">kiritilmagan</span>}
                </Row>
              </>
            )}
          </motion.dl>
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ icon: Icon, label, children }: { icon: typeof Phone; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-1 size-5 shrink-0 text-turq" />
      <div className="min-w-0">
        <dt className="text-sm text-ivory/60">{label}</dt>
        <dd className="break-words font-semibold">{children}</dd>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-ivory/20 bg-ink-2 px-4 py-3 text-base text-ivory outline-none transition-colors placeholder:text-ivory/40 focus:border-turq";

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
    <motion.form key="form" onSubmit={submit} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="relative mt-6 space-y-4">
      {fields.map((f) => {
        const err = fieldError(error, f.name);
        return (
          <label key={f.name} className="block">
            <span className="mb-1.5 block text-sm font-semibold">
              {f.label}
              {f.required && <span className="text-ember"> *</span>}
            </span>
            <input name={f.name} type={f.type ?? "text"} defaultValue={f.value} required={f.required} maxLength={255} className={cn(inputCls, err && "border-ember")} />
            {err && <span className="mt-1 block text-sm font-semibold text-ember">{err}</span>}
          </label>
        );
      })}
      {error instanceof ApiError && !fields.some((f) => fieldError(error, f.name)) && (
        <p className="text-sm font-semibold text-ember" role="alert">
          {error.message}
        </p>
      )}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={busy} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-ivory font-semibold text-ink disabled:opacity-70">
          {busy && <Loader2 className="size-4 animate-spin" />} Saqlash
        </button>
        <button type="button" onClick={onDone} aria-label="Bekor qilish" className="grid size-12 place-items-center rounded-xl border border-ivory/15">
          <X className="size-5" />
        </button>
      </div>
    </motion.form>
  );
}
