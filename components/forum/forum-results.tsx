"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CATEGORIES, CATEGORY_ORDER, type ForumCategory, type Nomination } from "@/lib/forum-data";
import { CatChip, NominationCard } from "./ui";

const ease = [0.16, 1, 0.3, 1] as const;

/** A forum's full results: every nomination (ordered by category) with a sticky category filter. */
export function ForumResults({ nominations }: { nominations: Nomination[] }) {
  const [cat, setCat] = useState<ForumCategory | "all">("all");
  const cats = useMemo(
    () => CATEGORY_ORDER.map((c) => ({ c, count: nominations.filter((n) => n.cat === c).length })).filter((g) => g.count),
    [nominations],
  );
  const shown = cat === "all" ? nominations : nominations.filter((n) => n.cat === cat);

  return (
    <>
      <div className="sticky top-[76px] z-20 -mx-5 border-b border-ivory/10 bg-ink-2/95 px-5 py-3 md:top-[84px] md:-mx-10 md:px-10">
        <div className="flex gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,#000_92%,transparent)] [scrollbar-width:none] md:flex-wrap md:[mask-image:none]">
          <CatChip active={cat === "all"} onClick={() => setCat("all")} label="Hammasi" count={nominations.length} />
          {cats.map(({ c, count }) => (
            <CatChip key={c} active={cat === c} onClick={() => setCat(c)} label={CATEGORIES[c].label} count={count} color={CATEGORIES[c].color} />
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.ul
          key={cat}
          className="mt-8 grid gap-4 md:mt-10 md:grid-cols-2 xl:grid-cols-3 [perspective:1200px]"
          exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
        >
          {shown.map((n, i) => (
            <motion.li
              key={n.official}
              initial={{ opacity: 0, y: 36, rotateX: -14 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ delay: 0.05 * (i % 3), duration: 0.7, ease }}
            >
              <NominationCard n={n} index={nominations.indexOf(n)} />
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    </>
  );
}
