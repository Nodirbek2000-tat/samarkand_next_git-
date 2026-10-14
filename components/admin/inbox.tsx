"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Building2, Inbox as InboxIcon, Mail, MessageSquareReply, Phone, Save, Send, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAdmin } from "./admin-context";
import { Badge, Btn, Card, ConfirmDialog, Empty, inputCls, PageHeader } from "./ui";

type Row = Record<string, string | number | null> & { id: number; status: string; status_label: string; created_at: string };
/** Sender who was signed in through the Telegram bot — replies reach them there. */
type Account = { name: string; phone: string; username: string; reachable: boolean };
const accountOf = (r: Row) => (r as unknown as { account?: Account | null }).account ?? null;

const TABS = [
  { key: "appeals", label: "Murojaatlar", endpoint: "appeals" },
  { key: "cooperation", label: "Hamkorlik takliflari", endpoint: "cooperation-requests" },
  { key: "applications", label: "A’zolik arizalari", endpoint: "member-applications" },
] as const;

const STATUSES = [
  { value: "new", label: "Yangi" },
  { value: "in_progress", label: "Ko‘rib chiqilmoqda" },
  { value: "done", label: "Javob berilgan" },
  { value: "archived", label: "Arxiv" },
];

const TONE: Record<string, "ember" | "gold" | "turq" | "muted"> = { new: "ember", in_progress: "gold", done: "turq", archived: "muted" };

const LABELS: Record<string, string> = {
  kind_label: "Turi",
  full_name: "F.I.Sh.",
  organization: "Tashkilot",
  contact_person: "Aloqa uchun shaxs",
  company: "Kompaniya",
  position: "Lavozim",
  size_label: "Toifa",
  industry: "Faoliyat sohasi",
  phone: "Telefon",
  email: "Email",
  website: "Veb-sayt",
  country: "Davlat",
  subject: "Mavzu",
  message: "Matn",
  proposal: "Taklif",
  handled_by_name: "Mas’ul",
  ip_address: "IP manzil",
};

const title = (r: Row) => String(r.full_name ?? r.organization ?? "—");
const preview = (r: Row) => String(r.subject || r.message || r.proposal || r.company || "").slice(0, 90);

