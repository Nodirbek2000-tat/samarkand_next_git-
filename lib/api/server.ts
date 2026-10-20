import { cacheLife, cacheTag } from "next/cache";
import type {
  Announcement,
  BoardMember,
  CouncilMember,
  Film,
  ForumEdition,
  ForumEditionDetail,
  Gallery,
  GalleryDetail,
  Leader,
  Meeting,
  NewsDetail,
  NewsItem,
  Page,
  Paginated,
  Partner,
  Project,
  ProjectDetail,
  ProjectParticipant,
  Recognition,
  SearchResult,
  SiteSettings,
} from "./types";

const DJANGO_URL = process.env.DJANGO_URL ?? "http://127.0.0.1:8000";

/**
 * Cached read from Django. Every response is tagged, and Django calls /internal/revalidate
 * with the same tags on save — so pages stay fast yet show edits immediately.
 * Returns null when the backend is unreachable or the object doesn't exist.
 *
 * Content is served from the cache and refreshed in the background every hour; a visitor only waits for
 * Django if nobody opened that page for a week (it used to be one hour). «Not found» is cached the same way
 * (creating the object revalidates its tag); a failed answer is kept for a minute only, so a hiccup heals by
 * itself. Django gets 8 s at most.
 */
const CONTENT = { stale: 300, revalidate: 3600, expire: 604800 };

async function get<T>(path: string, tags: string[]): Promise<T | null> {
  "use cache";
  for (const tag of tags) cacheTag(tag);
  try {
    const res = await fetch(`${DJANGO_URL}/api/${path}`, { headers: { Accept: "application/json" }, signal: AbortSignal.timeout(8000) });
    if (res.ok) {
      const data = (await res.json()) as T;
      cacheLife(CONTENT);
      return data;
    }
    if (res.status === 404) {
      cacheLife(CONTENT);
      return null;
    }
  } catch {}
  cacheLife("minutes");
  return null;
}

const enc = encodeURIComponent;
const qs = (params: Record<string, string | number | undefined | null>) => {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "");
  return entries.length ? "?" + entries.map(([k, v]) => `${k}=${enc(String(v))}`).join("&") : "";
};

export const api = {
  settings: () => get<SiteSettings>("settings", ["settings"]),
  page: (key: string) => get<Page>(`pages/${enc(key)}`, ["pages"]),

  news: (p: { page?: number; category?: string; page_size?: number } = {}) =>
    get<Paginated<NewsItem>>(`news${qs(p)}`, ["news"]),
  newsItem: (slug: string) => get<NewsDetail>(`news/${enc(slug)}`, ["news"]),

  films: (p: { page?: number; page_size?: number } = {}) => get<Paginated<Film>>(`films${qs(p)}`, ["films"]),
  film: (slug: string) => get<Film>(`films/${enc(slug)}`, ["films"]),

  announcements: (p: { page?: number; when?: string; kind?: string; page_size?: number } = {}) =>
    get<Paginated<Announcement>>(`announcements${qs(p)}`, ["announcements"]),
  announcement: (slug: string) => get<Announcement>(`announcements/${enc(slug)}`, ["announcements"]),

  galleries: (p: { page?: number; page_size?: number } = {}) => get<Paginated<Gallery>>(`galleries${qs(p)}`, ["galleries"]),
  gallery: (slug: string) => get<GalleryDetail>(`galleries/${enc(slug)}`, ["galleries"]),

  projects: (p: { category?: string; categories?: string; status?: string; page_size?: number; page?: number } = {}) =>
    get<Paginated<Project>>(`projects${qs({ page_size: 50, ...p })}`, ["projects"]),
  project: (slug: string) => get<ProjectDetail>(`projects/${enc(slug)}`, ["projects"]),
  participants: (projectSlug: string) =>
    get<ProjectParticipant[]>(`project-participants${qs({ project__slug: projectSlug })}`, ["projects"]),

  councilMembers: () => get<CouncilMember[]>("council-members", ["council"]),
  councilMember: (slug: string) => get<CouncilMember>(`council-members/${enc(slug)}`, ["council"]),
  boardMembers: () => get<BoardMember[]>("board-members", ["council"]),
  boardMember: (slug: string) => get<BoardMember>(`board-members/${enc(slug)}`, ["council"]),
  leaders: () => get<Leader[]>("leaders", ["council"]),
  meetings: () => get<Paginated<Meeting>>("meetings?page_size=100", ["council"]),
  recognitions: () => get<Recognition[]>("recognitions", ["council"]),

  forum: () => get<ForumEdition[]>("forum", ["forum"]),
  forumEdition: (year: string | number) => get<ForumEditionDetail>(`forum/${enc(String(year))}`, ["forum"]),

  partners: () => get<Partner[]>("partners", ["partners"]),
  telegram: () =>
    get<{ enabled: boolean; bot_username: string; bot_url: string; code_ttl: number }>("auth/telegram", ["settings"]),
  search: (q: string) => get<{ query: string; results: SearchResult[] }>(`search${qs({ q })}`, [
      "search", "pages", "news", "projects", "announcements", "council", "forum", "films", "galleries", "partners",
    ]),
};
