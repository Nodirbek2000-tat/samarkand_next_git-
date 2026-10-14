"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Ban, Briefcase, KeyRound, MessageSquare, Phone, Plus, Search, Send, UserPlus, Users, X } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api/client";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAdmin } from "./admin-context";
import { Badge, Btn, Card, Empty, inputCls, PageHeader, Switch } from "./ui";

type Role = "user" | "editor" | "admin";
type U = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  role: Role;
  role_label: string;
  is_active: boolean;
  has_password: boolean;
  telegram: { phone: string; username: string; company: string; position: string; bot_blocked: boolean; registered_at: string } | null;
  submissions: number;
  last_login: string | null;
  date_joined: string;
};

const ROLES: { value: Role; label: string; hint: string }[] = [
  { value: "user", label: "Foydalanuvchi", hint: "faqat shaxsiy kabinet" },
  { value: "editor", label: "Muharrir", hint: "kontentni boshqaradi" },
  { value: "admin", label: "Administrator", hint: "hamma narsa" },
];
const TABS = [
  { key: "", label: "Hammasi", count: "all" },
  { key: "admin", label: "Administratorlar", count: "admin" },
  { key: "editor", label: "Muharrirlar", count: "editor" },
  { key: "user", label: "Sayt foydalanuvchilari", count: "user" },
] as const;
const TONE: Record<Role, "gold" | "turq" | "muted"> = { admin: "gold", editor: "turq", user: "muted" };

