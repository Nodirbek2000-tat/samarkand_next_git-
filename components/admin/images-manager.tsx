"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, rectSortingStrategy, SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ImagePlus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import { Card, Empty } from "./ui";

type Img = { id: number; image: string; caption: string; order: number };

function Tile({ img, onCaption, onDelete }: { img: Img; onCaption: (v: string) => void; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: img.id });
  const [caption, setCaption] = useState(img.caption);
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group overflow-hidden rounded-2xl border border-ivory/10 bg-ink", isDragging && "z-10 opacity-80 shadow-2xl")}
    >
      <div className="relative aspect-[4/3]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img.image} alt={img.caption} className="size-full object-cover" />
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="absolute left-2 top-2 grid size-9 cursor-grab place-items-center rounded-lg bg-black/60 text-white backdrop-blur active:cursor-grabbing"
          aria-label="Sudrab tartiblash"
        >
          <GripVertical className="size-4" />
        </button>
        <button type="button" onClick={onDelete} className="absolute right-2 top-2 grid size-9 place-items-center rounded-lg bg-ember text-white opacity-0 transition-opacity group-hover:opacity-100" aria-label="O‘chirish">
          <Trash2 className="size-4" />
        </button>
      </div>
      <input
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        onBlur={() => caption !== img.caption && onCaption(caption)}
        placeholder="Izoh (ixtiyoriy)"
        className="w-full bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-ivory/40"
      />
    </div>
  );
}

export function ImagesManager({
  listEndpoint,
  uploadEndpoint,
  itemEndpoint,
  title = "Rasmlar",
}: {
  listEndpoint: string;
  uploadEndpoint: string;
  itemEndpoint: string;
  title?: string;
}) {
  const [images, setImages] = useState<Img[] | null>(null);
  const [uploading, setUploading] = useState(0);
  const [drag, setDrag] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const load = useCallback(() => {
    apiFetch<Img[]>(listEndpoint)
      .then(setImages)
      .catch(() => setImages([]));
  }, [listEndpoint]);
  useEffect(load, [load]);

  const upload = async (files: FileList | File[]) => {
    const list = [...files].filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    const tooBig = list.filter((f) => f.size > 10 * 1024 * 1024);
    if (tooBig.length) toast.error(`${tooBig.length} ta rasm 10 MB dan katta — o‘tkazib yuborildi`);
    const ok = list.filter((f) => f.size <= 10 * 1024 * 1024);
    // upload in small batches so one big set doesn't hit request limits
    setUploading(ok.length);
    try {
      for (let i = 0; i < ok.length; i += 6) {
        const form = new FormData();
        ok.slice(i, i + 6).forEach((f) => form.append("files", f));
        await apiFetch(uploadEndpoint, { method: "POST", form });
        setUploading(Math.max(0, ok.length - i - 6));
      }
      toast.success(`${ok.length} ta rasm yuklandi`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yuklab bo‘lmadi");
    } finally {
      setUploading(0);
      load();
    }
  };

  const onDragEnd = async ({ active, over }: DragEndEvent) => {
    if (!images || !over || active.id === over.id) return;
    const next = arrayMove(images, images.findIndex((i) => i.id === active.id), images.findIndex((i) => i.id === over.id));
    setImages(next);
    try {
      await apiFetch(`${itemEndpoint}/reorder`, { method: "POST", body: { ids: next.map((i) => i.id) } });
    } catch {
      toast.error("Tartibni saqlab bo‘lmadi");
      load();
    }
  };

  const caption = async (img: Img, value: string) => {
    try {
      await apiFetch(`${itemEndpoint}/${img.id}`, { method: "PATCH", body: { caption: value } });
      toast.success("Izoh saqlandi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  const remove = async (img: Img) => {
    if (!window.confirm("Rasm o‘chirilsinmi?")) return;
    setImages((l) => l?.filter((i) => i.id !== img.id) ?? null);
    try {
      await apiFetch(`${itemEndpoint}/${img.id}`, { method: "DELETE" });
    } catch {
      toast.error("O‘chirib bo‘lmadi");
      load();
    }
  };

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">{title}</h2>
          <p className="text-sm text-ivory/60">Bir nechta rasmni birdaniga tanlang yoki shu yerga tashlang. Sudrab tartiblang.</p>
        </div>
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={uploading > 0}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-turq px-5 font-semibold text-ink disabled:opacity-60"
        >
          {uploading ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
          {uploading ? `Yuklanmoqda (${uploading})…` : "Rasm qo‘shish"}
        </button>
      </div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (e.dataTransfer.files.length) upload(e.dataTransfer.files);
        }}
        className={cn("rounded-2xl transition-colors", drag && "bg-turq/10 ring-2 ring-turq")}
      >
        {images === null ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-ivory/[0.06]" />
            ))}
          </div>
        ) : images.length === 0 ? (
          <Empty title="Rasmlar yo‘q" text="Rasmlarni shu maydonga sudrab tashlang yoki «Rasm qo‘shish» tugmasini bosing." />
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={images.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {images.map((img) => (
                  <Tile key={img.id} img={img} onCaption={(v) => caption(img, v)} onDelete={() => remove(img)} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => (e.target.files && upload(e.target.files), (e.target.value = ""))} />
    </Card>
  );
}
