"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bot,
  Gauge,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  UserCog,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { StarMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiFetch } from "@/lib/api/client";
import { RESOURCES } from "@/lib/admin/resources";
import { fetchMe, resetMe, type SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";
import { AdminContext } from "./admin-context";

type Item = { href: string; label: string; icon: LucideIcon; badge?: number; exact?: boolean };

const GROUP_TITLES = { content: "Kontent", council: "Kengash", structure: "Tuzilma" } as const;
const ease = [0.16, 1, 0.3, 1] as const;

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [inboxNew, setInboxNew] = useState(0);
  const [drawer, setDrawer] = useState(false);

  useEffect(() => {
    fetchMe(true).then((me) => {
      // a signed-in site visitor (Telegram) is not staff — they still need the admin login
      if (!me.authenticated || !me.user || !me.user.is_staff) router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      else setUser(me.user);
    });
    // only on mount: pathname changes inside the panel don't need a re-check
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const refreshCounts = useCallback(() => {
    apiFetch<{ inbox: { groups: { new: number }[] } | null }>("dashboard")
      .then((d) => setInboxNew(d.inbox?.groups.reduce((s, g) => s + g.new, 0) ?? 0))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.is_superuser) refreshCounts();
  }, [user, refreshCounts]);

  const logout = async () => {
    try {
      await apiFetch("auth/logout", { method: "POST" });
    } catch {}
    resetMe();
    toast.success("Tizimdan chiqdingiz");
    router.replace("/admin/login");
  };

  if (!user) {
    return (
      <div className="grid min-h-svh place-items-center bg-ink">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2.4, repeat: Infinity, ease: "linear" }}>
          <StarMark className="size-14" />
        </motion.div>
      </div>
    );
  }

  const groups: { title: string; items: Item[] }[] = [
    { title: "", items: [{ href: "/admin", label: "Bosh panel", icon: LayoutDashboard, exact: true }] },
    ...(Object.keys(GROUP_TITLES) as (keyof typeof GROUP_TITLES)[]).map((g) => ({
      title: GROUP_TITLES[g],
      items: RESOURCES.filter((r) => r.group === g).map((r) => ({ href: `/admin/${r.key}`, label: r.title, icon: r.icon })),
    })),
  ];
  if (user.is_superuser) {
    groups.push({
      title: "Administrator",
      items: [
        { href: "/admin/inbox", label: "Kelgan murojaatlar", icon: Inbox, badge: inboxNew },
        { href: "/admin/users", label: "Foydalanuvchilar", icon: Users },
        { href: "/admin/bot", label: "Telegram bot", icon: Bot },
        { href: "/admin/vitals", label: "Sayt tezligi", icon: Gauge },
        { href: "/admin/settings", label: "Sayt sozlamalari", icon: Settings },
      ],
    });
  }

  const nav = (
    <nav className="flex flex-col gap-6">
      {groups.map((g) => (
        <div key={g.title || "main"}>
          {g.title && <p className="mb-2 px-3 font-mono text-[11px] uppercase tracking-[0.2em] text-mist">{g.title}</p>}
          <ul className="space-y-1">
            {g.items.map(({ href, label, icon: Icon, badge, exact }) => {
              const active = exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setDrawer(false)}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition-colors",
                      active ? "text-ink" : "text-ivory/80 hover:bg-ivory/[0.06] hover:text-ivory",
                    )}
                  >
                    {active && (
                      <motion.span layoutId="admin-nav" className="absolute inset-0 rounded-xl bg-ivory" transition={{ type: "spring", stiffness: 420, damping: 34 }} />
                    )}
                    <Icon className="relative size-5 shrink-0" />
                    <span className="relative flex-1">{label}</span>
                    {!!badge && <span className="relative rounded-full bg-ember px-2 py-0.5 text-xs font-bold text-white">{badge}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );

  const sidebarFooter = (
    <div className="space-y-2 border-t border-ivory/10 pt-4">
      <Link href="/admin/profile" onClick={() => setDrawer(false)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-ivory/[0.06]">
        <span className="grid size-10 place-items-center rounded-full bg-gradient-to-br from-turq to-lapis font-bold text-white">
          {(user.full_name || user.username).slice(0, 1).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold">{user.full_name || user.username}</span>
          <span className="block text-xs text-ivory/60">{user.is_superuser ? "Administrator" : "Muharrir"}</span>
        </span>
        <UserCog className="size-4 text-ivory/50" />
      </Link>
      <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold text-ember hover:bg-ember/10">
        <LogOut className="size-5" /> Chiqish
      </button>
    </div>
  );

  return (
    <AdminContext.Provider value={{ user, refreshCounts }}>
      <div className="min-h-svh bg-ink-3/40 lg:grid lg:grid-cols-[290px_1fr]">
        <aside className="sticky top-0 hidden h-svh flex-col gap-6 overflow-y-auto border-r border-ivory/10 bg-ink-2 p-5 lg:flex">
          <Link href="/admin" className="flex items-center gap-3 px-2">
            <StarMark className="spin-slow size-9" />
            <span>
              <span className="block font-display text-sm font-bold tracking-[0.14em]">YANGI SAMARQAND</span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Boshqaruv paneli</span>
            </span>
          </Link>
          <div className="flex-1">{nav}</div>
          {sidebarFooter}
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-ivory/10 bg-ink/80 px-4 py-3 backdrop-blur-xl md:px-8">
            <button type="button" onClick={() => setDrawer(true)} className="grid size-11 place-items-center rounded-xl border border-ivory/15 lg:hidden" aria-label="Menyu">
              <Menu className="size-5" />
            </button>
            <p className="hidden font-mono text-[12px] uppercase tracking-[0.2em] text-mist md:block">Boshqaruv paneli</p>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a href="/" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full border border-ivory/15 px-4 text-sm font-semibold hover:border-turq hover:text-turq">
                <ExternalLink className="size-4" /> <span className="hidden sm:inline">Saytni ochish</span>
              </a>
            </div>
          </header>
          <main className="px-4 py-6 md:px-8 md:py-10">{children}</main>
        </div>

        <AnimatePresence>
          {drawer && (
            <motion.div className="fixed inset-0 z-50 lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="absolute inset-0 bg-black/50" onClick={() => setDrawer(false)} />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ duration: 0.5, ease }}
                className="absolute inset-y-0 left-0 flex w-[300px] flex-col gap-6 overflow-y-auto bg-ink-2 p-5"
              >
                <div className="flex items-center justify-between">
                  <StarMark className="size-9" />
                  <button type="button" onClick={() => setDrawer(false)} className="grid size-10 place-items-center rounded-xl border border-ivory/15" aria-label="Yopish">
                    <X className="size-5" />
                  </button>
                </div>
                <div className="flex-1">{nav}</div>
                {sidebarFooter}
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminContext.Provider>
  );
}