export function UsersPage() {
  const { user } = useAdmin();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const tab = TABS.find((t) => t.key === params.get("role")) ?? TABS[0];
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<U[] | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [creating, setCreating] = useState(false);
  const [resetFor, setResetFor] = useState<U | null>(null);

  const load = useCallback(() => {
    const qs = new URLSearchParams({ page_size: "200" });
    if (tab.key) qs.set("role", tab.key);
    if (query.trim()) qs.set("search", query.trim());
    apiFetch<{ results: U[] }>(`admin/users?${qs}`)
      .then((d) => setUsers(d.results))
      .catch(() => setUsers([]));
    apiFetch<Record<string, number>>("admin/users/counts").then(setCounts).catch(() => {});
  }, [tab.key, query]);

  useEffect(() => {
    const t = window.setTimeout(load, 200); // debounce typing in the search box
    return () => window.clearTimeout(t);
  }, [load]);

  const patch = async (u: U, body: Partial<Pick<U, "role" | "is_active">>, done: string) => {
    try {
      const updated = await apiFetch<U>(`admin/users/${u.id}`, { method: "PATCH", body });
      setUsers((list) => list?.map((x) => (x.id === u.id ? updated : x)) ?? null);
      apiFetch<Record<string, number>>("admin/users/counts").then(setCounts).catch(() => {});
      toast.success(done);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  if (!user.is_superuser) return <Empty title="Bu bo‘lim faqat administratorlar uchun" />;

  return (
    <>
      <PageHeader
        title="Foydalanuvchilar"
        subtitle="Hamma hisoblar bir joyda: rol bering yoki oling, bloklang. Telegram orqali kirganlar admin bo‘lsa ham bot kodi bilan kiradi."
        icon={Users}
        actions={
          <Btn variant="turq" onClick={() => setCreating(true)}>
            <UserPlus className="size-5" /> Xodim qo‘shish
          </Btn>
        }
      />

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-1 rounded-xl border border-ivory/10 bg-ink-2 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => router.replace(t.key ? `${pathname}?role=${t.key}` : pathname)}
              className={cn("relative rounded-lg px-3.5 py-2 text-[14px] font-semibold", tab.key === t.key ? "text-ink" : "text-ivory/75")}
            >
              {tab.key === t.key && <motion.span layoutId="users-tab" className="absolute inset-0 rounded-lg bg-ivory" />}
              <span className="relative">
                {t.label} {counts[t.count] !== undefined && <span className="opacity-60">{counts[t.count]}</span>}
              </span>
            </button>
          ))}
        </div>
        <label className="relative block w-full lg:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-ivory/50" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Ism, telefon, login…" className={cn(inputCls, "pl-11")} aria-label="Qidirish" />
        </label>
      </div>

      {users === null ? (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-52 animate-pulse rounded-[1.4rem] bg-ivory/[0.05]" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <Empty title={query ? "Hech kim topilmadi" : "Bu yerda hozircha hech kim yo‘q"} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {users.map((u) => {
            const me = u.id === user.id;
            return (
              <Card key={u.id} className={cn("flex flex-col gap-4 !p-5", !u.is_active && "opacity-60")}>
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-full text-lg font-bold text-white",
                      u.telegram ? "bg-gradient-to-br from-[#229ED9] to-lapis" : "bg-gradient-to-br from-turq to-lapis",
                    )}
                  >
                    {u.full_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold">{u.full_name}</p>
                    <p className="truncate text-sm text-ivory/60">
                      {u.telegram ? (u.telegram.username ? `@${u.telegram.username}` : "Telegram") : `@${u.username}`}
                    </p>
                  </div>
                  <Badge tone={TONE[u.role]}>{u.role_label}</Badge>
                </div>

                <div className="space-y-1 text-sm text-ivory/80">
                  {u.telegram && (
                    <a href={`tel:${u.telegram.phone}`} className="flex items-center gap-2 font-semibold text-turq">
                      <Phone className="size-4" /> {u.telegram.phone}
                    </a>
                  )}
                  {u.telegram && (u.telegram.company || u.telegram.position) && (
                    <p className="flex items-center gap-2">
                      <Briefcase className="size-4 shrink-0" />
                      <span className="truncate">{[u.telegram.company, u.telegram.position].filter(Boolean).join(" · ")}</span>
                    </p>
                  )}
                  {u.submissions > 0 && (
                    <p className="flex items-center gap-2">
                      <MessageSquare className="size-4" /> Murojaatlar: <b>{u.submissions}</b>
                    </p>
                  )}
                  <p className="text-ivory/55">
                    {u.telegram ? `Ro‘yxatdan o‘tgan: ${formatDate(u.telegram.registered_at)}` : `Qo‘shilgan: ${formatDate(u.date_joined)}`} · Oxirgi
                    kirish: {u.last_login ? formatDateTime(u.last_login) : "—"}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {!u.is_active && (
                      <Badge tone="ember">
                        <Ban className="mr-1 size-3.5" /> Bloklangan
                      </Badge>
                    )}
                    {u.telegram?.bot_blocked && (
                      <Badge tone="muted">
                        <Send className="mr-1 size-3.5" /> Botni to‘xtatgan
                      </Badge>
                    )}
                    {me && <Badge>Siz</Badge>}
                  </div>
                </div>

                {!me && (
                  <div className="mt-auto space-y-3 border-t border-ivory/10 pt-4">
                    <div className="grid grid-cols-3 gap-1 rounded-xl bg-ivory/[0.05] p-1" role="radiogroup" aria-label="Rol">
                      {ROLES.map((r) => (
                        <button
                          key={r.value}
                          type="button"
                          role="radio"
                          aria-checked={u.role === r.value}
                          title={r.hint}
                          onClick={() => u.role !== r.value && patch(u, { role: r.value }, `${u.full_name}: ${r.label.toLowerCase()} bo‘ldi`)}
                          className={cn(
                            "rounded-lg px-2 py-1.5 text-[13px] font-semibold transition-colors",
                            u.role === r.value ? "bg-ivory text-ink" : "text-ivory/70 hover:text-ivory",
                          )}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <Switch
                        id={`active-${u.id}`}
                        checked={u.is_active}
                        onChange={(v) => patch(u, { is_active: v }, v ? "Faollashtirildi" : "Bloklandi — saytga kira olmaydi")}
                        label={u.is_active ? "Faol" : "Bloklangan"}
                      />
                      {u.role !== "user" && (
                        <Btn variant="ghost" className="!h-9 !px-3 text-sm" onClick={() => setResetFor(u)}>
                          <KeyRound className="size-4" /> {u.has_password ? "Parol" : "Parol berish"}
                        </Btn>
                      )}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {creating && <UserDialog onClose={() => setCreating(false)} onDone={load} />}
        {resetFor && <UserDialog reset={resetFor} onClose={() => setResetFor(null)} onDone={load} />}
      </AnimatePresence>
    </>
  );
}

function UserDialog({ reset, onClose, onDone }: { reset?: U; onClose: () => void; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    setBusy(true);
    setErrors({});
    try {
      if (reset) await apiFetch(`admin/users/${reset.id}`, { method: "PATCH", body: { password: f.password } });
      else await apiFetch("admin/users", { method: "POST", body: { ...f, is_active: true } });
      toast.success(reset ? "Parol saqlandi" : "Xodim qo‘shildi");
      onDone();
      onClose();
    } catch (err) {
      if (err instanceof ApiError && err.errors)
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])));
      toast.error(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  };

  const field = (name: string, label: string, type = "text", required = false) => (
    <label className="block">
      <span className="mb-2 block text-[15px] font-semibold">
        {label}
        {required && <span className="text-ember"> *</span>}
      </span>
      <input name={name} type={type} required={required} className={inputCls} autoComplete={type === "password" ? "new-password" : "off"} />
      {errors[name] && <span className="mt-1 block text-sm font-semibold text-ember">{errors[name]}</span>}
    </label>
  );

  return (
    <motion.div className="fixed inset-0 z-[80] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <motion.form
        onSubmit={submit}
        initial={{ scale: 0.96, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.97, opacity: 0 }}
        className="relative w-full max-w-lg space-y-4 rounded-[1.6rem] border border-ivory/10 bg-ink-2 p-7"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-2xl font-semibold">{reset ? `Parol: ${reset.full_name}` : "Yangi xodim"}</h3>
          <button type="button" onClick={onClose} className="grid size-10 place-items-center rounded-xl hover:bg-ivory/10" aria-label="Yopish">
            <X className="size-5" />
          </button>
        </div>
        {reset && !reset.has_password && (
          <p className="rounded-xl bg-turq/10 p-3 text-sm text-ivory/85">
            Bu odam Telegram orqali kiradi. Parol bersangiz, «/admin/login» sahifasida <b>{reset.username}</b> logini bilan ham kira oladi.
          </p>
        )}
        {!reset && (
          <>
            {field("username", "Login", "text", true)}
            <div className="grid gap-4 sm:grid-cols-2">
              {field("first_name", "Ism")}
              {field("last_name", "Familiya")}
            </div>
            {field("email", "Email", "email")}
            <label className="block">
              <span className="mb-2 block text-[15px] font-semibold">Rol</span>
              <select name="role" defaultValue="editor" className={inputCls}>
                <option value="editor">Muharrir — kontentni boshqaradi</option>
                <option value="admin">Administrator — hamma narsa</option>
              </select>
            </label>
          </>
        )}
        {field("password", "Parol (kamida 10 belgi)", "password", true)}
        {errors.non_field_errors && <p className="text-sm font-semibold text-ember">{errors.non_field_errors}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Btn variant="ghost" onClick={onClose}>
            Bekor qilish
          </Btn>
          <Btn type="submit" variant="turq" loading={busy}>
            <Plus className="size-4" /> {reset ? "Saqlash" : "Qo‘shish"}
          </Btn>
        </div>
      </motion.form>
    </motion.div>
  );
}
