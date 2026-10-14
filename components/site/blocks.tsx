import type { Block, SiteSettings, Stat } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Reveal } from "./reveal";

export const byGroup = (blocks: Block[] | undefined, group: string) => (blocks ?? []).filter((b) => b.group === group);

/** Big numbered rows that slide their number on hover. */
export function NumberedList({ items, className }: { items: { title: string; body?: string }[]; className?: string }) {
  return (
    <Reveal stagger={0.07} as="ol" className={cn("border-t border-ivory/10", className)}>
      {items.map((item, i) => (
        <li
          key={item.title}
          data-reveal-item
          className="group grid grid-cols-[3.5rem_1fr] gap-4 border-b border-ivory/10 py-7 transition-colors md:grid-cols-[6rem_1fr_1.2fr] md:gap-8 md:py-9"
        >
          <span className="font-display text-3xl font-bold text-ivory/20 transition-colors duration-500 group-hover:text-turq md:text-5xl">
            {String(i + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display text-xl font-semibold leading-snug md:text-2xl">{item.title}</h3>
          {item.body && <p className="col-span-2 text-lg leading-relaxed text-ivory/80 md:col-span-1">{item.body}</p>}
        </li>
      ))}
    </Reveal>
  );
}

export function StatsStrip({ stats, className }: { stats: Stat[]; className?: string }) {
  if (!stats.length) return null;
  return (
    <Reveal stagger={0.08} className={cn("grid border-l border-t border-ivory/10 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((s) => (
        <div key={s.label} data-reveal-item className="border-b border-r border-ivory/10 p-7 md:p-9">
          <p className="font-display text-5xl font-semibold tracking-tight text-turq md:text-6xl">{s.value}</p>
          <p className="mt-3 text-base text-ivory/80">{s.label}</p>
        </div>
      ))}
    </Reveal>
  );
}

export function settingsStats(s: SiteSettings | null): Stat[] {
  if (!s) return [];
  const fmt = (n: number) => n.toLocaleString("ru-RU").replace(/ /g, " ");
  return [
    { value: fmt(s.stat_members), label: "Kengashning faol a’zolari" },
    { value: fmt(s.stat_catalog), label: "«Made in Samarkand» katalogidagi korxonalar" },
    { value: fmt(s.stat_startups), label: "Moliyalashtirilgan startaplar" },
    { value: `${fmt(s.stat_enterprises)}+`, label: "Viloyatdagi sanoat korxonalari" },
  ].filter((x) => !x.value.startsWith("0"));
}
