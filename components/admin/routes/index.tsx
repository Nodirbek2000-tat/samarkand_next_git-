"use client";

import { useParams } from "next/navigation";
import { ResourceEditor } from "../resource-editor";
import { ResourceList } from "../resource-list";
import { Empty } from "../ui";
import { RESOURCE_MAP } from "@/lib/admin/resources";

export function ResourceListRoute() {
  const { resource } = useParams<{ resource: string }>();
  const config = RESOURCE_MAP[resource];
  if (!config) return <Empty title="Bo‘lim topilmadi" />;
  return <ResourceList key={resource} resource={config} />;
}

export function ResourceNewRoute() {
  const { resource } = useParams<{ resource: string }>();
  return <ResourceEditor key={`${resource}-new`} resourceKey={resource} />;
}

export function ResourceEditRoute() {
  const { resource, ref } = useParams<{ resource: string; ref: string }>();
  return <ResourceEditor key={`${resource}-${ref}`} resourceKey={resource} refId={decodeURIComponent(ref)} />;
}
