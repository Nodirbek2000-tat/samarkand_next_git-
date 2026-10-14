"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowUpRight, Bot, CalendarPlus, Camera, FilePlus2, FolderPlus, Inbox, LayoutDashboard, Send } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { RESOURCES } from "@/lib/admin/resources";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAdmin } from "./admin-context";
import { Badge, Card, PageHeader } from "./ui";

type Dash = {
  content: { key: string; label: string; href: string; total: number; published: number }[];
  people: { key: string; label: string; href: string; total: number }[];
  inbox: { groups: { key: string; label: string; total: number; new: number }[]; daily: { date: string; count: number }[] } | null;
  recent: { kind: string; title: string; href: string; updated_at: string; is_published: boolean }[];
  site_users?: { total: number; week: number };
  bot?: { username: string; online: boolean; last_seen: string | null; pending: number; failed: number };
};

const ICONS = Object.fromEntries(RESOURCES.map((r) => [`/admin/${r.key}`, r.icon]));
const ease = [0.16, 1, 0.3, 1] as const;

const QUICK = [
  { href: "/admin/news/new", label: "Yangilik yozish", icon: FilePlus2 },
  { href: "/admin/announcements/new", label: "Tadbir e’lon qilish", icon: CalendarPlus },
  { href: "/admin/galleries/new", label: "Fotohisobot yuklash", icon: Camera },
  { href: "/admin/projects/new", label: "Loyiha qo‘shish", icon: FolderPlus },
];

function greeting() {
  const h = (new Date().getUTCHours() + 5) % 24;
  return h < 11 ? "Xayrli tong" : h < 17 ? "Xayrli kun" : "Xayrli kech";
}

