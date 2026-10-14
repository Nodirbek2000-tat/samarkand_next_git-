"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Project } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./cards";
import { EmptyState } from "./ui";

const STATUS = [
  { value: "", label: "Barchasi" },
  { value: "active", label: "Amaldagi" },
  { value: "completed", label: "Amalga oshirilgan" },
];

/** Client-side filtering keeps the page fully cacheable and the transitions instant. */
export function ProjectsExplorer({ projects, showFilters = true }: { projects: Project[]; showFilters?: boolean }) {
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");

  const categories = useMemo(() => {
    const seen = new Map<string, string>();
    for (const p of projects) seen.set(p.category, p.category_label);
    return [{ value: "", label: "Barcha yo‘nalishlar" }, ...[...seen].map(([value, label]) => ({ value, label }))];
  }, [projects]);

  const list = projects.filter((p) => (!category || p.category === category) && (!status || p.status === status));

  return (
    <>
      {showFilters && (
        <div className="mb-12 flex flex-col gap-4">
          <Chips options={categories} value={category} onChange={setCategory} layoutId="cat" />
          <Chips options={STATUS} value={status} onChange={setStatus} layoutId="status" small />
        </div>
      )}
      {list.length === 0 ? (
        <EmptyState title="Bu yo‘nalishda loyihalar hozircha yo‘q" text="Tez orada yangi loyihalar qo‘shiladi." />
      ) : (
        <motion.div layout className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => (
              <motion.div
                key={p.id}
                layout
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.94 }}
                transition={{ duration: 0.7, delay: Math.min(i, 8) * 0.05, ease: [0.16, 1, 0.3, 1] }}
              >
                <ProjectCard project={p} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </>
  );
}

function Chips({
  options,
  value,
  onChange,
  layoutId,
  small,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  layoutId: string;
  small?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="tab"
          aria-selected={value === o.value}
          data-cursor="hover"
          onClick={() => onChange(o.value)}
          className={cn(
            "relative rounded-full border border-ivory/15 font-semibold transition-colors",
            small ? "px-4 py-2 text-[15px]" : "px-5 py-2.5 text-base",
            value === o.value ? "text-ink" : "text-ivory/85 hover:border-turq hover:text-turq",
          )}
        >
          {value === o.value && (
            <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full bg-ivory" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  );
}
