"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, Inbox, Plus, Settings, Users } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import type { SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

type Stats = {
  content: { key: string; label: string; href: string; total: number; published: number }[];
  inbox: { groups: { key: string; label: string; total: number; new: number }[] } | null;
  site_users?: { total: number; week: number };
  bot?: { online: boolean; username: string };
};

/**
 * Gear in the public header for staff: a minimal stats sheet and the way into the admin panel.
 * Stats load on first open only, so visitors and the first paint pay nothing for it.
 */
export function AdminQuick({ user, className }: { user: SessionUser; className?: string }) {
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    apiFetch<Stats>("dashboard").then(setStats).catch(() => {});
    const close = (e: PointerEvent) => !root.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  const newInbox = stats?.inbox?.groups.reduce((s, g) => s + g.new, 0) ?? 0;

  return (
    <div ref={root} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Boshqaruv paneli"
        title="Boshqaruv paneli"
        className={cn(
          "grid size-10 place-items-center rounded-full border transition-colors",
          open ? "border-turq bg-turq text-ink" : "border-ivory/15 text-ivory hover:border-turq hover:text-turq",
        )}
      >
        <Settings className={cn("size-[18px] transition-transform duration-500", open && "rotate-90")} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="panel absolute right-0 top-[calc(100%+12px)] z-50 w-[min(92vw,360px)] origin-top-right rounded-2xl p-4 text-ivory"
          >
            <div className="flex items-center justify-between px-1">
              <div>
                <p className="text-[15px] font-semibold">{user.full_name || user.username}</p>
                <p className="text-xs text-ivory/60">{user.is_superuser ? "Administrator" : "Muharrir"}</p>
              </div>
              {stats?.bot && (
                <span className={cn("flex items-center gap-1.5 text-xs font-semibold", stats.bot.online ? "text-turq" : "text-ember")}>
                  <span className={cn("size-1.5 rounded-full", stats.bot.online ? "bg-turq" : "bg-ember")} />
                  Bot {stats.bot.online ? "ishlayapti" : "to‘xtagan"}
                </span>
              )}
            </div>

            <div className="mt-3 grid grid-cols-3 gap-1.5">
              {(stats?.content ?? Array.from({ length: 6 }, () => null)).slice(0, 6).map((c, i) =>
                c ? (
                  <Link
                    key={c.key}
                    href={c.href}
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-ivory/[0.04] px-2.5 py-2 transition-colors hover:bg-turq/10"
                  >
                    <span className="block font-display text-lg font-semibold leading-tight">{c.total}</span>
                    <span className="block truncate text-[11px] text-ivory/60">{c.label}</span>
                  </Link>
                ) : (
                  <span key={i} className="h-[52px] animate-pulse rounded-xl bg-ivory/[0.05]" />
                ),
              )}
            </div>

            {(stats?.inbox || stats?.site_users) && (
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {stats.inbox && (
                  <Link href="/admin/inbox" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl bg-ivory/[0.04] px-3 py-2 hover:bg-turq/10">
                    <Inbox className="size-4 text-turq" />
                    <span className="text-sm">
                      <b className={cn(newInbox > 0 && "text-ember")}>{newInbox}</b> yangi murojaat
                    </span>
                  </Link>
                )}
                {stats.site_users && (
                  <Link href="/admin/users?role=user" onClick={() => setOpen(false)} className="flex items-center gap-2.5 rounded-xl bg-ivory/[0.04] px-3 py-2 hover:bg-turq/10">
                    <Users className="size-4 text-turq" />
                    <span className="text-sm">
                      <b>{stats.site_users.total}</b> foydalanuvchi
                    </span>
                  </Link>
                )}
              </div>
            )}

            <div className="mt-3 flex gap-2">
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-ivory text-sm font-semibold text-ink"
              >
                Admin panel <ArrowUpRight className="size-4" />
              </Link>
              <Link
                href="/admin/news/new"
                onClick={() => setOpen(false)}
                title="Yangilik qo‘shish"
                aria-label="Yangilik qo‘shish"
                className="grid size-10 place-items-center rounded-xl border border-ivory/15 hover:border-turq hover:text-turq"
              >
                <Plus className="size-4" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