/** Single-series bar chart: daily public-form submissions, last 30 days. */
function DailyBars({ data }: { data: { date: string; count: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-ivory/65">So‘nggi 30 kun</p>
          <p className="font-display text-4xl font-semibold">{total}</p>
        </div>
        <p className="h-10 text-right text-sm text-ivory/75" aria-live="polite">
          {hover !== null && (
            <>
              <span className="block font-semibold text-ivory">{data[hover].count} ta murojaat</span>
              {formatDate(data[hover].date)}
            </>
          )}
        </p>
      </div>
      <div className="relative h-40" role="img" aria-label={`So‘nggi 30 kunda ${total} ta murojaat`}>
        <div className="absolute inset-x-0 bottom-0 h-px bg-ivory/15" />
        <div className="absolute inset-x-0 top-0 border-t border-dashed border-ivory/10" />
        <div className="relative flex h-full items-end gap-[2px]" onMouseLeave={() => setHover(null)}>
          {data.map((d, i) => (
            <div key={d.date} className="flex h-full flex-1 items-end" onMouseEnter={() => setHover(i)}>
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(d.count ? 6 : 2, (d.count / max) * 100)}%` }}
                transition={{ duration: 0.9, delay: i * 0.015, ease }}
                className={cn("w-full rounded-t-[4px]", d.count ? "bg-turq" : "bg-ivory/10", hover === i && "brightness-125")}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="mt-2 flex justify-between text-xs text-ivory/55">
        <span>{formatDate(data[0]?.date)}</span>
        <span>eng ko‘p: {max}</span>
        <span>{formatDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

export function Dashboard() {
  const { user } = useAdmin();
  const [data, setData] = useState<Dash | null>(null);

  useEffect(() => {
    apiFetch<Dash>("dashboard").then(setData).catch(() => setData(null));
  }, []);

  return (
    <>
      <PageHeader title={`${greeting()}, ${user.first_name || user.username}!`} subtitle="Saytning umumiy holati bir qarashda" icon={LayoutDashboard} />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {QUICK.map(({ href, label, icon: Icon }, i) => (
          <motion.div key={href} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease }}>
            <Link href={href} className="group flex items-center gap-4 rounded-2xl bg-gradient-to-br from-turq/15 to-lapis/10 p-5 transition-transform duration-500 hover:-translate-y-1">
              <span className="grid size-12 place-items-center rounded-xl bg-turq text-ink">
                <Icon className="size-6" />
              </span>
              <span className="flex-1 text-base font-semibold">{label}</span>
              <ArrowUpRight className="size-5 text-ivory/50 transition-transform group-hover:rotate-45 group-hover:text-turq" />
            </Link>
          </motion.div>
        ))}
      </div>

      {!data ? (
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-[1.4rem] bg-ivory/[0.05]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.content.map((c, i) => {
                const Icon = ICONS[c.href] ?? LayoutDashboard;
                return (
                  <motion.div key={c.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.04, duration: 0.6, ease }}>
                    <Link href={c.href} className="group block rounded-[1.4rem] border border-ivory/10 bg-ink-2 p-5 transition-colors hover:border-turq/50">
                      <div className="flex items-center justify-between">
                        <Icon className="size-6 text-turq" />
                        <ArrowUpRight className="size-4 text-ivory/40 transition-transform group-hover:rotate-45" />
                      </div>
                      <p className="mt-5 font-display text-4xl font-semibold">{c.total}</p>
                      <p className="mt-1 text-[15px] font-semibold">{c.label}</p>
                      <p className="text-sm text-ivory/60">{c.published} tasi saytda</p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <Card>
              <h2 className="mb-4 font-display text-xl font-semibold">So‘nggi o‘zgarishlar</h2>
              {data.recent.length === 0 ? (
                <p className="text-ivory/60">Hozircha o‘zgarishlar yo‘q.</p>
              ) : (
                <ul className="divide-y divide-ivory/10">
                  {data.recent.map((r) => (
                    <li key={r.href}>
                      <Link href={r.href} className="flex items-center gap-4 py-3 hover:text-turq">
                        <Badge>{r.kind}</Badge>
                        <span className="min-w-0 flex-1 truncate font-semibold">{r.title}</span>
                        {!r.is_published && <Badge tone="muted">Qoralama</Badge>}
                        <span className="hidden shrink-0 text-sm text-ivory/55 sm:block">{formatDateTime(r.updated_at)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <div className="space-y-6">
            {data.inbox && (
              <Card>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
                    <Inbox className="size-5 text-turq" /> Murojaatlar
                  </h2>
                  <Link href="/admin/inbox" className="text-sm font-semibold text-turq">
                    Barchasi →
                  </Link>
                </div>
                <ul className="mb-6 space-y-2">
                  {data.inbox.groups.map((g) => (
                    <li key={g.key}>
                      <Link href={`/admin/inbox?tab=${g.key}`} className="flex items-center justify-between rounded-xl bg-ink px-4 py-3 hover:bg-ivory/[0.05]">
                        <span className="font-semibold">{g.label}</span>
                        <span className="flex items-center gap-2">
                          {g.new > 0 && <Badge tone="ember">{g.new} yangi</Badge>}
                          <span className="text-sm text-ivory/60">{g.total}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <DailyBars data={data.inbox.daily} />
              </Card>
            )}
            {data.site_users && (
              <Link href="/admin/users?role=user" className="group block">
                <Card className="flex items-center gap-4 transition-colors group-hover:border-turq/50">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-[#229ED9]/15 text-[#229ED9]">
                    <Send className="size-6" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">Telegram orqali ro‘yxatdan o‘tganlar</span>
                    <span className="block text-sm text-ivory/60">Shu hafta: +{data.site_users.week}</span>
                  </span>
                  <span className="font-display text-3xl font-semibold text-turq">{data.site_users.total}</span>
                </Card>
              </Link>
            )}
            {data.bot && <BotStatus bot={data.bot} />}
            <Card>
              <h2 className="mb-4 font-display text-xl font-semibold">Kengash</h2>
              <ul className="space-y-2">
                {data.people.map((p) => (
                  <li key={p.key}>
                    <Link href={p.href} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-ivory/[0.05]">
                      <span className="font-semibold">{p.label}</span>
                      <span className="font-display text-2xl font-semibold text-turq">{p.total}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </>
  );
}

/** The Telegram bot is a separate process (samarkand_bot); it polls the outbox every few seconds, which doubles as a heartbeat. */
function BotStatus({ bot }: { bot: NonNullable<Dash["bot"]> }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Bot className="size-5 text-[#229ED9]" /> Telegram bot
        </h2>
        <span
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-semibold",
            bot.online ? "bg-turq/15 text-turq" : "bg-ember/10 text-ember",
          )}
        >
          <span className={cn("size-2 rounded-full", bot.online ? "animate-pulse bg-turq" : "bg-ember")} />
          {bot.online ? "Ishlayapti" : "To‘xtagan"}
        </span>
      </div>
      <p className="mt-3 text-[15px] text-ivory/75">
        {bot.username ? (
          <a href={`https://t.me/${bot.username}`} target="_blank" rel="noreferrer" className="font-semibold text-turq hover:underline">
            @{bot.username}
          </a>
        ) : (
          "Bot hali ulanmagan"
        )}
        {bot.last_seen && <> · oxirgi aloqa {formatDateTime(bot.last_seen)}</>}
      </p>
      {!bot.online && (
        <p className="mt-2 text-sm text-ivory/60">Kirish kodlari va javoblar yetib bormaydi. Serverda botni ishga tushiring: samarkand_bot → python app.py</p>
      )}
      {(bot.pending > 0 || bot.failed > 0) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {bot.pending > 0 && <Badge tone="gold">Navbatda: {bot.pending}</Badge>}
          {bot.failed > 0 && <Badge tone="ember">Yetkazilmagan (7 kun): {bot.failed}</Badge>}
        </div>
      )}
    </Card>
  );
}
