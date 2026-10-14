"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Reports the current pathname to a parent. Render it inside <Suspense> so layouts that only need
 * the path for highlighting/menus don't turn dynamic routes into blocking renders.
 */
export function PathWatcher({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  useEffect(() => onChange(pathname), [pathname, onChange]);
  return null;
}
