// Forum ichki sahifalari uchun ma'lumot: avval admin panel (Django API), u javob bermasa — rasmiy ro'yxat
// (lib/forum-data.ts). API nominatsiyalariga kategoriya va qisqa nom rasmiy ro'yxatdan (yoki kalit so'zdan) beriladi,
// shunda bosh sahifa va ichki sahifalar bir xil ko'rinadi.
import { api } from "@/lib/api/server";
import type { Nomination as ApiNomination, Winner as ApiWinner } from "@/lib/api/types";
import { FORUM, sortByCategory, type ForumCategory, type ForumWinner, type Nomination } from "@/lib/forum-data";

export type ForumEditionView = {
  year: number;
  resultsYear: number;
  title: string;
  date: string;
  location: string;
  intro: string;
  gallerySlug: string | null;
  nominations: Nomination[];
};

export const countWinners = (e: ForumEditionView) => e.nominations.reduce((s, n) => s + n.winners.length, 0);
export const editionCategories = (e: ForumEditionView) => [...new Set(e.nominations.map((n) => n.cat))];

const norm = (s: string) => s.toLowerCase().replace(/[‘’ʼ'`]/g, "").replace(/\s+/g, " ").trim();

/** a nomination typed in the admin panel that is not in the official list: best guess by keyword */
function guessCategory(title: string): ForumCategory {
  const t = norm(title);
  if (t.includes("lokaliz")) return "lokal";
  if (t.includes("kooperats")) return "koop";
  if (t.includes("investits")) return "invest";
  if (t.includes("eksport")) return "eksport";
  if (t.includes("brend")) return "brend";
  if (t.includes("turizm")) return "turizm";
  if (t.includes("ijtimoiy")) return "ijtimoiy";
  if (t.includes("axborot") || t.includes("jurnalist")) return "oav";
  return "tarmoq";
}

/** "2023-yilda mebel sanoatidagi …" → "Mebel sanoatidagi …" */
function shortTitle(title: string) {
  const t = title.replace(/^\d{4}-yil(da|ning)\s+/i, "");
  return t.charAt(0).toUpperCase() + t.slice(1);
}

/** "«AZIA METALL PROF» QK MChJ" → name "AZIA METALL PROF", note "QK MChJ" (the official list's style) */
function splitName(name: string, note: string) {
  const m = name.match(/^(.*?)«([^»]+)»(.*)$/);
  if (!m) return { name, note: note || undefined };
  const rest = `${m[1]} ${m[3]}`.replace(/\s+/g, " ").trim();
  return { name: m[2].trim(), note: [rest, note].filter(Boolean).join(" · ") || undefined };
}

function toPlace(level: string): ForumWinner["place"] {
  if (level === "1" || level === "2" || level === "3") return Number(level) as 1 | 2 | 3;
  return level === "special" ? "special" : "winner";
}

function fromApi(n: ApiNomination, year: number): Nomination {
  const official = FORUM.find((y) => y.year === year)?.nominations.find((l) => norm(l.official) === norm(n.title));
  return {
    cat: official?.cat ?? guessCategory(n.title),
    title: official?.title ?? shortTitle(n.title),
    official: n.title,
    winners: [...n.winners].sort((a, b) => a.order - b.order).map((w: ApiWinner) => ({ place: toPlace(w.level), ...splitName(w.name, w.note) })),
  };
}

function fromLocal(year: number): ForumEditionView | null {
  const y = FORUM.find((f) => f.year === year);
  if (!y) return null;
  return {
    year: y.year,
    resultsYear: y.resultsYear,
    title: `Samarqand viloyati sanoatchilar forumi — ${y.year}`,
    date: y.date,
    location: "",
    intro: "",
    gallerySlug: null,
    nominations: sortByCategory(y.nominations),
  };
}

/** One forum with every nomination, or null when neither the admin panel nor the official list knows the year. */
export async function getForumEdition(year: number): Promise<ForumEditionView | null> {
  const e = await api.forumEdition(year);
  if (!e || !e.nominations.length) return fromLocal(year);
  return {
    year: e.year,
    resultsYear: e.results_year,
    title: e.title,
    date: e.dates,
    location: e.location,
    intro: e.intro,
    gallerySlug: e.gallery_slug,
    nominations: sortByCategory([...e.nominations].sort((a, b) => a.order - b.order).map((n) => fromApi(n, e.year))),
  };
}

/** Every forum, oldest first (2023 → …), each with its nominations. */
export async function getForumEditions(): Promise<ForumEditionView[]> {
  const list = await api.forum();
  const years = list?.length ? list.map((e) => e.year) : FORUM.map((f) => f.year);
  const editions = await Promise.all(years.map((y) => getForumEdition(y)));
  return editions.filter((e): e is ForumEditionView => e !== null).sort((a, b) => a.year - b.year);
}
