"use client";

import { useEffect, useId } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  Underline,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { cn } from "@/lib/utils";

export function RichEditor({ value, onChange, placeholder }: { value: string; onChange: (html: string) => void; placeholder?: string }) {
  const fileInputId = useId();
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" } },
      }),
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      Placeholder.configure({ placeholder: placeholder ?? "Matnni shu yerga yozing…" }),
    ],
    content: value || "",
    editorProps: { attributes: { class: "rich min-h-[260px] px-5 py-4 outline-none" } },
    onUpdate: ({ editor }) => onChange(editor.isEmpty ? "" : editor.getHTML()),
  });

  // external value changes (e.g. after the record loads)
  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) editor.commands.setContent(value || "", { emitUpdate: false });
  }, [value, editor]);

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            h2: e.isActive("heading", { level: 2 }),
            h3: e.isActive("heading", { level: 3 }),
            ul: e.isActive("bulletList"),
            ol: e.isActive("orderedList"),
            quote: e.isActive("blockquote"),
            link: e.isActive("link"),
            canUndo: e.can().undo(),
            canRedo: e.can().redo(),
          }
        : null,
  });

  if (!editor) return <div className="h-[320px] animate-pulse rounded-xl bg-ivory/[0.06]" />;

  const setLink = () => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Havola (https://…)", prev ?? "https://");
    if (url === null) return;
    if (!url || url === "https://") editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const upload = async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const id = toast.loading("Rasm yuklanmoqda…");
    try {
      const res = await apiFetch<{ file: string }>("uploads/editor", { method: "POST", form });
      editor.chain().focus().setImage({ src: res.file, alt: file.name }).run();
      toast.success("Rasm qo‘shildi", { id });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Yuklab bo‘lmadi", { id });
    }
  };

  const tools: { icon: typeof Bold; label: string; on?: boolean; run: () => void; disabled?: boolean }[][] = [
    [
      { icon: Heading2, label: "Sarlavha", on: state?.h2, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
      { icon: Heading3, label: "Kichik sarlavha", on: state?.h3, run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    ],
    [
      { icon: Bold, label: "Qalin", on: state?.bold, run: () => editor.chain().focus().toggleBold().run() },
      { icon: Italic, label: "Kursiv", on: state?.italic, run: () => editor.chain().focus().toggleItalic().run() },
      { icon: Underline, label: "Tagiga chizish", on: state?.underline, run: () => editor.chain().focus().toggleUnderline().run() },
    ],
    [
      { icon: List, label: "Ro‘yxat", on: state?.ul, run: () => editor.chain().focus().toggleBulletList().run() },
      { icon: ListOrdered, label: "Raqamli ro‘yxat", on: state?.ol, run: () => editor.chain().focus().toggleOrderedList().run() },
      { icon: Quote, label: "Iqtibos", on: state?.quote, run: () => editor.chain().focus().toggleBlockquote().run() },
      { icon: Minus, label: "Ajratuvchi chiziq", run: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    [
      { icon: Link2, label: "Havola", on: state?.link, run: setLink },
      { icon: ImagePlus, label: "Rasm", run: () => document.getElementById(fileInputId)?.click() },
      { icon: RemoveFormatting, label: "Formatni tozalash", run: () => editor.chain().focus().unsetAllMarks().clearNodes().run() },
    ],
    [
      { icon: Undo2, label: "Bekor qilish", run: () => editor.chain().focus().undo().run(), disabled: !state?.canUndo },
      { icon: Redo2, label: "Qaytarish", run: () => editor.chain().focus().redo().run(), disabled: !state?.canRedo },
    ],
  ];

  return (
    <div className="overflow-hidden rounded-xl border border-ivory/15 bg-ink focus-within:border-turq">
      <div className="flex flex-wrap items-center gap-1 border-b border-ivory/10 bg-ink-2 p-2">
        {tools.map((group, gi) => (
          <div key={gi} className="flex items-center gap-1 border-r border-ivory/10 pr-1 last:border-0">
            {group.map(({ icon: Icon, label, on, run, disabled }) => (
              <button
                key={label}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={on}
                disabled={disabled}
                onClick={run}
                className={cn(
                  "grid size-9 place-items-center rounded-lg transition-colors disabled:opacity-30",
                  on ? "bg-turq text-ink" : "text-ivory/80 hover:bg-ivory/10",
                )}
              >
                <Icon className="size-[18px]" />
              </button>
            ))}
          </div>
        ))}
      </div>
      <EditorContent editor={editor} />
      <input
        id={fileInputId}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) upload(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
