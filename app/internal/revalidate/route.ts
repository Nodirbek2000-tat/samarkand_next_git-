import { revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";

const SECRET = process.env.NEXT_REVALIDATE_SECRET ?? "dev-revalidate-secret";

/**
 * Called by Django (post_save / post_delete signals) whenever content changes.
 * `expire: 0` makes the very next visit render fresh data, so admins see their edits at once.
 */
export async function POST(request: NextRequest) {
  if (request.headers.get("x-revalidate-secret") !== SECRET) {
    return Response.json({ ok: false }, { status: 401 });
  }
  const body = (await request.json().catch(() => null)) as { tags?: unknown } | null;
  const tags = Array.isArray(body?.tags) ? body.tags.filter((t): t is string => typeof t === "string") : [];
  for (const tag of tags.slice(0, 50)) revalidateTag(tag, { expire: 0 });
  return Response.json({ ok: true, tags });
}
