"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { AnimatePresence, m } from "motion/react";
import type { CouncilMember } from "@/lib/api/types";
import { memberToPerson, PersonCard } from "./cards";
import { EmptyState } from "./ui";

/** Searchable council member grid with animated re-ordering. */
export function MembersGrid({ members }: { members: CouncilMember[] }) {
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return members;
    return members.filter((m) => [m.full_name, m.company, m.position, m.industry].join(" ").toLowerCase().includes(term));
  }, [q, members]);

  return (
    <>
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <label className="glass flex h-14 w-full max-w-md items-center gap-3 rounded-full px-5">
          <Search className="size-5 text-turq" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ism yoki kompaniya bo‘yicha qidirish"
            className="h-full w-full bg-transparent text-[17px] outline-none placeholder:text-ivory/50"
            aria-label="A’zolarni qidirish"
          />
        </label>
        <p className="text-base text-ivory/75">
          Jami: <span className="font-semibold text-ivory">{list.length}</span> ta a’zo
        </p>
      </div>
      {list.length === 0 ? (
        <EmptyState title="Hech narsa topilmadi" text="Boshqa so‘z bilan qidirib ko‘ring." />
      ) : (
        <m.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          <AnimatePresence mode="popLayout">
            {list.map((member, i) => (
              <m.div
                key={member.id}
                layout
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.6, delay: Math.min(i, 12) * 0.03, ease: [0.16, 1, 0.3, 1] }}
              >
                <PersonCard person={memberToPerson(member)} href={`/council/members/${member.slug}`} />
              </m.div>
            ))}
          </AnimatePresence>
        </m.div>
      )}
    </>
  );
}
