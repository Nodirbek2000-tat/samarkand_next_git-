"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, useAnimationControls } from "motion/react";
import QRCode from "react-qr-code";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { apiFetch, ApiError } from "@/lib/api/client";
import { resetMe, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type Config = { enabled: boolean; bot_username: string; bot_url: string; code_ttl: number };

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/kabinet";
}

/** Where to go after sign-in: the admin panel only for staff, everyone else to the requested page or the cabinet. */
function target(next: string, isStaff: boolean) {
  if (next.startsWith("/admin")) return isStaff ? next : "/kabinet";
  return next;
}

/** Simple sign-in card: open the bot, get a 6-digit code, type it here. Registration happens in the bot. */
export function TelegramLogin({ config }: { config: Config | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const session = useSession();
  const [code, setCode] = useState("");
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const shake = useAnimationControls();

  // already signed in → straight on
  useEffect(() => {
    if (session && state === "idle") router.replace(session.is_staff && !session.telegram ? "/admin" : target(next, session.is_staff));
  }, [session, state, router, next]);

  const submit = async (value: string) => {
    if (value.length !== 6 || state !== "idle") return;
    setState("busy");
    setError(null);
    try {
      const res = await apiFetch<{ user: { is_staff: boolean } }>("auth/telegram/code", { method: "POST", body: { code: value } });
      setState("done");
      resetMe();
      window.setTimeout(() => router.replace(target(next, res.user.is_staff)), 700);
    } catch (e) {
      setState("idle");
      setCode("");
      setError(e instanceof ApiError ? e.message : "Xatolik yuz berdi.");
      shake.start({ x: [0, -12, 10, -6, 4, 0], transition: { duration: 0.45 } });
    }
  };

  const onChange = (raw: string) => {
    const digits = raw.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setError(null);
    if (digits.length === 6) submit(digits);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md rounded-[2rem] border border-ivory/10 bg-ink-2 p-7 shadow-[0_30px_80px_-40px_rgb(0_0_0/0.35)] md:p-9"
    >
      <h1 className="font-display text-4xl font-bold">Kirish</h1>
      <p className="mt-2 text-lg text-ivory/75">Ro‘yxatdan o‘tish va kirish — Telegram bot orqali, parolsiz.</p>

      {/* 1. bot */}
      <div className="mt-8">
        {config?.enabled ? (
          <>
            <a
              href={config.bot_url}
              target="_blank"
              rel="noreferrer"
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-[#229ED9] text-lg font-semibold text-white transition-[filter] hover:brightness-110"
            >
              <Send className="size-5" /> Botni ochish
            </a>
            <p className="mt-3 text-[15px] leading-relaxed text-ivory/70">
              Botda <b>«📱 Telefon raqamni yuborish»</b> tugmasini bosing — u sizga 6 xonali kod yuboradi.
            </p>
            <details className="mt-2 text-[15px] text-ivory/70 max-md:hidden">
              <summary className="cursor-pointer select-none text-turq">Kompyuterdamisiz? QR-kodni telefonda skanerlang</summary>
              <div className="mt-3 inline-block rounded-xl bg-white p-2.5">
                <QRCode value={config.bot_url} size={120} fgColor="#0b1424" />
              </div>
            </details>
          </>
        ) : (
          <p className="rounded-2xl border border-gold/40 bg-gold/10 p-4 text-base text-ivory/85">
            Telegram bot hozircha ishlamayapti. Birozdan keyin qayta urinib ko‘ring.
          </p>
        )}
      </div>

      {/* 2. code */}
      {state === "done" ? (
        <p className="mt-8 flex items-center gap-3 text-xl font-semibold" role="status">
          <CheckCircle2 className="size-7 text-turq" /> Xush kelibsiz!
        </p>
      ) : (
        <motion.form
          animate={shake}
          onSubmit={(e) => {
            e.preventDefault();
            submit(code);
          }}
          className="mt-8 border-t border-ivory/10 pt-7"
        >
          <label htmlFor="tg-code" className="mb-2 block text-base font-semibold">
            Botdan kelgan kod
          </label>
          <input
            id="tg-code"
            value={code}
            onChange={(e) => onChange(e.target.value)}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="______"
            disabled={state === "busy"}
            aria-invalid={!!error}
            className={cn(
              "h-16 w-full rounded-2xl border-2 bg-ink pl-[calc(1.25rem+0.5em)] pr-5 text-center font-mono text-3xl tracking-[0.5em] text-ivory outline-none transition-colors placeholder:text-ivory/25",
              error ? "border-ember" : "border-ivory/20 focus:border-turq",
            )}
          />
          {error && (
            <p className="mt-2 text-[15px] font-semibold text-ember" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={code.length !== 6 || state === "busy"}
            className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-ivory text-lg font-semibold text-ink transition-opacity disabled:opacity-40"
          >
            {state === "busy" && <Loader2 className="size-5 animate-spin" />} Kirish
          </button>
        </motion.form>
      )}
    </motion.div>
  );
}
