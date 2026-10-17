"use client";

import { useCallback, useEffect, useState } from "react";
import { Ban, Bot, Megaphone, Radio, Send, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import { ApiError, apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { useAdmin } from "./admin-context";
import { Badge, Btn, Card, ConfirmDialog, Empty, PageHeader, Switch } from "./ui";

type Channel = { id: number; chat_id: number; title: string; username: string; link: string; is_active: boolean };
type Broadcast = {
  id: number;
  kind: "post" | "ad";
  kind_label: string;
  status: "pending" | "sending" | "done" | "cancelled";
  status_label: string;
  title: string;
  url: string;
  total: number;
  sent: number;
  failed: number;
  created_at: string;
  finished_at: string | null;
};
type BotAdmin = {
  bot: { username: string; online: boolean; last_seen: string | null; autopost: boolean; autopost_since: string | null };
  stats: {
    subscribers: { total: number; active: number; blocked: number; today: number; week: number };
    site: { users: number; registered: number; staff: number };
    channels: number;
    queue: number;
  };
  channels: Channel[];
  broadcasts: Broadcast[];
};

const STATUS_TONE = { pending: "gold", sending: "turq", done: "default", cancelled: "muted" } as const;
const fmt = (v: number) => v.toLocaleString("ru-RU").replace(/ /g, " ");
const when = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString("uz-UZ", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

export function BotPage() {
  const { user } = useAdmin();
  const [data, setData] = useState<BotAdmin | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "channel" | "cancel"; id: number; title: string } | null>(null);

  const load = useCallback(() => apiFetch<BotAdmin>("admin/bot").then(setData).catch(() => {}), []);
  useEffect(() => {
    load();
  }, [load]);

  // a broadcast is running: keep the numbers live
  const running = !!data?.broadcasts.some((b) => b.status === "pending" || b.status === "sending");
  useEffect(() => {
    const t = window.setInterval(load, running ? 3000 : 20000);
    return () => window.clearInterval(t);
  }, [running, load]);

  const act = async (path: string, init: Parameters<typeof apiFetch>[1], ok?: string) => {
    setBusy(true);
    try {
      setData(await apiFetch<BotAdmin>(path, init));
      if (ok) toast.success(ok);
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Saqlab bo‘lmadi");
    } finally {
      setBusy(false);
      setConfirm(null);
    }
  };

  if (!user.is_superuser) return <Empty title="Bu bo‘lim faqat administratorlar uchun" />;
  if (!data) return <div className="h-96 animate-pulse rounded-[1.4rem] bg-ivory/[0.05]" />;

  const { bot, stats } = data;
  const tiles = [
    { label: "Bot obunachilari", value: stats.subscribers.total, hint: `bugun +${fmt(stats.subscribers.today)} · 7 kunda +${fmt(stats.subscribers.week)}`, icon: Users },
    { label: "Faol obunachilar", value: stats.subscribers.active, hint: "xabarlar shularga boradi", icon: Radio },
    { label: "Botni bloklagan", value: stats.subscribers.blocked, hint: "ularga yuborilmaydi", icon: Ban },
    { label: "Sayt foydalanuvchilari", value: stats.site.users, hint: `${fmt(stats.site.staff)} nafari xodim`, icon: UserPlus },
    { label: "Bot orqali ro‘yxatdan o‘tgan", value: stats.site.registered, hint: "telefon raqami tasdiqlangan", icon: Send },
    { label: "Majburiy kanallar", value: stats.channels, hint: "obunasiz botdan foydalanib bo‘lmaydi", icon: Megaphone },
  ];

  return (
    <>
      <PageHeader
        title="Telegram bot"
        icon={Bot}
        subtitle={bot.username ? `@${bot.username} · ${bot.online ? "onlayn" : "oflayn"}` : "Bot hali ulanmagan — samarkand_bot ni ishga tushiring"}
        actions={<Badge tone={bot.online ? "turq" : "ember"}>{bot.online ? "● Ishlayapti" : "● Javob bermayapti"}</Badge>}
      />

      <Card className="mb-6 flex flex-col justify-between gap-5 md:flex-row md:items-center">
        <div className="max-w-2xl">
          <p className="font-display text-xl font-semibold">Saytdagi yangiliklarni botga yuborish</p>
          <p className="mt-2 text-[15px] leading-relaxed text-ivory/75">
            Yangilik, e’lon, loyiha va startap, film, fotohisobot yoki forum e’lon qilinishi bilan bot uni barcha obunachilarga
            rasmi, qisqa matni va <b>«Davomini o‘qish»</b> tugmasi bilan yuboradi. Odamlar (a’zolar, rahbariyat) yuborilmaydi; har
            bir material faqat bir marta boradi.
          </p>
          {bot.autopost && bot.autopost_since && (
            <p className="mt-2 text-sm text-turq">Yoqilgan: {when(bot.autopost_since)} dan keyin e’lon qilinganlar yuboriladi.</p>
          )}
        </div>
        <Switch
          id="autopost"
          checked={bot.autopost}
          label={bot.autopost ? "Yoqilgan" : "O‘chirilgan"}
          onChange={(v) => act("admin/bot", { method: "PATCH", body: { autopost: v } }, v ? "Avtomatik yuborish yoqildi" : "Avtomatik yuborish o‘chirildi")}
        />
      </Card>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label} className="flex items-start gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-turq/15 text-turq">
              <Icon className="size-6" />
            </span>
            <div>
              <p className="font-display text-3xl font-semibold tracking-tight">{fmt(value)}</p>
              <p className="mt-1 text-[15px] font-semibold">{label}</p>
              <p className="text-sm text-ivory/60">{hint}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="min-w-0 xl:col-span-2">
          <p className="font-display text-xl font-semibold">Majburiy kanallar</p>
          <p className="mt-1 text-sm text-ivory/65">
            Yangi kanal bot orqali qo‘shiladi: botda <code className="text-turq">/admin</code> → «Majburiy kanallar» → «Kanal qo‘shish». Bot
            o‘sha kanalda admin bo‘lishi shart.
          </p>
          <ul className="mt-5 space-y-2">
            {data.channels.length === 0 && <li className="rounded-xl border border-dashed border-ivory/15 p-4 text-ivory/60">Kanal qo‘shilmagan</li>}
            {data.channels.map((c) => (
              <li key={c.id} className="flex items-center gap-3 rounded-xl border border-ivory/10 p-3">
                <div className="min-w-0 flex-1">
                  {c.link ? (
                    <a href={c.link} target="_blank" rel="noreferrer" className="block truncate font-semibold hover:text-turq">
                      {c.title || c.username || c.chat_id}
                    </a>
                  ) : (
                    <span className="block truncate font-semibold">{c.title || c.chat_id}</span>
                  )}
                  {c.username && <span className="text-sm text-ivory/60">@{c.username}</span>}
                </div>
                <Switch
                  id={`ch-${c.id}`}
                  checked={c.is_active}
                  onChange={(v) => act(`admin/bot/channels/${c.id}`, { method: "PATCH", body: { is_active: v } })}
                />
                <button
                  type="button"
                  aria-label="Kanalni o‘chirish"
                  onClick={() => setConfirm({ kind: "channel", id: c.id, title: c.title || c.username })}
                  className="grid size-10 place-items-center rounded-xl text-ivory/60 transition-colors hover:bg-ember/15 hover:text-ember"
                >
                  <Trash2 className="size-5" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card className="min-w-0 xl:col-span-3">
          <p className="font-display text-xl font-semibold">Yuborishlar tarixi</p>
          <p className="mt-1 text-sm text-ivory/65">
            Reklama botda <code className="text-turq">/admin</code> → «Reklama yuborish» orqali jo‘natiladi. Bu yerda — holati va natijasi.
          </p>
          {data.broadcasts.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-ivory/15 p-4 text-ivory/60">Hali hech narsa yuborilmagan</p>
          ) : (
            <ul className="mt-5 divide-y divide-ivory/10">
              {data.broadcasts.map((b) => {
                const pct = b.total ? Math.min(100, Math.round(((b.sent + b.failed) / b.total) * 100)) : b.status === "done" ? 100 : 0;
                const active = b.status === "pending" || b.status === "sending";
                return (
                  <li key={b.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={b.kind === "ad" ? "gold" : "default"}>{b.kind_label}</Badge>
                        <Badge tone={STATUS_TONE[b.status]}>{b.status_label}</Badge>
                        <span className="text-sm text-ivory/55">{when(b.created_at)}</span>
                      </div>
                      <p className="mt-2 truncate font-semibold">
                        {b.url ? (
                          <a href={b.url} target="_blank" rel="noreferrer" className="hover:text-turq">
                            {b.title || "Reklama"}
                          </a>
                        ) : (
                          b.title || "Reklama"
                        )}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <div className="h-1.5 min-w-32 flex-1 overflow-hidden rounded-full bg-ivory/10">
                          <div className={cn("h-full rounded-full", active ? "bg-turq" : "bg-ivory/40")} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-sm tabular-nums text-ivory/70">
                          {fmt(b.sent)}/{fmt(b.total)}
                          {b.failed > 0 && <span className="text-ember"> · {fmt(b.failed)} yetkazilmadi</span>}
                        </span>
                      </div>
                    </div>
                    {active && (
                      <Btn variant="danger" className="h-9 px-4 text-sm" onClick={() => setConfirm({ kind: "cancel", id: b.id, title: b.title || "Reklama" })}>
                        To‘xtatish
                      </Btn>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={!!confirm}
        busy={busy}
        title={confirm?.kind === "cancel" ? "Yuborishni to‘xtatasizmi?" : "Kanalni o‘chirasizmi?"}
        text={
          confirm?.kind === "cancel"
            ? `«${confirm.title}» qolgan obunachilarga yuborilmaydi.`
            : `«${confirm?.title}» majburiy kanallar ro‘yxatidan olib tashlanadi.`
        }
        confirmLabel={confirm?.kind === "cancel" ? "To‘xtatish" : "O‘chirish"}
        onClose={() => setConfirm(null)}
        onConfirm={() =>
          confirm &&
          (confirm.kind === "cancel"
            ? act(`admin/bot/broadcasts/${confirm.id}/cancel`, { method: "POST" }, "Yuborish to‘xtatildi")
            : act(`admin/bot/channels/${confirm.id}`, { method: "DELETE" }, "Kanal olib tashlandi"))
        }
      />
    </>
  );
}
