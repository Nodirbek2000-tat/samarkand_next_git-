import Link from "next/link";
import { ArrowUpRight, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";

/** Sanitised (server-side, nh3) rich text from the CMS. */
export function RichText({ html, className }: { html: string; className?: string }) {
  if (!html) return null;
  return <div className={cn("rich", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-[1600px] px-5 md:px-10", className)}>{children}</div>;
}

export function SectionTitle({
  index,
  kicker,
  title,
  highlight,
  text,
  action,
  className,
}: {
  index?: string;
  kicker: string;
  title: string;
  highlight?: string;
  text?: string;
  action?: { label: string; href: string };
  className?: string;
}) {
  return (
    <div className={cn("mb-7 flex flex-col justify-between gap-4 md:mb-9 lg:flex-row lg:items-end", className)}>
      <div>
        <div className="mb-3 flex items-center gap-3 font-mono text-[12px] font-semibold uppercase tracking-[0.2em] text-mist">
          {index && <span className="text-turq">{index}</span>}
          <span className="h-px w-8 bg-ivory/25" />
          {kicker}
        </div>
        <h2 className="max-w-[26ch] font-display text-[clamp(1.4rem,2.8vw,2.6rem)] [overflow-wrap:anywhere] font-semibold uppercase leading-[1.04] tracking-[-0.025em]">
          {title} {highlight && <span className="text-gradient">{highlight}</span>}
        </h2>
      </div>
      <div className="flex max-w-md flex-col gap-3 lg:items-end lg:text-right">
        {text && <p className="text-base leading-relaxed text-ivory/85 md:text-lg">{text}</p>}
        {action && (
          <Link
            href={action.href}
            data-cursor="hover"
            className="group inline-flex items-center gap-2 font-semibold text-turq"
          >
            {action.label}
            <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
          </Link>
        )}
      </div>
    </div>
  );
}

export function EmptyState({ title, text, className }: { title: string; text?: string; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[2rem] border border-dashed border-ivory/20 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="grid size-16 place-items-center rounded-2xl bg-turq/10 text-turq">
        <Inbox className="size-7" />
      </span>
      <p className="mt-6 font-display text-2xl font-semibold">{title}</p>
      {text && <p className="mt-3 max-w-md text-lg text-ivory/75">{text}</p>}
    </div>
  );
}

export function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-ivory/15 bg-ink-2/70 px-3 py-1 text-[13px] font-semibold text-ivory/85 backdrop-blur",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function GridSkeleton({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-[1.6rem] border border-ivory/10 bg-ink-2">
          <div className="aspect-[16/10] animate-pulse bg-ivory/[0.06]" />
          <div className="space-y-3 p-6">
            <div className="h-4 w-1/3 animate-pulse rounded bg-ivory/[0.08]" />
            <div className="h-6 w-4/5 animate-pulse rounded bg-ivory/[0.08]" />
            <div className="h-4 w-full animate-pulse rounded bg-ivory/[0.06]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Pagination({ page, pages, href }: { page: number; pages: number; href: (p: number) => string }) {
  if (pages <= 1) return null;
  const items = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  );
  return (
    <nav className="mt-14 flex flex-wrap items-center justify-center gap-2" aria-label="Sahifalar">
      {items.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - items[i - 1] > 1 && <span className="px-1 text-ivory/50">…</span>}
          <Link
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn(
              "grid size-12 place-items-center rounded-full border text-base font-semibold transition-colors",
              p === page ? "border-turq bg-turq text-ink" : "border-ivory/15 hover:border-turq hover:text-turq",
            )}
          >
            {p}
          </Link>
        </span>
      ))}
    </nav>
  );
}
