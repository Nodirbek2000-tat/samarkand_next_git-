"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowUpRight, CheckCircle2, Loader2, Send, UserRoundCheck } from "lucide-react";
import { apiFetch, ApiError, fieldError } from "@/lib/api/client";
import { useSession, type SessionUser } from "@/lib/session";
import { cn } from "@/lib/utils";

export type FormFieldDef = {
  name: string;
  label: string;
  type?: "text" | "tel" | "email" | "url" | "textarea" | "select";
  required?: boolean;
  options?: { value: string; label: string }[];
  placeholder?: string;
  full?: boolean;
  defaultValue?: string;
  maxLength?: number;
};

const inputCls =
  "w-full rounded-2xl border border-ivory/20 bg-ink-2 px-5 py-4 text-[17px] text-ivory outline-none transition-[border-color,box-shadow] duration-300 placeholder:text-ivory/40 focus:border-turq focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-turq)_18%,transparent)]";

/** Values we already know about a signed-in visitor (Telegram verified the phone). */
function prefillFor(user: SessionUser | null | undefined): Record<string, string> {
  if (!user) return {};
  const name = [user.first_name, user.last_name].join(" ").trim();
  return {
    full_name: name,
    contact_person: name,
    phone: user.telegram?.phone ?? "",
    email: user.email,
    company: user.telegram?.company ?? "",
    position: user.telegram?.position ?? "",
  };
}

