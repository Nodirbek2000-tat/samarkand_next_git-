"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, Reorder } from "motion/react";
import { Film, GripVertical, ImageUp, Plus, Trash2, X } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { inputCls } from "./ui";

const MAX_IMAGE_MB = 10;
const MAX_VIDEO_MB = 500;

/** Image (or video) picker: drop or click, instant preview, remove. Value is a File (new), a URL (existing) or null (removed). */
export function ImageField({
  value,
  onChange,
  kind = "image",
}: {
  value: File | string | null;
  onChange: (v: File | string | null) => void;
  kind?: "image" | "video";
}) {
  const video = kind === "video";
  const maxMb = video ? MAX_VIDEO_MB : MAX_IMAGE_MB;
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // object URL is created in the event handler (not during render) and released when replaced/unmounted
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  useEffect(() => () => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
  }, []);
  const preview = value instanceof File ? localUrl : typeof value === "string" && value ? value : null;

  const pick = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith(video ? "video/" : "image/")) return setError(video ? "Faqat video fayl tanlang." : "Faqat rasm fayli tanlang.");
    if (file.size > maxMb * 1024 * 1024) return setError(`Fayl hajmi ${maxMb} MB dan oshmasin.`);
    setError(null);
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = URL.createObjectURL(file);
    setLocalUrl(urlRef.current);
    onChange(file);
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          pick(e.dataTransfer.files[0]);
        }}
        className={cn(
          "relative flex min-h-[180px] items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          drag ? "border-turq bg-turq/10" : "border-ivory/20 bg-ink",
        )}
      >
        {preview ? (
          <>
            {video ? (
              <video src={preview} controls preload="metadata" className="max-h-[320px] w-full bg-black" />
            ) : (
              // local object URLs / media previews — next/image adds nothing here
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="max-h-[320px] w-full object-contain" />
            )}
            <div className="absolute right-3 top-3 flex gap-2">
              <button type="button" onClick={() => input.current?.click()} className="rounded-lg bg-black/60 px-3 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/80">
                Almashtirish
              </button>
              <button type="button" onClick={() => onChange(null)} className="grid size-9 place-items-center rounded-lg bg-ember text-white" aria-label={video ? "Videoni olib tashlash" : "Rasmni olib tashlash"}>
                <X className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <button type="button" onClick={() => input.current?.click()} className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-turq/15 text-turq">
              {video ? <Film className="size-7" /> : <ImageUp className="size-7" />}
            </span>
            <span className="text-base font-semibold">{video ? "Videoni" : "Rasmni"} shu yerga tashlang yoki tanlang</span>
            <span className="text-sm text-ivory/60">{video ? "MP4, WEBM, MOV" : "JPG, PNG, WEBP"} · {maxMb} MB gacha</span>
          </button>
        )}
      </div>
      {error && <p className="mt-2 text-sm font-semibold text-ember">{error}</p>}
      <input ref={input} type="file" accept={video ? "video/*" : "image/*"} hidden onChange={(e) => (pick(e.target.files?.[0]), (e.target.value = ""))} />
    </div>
  );
}

type Stat = { value: string; label: string };

export function StatsEditor({ value, onChange }: { value: Stat[]; onChange: (v: Stat[]) => void }) {
  const set = (i: number, patch: Partial<Stat>) => onChange(value.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  return (
    <div className="space-y-2">
      <AnimatePresence initial={false}>
        {value.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-[110px_1fr_auto] gap-2"
          >
            <input className={inputCls} value={s.value} onChange={(e) => set(i, { value: e.target.value })} placeholder="406" aria-label="Qiymat" />
            <input className={inputCls} value={s.label} onChange={(e) => set(i, { label: e.target.value })} placeholder="korxona katalogda" aria-label="Izoh" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="grid size-12 place-items-center rounded-xl text-ember hover:bg-ember/10" aria-label="O‘chirish">
              <Trash2 className="size-5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
      {value.length < 6 && (
        <button type="button" onClick={() => onChange([...value, { value: "", label: "" }])} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-semibold text-turq hover:bg-turq/10">
          <Plus className="size-4" /> Raqam qo‘shish
        </button>
      )}
    </div>
  );
}

type Block = { group: string; title: string; body: string; _k?: string };

let blockKey = 0;
const withKeys = (blocks: Block[]) => blocks.map((b) => (b._k ? b : { ...b, _k: `b${blockKey++}` }));

/** Repeater for structured page cards; drag to reorder. */
export function BlocksEditor({ value, onChange }: { value: Block[]; onChange: (v: Block[]) => void }) {
  const [items, setItems] = useState<Block[]>(() => withKeys(value));
  useEffect(() => {
    // keep local keys stable while syncing outward
    onChange(items.map((b) => ({ group: b.group, title: b.title, body: b.body })));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  const set = (k: string, patch: Partial<Block>) => setItems((list) => list.map((b) => (b._k === k ? { ...b, ...patch } : b)));
  const groups = [...new Set(items.map((b) => b.group).filter(Boolean))];

  return (
    <div className="space-y-3">
      {groups.length > 0 && (
        <p className="text-sm text-ivory/60">Guruhlar: {groups.join(", ")} — sahifa dizayni shu guruh nomlariga qarab kartochkalarni joylashtiradi.</p>
      )}
      <Reorder.Group axis="y" values={items} onReorder={setItems} className="space-y-3">
        {items.map((b) => (
          <Reorder.Item key={b._k} value={b} className="rounded-xl border border-ivory/10 bg-ink p-3">
            <div className="flex gap-3">
              <GripVertical className="mt-3 size-5 shrink-0 cursor-grab text-ivory/40 active:cursor-grabbing" />
              <div className="grid flex-1 gap-2 md:grid-cols-[160px_1fr]">
                <input className={inputCls} value={b.group} onChange={(e) => set(b._k!, { group: e.target.value })} placeholder="guruh" aria-label="Guruh" />
                <input className={inputCls} value={b.title} onChange={(e) => set(b._k!, { title: e.target.value })} placeholder="Sarlavha" aria-label="Sarlavha" />
                <textarea
                  className={cn(inputCls, "md:col-span-2")}
                  rows={2}
                  value={b.body}
                  onChange={(e) => set(b._k!, { body: e.target.value })}
                  placeholder="Matn"
                  aria-label="Matn"
                />
              </div>
              <button type="button" onClick={() => setItems((l) => l.filter((x) => x._k !== b._k))} className="grid size-11 shrink-0 place-items-center rounded-xl text-ember hover:bg-ember/10" aria-label="O‘chirish">
                <Trash2 className="size-5" />
              </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
      <button
        type="button"
        onClick={() => setItems((l) => [...l, { group: l[l.length - 1]?.group ?? "", title: "", body: "", _k: `b${blockKey++}` }])}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-[15px] font-semibold text-turq hover:bg-turq/10"
      >
        <Plus className="size-4" /> Kartochka qo‘shish
      </button>
    </div>
  );
}

type Option = { id: number; label: string };

export function RelationSelect({
  endpoint,
  labelKey,
  value,
  onChange,
}: {
  endpoint: string;
  labelKey: string;
  value: number | null;
  onChange: (v: number | null) => void;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    apiFetch<Record<string, unknown>[] | { results: Record<string, unknown>[] }>(endpoint)
      .then((d) => {
        const rows = Array.isArray(d) ? d : d.results;
        setOptions(rows.map((r) => ({ id: Number(r.id), label: String(r[labelKey]) })));
      })
      .catch(() => setOptions([]));
  }, [endpoint, labelKey]);
  return (
    <select className={inputCls} value={value ?? ""} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}>
      <option value="">— Tanlanmagan —</option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
