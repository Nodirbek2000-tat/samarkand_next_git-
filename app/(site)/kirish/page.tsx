import type { Metadata } from "next";
import { Suspense } from "react";
import { TelegramLogin } from "@/components/site/telegram-login";
import { api } from "@/lib/api/server";

export const metadata: Metadata = {
  title: "Kirish — Yangi Samarqand",
  description: "Telegram orqali ro‘yxatdan o‘ting va shaxsiy kabinetingizga kiring.",
  robots: { index: false },
};

export default async function LoginPage() {
  const config = await api.telegram();
  return (
    <section className="flex min-h-svh items-center justify-center px-4 pb-12 pt-32 md:pt-32">
      <Suspense fallback={<div className="h-[460px] w-full max-w-md animate-pulse rounded-[2rem] bg-ivory/[0.05]" />}>
        <TelegramLogin config={config} />
      </Suspense>
    </section>
  );
}
