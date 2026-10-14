import { cn } from "@/lib/utils";

/** Eight-point Timurid star mark (two rotated squares + inner octagon). */
export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="star-g" x1="0" y1="0" x2="48" y2="48">
          <stop offset="0" stopColor="#2ee8d6" />
          <stop offset="1" stopColor="#f3c46b" />
        </linearGradient>
      </defs>
      <g stroke="url(#star-g)" strokeWidth="1.6">
        <rect x="10" y="10" width="28" height="28" />
        <rect x="10" y="10" width="28" height="28" transform="rotate(45 24 24)" />
        <circle cx="24" cy="24" r="6.5" />
      </g>
      <circle cx="24" cy="24" r="2" fill="#f3c46b" />
    </svg>
  );
}

/** `responsive` tightens the wordmark on phones so the inner-page header fits next to its buttons. */
export function Logo({ className, responsive = false }: { className?: string; responsive?: boolean }) {
  return (
    <span className={cn("inline-flex items-center", responsive ? "gap-2 sm:gap-3" : "gap-3", className)}>
      <StarMark className="spin-slow" />
      <span className="flex flex-col whitespace-nowrap leading-none">
        <span className={cn("font-display font-semibold", responsive ? "text-[10px] tracking-[0.06em] sm:text-[13px] sm:tracking-[0.18em]" : "text-[13px] tracking-[0.18em]")}>
          YANGI SAMARQAND
        </span>
        <span
          className={cn(
            "mt-1 font-mono uppercase text-mist",
            responsive ? "text-[8px] tracking-[0.06em] sm:text-[10px] sm:tracking-[0.2em]" : "text-[10px] tracking-[0.2em]",
          )}
        >
          Tadbirkorlar kengashi
        </span>
      </span>
    </span>
  );
}
