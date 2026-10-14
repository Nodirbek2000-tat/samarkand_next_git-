// Locale-independent Uzbek formatting (identical on server and client — no hydration drift).

const MONTHS = [
  "yanvar", "fevral", "mart", "aprel", "may", "iyun",
  "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr",
];

const TZ_OFFSET_MIN = 5 * 60; // Asia/Samarkand, UTC+5, no DST

function parts(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  // date-only strings ("2025-09-29") are calendar dates already
  const shifted = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? d : new Date(d.getTime() + TZ_OFFSET_MIN * 60_000);
  return {
    y: shifted.getUTCFullYear(),
    m: shifted.getUTCMonth(),
    d: shifted.getUTCDate(),
    hh: String(shifted.getUTCHours()).padStart(2, "0"),
    mm: String(shifted.getUTCMinutes()).padStart(2, "0"),
  };
}

/** "29-sentabr, 2025" */
export function formatDate(iso?: string | null) {
  const p = iso ? parts(iso) : null;
  return p ? `${p.d}-${MONTHS[p.m]}, ${p.y}` : "";
}

/** "29-sentabr, 2025 · 10:00" */
export function formatDateTime(iso?: string | null) {
  const p = iso ? parts(iso) : null;
  return p ? `${p.d}-${MONTHS[p.m]}, ${p.y} · ${p.hh}:${p.mm}` : "";
}

export function dayMonth(iso?: string | null) {
  const p = iso ? parts(iso) : null;
  return p ? { day: String(p.d).padStart(2, "0"), month: MONTHS[p.m], year: p.y } : null;
}

export function formatBytes(size?: number | null) {
  if (!size) return "";
  if (size < 1024 * 1024) return `${Math.max(1, Math.round(size / 1024))} KB`;
  return `${(size / 1024 / 1024).toFixed(1)} MB`;
}

export function stripHtml(html: string, max = 180) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + "…" : text;
}

/** Stable small hash for generative artwork. */
export function hashString(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return Math.abs(h);
}

/** YouTube watch / short / embed URLs -> embed URL. */
export function youtubeEmbed(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? `https://www.youtube-nocookie.com/embed/${m[1]}` : null;
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}
