"use client";

import { useCallback, useEffect, useState } from "react";
import { Reorder } from "motion/react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { Card, Empty, inputCls } from "./ui";

type P = { id: number; company: string; person: string; role: string; contribution: string; order: number };

export function ParticipantsEditor({ projectId }: { projectId: number }) {
  const [rows, setRows] = useState<P[] | null>(null);

  const load = useCallback(() => {
    apiFetch<P[]>(`project-participants?project=${projectId}`)
      .then(setRows)
      .catch(() => setRows([]));
  }, [projectId]);
  useEffect(load, [load]);

  const add = async () => {
    try {
      const created = await apiFetch<P>("project-participants", {
        method: "POST",
        body: { project: projectId, company: "Yangi kompaniya", role: "Tashabbuskor", order: rows?.length ?? 0 },
      });
      setRows((r) => [...(r ?? []), created]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  const patch = async (row: P, field: keyof P, value: string) => {
    if (row[field] === value) return;
    try {
      await apiFetch(`project-participants/${row.id}`, { method: "PATCH", body: { [field]: value } });
      setRows((r) => r?.map((x) => (x.id === row.id ? { ...x, [field]: value } : x)) ?? null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlab bo‘lmadi");
    }
  };

  const remove = async (row: P) => {
    if (!window.confirm(`«${row.company}» o‘chirilsinmi?`)) return;
    await apiFetch(`project-participants/${row.id}`, { method: "DELETE" }).catch(() => toast.error("O‘chirib bo‘lmadi"));
    setRows((r) => r?.filter((x) => x.id !== row.id) ?? null);
  };

  const reorder = async (next: P[]) => {
    setRows(next);
    await apiFetch("project-participants/reorder", { method: "POST", body: { ids: next.map((x) => x.id) } }).catch(() =>
      toast.error("Tartibni saqlab bo‘lmadi"),
    );
  };

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Ishtirokchilar</h2>
          <p className="text-sm text-ivory/60">Loyiha tashabbuskorlari va hamkor kompaniyalar. O‘zgarishlar maydondan chiqqanda saqlanadi.</p>
        </div>
        <button type="button" onClick={add} className="inline-flex h-11 items-center gap-2 rounded-xl bg-turq px-5 font-semibold text-ink">
          <Plus className="size-5" /> Qo‘shish
        </button>
      </div>
      {rows === null ? (
        <div className="h-24 animate-pulse rounded-2xl bg-ivory/[0.06]" />
      ) : rows.length === 0 ? (
        <Empty title="Ishtirokchilar yo‘q" />
      ) : (
        <Reorder.Group axis="y" values={rows} onReorder={reorder} className="space-y-2">
          {rows.map((row) => (
            <Reorder.Item key={row.id} value={row} className="flex items-start gap-2 rounded-2xl border border-ivory/10 bg-ink p-3">
              <GripVertical className="mt-3 size-5 shrink-0 cursor-grab text-ivory/40" />
              <div className="grid flex-1 gap-2 md:grid-cols-4">
                <input defaultValue={row.company} onBlur={(e) => patch(row, "company", e.target.value)} className={inputCls} placeholder="Kompaniya" aria-label="Kompaniya" />
                <input defaultValue={row.person} onBlur={(e) => patch(row, "person", e.target.value)} className={inputCls} placeholder="Mas’ul shaxs" aria-label="Mas’ul shaxs" />
                <input defaultValue={row.role} onBlur={(e) => patch(row, "role", e.target.value)} className={inputCls} placeholder="Roli" aria-label="Roli" />
                <input defaultValue={row.contribution} onBlur={(e) => patch(row, "contribution", e.target.value)} className={inputCls} placeholder="Hissasi" aria-label="Hissasi" />
              </div>
              <button type="button" onClick={() => remove(row)} className="grid size-12 shrink-0 place-items-center rounded-xl text-ember hover:bg-ember/10" aria-label="O‘chirish">
                <Trash2 className="size-5" />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </Card>
  );
}
