"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api/client";
import { itemRef, itemTitle, RESOURCE_MAP, type Nested } from "@/lib/admin/resources";
import { cn } from "@/lib/utils";
import { DocumentsManager } from "./documents-manager";
import { ForumStructureEditor } from "./forum-structure";
import { ImagesManager } from "./images-manager";
import { ParticipantsEditor } from "./participants-editor";
import { ResourceForm } from "./resource-form";
import { Badge, Btn, ConfirmDialog, Empty, PageHeader } from "./ui";

type Item = Record<string, unknown> & { id: number };

const TAB_LABELS: Record<Nested, string> = {
  "news-images": "Rasmlar galereyasi",
  "gallery-images": "Suratlar",
  "project-media": "Rasm va hujjatlar",
  participants: "Ishtirokchilar",
  "forum-structure": "Nominatsiyalar",
};

export function ResourceEditor({ resourceKey, refId }: { resourceKey: string; refId?: string }) {
  const resource = RESOURCE_MAP[resourceKey];
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">(refId ? "loading" : "ready");
  const [tab, setTab] = useState<"main" | Nested>("main");
  const [confirm, setConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!resource || !refId) return;
    apiFetch<Item>(`${resource.endpoint}/${refId}`)
      .then((d) => {
        setItem(d);
        setState("ready");
      })
      .catch((e) => {
        setState("missing");
        if (!(e instanceof ApiError && e.status === 404)) toast.error(e instanceof Error ? e.message : "Yuklab bo‘lmadi");
      });
  }, [resource, refId]);

  if (!resource) return <Empty title="Bo‘lim topilmadi" />;
  if (state === "loading") return <div className="h-96 animate-pulse rounded-[1.4rem] bg-ivory/[0.05]" />;
  if (state === "missing") return <Empty title="Yozuv topilmadi" text="U o‘chirilgan bo‘lishi mumkin." />;

  const isNew = !item;
  const preview = item ? resource.preview?.(item) : null;
  const flag = resource.visibility === "active" ? "is_active" : "is_published";
  const tabs: ("main" | Nested)[] = item ? ["main", ...(resource.nested ?? [])] : ["main"];

  const remove = async () => {
    if (!item) return;
    setBusy(true);
    try {
      await apiFetch(`${resource.endpoint}/${itemRef(resource, item)}`, { method: "DELETE" });
      toast.success("O‘chirildi");
      router.replace(`/admin/${resource.key}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "O‘chirib bo‘lmadi");
      setBusy(false);
    }
  };

  return (
    <>
      <Link href={`/admin/${resource.key}`} className="mb-5 inline-flex items-center gap-2 font-semibold text-turq">
        <ArrowLeft className="size-5" /> {resource.title}
      </Link>
      <PageHeader
        title={isNew ? `Yangi: ${resource.singular.toLowerCase()}` : itemTitle(item)}
        subtitle={isNew ? "Maydonlarni to‘ldiring va «Qo‘shish»ni bosing" : undefined}
        icon={resource.icon}
        actions={
          item && (
            <>
              {resource.visibility && <Badge tone={item[flag] ? "turq" : "muted"}>{item[flag] ? "Saytda ko‘rinadi" : "Yashirin"}</Badge>}
              {preview && (
                <a href={preview} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center gap-2 rounded-xl border border-ivory/15 px-4 font-semibold hover:border-turq hover:text-turq">
                  <ExternalLink className="size-4" /> Saytda ko‘rish
                </a>
              )}
              <Btn variant="danger" onClick={() => setConfirm(true)}>
                <Trash2 className="size-4" /> O‘chirish
              </Btn>
            </>
          )
        }
      />

      {tabs.length > 1 && (
        <div className="mb-6 flex flex-wrap gap-1 rounded-xl border border-ivory/10 bg-ink-2 p-1">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn("relative rounded-lg px-4 py-2.5 text-[15px] font-semibold", tab === t ? "text-ink" : "text-ivory/75 hover:text-ivory")}
            >
              {tab === t && <motion.span layoutId="editor-tab" className="absolute inset-0 rounded-lg bg-ivory" />}
              <span className="relative">{t === "main" ? "Asosiy ma’lumot" : TAB_LABELS[t]}</span>
            </button>
          ))}
        </div>
      )}

      <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        {tab === "main" && (
          <ResourceForm
            key={String(item?.updated_at ?? "new")}
            resource={resource}
            item={item}
            onSaved={(saved) => {
              if (isNew) router.replace(`/admin/${resource.key}/${itemRef(resource, saved)}`);
              else setItem(saved as Item);
            }}
          />
        )}
        {item && tab === "news-images" && (
          <ImagesManager listEndpoint={`news-images?news=${item.id}`} uploadEndpoint={`news/${item.id}/images`} itemEndpoint="news-images" title="Rasmlar galereyasi" />
        )}
        {item && tab === "gallery-images" && (
          <ImagesManager listEndpoint={`gallery-images?gallery=${item.id}`} uploadEndpoint={`galleries/${item.id}/images`} itemEndpoint="gallery-images" title="Suratlar" />
        )}
        {item && tab === "project-media" && (
          <div className="space-y-6">
            <ImagesManager listEndpoint={`project-images?project=${item.id}`} uploadEndpoint={`projects/${item.id}/images`} itemEndpoint="project-images" title="Loyiha rasmlari" />
            <DocumentsManager projectId={item.id} projectRef={String(item.id)} />
          </div>
        )}
        {item && tab === "participants" && <ParticipantsEditor projectId={item.id} />}
        {item && tab === "forum-structure" && <ForumStructureEditor year={Number(item.year)} />}
      </motion.div>

      <ConfirmDialog
        open={confirm}
        title={`«${item ? itemTitle(item) : ""}» o‘chirilsinmi?`}
        text="Bu amalni qaytarib bo‘lmaydi."
        busy={busy}
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </>
  );
}
