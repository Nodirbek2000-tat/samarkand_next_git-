// Sanoatchilar forumi: bosh sahifa bo'limi va ichki forum sahifalari bir xil kartalardan foydalanadi.
import { cn } from "@/lib/utils";
import { CATEGORIES, type ForumWinner, type Nomination } from "@/lib/forum-data";

export const MEDAL: Record<ForumWinner["place"], string> = {
  1: "from-[#f6d77b] to-[#b8862b] text-[#3a2600]",
  2: "from-[#eef1f5] to-[#9aa4b2] text-[#1d2430]",
  3: "from-[#f0b48a] to-[#9b5a2e] text-[#2c1405]",
  winner: "from-turq to-lapis text-white",
  special: "from-lapis to-ember text-white",
};
export const MEDAL_TEXT: Record<ForumWinner["place"], [string, string]> = {
  1: ["I", "I darajali diplom"],
  2: ["II", "II darajali diplom"],
  3: ["III", "III darajali diplom"],
  winner: ["★", "G‘olib"],
  special: ["✦", "Taqdirlangan"],
};

export function PagerButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      data-cursor="hover"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-11 place-items-center rounded-full border border-ivory/20 transition-colors hover:border-gold hover:text-gold disabled:pointer-events-none disabled:opacity-30"
    >
      {children}
    </button>
  );
}

export function CatChip({
  active,
  onClick,
  label,
  count,
  color,
  small = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
  color?: string;
  small?: boolean;
}) {
  return (
    <button
      type="button"
      data-cursor="hover"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border font-medium transition-colors duration-300",
        small ? "px-3 py-1.5 text-[13px]" : "px-4 py-2 text-sm",
        active ? "border-ivory bg-ivory text-ink" : "border-ivory/15 text-ivory/80 hover:border-ivory/40 hover:text-ivory",
      )}
    >
      {color && <span className="size-2 rounded-full" style={{ background: color }} />}
      {label}
      <span className={cn("font-mono text-[11px]", active ? "text-ink/60" : "text-mist")}>{count}</span>
    </button>
  );
}

export function NominationCard({ n, index, compact = false }: { n: Nomination; index: number; compact?: boolean }) {
  const c = CATEGORIES[n.cat];
  // the media nomination honours five people: one tight line each keeps the pinned card as tall as the others
  const dense = compact && n.winners.length > 3;
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-3xl border border-ivory/10 bg-ink transition-colors duration-500 hover:border-[color:var(--c)]",
        compact ? "px-5 py-4 2xl:px-6 2xl:py-5" : "p-6 md:p-7",
      )}
      style={{ "--c": c.color } as React.CSSProperties}
    >
      <div className="pointer-events-none absolute -right-20 -top-20 size-56 rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--c)_16%,transparent),transparent_65%)] opacity-70 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative flex items-center justify-between gap-3">
        <span
          className="rounded-full border px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em]"
          style={{
            color: "color-mix(in oklab, var(--c) 72%, var(--color-ivory))",
            borderColor: "color-mix(in oklab, var(--c) 40%, transparent)",
          }}
        >
          {c.label}
        </span>
        <span className="font-mono text-[12px] text-mist">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3
        className={cn("relative font-display font-semibold", compact ? "mt-3 text-lg" : "mt-5 text-lg md:text-xl", "leading-snug")}
        title={n.official}
      >
        {n.title}
      </h3>
      <ol
        className={cn(
          "relative border-t border-ivory/10",
          compact ? "mt-3 pt-3" : "mt-5 pt-5",
          dense ? "space-y-1.5" : compact ? "space-y-2" : "space-y-3",
        )}
      >
        {n.winners.map((w) => (
          <li key={w.name + w.place} className={cn("flex gap-3", dense ? "items-center" : "items-start")}>
            <span
              className={cn(
                "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display text-[11px] font-bold shadow-sm",
                dense ? "size-6 text-[10px]" : compact ? "size-7" : "size-8",
                MEDAL[w.place],
              )}
            >
              <span aria-hidden>{MEDAL_TEXT[w.place][0]}</span>
              <span className="sr-only">{MEDAL_TEXT[w.place][1]}:</span>
            </span>
            {dense ? (
              <span className="min-w-0 truncate text-sm leading-snug">
                <span className="font-semibold">{w.name}</span>
                {w.note && <span className="text-[12px] text-ivory/65"> · {w.note}</span>}
              </span>
            ) : (
              <span className="min-w-0 pt-0.5">
                <span
                  className={cn(
                    "block font-semibold",
                    w.place === 1 || w.place === "winner" ? "text-[15px] md:text-base" : "text-sm text-ivory/90",
                    "leading-snug",
                  )}
                >
                  {w.name}
                </span>
                {w.note && (
                  <span className={cn("mt-0.5 block text-ivory/65", compact ? "text-[12px]" : "text-[13px]", "leading-snug")}>{w.note}</span>
                )}
              </span>
            )}
          </li>
        ))}
      </ol>
    </article>
  );
}
