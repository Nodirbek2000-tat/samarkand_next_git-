"use client";

import { useEffect, useState } from "react";
import { Settings } from "lucide-react";
import { apiFetch } from "@/lib/api/client";
import { SETTINGS_RESOURCE } from "@/lib/admin/resources";
import { useAdmin } from "./admin-context";
import { ResourceForm } from "./resource-form";
import { Empty, PageHeader } from "./ui";

export function SettingsPage() {
  const { user } = useAdmin();
  const [item, setItem] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    apiFetch<Record<string, unknown>>("settings").then(setItem).catch(() => setItem({}));
  }, []);

  if (!user.is_superuser) return <Empty title="Bu bo‘lim faqat administratorlar uchun" />;

  return (
    <>
      <PageHeader title="Sayt sozlamalari" subtitle="Kontaktlar, ijtimoiy tarmoqlar va saytdagi asosiy raqamlar" icon={Settings} />
      {item ? (
        <ResourceForm key={String(item.updated_at ?? "s")} resource={SETTINGS_RESOURCE} item={item} onSaved={setItem} />
      ) : (
        <div className="h-96 animate-pulse rounded-[1.4rem] bg-ivory/[0.05]" />
      )}
    </>
  );
}
