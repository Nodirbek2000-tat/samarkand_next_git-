import { SITE_NAV } from "@/components/site/nav";
import type { SearchResult } from "@/lib/api/types";

/**
 * The part of site search that needs no server: the menu pages themselves («A’zolik», «Murojaat yuborish»…),
 * so a visitor typing a section name lands on it at once. Content (news, projects, people…) comes from
 * /api/search; both lists are merged here, shared by the header search and the /search page.
 */

// Uzbek apostrophes are typed many ways (o'zbek, o‘zbek, oʻzbek, o`zbek): any of them finds the others
const APOSTROPHES = "'‘’`ʻʼ";
const APOS_RE = new RegExp(`[${APOSTROPHES}]`, "g");

export const MIN_QUERY = 2;

/** Lower case + one kind of apostrophe. */
export const fold = (s: string) => s.toLowerCase().replace(APOS_RE, "'");

export const cleanQuery = (q: string) => q.split(/\s+/).filter(Boolean).join(" ").slice(0, 100);

const words = (q: string) => fold(cleanQuery(q)).split(" ").filter(Boolean).slice(0, 6);

type Entry = SearchResult & { haystack: string; name: string };

const PAGES: Entry[] = (() => {
  const seen = new Set<string>();
  const list: Entry[] = [];
  const push = (title: string, text: string, url: string, extra = "") => {
    if (seen.has(url)) return;
    seen.add(url);
    list.push({ kind: "Sahifa", title, text, url, name: fold(title), haystack: fold(`${title} ${text} ${extra}`) });
  };
  for (const group of SITE_NAV) for (const link of group.children) push(link.label, link.desc ?? "", link.href, group.label);
  push("Bosh sahifa", "Yangi Samarqand tadbirkorlar kengashi", "/", "asosiy");
  push("Shaxsiy kabinet", "Profil va murojaatlaringiz tarixi", "/kabinet", "kirish profil akkaunt");
  return list;
})();

/** Menu pages whose name or description holds every word; the ones named so come first. */
export function searchPages(q: string): SearchResult[] {
  const w = words(q);
  if (fold(cleanQuery(q)).length < MIN_QUERY) return [];
  return PAGES.filter((p) => w.every((x) => p.haystack.includes(x)))
    .sort((a, b) => Number(!w.every((x) => b.name.includes(x))) - Number(!w.every((x) => a.name.includes(x))))
    .slice(0, 6)
    .map(({ kind, title, text, url }) => ({ kind, title, text, url }));
}

/** Menu pages first, then content; an address already listed is not repeated. */
export function mergeResults(pages: SearchResult[], content: SearchResult[]) {
  const urls = new Set<string>();
  return [...pages, ...content].filter((r) => {
    if (urls.has(r.url)) return false;
    urls.add(r.url);
    return true;
  });
}

/** Results grouped by kind, in the order the kinds first appear. */
export function groupByKind(results: SearchResult[]) {
  const groups = new Map<string, SearchResult[]>();
  for (const r of results) {
    const list = groups.get(r.kind);
    if (list) list.push(r);
    else groups.set(r.kind, [r]);
  }
  return [...groups].map(([kind, items]) => ({ kind, items }));
}

/** Splits `text` into plain and matching parts (for <mark>), apostrophe- and case-insensitive. */
export function splitMatches(text: string, q: string): { part: string; hit: boolean }[] {
  const w = words(q).filter((x) => x.length >= 2);
  if (!text || !w.length) return [{ part: text, hit: false }];
  const pattern = w
    .sort((a, b) => b.length - a.length)
    .map((x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/'/g, `[${APOSTROPHES}]`))
    .join("|");
  const whole = new RegExp(`^(?:${pattern})$`, "iu");
  return text
    .split(new RegExp(`(${pattern})`, "giu"))
    .filter(Boolean)
    .map((part) => ({ part, hit: whole.test(part) }));
}
