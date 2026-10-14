"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { apiFetch, ApiError } from "@/lib/api/client";
import { isoToLocalInput, localInputToIso } from "@/lib/admin/dates";
import type { Field, Resource } from "@/lib/admin/resources";
import { cn } from "@/lib/utils";
import { BlocksEditor, ImageField, RelationSelect, StatsEditor } from "./fields";
import { RichEditor } from "./rich-editor";
import { Btn, Card, inputCls, Switch } from "./ui";

type Values = Record<string, unknown>;

function initialValues(fields: Field[], item: Values | null): Values {
  const v: Values = {};
  for (const f of fields) {
    const raw = item ? item[f.name] : f.defaultValue;
    if (f.type === "datetime") v[f.name] = isoToLocalInput(raw as string);
    else if (f.type === "date") v[f.name] = isoToLocalInput(raw as string, false);
    else if (f.type === "switch") v[f.name] = Boolean(raw ?? f.defaultValue ?? false);
    else if (f.type === "stats" || f.type === "blocks") v[f.name] = Array.isArray(raw) ? raw : [];
    else if (f.type === "relation") v[f.name] = (raw as number | null) ?? null;
    else if (f.type === "image" || f.type === "video") v[f.name] = (raw as string | null) ?? null;
    else v[f.name] = raw ?? "";
  }
  return v;
}

function toFormData(fields: Field[], values: Values, initial: Values, isNew: boolean) {
  const form = new FormData();
  for (const f of fields) {
    if (f.createOnly && !isNew) continue;
    const val = values[f.name];
    switch (f.type) {
      case "image":
      case "video":
        if (val instanceof File) form.append(f.name, val);
        else if (val === null && initial[f.name]) form.append(f.name, "null");
        break;
      case "switch":
        form.append(f.name, val ? "true" : "false");
        break;
      case "datetime":
        form.append(f.name, localInputToIso(String(val ?? "")));
        break;
      case "stats":
      case "blocks":
        form.append(f.name, JSON.stringify(val ?? []));
        break;
      case "relation":
        form.append(f.name, val ? String(val) : "");
        break;
      default:
        form.append(f.name, val === null || val === undefined ? "" : String(val));
    }
  }
  return form;
}

