"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FilePlus2, FileText, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { formatBytes } from "@/lib/format";
import { Card, Empty, inputCls } from "./ui";

type Doc = { id: number; title: string; file: string; size: number | null; extension: string | null };

export function DocumentsManager({ projectId, projectRef }: { projectId: number; projectRef: string }) {
  const [docs, setDocs] = useState<Doc[] | null>(null);
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    apiFetch<Doc[]>(`project-documents?project=${projectId}`)
      .then(setDocs)
      .catch(() => setDocs([]));
  }, [projectId]);
  useEffect(load, [load]);

  const upload = async (files: FileList) => {
    const form = new FormData();
    [...files].forEach((f) => form.append("files", f));
    setBusy(true);
    try {
      await apiFetch(`projects/${projectRef}/documents`, { method: "POST", form });
      toast.success("Hujjatlar yuklandi");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yuklab bo‘lmadi");
    } finally {
      setBusy(false);
    }
  };

  const rename = async (doc: Doc, title: string) => {
    if (!title.trim() || title === doc.title) return;
    try {
      await apiFetch(`project-documents/${doc.id}`, { method: "PATCH", body: { title } });
      toast.success("Nomi saqlandi");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Xatolik");
    }
  };

  const remove = async (doc: Doc) => {
    if (!window.confirm(`«${doc.title}» o‘chirilsinmi?`)) return;
    try {
      await apiFetch(`project-documents/${doc.id}`, { method: "DELETE" });
      setDocs((d) => d?.filter((x) => x.id !== doc.id) ?? null);
    } catch {
      toast.error("O‘chirib bo‘lmadi");
    }
  };

  return (
    <Card>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-semibold">Hujjatlar</h2>
          <p className="text-sm text-ivory/60">PDF, Word, Excel, PowerPoint, ZIP · 25 MB gacha</p>
        </div>
        <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex h-11 items-center gap-2 rounded-xl bg-turq px-5 font-semibold text-ink disabled:opacity-60">
          {busy ? <Loader2 className="size-5 animate-spin" /> : <FilePlus2 className="size-5" />} Hujjat qo‘shish
        </button>
      </div>
      {docs === null ? (
        <div className="h-24 animate-pulse rounded-2xl bg-ivory/[0.06]" />
      ) : docs.length === 0 ? (
        <Empty title="Hujjatlar yo‘q" />
      ) : (
        <ul className="space-y-2">
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-3 rounded-2xl border border-ivory/10 bg-ink p-3">
              <FileText className="size-7 shrink-0 text-turq" />
              <input defaultValue={d.title} onBlur={(e) => rename(d, e.target.value)} className={inputCls + " py-2"} aria-label="Hujjat nomi" />
              <a href={d.file} target="_blank" rel="noreferrer" className="shrink-0 text-sm uppercase text-ivory/60 hover:text-turq">
                {d.extension} {formatBytes(d.size)}
              </a>
              <button type="button" onClick={() => remove(d)} className="grid size-10 shrink-0 place-items-center rounded-xl text-ember hover:bg-ember/10" aria-label="O‘chirish">
                <Trash2 className="size-5" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <input
        ref={input}
        type="file"
        multiple
        hidden
        accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip"
        onChange={(e) => (e.target.files?.length && upload(e.target.files), (e.target.value = ""))}
      />
    </Card>
  );
}
