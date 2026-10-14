import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { StarMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="relative grid min-h-svh place-items-center overflow-hidden bg-ink px-5 text-center">
      <svg viewBox="0 0 400 400" className="spin-slower pointer-events-none absolute size-[110vmin] opacity-[0.12]" fill="none" stroke="var(--color-turq)" strokeWidth="0.5" aria-hidden>
        {Array.from({ length: 20 }).map((_, i) => (
          <rect key={i} x="80" y="80" width="240" height="240" transform={`rotate(${i * 4.5} 200 200)`} />
        ))}
      </svg>
      <div className="relative">
        <StarMark className="mx-auto size-16" />
        <p className="text-gradient mt-6 font-display text-[28vw] font-bold leading-[0.8] tracking-[-0.06em] md:text-[16vw]">404</p>
        <h1 className="mt-6 font-display text-3xl font-semibold md:text-5xl">Sahifa topilmadi</h1>
        <p className="mx-auto mt-4 max-w-md text-lg text-ivory/80">Siz qidirgan sahifa ko‘chirilgan yoki o‘chirilgan bo‘lishi mumkin.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <Link href="/" className="inline-flex h-14 items-center gap-2 rounded-full bg-ivory px-7 text-lg font-semibold text-ink">
            <ArrowLeft className="size-5" /> Bosh sahifa
          </Link>
          <Link href="/search" className="inline-flex h-14 items-center gap-2 rounded-full border border-ivory/20 px-7 text-lg font-semibold hover:border-turq hover:text-turq">
            <Search className="size-5" /> Qidirish
          </Link>
        </div>
      </div>
    </main>
  );
}
