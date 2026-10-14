// <input type="datetime-local"> works in wall-clock time; the site lives in Samarkand (UTC+5, no DST).
const OFFSET_MS = 5 * 60 * 60 * 1000;

export function isoToLocalInput(iso: string | null | undefined, withTime = true) {
  if (!iso) return "";
  if (!withTime && /^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const local = new Date(d.getTime() + OFFSET_MS).toISOString();
  return withTime ? local.slice(0, 16) : local.slice(0, 10);
}

/** "2025-09-29T10:00" (Samarkand wall clock) -> ISO with explicit offset, unambiguous for Django. */
export function localInputToIso(value: string) {
  return value ? `${value}:00+05:00` : "";
}
