"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { ArrowDownUp, Check, ExternalLink, GripVertical, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { itemRef, itemTitle, type Column, type Resource } from "@/lib/admin/resources";
import { formatDate, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Badge, Btn, ConfirmDialog, Empty, PageHeader, Switch } from "./ui";

type Row = Record<string, unknown> & { id: number };
type ListResponse = Row[] | { results: Row[]; count: number; pages: number; page: number };

function Cell({ col, row }: { col: Column; row: Row }) {
  const v = row[col.key];
  switch (col.kind) {
    case "image":
      return v ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={String(v)} alt="" className="size-12 rounded-xl object-cover" />
      ) : (
        <span className="grid size-12 place-items-center rounded-xl bg-gradient-to-br from-turq/20 to-gold/20 font-display text-sm font-bold text-turq">
          {itemTitle(row).slice(0, 1)}
        </span>
      );
    case "date":
      return <span className="whitespace-nowrap text-ivory/80">{v ? formatDate(String(v)) : "—"}</span>;
    case "datetime":
      return <span className="whitespace-nowrap text-ivory/80">{v ? formatDateTime(String(v)) : "—"}</span>;
    case "badge":
      return v ? <Badge>{String(v)}</Badge> : <span>—</span>;
    case "strong":
      return <span className="line-clamp-2 font-semibold">{String(v ?? "—")}</span>;
    default:
      return <span className="line-clamp-2 text-ivory/80">{v === null || v === undefined || v === "" ? "—" : String(v)}</span>;
  }
}

