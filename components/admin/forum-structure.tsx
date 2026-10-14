"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { ChevronDown, GripVertical, Plus, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import type { ForumEditionDetail } from "@/lib/api/types";
import { cn } from "@/lib/utils";
import { Btn, Card, inputCls } from "./ui";

const LEVELS = [
  { value: "1", label: "I darajali diplom" },
  { value: "2", label: "II darajali diplom" },
  { value: "3", label: "III darajali diplom" },
  { value: "winner", label: "G‘olib" },
  { value: "special", label: "Maxsus e’tirof" },
];

type W = { k: string; level: string; name: string; note: string };
type N = { k: string; title: string; winners: W[]; open: boolean };

let seq = 0;
const key = () => `k${seq++}`;

/** Edit every nomination and winner of a forum year, then save the whole structure atomically. */
export function ForumStructureEditor({ year }: { year: number }) {
  const [items, setItems] = useState<N[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    apiFetch<ForumEditionDetail>(`forum/${year}`)
      .then((d) =>
        setItems(
          d.nominations.map((n, i) => ({
            k: key(),
            title: n.title,
            open: i === 0,
            winners: n.winners.map((w) => ({ k: key(), level: w.level, name: w.name, note: w.note })),
          })),
        ),
      )
      .catch(() => setItems([]));
  }, [year]);

  const update = (fn: (list: N[]) => N[]) => {
    setItems((l) => (l ? fn(l) : l));
    setDirty(true);
  };
  const setNom = (k: string, patch: Partial<N>) => update((l) => l.map((n) => (n.k === k ? { ...n, ...patch } : n)));
  const setWin = (nk: string, wk: string, patch: Partial<W>) =>
    update((l) => l.map((n) => (n.k === nk ? { ...n, winners: n.winners.map((w) => (w.k === wk ? { ...w, ...patch } : w)) } : n)));

  const save = async () => {
    if (!items) return;
    const bad = items.find((n) => !n.title.trim() || n.winners.some((w) => !w.name.trim()));
    if (bad) {
      toast.error("Nominatsiya nomi va g‘olib nomi bo‘sh bo‘lmasin");
      return;
    }
    setBusy(true);
    try {
      await apiFetch(`forum/${year}/structure`, {
        method: "PUT",
        body: { nominations: items.map((n) => ({ title: n.title, winners: n.winners.map(({ level, name, note }) => ({ level, name, note })) })) },
      });
      setDirty(false);
      toast.success("Nominatsiyalar saqlandi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlab bo‘lmadi");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Nominatsiyalar va g‘oliblar</h2>
          <p className="text-sm text-ivory/60">Nominatsiyalarni sudrab tartiblang. Oxirida «Saqlash»ni bosing.</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="ghost" onClick={() => update((l) => [...l, { k: key(), title: "", open: true, winners: [{ k: key(), level: "1", name: "", note: "" }] }])}>
            <Plus className="size-4" /> Nominatsiya
          </Btn>
          <Btn variant="turq" loading={busy} disabled={!dirty} onClick={save}>
            <Save className="size-4" /> Saqlash
          </Btn>
        </div>
      </div>

      {items === null ? (
        <div className="h-32 animate-pulse rounded-2xl bg-ivory/[0.06]" />
      ) : (
        <Reorder.Group axis="y" values={items} onReorder={(v) => update(() => v)} className="space-y-3">
          {items.map((n, i) => (
            <Reorder.Item key={n.k} value={n} className="overflow-hidden rounded-2xl border border-ivory/10 bg-ink">
              <div className="flex items-center gap-2 p-3">
                <GripVertical className="size-5 shrink-0 cursor-grab text-ivory/40" />
                <span className="w-7 font-mono text-sm text-gold">{String(i + 1).padStart(2, "0")}</span>
                <input value={n.title} onChange={(e) => setNom(n.k, { title: e.target.value })} className={inputCls} placeholder="Nominatsiya nomi" aria-label="Nominatsiya nomi" />
                <span className="hidden shrink-0 text-sm text-ivory/60 md:inline">{n.winners.length} g‘olib</span>
                <button type="button" onClick={() => setNom(n.k, { open: !n.open })} className="grid size-11 shrink-0 place-items-center rounded-xl hover:bg-ivory/10" aria-label="Ochish">
                  <ChevronDown className={cn("size-5 transition-transform", n.open && "rotate-180")} />
                </button>
                <button
                  type="button"
                  onClick={() => window.confirm("Nominatsiya o‘chirilsinmi?") && update((l) => l.filter((x) => x.k !== n.k))}
                  className="grid size-11 shrink-0 place-items-center rounded-xl text-ember hover:bg-ember/10"
                  aria-label="O‘chirish"
                >
                  <Trash2 className="size-5" />
                </button>
              </div>
              <AnimatePresence initial={false}>
                {n.open && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="space-y-2 border-t border-ivory/10 p-3 pl-12">
                      {n.winners.map((w) => (
                        <div key={w.k} className="grid gap-2 md:grid-cols-[190px_1fr_1fr_auto]">
                          <select value={w.level} onChange={(e) => setWin(n.k, w.k, { level: e.target.value })} className={inputCls} aria-label="Daraja">
                            {LEVELS.map((l) => (
                              <option key={l.value} value={l.value}>
                                {l.label}
                              </option>
                            ))}
                          </select>
                          <input value={w.name} onChange={(e) => setWin(n.k, w.k, { name: e.target.value })} className={inputCls} placeholder="Korxona yoki shaxs" aria-label="G‘olib" />
                          <input value={w.note} onChange={(e) => setWin(n.k, w.k, { note: e.target.value })} className={inputCls} placeholder="Izoh (hudud, brend)" aria-label="Izoh" />
                          <button
                            type="button"
                            onClick={() => setNom(n.k, { winners: n.winners.filter((x) => x.k !== w.k) })}
                            className="grid size-12 place-items-center rounded-xl text-ember hover:bg-ember/10"
                            aria-label="G‘olibni o‘chirish"
                          >
                            <Trash2 className="size-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setNom(n.k, { winners: [...n.winners, { k: key(), level: n.winners.length < 3 ? String(n.winners.length + 1) : "winner", name: "", note: "" }] })}
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-semibold text-turq hover:bg-turq/10"
                      >
                        <Plus className="size-4" /> G‘olib qo‘shish
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </Card>
  );
}
