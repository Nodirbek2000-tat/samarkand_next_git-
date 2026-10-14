"use client";

import { useState } from "react";
import { KeyRound, UserCog } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";
import { useAdmin } from "./admin-context";
import { Badge, Btn, Card, inputCls, PageHeader } from "./ui";

export function ProfilePage() {
  const { user } = useAdmin();
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = Object.fromEntries(new FormData(form)) as Record<string, string>;
    if (f.new_password !== f.repeat) {
      setErrors({ repeat: "Parollar mos kelmadi" });
      return;
    }
    setBusy(true);
    setErrors({});
    try {
      await apiFetch("auth/change-password", { method: "POST", body: { old_password: f.old_password, new_password: f.new_password } });
      toast.success("Parol almashtirildi");
      form.reset();
    } catch (err) {
      if (err instanceof ApiError && err.errors)
        setErrors(Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])));
      toast.error(err instanceof Error ? err.message : "Xatolik");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Profil" subtitle="Hisob ma’lumotlari va xavfsizlik" icon={UserCog} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <div className="flex items-center gap-4">
            <span className="grid size-16 place-items-center rounded-full bg-gradient-to-br from-turq to-lapis text-2xl font-bold text-white">
              {(user.full_name || user.username).slice(0, 1).toUpperCase()}
            </span>
            <div>
              <p className="text-xl font-semibold">{user.full_name || user.username}</p>
              <p className="text-ivory/60">@{user.username}</p>
            </div>
          </div>
          <dl className="mt-6 space-y-3 text-base">
            <div className="flex justify-between gap-4">
              <dt className="text-ivory/60">Rol</dt>
              <dd>
                <Badge tone={user.is_superuser ? "gold" : "turq"}>{user.is_superuser ? "Administrator" : "Muharrir"}</Badge>
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ivory/60">Email</dt>
              <dd className="font-semibold">{user.email || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ivory/60">Oxirgi kirish</dt>
              <dd className="font-semibold">{user.last_login ? formatDateTime(user.last_login) : "—"}</dd>
            </div>
          </dl>
        </Card>
        <Card>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <KeyRound className="size-5 text-turq" /> Parolni almashtirish
          </h2>
          <form onSubmit={submit} className="mt-5 space-y-4">
            {[
              ["old_password", "Joriy parol", "current-password"],
              ["new_password", "Yangi parol (kamida 10 belgi)", "new-password"],
              ["repeat", "Yangi parolni takrorlang", "new-password"],
            ].map(([name, label, ac]) => (
              <label key={name} className="block">
                <span className="mb-2 block text-[15px] font-semibold">{label}</span>
                <input name={name} type="password" required autoComplete={ac} className={inputCls} />
                {errors[name] && <span className="mt-1 block text-sm font-semibold text-ember">{errors[name]}</span>}
              </label>
            ))}
            <Btn type="submit" variant="turq" loading={busy}>
              Parolni saqlash
            </Btn>
          </form>
        </Card>
      </div>
    </>
  );
}