export function PublicForm({
  endpoint,
  fields,
  submitLabel = "Yuborish",
  successTitle = "Rahmat! Murojaatingiz qabul qilindi",
  successText = "Tez orada siz bilan bog‘lanamiz.",
  extra,
  className,
}: {
  endpoint: string;
  fields: FormFieldDef[];
  submitLabel?: string;
  successTitle?: string;
  successText?: string;
  /** Fixed values sent with every submission (e.g. kind: "contact"). */
  extra?: Record<string, string>;
  className?: string;
}) {
  const router = useRouter();
  const user = useSession();
  const prefill = prefillFor(user);
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<unknown>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, unknown>;
    data.consent = data.consent === "on";
    Object.assign(data, extra);
    setState("sending");
    setError(null);
    try {
      await apiFetch(endpoint, { method: "POST", body: data });
      setState("done");
      form.reset();
    } catch (err) {
      setError(err);
      setState("idle");
    }
  };

  const generalError = error instanceof ApiError ? error.message : error ? "Xatolik yuz berdi." : null;

  return (
    <div className={cn("glass relative overflow-hidden rounded-[2rem] p-6 md:p-10", className)}>
      <AnimatePresence mode="wait">
        {state === "done" ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex min-h-[380px] flex-col items-center justify-center text-center"
            role="status"
          >
            <motion.div initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}>
              <CheckCircle2 className="size-20 text-turq" />
            </motion.div>
            <h3 className="mt-6 font-display text-3xl font-semibold">{successTitle}</h3>
            <p className="mt-3 max-w-md text-lg text-ivory/85">{successText}</p>
            <button
              type="button"
              onClick={() => setState("idle")}
              className="mt-8 rounded-full border border-ivory/20 px-6 py-3 font-semibold hover:border-turq hover:text-turq"
            >
              Yana yuborish
            </button>
          </motion.div>
        ) : (
          // keyed by the visitor so the uncontrolled inputs pick up the prefill once the session loads
          <motion.form key={`form-${user?.id ?? "guest"}`} onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} noValidate={false}>
            {user ? (
              <p className="mb-7 flex items-start gap-3 rounded-2xl border border-turq/30 bg-turq/10 px-5 py-4 text-base text-ivory/90">
                <UserRoundCheck className="mt-0.5 size-5 shrink-0 text-turq" />
                <span>
                  Siz kabinet orqali yuboryapsiz — javob <b>shaxsiy kabinetingizda</b>
                  {user.telegram && " va Telegram’da"} ko‘rinadi.
                </span>
              </p>
            ) : user === null ? (
              <p className="mb-7 flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-ivory/15 bg-ivory/[0.04] px-5 py-4 text-base text-ivory/85">
                <Send className="size-5 shrink-0 text-[#229ED9]" />
                <span className="flex-1">Javobni Telegram orqali olishni xohlaysizmi?</span>
                <button
                  type="button"
                  onClick={() => router.push(`/kirish?next=${encodeURIComponent(window.location.pathname)}`)}
                  className="font-semibold text-turq underline-offset-4 hover:underline"
                >
                  Telegram orqali kiring →
                </button>
              </p>
            ) : null}
            <div className="grid gap-5 md:grid-cols-2">
              {fields.map((f) => {
                const err = fieldError(error, f.name);
                const id = `f-${endpoint}-${f.name}`;
                return (
                  <label key={f.name} htmlFor={id} className={cn("block", (f.full || f.type === "textarea") && "md:col-span-2")}>
                    <span className="mb-2 block text-[15px] font-semibold text-ivory">
                      {f.label}
                      {f.required && <span className="text-ember"> *</span>}
                    </span>
                    {f.type === "textarea" ? (
                      <textarea
                        id={id}
                        name={f.name}
                        required={f.required}
                        rows={5}
                        maxLength={f.maxLength ?? 5000}
                        placeholder={f.placeholder}
                        defaultValue={prefill[f.name] || f.defaultValue}
                        className={cn(inputCls, "resize-y", err && "border-ember")}
                        aria-invalid={!!err}
                      />
                    ) : f.type === "select" ? (
                      <select id={id} name={f.name} required={f.required} defaultValue={f.defaultValue} className={cn(inputCls, err && "border-ember")}>
                        {f.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        id={id}
                        name={f.name}
                        type={f.type ?? "text"}
                        required={f.required}
                        maxLength={f.maxLength ?? 255}
                        placeholder={f.placeholder}
                        defaultValue={prefill[f.name] || f.defaultValue}
                        autoComplete={f.type === "tel" ? "tel" : f.type === "email" ? "email" : f.name === "full_name" ? "name" : undefined}
                        className={cn(inputCls, err && "border-ember")}
                        aria-invalid={!!err}
                      />
                    )}
                    {err && <span className="mt-2 block text-sm font-semibold text-ember">{err}</span>}
                  </label>
                );
              })}
            </div>

            {/* honeypot — hidden from people, irresistible to bots */}
            <input type="text" name="hp" tabIndex={-1} autoComplete="off" className="absolute -left-[9999px] size-px opacity-0" aria-hidden />

            <label className="mt-6 flex items-start gap-3 text-base text-ivory/85">
              <input type="checkbox" name="consent" required className="mt-1 size-5 shrink-0 accent-[var(--color-turq)]" />
              Shaxsiy ma’lumotlarimni qayta ishlashga roziman
            </label>
            {fieldError(error, "consent") && <p className="mt-2 text-sm font-semibold text-ember">{fieldError(error, "consent")}</p>}

            {generalError && (
              <p className="mt-6 rounded-2xl border border-ember/40 bg-ember/10 px-5 py-4 text-base font-semibold text-ember" role="alert">
                {generalError}
              </p>
            )}

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={state === "sending"}
                data-cursor="hover"
                className="group relative inline-flex h-16 items-center gap-4 overflow-hidden rounded-full bg-ivory pl-8 pr-2 text-base font-semibold text-ink disabled:opacity-70"
              >
                <span className="absolute inset-0 translate-y-full rounded-full bg-turq transition-transform duration-700 ease-expo group-hover:translate-y-0" />
                <span className="relative">{state === "sending" ? "Yuborilmoqda…" : submitLabel}</span>
                <span className="relative grid size-12 place-items-center rounded-full bg-ink text-ivory transition-transform duration-500 ease-expo group-hover:rotate-45">
                  {state === "sending" ? <Loader2 className="size-5 animate-spin" /> : <ArrowUpRight className="size-5" />}
                </span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export const APPEAL_FIELDS: FormFieldDef[] = [
  {
    name: "kind",
    label: "Murojaat turi",
    type: "select",
    required: true,
    defaultValue: "appeal",
    options: [
      { value: "appeal", label: "Murojaat" },
      { value: "proposal", label: "Taklif" },
      { value: "question", label: "Savol" },
      { value: "complaint", label: "Shikoyat" },
    ],
  },
  { name: "full_name", label: "F.I.Sh.", required: true },
  { name: "phone", label: "Telefon", type: "tel", required: true, placeholder: "+998 90 123 45 67" },
  { name: "email", label: "Email", type: "email" },
  { name: "organization", label: "Tashkilot" },
  { name: "subject", label: "Mavzu", required: true },
  { name: "message", label: "Murojaat matni", type: "textarea", required: true },
];