export function ResourceForm({
  resource,
  item,
  onSaved,
}: {
  resource: Resource;
  item: Values | null;
  onSaved: (saved: Values) => void;
}) {
  const isNew = !item;
  const initial = useMemo(() => initialValues(resource.fields, item), [resource, item]);
  const [values, setValues] = useState<Values>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const dirty = useMemo(() => JSON.stringify(values) !== JSON.stringify(initial), [values, initial]);

  // warn before leaving with unsaved changes
  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const set = (name: string, v: unknown) => {
    setValues((s) => ({ ...s, [name]: v }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  const save = async () => {
    const missing = resource.fields.filter((f) => f.required && !(f.createOnly && !isNew) && (values[f.name] === "" || values[f.name] === null));
    if (missing.length) {
      setErrors(Object.fromEntries(missing.map((f) => [f.name, "Majburiy maydon"])));
      toast.error("Majburiy maydonlarni to‘ldiring");
      return;
    }
    setBusy(true);
    try {
      const ref = item ? String(item[resource.lookup ?? "id"]) : "";
      const url = resource.singleton ? resource.endpoint : isNew ? resource.endpoint : `${resource.endpoint}/${ref}`;
      const saved = await apiFetch<Values>(url, {
        method: isNew && !resource.singleton ? "POST" : "PATCH",
        form: toFormData(resource.fields, values, initial, isNew),
      });
      setErrors({});
      toast.success(isNew ? `${resource.singular} qo‘shildi` : "O‘zgarishlar saqlandi");
      onSaved(saved);
    } catch (e) {
      if (e instanceof ApiError && e.errors) {
        setErrors(Object.fromEntries(Object.entries(e.errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : String(v)])));
      }
      toast.error(e instanceof Error ? e.message : "Saqlab bo‘lmadi");
    } finally {
      setBusy(false);
    }
  };

  // Ctrl/Cmd + S
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const switches = resource.fields.filter((f) => f.type === "switch");
  const main = resource.fields.filter((f) => f.type !== "switch" && !(f.createOnly && !isNew));
  const nonField = errors.non_field_errors || errors.detail;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        save();
      }}
      className="grid gap-6 xl:grid-cols-[1fr_320px]"
    >
      <Card className="grid gap-6 md:grid-cols-2">
        {main.map((f, i) => (
          <motion.div
            key={f.name}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(i, 12) * 0.03, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className={cn((f.span === 2 || ["richtext", "image", "video", "stats", "blocks"].includes(f.type)) && "md:col-span-2")}
          >
            <label className="mb-2 block text-[15px] font-semibold" htmlFor={`fld-${f.name}`}>
              {f.label}
              {f.required && <span className="text-ember"> *</span>}
            </label>
            <FieldInput field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} invalid={!!errors[f.name]} />
            {errors[f.name] ? (
              <p className="mt-2 text-sm font-semibold text-ember">{errors[f.name]}</p>
            ) : (
              f.help && <p className="mt-2 text-sm text-ivory/60">{f.help}</p>
            )}
          </motion.div>
        ))}
      </Card>

      <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
        <Card className="space-y-5">
          {switches.map((f) => (
            <Switch key={f.name} id={`fld-${f.name}`} checked={Boolean(values[f.name])} onChange={(v) => set(f.name, v)} label={f.label} />
          ))}
          {nonField && <p className="text-sm font-semibold text-ember">{nonField}</p>}
          <Btn type="submit" variant="turq" loading={busy} className="h-14 w-full text-base">
            <Save className="size-5" /> {isNew ? "Qo‘shish" : "Saqlash"}
          </Btn>
          <p className="text-center text-sm text-ivory/55">{dirty ? "Saqlanmagan o‘zgarishlar bor" : "Barcha o‘zgarishlar saqlangan"} · Ctrl+S</p>
        </Card>
      </div>
    </form>
  );
}

function FieldInput({ field: f, value, onChange, invalid }: { field: Field; value: unknown; onChange: (v: unknown) => void; invalid: boolean }) {
  const cls = cn(inputCls, invalid && "border-ember");
  const id = `fld-${f.name}`;
  switch (f.type) {
    case "textarea":
      return <textarea id={id} className={cls} rows={4} value={String(value ?? "")} placeholder={f.placeholder} onChange={(e) => onChange(e.target.value)} />;
    case "richtext":
      return <RichEditor value={String(value ?? "")} onChange={onChange} placeholder={f.placeholder} />;
    case "select":
      return (
        <select id={id} className={cls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)}>
          {f.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case "relation":
      return <RelationSelect endpoint={f.relation!.endpoint} labelKey={f.relation!.labelKey} value={(value as number | null) ?? null} onChange={onChange} />;
    case "image":
      return <ImageField value={value as File | string | null} onChange={onChange} />;
    case "video":
      return <ImageField kind="video" value={value as File | string | null} onChange={onChange} />;
    case "stats":
      return <StatsEditor value={(value as { value: string; label: string }[]) ?? []} onChange={onChange} />;
    case "blocks":
      return <BlocksEditor value={(value as { group: string; title: string; body: string }[]) ?? []} onChange={onChange} />;
    case "date":
      return <input id={id} type="date" className={cls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "datetime":
      return <input id={id} type="datetime-local" className={cls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return <input id={id} type="number" className={cls} value={String(value ?? "")} onChange={(e) => onChange(e.target.value)} />;
    default:
      return (
        <input
          id={id}
          type={f.type === "url" ? "url" : f.type === "email" ? "email" : f.type === "tel" ? "tel" : "text"}
          className={cls}
          value={String(value ?? "")}
          placeholder={f.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}
