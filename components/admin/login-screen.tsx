"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Eye, EyeOff, Loader2, LockKeyhole, Send, UserRound } from "lucide-react";
import Link from "next/link";
import { Logo, StarMark } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { apiFetch, ApiError } from "@/lib/api/client";
import { fetchMe, resetMe } from "@/lib/session";

const ease = [0.16, 1, 0.3, 1] as const;

export function LoginScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next");
  const target = next && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // already signed in → straight to the panel
  useEffect(() => {
    fetchMe(true).then((me) => me.authenticated && me.user?.is_staff && router.replace(target));
  }, [router, target]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await apiFetch("auth/login", { method: "POST", body: { username: form.get("username"), password: form.get("password") } });
      resetMe();
      router.replace(target);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xatolik yuz berdi.");
      setBusy(false);
    }
  };

  return (
    <main className="relative grid min-h-svh overflow-hidden bg-ink lg:grid-cols-2">
      {/* brand side */}
      <section className="relative hidden overflow-hidden bg-gradient-to-br from-[#062a2a] via-[#0b1a4a] to-[#2a1606] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <svg viewBox="0 0 400 400" className="spin-slower absolute -right-40 -top-40 size-[900px] opacity-20" fill="none" stroke="#ff8a1f" strokeWidth="0.5" aria-hidden>
          {Array.from({ length: 24 }).map((_, i) => (
            <rect key={i} x="80" y="80" width="240" height="240" transform={`rotate(${i * 3.75} 200 200)`} />
          ))}
          <circle cx="200" cy="200" r="196" stroke="#34d07a" />
        </svg>
        <div className="orb absolute -bottom-40 -left-40 size-[520px] opacity-40" />
        <div className="relative [&_*]:!text-white">
          <Logo />
        </div>
        <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, ease }} className="relative">
          <StarMark className="size-20" />
          <h1 className="mt-8 font-display text-6xl font-bold uppercase leading-[0.95] tracking-tight">
            Boshqaruv
            <br />
            <span className="bg-gradient-to-r from-[#34d07a] via-[#ff8a1f] to-[#ff7847] bg-clip-text text-transparent">paneli</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-white/80">Yangiliklar, loyihalar, Kengash a’zolari, forum natijalari va murojaatlar — barchasi bir joyda.</p>
        </motion.div>
        <p className="relative text-sm text-white/60">Faqat administrator huquqi berilgan xodimlar uchun.</p>
      </section>

      {/* form side */}
      <section className="relative flex flex-col px-6 py-8 md:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-base font-semibold text-ivory/80 hover:text-turq">
            <ArrowLeft className="size-5" /> Saytga qaytish
          </Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-12">
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <div className="lg:hidden">
              <Logo />
            </div>
            <h2 className="mt-10 font-display text-4xl font-bold lg:mt-0">Tizimga kirish</h2>
            <p className="mt-3 text-lg text-ivory/75">Login va parolingizni kiriting.</p>

            <label className="mt-10 block">
              <span className="mb-2 block text-[15px] font-semibold">Login</span>
              <span className="flex h-16 items-center gap-3 rounded-2xl border border-ivory/20 bg-ink-2 px-5 focus-within:border-turq">
                <UserRound className="size-5 text-turq" />
                <input name="username" required autoComplete="username" autoFocus className="h-full w-full bg-transparent text-lg outline-none" />
              </span>
            </label>
            <label className="mt-5 block">
              <span className="mb-2 block text-[15px] font-semibold">Parol</span>
              <span className="flex h-16 items-center gap-3 rounded-2xl border border-ivory/20 bg-ink-2 px-5 focus-within:border-turq">
                <LockKeyhole className="size-5 text-turq" />
                <input
                  name="password"
                  type={show ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  className="h-full w-full bg-transparent text-lg outline-none"
                />
                <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"} className="text-ivory/60 hover:text-turq">
                  {show ? <EyeOff className="size-5" /> : <Eye className="size-5" />}
                </button>
              </span>
            </label>

            {error && (
              <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-ember/40 bg-ember/10 px-5 py-4 font-semibold text-ember" role="alert">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="group relative mt-8 flex h-16 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-ivory text-lg font-semibold text-ink disabled:opacity-70"
            >
              <span className="absolute inset-0 translate-y-full bg-turq transition-transform duration-700 ease-expo group-hover:translate-y-0" />
              <span className="relative flex items-center gap-3">
                {busy && <Loader2 className="size-5 animate-spin" />}
                {busy ? "Kirilmoqda…" : "Kirish"}
              </span>
            </button>
            <p className="mt-6 text-center text-sm text-ivory/55">Admin huquqi Telegram hisobingizga berilganmi?</p>
            <a
              href={`/kirish?next=${encodeURIComponent(target)}`}
              className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-ivory/15 text-[15px] font-semibold text-ivory/85 hover:border-[#229ED9] hover:text-[#229ED9]"
            >
              <Send className="size-4" /> Telegram orqali kirish
            </a>
          </motion.form>
        </div>
      </section>
    </main>
  );
}