export function InboxPage() {
  const { user, refreshCounts } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = TABS.find((t) => t.key === params.get("tab")) ?? TABS[0];
  const [status, setStatus] = useState("new");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [selected, setSelected] = useState<Row | null>(null);
  const [note, setNote] = useState("");
  const [reply, setReply] = useState("");
  const [nextStatus, setNextStatus] = useState("new");
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page_size: "100" });
    if (status) qs.set("status", status);
    apiFetch<{ results: Row[] }>(`${tab.endpoint}?${qs}`)
      .then((d) => setRows(d.results))
      .catch(() => setRows([]));
  }, [tab.endpoint, status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reset while the new tab loads
    setRows(null);
    setSelected(null);
    load();
  }, [load]);

  const open = async (row: Row) => {
    setSelected(row);
    setNote(String(row.admin_note ?? ""));
    setReply(String(row.reply ?? ""));
    setNextStatus(row.status === "new" ? "in_progress" : row.status);
    if (row.status === "new") {
      try {
        const updated = await apiFetch<Row>(`${tab.endpoint}/${row.id}`, { method: "PATCH", body: { status: "in_progress" } });
        setSelected(updated);
        setRows((rs) => rs?.map((r) => (r.id === row.id ? updated : r)) ?? null);
        refreshCounts();
      } catch {}
    }
  };

  const save = async () => {
    if (!selected) return;
    setBusy(true);
    const newReply = reply.trim() !== String(selected.reply ?? "").trim() && reply.trim() !== "";
    // writing an answer means the request is answered
    const status = newReply && (nextStatus === "new" || nextStatus === "in_progress") ? "done" : nextStatus;
    try {
      const updated = await apiFetch<Row>(`${tab.endpoint}/${selected.id}`, { method: "PATCH", body: { status, admin_note: note, reply: reply.trim() } });
      setSelected(updated);
      setNextStatus(updated.status);
      setRows((rs) => rs?.map((r) => (r.id === updated.id ? updated : r)) ?? null);
      refreshCounts();
      // null = nothing to notify; true = queued for the bot (it delivers within seconds); false = user blocked the bot
      const queued = (updated as unknown as { telegram_queued?: boolean | null }).telegram_queued;
      if (queued === true) toast.success("Saqlandi — javob bot orqali foydalanuvchiga yuboriladi");
      else if (queued === false) toast.warning("Saqlandi, lekin foydalanuvchi botni bloklagan — javob faqat kabinetda ko‘rinadi");
      else toast.success("Saqlandi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await apiFetch(`${tab.endpoint}/${selected.id}`, { method: "DELETE" });
      setRows((rs) => rs?.filter((r) => r.id !== selected.id) ?? null);
      setSelected(null);
      setConfirm(false);
      refreshCounts();
      toast.success("O‘chirildi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  };

  if (!user.is_superuser) return <Empty title="Bu bo‘lim faqat administratorlar uchun" />;

  return (
    <>
      <PageHeader title="Kelgan murojaatlar" subtitle="Saytdagi formalar orqali yuborilgan barcha xabarlar" icon={InboxIcon} />

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl border border-ivory/10 bg-ink-2 p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => router.replace(`${pathname}?tab=${t.key}`)}
            className={cn("relative rounded-lg px-4 py-2.5 text-[15px] font-semibold", tab.key === t.key ? "text-ink" : "text-ivory/75")}
          >
            {tab.key === t.key && <motion.span layoutId="inbox-tab" className="absolute inset-0 rounded-lg bg-ivory" />}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>
      <div className="mb-6 flex flex-wrap gap-2">
        {[{ value: "", label: "Barchasi" }, ...STATUSES].map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setStatus(s.value)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
              status === s.value ? "border-turq bg-turq/15 text-turq" : "border-ivory/15 text-ivory/75 hover:border-ivory/40",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div>
          {rows === null ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-ivory/[0.05]" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <Empty title="Bu yerda hozircha hech narsa yo‘q" text={status === "new" ? "Barcha yangi murojaatlar ko‘rib chiqilgan 🎉" : undefined} />
          ) : (
            <ul className="space-y-2">
              {rows.map((r) => (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => open(r)}
                    className={cn(
                      "w-full rounded-2xl border p-4 text-left transition-colors",
                      selected?.id === r.id ? "border-turq bg-turq/10" : "border-ivory/10 bg-ink-2 hover:border-ivory/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-base font-semibold">{title(r)}</span>
                        {accountOf(r) && <Send className="size-4 shrink-0 text-[#229ED9]" aria-label="Telegram orqali ro‘yxatdan o‘tgan" />}
                        {r.reply && <MessageSquareReply className="size-4 shrink-0 text-turq" aria-label="Javob berilgan" />}
                      </span>
                      <Badge tone={TONE[r.status]}>{r.status_label}</Badge>
                    </div>
                    <p className="mt-1 truncate text-sm text-ivory/70">{preview(r)}</p>
                    <p className="mt-2 text-xs text-ivory/50">{formatDateTime(r.created_at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AnimatePresence mode="wait">
          {selected ? (
            <motion.div key={selected.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
              <Card className="xl:sticky xl:top-24">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-semibold">{title(selected)}</h2>
                    <p className="mt-1 text-sm text-ivory/60">{formatDateTime(selected.created_at)}</p>
                  </div>
                  <button type="button" onClick={() => setSelected(null)} className="grid size-10 place-items-center rounded-xl hover:bg-ivory/10" aria-label="Yopish">
                    <X className="size-5" />
                  </button>
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {selected.phone && (
                    <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-2 rounded-xl bg-turq/15 px-4 py-2 font-semibold text-turq">
                      <Phone className="size-4" /> {selected.phone}
                    </a>
                  )}
                  {selected.email && (
                    <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-2 rounded-xl bg-turq/15 px-4 py-2 font-semibold text-turq">
                      <Mail className="size-4" /> {selected.email}
                    </a>
                  )}
                  {(selected.organization || selected.company) && tab.key !== "cooperation" && (
                    <span className="inline-flex items-center gap-2 rounded-xl bg-ivory/[0.06] px-4 py-2 font-semibold">
                      <Building2 className="size-4" /> {selected.organization || selected.company}
                    </span>
                  )}
                </div>
                <AccountBox account={accountOf(selected)} />
                <dl className="mt-6 space-y-4">
                  {Object.keys(LABELS)
                    .filter((k) => selected[k] && !["phone", "email", "full_name"].includes(k))
                    .map((k) => (
                      <div key={k}>
                        <dt className="text-sm text-ivory/60">{LABELS[k]}</dt>
                        <dd className={cn("mt-1 whitespace-pre-wrap", ["message", "proposal"].includes(k) ? "rounded-xl bg-ink p-4 text-[16px] leading-relaxed" : "font-semibold")}>
                          {String(selected[k])}
                        </dd>
                      </div>
                    ))}
                </dl>
                <div className="mt-6 space-y-4 border-t border-ivory/10 pt-6">
                  <label className="block">
                    <span className="mb-2 block text-[15px] font-semibold">Holati</span>
                    <select className={inputCls} value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center gap-2 text-[15px] font-semibold">
                      <MessageSquareReply className="size-4 text-turq" /> Foydalanuvchiga javob
                    </span>
                    <textarea
                      className={inputCls}
                      rows={4}
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      maxLength={4000}
                      placeholder="Murojaat egasiga ko‘rinadigan javob matni"
                    />
                    <span className="mt-1.5 block text-sm text-ivory/60">
                      {accountOf(selected)
                        ? accountOf(selected)!.reachable
                          ? "Saqlaganda javob foydalanuvchining kabinetida ko‘rinadi va Telegram’ga yuboriladi. Holat «Javob berilgan» bo‘ladi."
                          : "Foydalanuvchi botni bloklagan — javob faqat kabinetda ko‘rinadi. Telefon orqali ham bog‘laning."
                        : "Yuboruvchi saytga kirmagan — javob hech kimga yuborilmaydi, faqat yozib qo‘yiladi. Telefon yoki email orqali bog‘laning."}
                    </span>
                  </label>
                  <label className="block">
                    <span className="mb-2 block text-[15px] font-semibold">Ichki izoh (faqat adminlar ko‘radi)</span>
                    <textarea className={inputCls} rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Masalan: qo‘ng‘iroq qilindi, 15-oktabrga uchrashuv belgilandi" />
                  </label>
                  <div className="flex justify-between gap-2">
                    <Btn variant="danger" onClick={() => setConfirm(true)}>
                      <Trash2 className="size-4" /> O‘chirish
                    </Btn>
                    <Btn variant="turq" loading={busy} onClick={save}>
                      <Save className="size-4" /> Saqlash
                    </Btn>
                  </div>
                </div>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hidden xl:block">
              <Empty title="Xabarni tanlang" text="Chapdagi ro‘yxatdan xabarni bosing — tafsilotlar shu yerda ochiladi." />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ConfirmDialog open={confirm} title="Xabar o‘chirilsinmi?" busy={busy} onConfirm={remove} onClose={() => setConfirm(false)} />
    </>
  );
}

function AccountBox({ account }: { account: Account | null }) {
  if (!account) return null;
  return (
    <div className="mt-5 flex items-start gap-3 rounded-2xl border border-[#229ED9]/40 bg-[#229ED9]/10 p-4">
      <Send className="mt-0.5 size-5 shrink-0 text-[#229ED9]" />
      <div className="min-w-0 text-sm">
        <p className="flex items-center gap-1.5 font-semibold">
          Ro‘yxatdan o‘tgan foydalanuvchi <BadgeCheck className="size-4 text-turq" />
        </p>
        <p className="mt-1 text-ivory/80">
          {account.name}
          {account.phone && ` · ${account.phone}`}
          {account.username && ` · @${account.username}`}
        </p>
        <p className={cn("mt-1 font-semibold", account.reachable ? "text-turq" : "text-ember")}>
          {account.reachable ? "Telegram orqali xabar yetkaziladi" : "Botni bloklagan — Telegram xabari yetmaydi"}
        </p>
      </div>
    </div>
  );
}