export function ResourceList({ resource }: { resource: Resource }) {
  const router = useRouter();
  const vis = resource.visibility;
  const flag = vis === "active" ? "is_active" : "is_published";
  const tabs = vis
    ? [
        { value: "", label: "Barchasi" },
        { value: "published", label: vis === "active" ? "Faol" : "E’lon qilingan" },
        { value: "draft", label: vis === "active" ? "Yashirin" : "Qoralama" },
      ]
    : [];

  const [tab, setTab] = useState("");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<Row[] | null>(null);
  const [meta, setMeta] = useState<{ count: number; pages: number }>({ count: 0, pages: 1 });
  const [reorder, setReorder] = useState(false);
  const [order, setOrder] = useState<Row[]>([]);
  const [toDelete, setToDelete] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setSearch(query.trim());
      setPage(1);
    }, 350);
    return () => window.clearTimeout(t);
  }, [query]);

  const load = useCallback(async () => {
    const params = new URLSearchParams({ page: String(page), page_size: reorder ? "500" : "25" });
    if (tab) params.set("status", tab);
    if (search) params.set("search", search);
    try {
      const data = await apiFetch<ListResponse>(`${resource.endpoint}?${params}`);
      if (Array.isArray(data)) {
        setRows(data);
        setMeta({ count: data.length, pages: 1 });
      } else {
        setRows(data.results);
        setMeta({ count: data.count, pages: data.pages });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yuklab bo‘lmadi");
      setRows([]);
    }
  }, [resource.endpoint, page, tab, search, reorder]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- loading external data
    load();
  }, [load]);

  const togglePublish = async (row: Row) => {
    const next = !row[flag];
    setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, [flag]: next } : r)) ?? null);
    try {
      const ref = itemRef(resource, row);
      if (vis === "published") await apiFetch(`${resource.endpoint}/${ref}/publish`, { method: "POST", body: { is_published: next } });
      else await apiFetch(`${resource.endpoint}/${ref}`, { method: "PATCH", body: { [flag]: next } });
      toast.success(next ? "Saytda ko‘rsatiladi" : "Saytdan yashirildi");
    } catch (e) {
      setRows((rs) => rs?.map((r) => (r.id === row.id ? { ...r, [flag]: !next } : r)) ?? null);
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setBusy(true);
    try {
      await apiFetch(`${resource.endpoint}/${itemRef(resource, toDelete)}`, { method: "DELETE" });
      toast.success("O‘chirildi");
      setToDelete(null);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O‘chirib bo‘lmadi");
    } finally {
      setBusy(false);
    }
  };

  const startReorder = () => {
    setTab("");
    setQuery("");
    setReorder(true);
  };
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mirror rows into the sortable copy
    if (reorder && rows) setOrder(rows);
  }, [reorder, rows]);

  const saveOrder = async () => {
    setBusy(true);
    try {
      await apiFetch(`${resource.endpoint}/reorder`, { method: "POST", body: { ids: order.map((r) => r.id) } });
      toast.success("Tartib saqlandi");
      setReorder(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Saqlab bo‘lmadi");
    } finally {
      setBusy(false);
    }
  };

  const Icon = resource.icon;
  const edit = (row: Row) => router.push(`/admin/${resource.key}/${itemRef(resource, row)}`);

  return (
    <>
      <PageHeader
        title={resource.title}
        subtitle={rows ? `Jami: ${meta.count}` : "Yuklanmoqda…"}
        icon={Icon}
        actions={
          reorder ? (
            <>
              <Btn variant="ghost" onClick={() => setReorder(false)}>
                Bekor qilish
              </Btn>
              <Btn variant="turq" loading={busy} onClick={saveOrder}>
                <Check className="size-4" /> Tartibni saqlash
              </Btn>
            </>
          ) : (
            <>
              {resource.reorderable && (
                <Btn variant="ghost" onClick={startReorder}>
                  <ArrowDownUp className="size-4" /> Tartiblash
                </Btn>
              )}
              <Link href={`/admin/${resource.key}/new`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-turq px-5 text-[15px] font-semibold text-ink hover:brightness-110">
                <Plus className="size-5" /> Qo‘shish
              </Link>
            </>
          )
        }
      />

      {!reorder && (tabs.length > 0 || resource.searchable) && (
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-1 rounded-xl border border-ivory/10 bg-ink-2 p-1">
            {tabs.map((t) => (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTab(t.value);
                  setPage(1);
                }}
                className={cn("relative rounded-lg px-4 py-2 text-[15px] font-semibold", tab === t.value ? "text-ink" : "text-ivory/75 hover:text-ivory")}
              >
                {tab === t.value && <motion.span layoutId={`tab-${resource.key}`} className="absolute inset-0 rounded-lg bg-ivory" />}
                <span className="relative">{t.label}</span>
              </button>
            ))}
          </div>
          {resource.searchable && (
            <label className="flex h-12 w-full items-center gap-3 rounded-xl border border-ivory/15 bg-ink-2 px-4 md:w-80">
              <Search className="size-5 text-turq" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Qidirish…" className="h-full w-full bg-transparent outline-none" />
            </label>
          )}
        </div>
      )}

      {rows === null ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[72px] animate-pulse rounded-2xl bg-ivory/[0.05]" />
          ))}
        </div>
      ) : reorder ? (
        <>
          <p className="mb-4 text-base text-ivory/70">Qatorlarni sichqoncha bilan sudrab, kerakli tartibga keltiring — saytda shu tartibda chiqadi.</p>
          <Reorder.Group axis="y" values={order} onReorder={setOrder} className="space-y-2">
            {order.map((row, i) => (
              <Reorder.Item
                key={row.id}
                value={row}
                className="flex cursor-grab items-center gap-4 rounded-2xl border border-ivory/10 bg-ink-2 p-3 active:cursor-grabbing"
                whileDrag={{ scale: 1.02, boxShadow: "0 20px 50px -20px rgba(0,0,0,.4)" }}
              >
                <GripVertical className="size-5 text-ivory/40" />
                <span className="w-8 font-mono text-sm text-ivory/50">{i + 1}</span>
                {resource.columns.slice(0, 3).map((c) => (
                  <div key={c.key} className={c.kind === "image" ? "" : "min-w-0 flex-1"}>
                    <Cell col={c} row={row} />
                  </div>
                ))}
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </>
      ) : rows.length === 0 ? (
        <Empty
          title={search ? "Hech narsa topilmadi" : "Hozircha yozuvlar yo‘q"}
          text={search ? "Boshqa so‘z bilan qidirib ko‘ring." : `Birinchi ${resource.singular.toLowerCase()}ni qo‘shing.`}
          action={
            !search && (
              <Link href={`/admin/${resource.key}/new`} className="inline-flex h-11 items-center gap-2 rounded-xl bg-turq px-5 font-semibold text-ink">
                <Plus className="size-5" /> Qo‘shish
              </Link>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-[1.4rem] border border-ivory/10 bg-ink-2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[15px]">
              <thead>
                <tr className="border-b border-ivory/10 text-sm text-ivory/60">
                  {resource.columns.map((c) => (
                    <th key={c.key} className="px-4 py-3 font-semibold">
                      {c.label}
                    </th>
                  ))}
                  {vis && <th className="px-4 py-3 font-semibold">{vis === "active" ? "Saytda" : "E’lon"}</th>}
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {rows.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(i, 15) * 0.02 }}
                      onClick={() => edit(row)}
                      className="cursor-pointer border-b border-ivory/[0.06] transition-colors last:border-0 hover:bg-ivory/[0.04]"
                    >
                      {resource.columns.map((c) => (
                        <td key={c.key} className={cn("px-4 py-3 align-middle", c.kind === "image" && "w-16")}>
                          <Cell col={c} row={row} />
                        </td>
                      ))}
                      {vis && (
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Switch checked={Boolean(row[flag])} onChange={() => togglePublish(row)} />
                        </td>
                      )}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          {resource.preview?.(row) && (
                            <a href={resource.preview(row)!} target="_blank" rel="noreferrer" title="Saytda ko‘rish" className="grid size-10 place-items-center rounded-xl text-ivory/70 hover:bg-ivory/10 hover:text-turq">
                              <ExternalLink className="size-[18px]" />
                            </a>
                          )}
                          <button type="button" title="Tahrirlash" onClick={() => edit(row)} className="grid size-10 place-items-center rounded-xl text-ivory/70 hover:bg-ivory/10 hover:text-turq">
                            <Pencil className="size-[18px]" />
                          </button>
                          <button type="button" title="O‘chirish" onClick={() => setToDelete(row)} className="grid size-10 place-items-center rounded-xl text-ember/80 hover:bg-ember/10 hover:text-ember">
                            <Trash2 className="size-[18px]" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {meta.pages > 1 && (
            <div className="flex items-center justify-between border-t border-ivory/10 px-4 py-3">
              <span className="text-sm text-ivory/60">
                {page}-sahifa / {meta.pages}
              </span>
              <div className="flex gap-2">
                <Btn variant="ghost" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  Oldingi
                </Btn>
                <Btn variant="ghost" disabled={page >= meta.pages} onClick={() => setPage((p) => p + 1)}>
                  Keyingi
                </Btn>
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmDialog
        open={!!toDelete}
        title={`«${toDelete ? itemTitle(toDelete) : ""}» o‘chirilsinmi?`}
        text="Bu amalni qaytarib bo‘lmaydi. Yozuv va unga bog‘liq rasmlar o‘chiriladi."
        busy={busy}
        onConfirm={remove}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
