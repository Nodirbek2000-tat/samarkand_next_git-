"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, ArrowUpRight, CornerDownLeft, History, Loader2, Search, X } from "lucide-react";
import type { SearchResult } from "@/lib/api/types";
import { cleanQuery, fold, groupByKind, mergeResults, MIN_QUERY, searchPages } from "@/lib/site-search";
import { cn } from "@/lib/utils";
import { SITE_NAV } from "./nav";
import { Highlight, kindIcon } from "./search-ui";

const ease = [0.16, 1, 0.3, 1] as const;
const PER_GROUP = 4;
const QUICK = [
  "/about/membership",
  "/council/members",
  "/business-environment/forum",
  "/made-in-samarkand",
  "/projects",
  "/feedback/appeals",
];
const QUICK_LINKS = QUICK.map((href) => SITE_NAV.flatMap((g) => g.children).find((c) => c.href === href)!).filter(Boolean);

// answers already fetched in this visit: typing a query again (or deleting back to it) is instant
const answers = new Map<string, SearchResult[]>();
const remember = (key: string, results: SearchResult[]) => {
  if (answers.size >= 60) answers.delete(answers.keys().next().value!);
  answers.set(key, results);
};

const NONE: SearchResult[] = [];

const RECENT_KEY = "ys-search-recent";
function readRecent(): string[] {
  try {
    const list = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(list) ? list.filter((x): x is string => typeof x === "string").slice(0, 5) : [];
  } catch {
    return [];
  }
}
function writeRecent(list: string[]) {
  try {
    if (list.length) localStorage.setItem(RECENT_KEY, JSON.stringify(list));
    else localStorage.removeItem(RECENT_KEY);
  } catch {}
}

const fullResults = (q: string, kind?: string) =>
  `/search?q=${encodeURIComponent(q)}${kind ? `&kind=${encodeURIComponent(kind)}` : ""}`;

/**
 * Live site search: menu pages answer at once, content (news, projects, people…) arrives from Django while
 * typing. ↑/↓ pick a result, Enter opens it — or, with nothing picked, the full results page.
 */
export function SearchDialog({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  // the latest server answer and the query it belongs to (null results = the request failed)
  const [answer, setAnswer] = useState<{ key: string; results: SearchResult[] | null } | null>(null);
  const [cursor, setCursor] = useState<{ key: string; i: number }>({ key: "", i: -1 });
  const [recent, setRecent] = useState(readRecent);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);

  const query = cleanQuery(q);
  const key = fold(query);
  const ready = key.length >= MIN_QUERY;

  useEffect(() => input.current?.focus(), []);

  // ask Django once the typing pauses; a newer query cancels the older request
  useEffect(() => {
    if (!ready || answers.has(key)) return;
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal, headers: { Accept: "application/json" } })
        .then((res) => (res.ok ? (res.json() as Promise<{ results: SearchResult[] }>) : Promise.reject(res.status)))
        .then(({ results }) => {
          remember(key, results);
          setAnswer({ key, results });
        })
        .catch(() => {
          if (!ctrl.signal.aborted) setAnswer({ key, results: null });
        });
    }, 220);
    return () => {
      window.clearTimeout(timer);
      ctrl.abort();
    };
  }, [key, query, ready]);

  const cached = ready ? answers.get(key) : undefined;
  const fresh = cached ?? (answer?.key === key ? answer.results : undefined);
  const loading = ready && fresh === undefined;
  const failed = ready && fresh === null;
  // while the next answer is on its way the previous one stays (dimmed) instead of flashing empty
  const content = fresh ?? (loading ? (answer?.results ?? NONE) : NONE);

  // results grouped by kind (a few per group here, the rest on the full page); `start` numbers them for ↑/↓
  const { groups, flat, total } = useMemo(() => {
    const merged = ready ? mergeResults(searchPages(query), content) : NONE;
    const groups: { kind: string; items: SearchResult[]; more: number; start: number }[] = [];
    for (const { kind, items } of groupByKind(merged)) {
      const last = groups.at(-1);
      groups.push({
        kind,
        items: items.slice(0, PER_GROUP),
        more: Math.max(0, items.length - PER_GROUP),
        start: last ? last.start + last.items.length : 0,
      });
    }
    return { groups, flat: groups.flatMap((g) => g.items), total: merged.length };
  }, [ready, query, content]);
  const active = cursor.key === key ? Math.min(cursor.i, flat.length - 1) : -1;

  const keep = (term: string) => {
    const next = [term, ...recent.filter((r) => fold(r) !== fold(term))].slice(0, 5);
    setRecent(next);
    writeRecent(next);
  };
  const open = (url: string) => {
    if (ready) keep(query);
    onClose();
    router.push(url);
  };

  const move = (step: number) => {
    if (!flat.length) return;
    const i = active < 0 ? (step > 0 ? 0 : flat.length - 1) : (active + step + flat.length) % flat.length;
    setCursor({ key, i });
    requestAnimationFrame(() => list.current?.querySelector(`#sr-${i}`)?.scrollIntoView({ block: "nearest" }));
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/70 px-3 pt-[8vh] backdrop-blur-md md:pt-[12vh]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Sayt bo‘yicha qidiruv"
        onClick={(e) => e.stopPropagation()}
        initial={{ y: -30, opacity: 0, scale: 0.97 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.5, ease }}
        className="glass flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl"
      >
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            if (active >= 0 && flat[active]) open(flat[active].url);
            else if (ready) open(fullResults(query));
          }}
          className="flex items-center gap-3 p-3 pl-5"
        >
          <Search className="size-6 shrink-0 text-turq" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                e.preventDefault();
                move(e.key === "ArrowDown" ? 1 : -1);
              }
            }}
            placeholder="Yangiliklar, loyihalar, a’zolar…"
            className="h-14 w-full min-w-0 bg-transparent text-xl text-ivory outline-none placeholder:text-ivory/45"
            role="combobox"
            aria-label="Sayt bo‘yicha qidirish"
            aria-autocomplete="list"
            aria-expanded={ready && flat.length > 0}
            aria-controls="search-results"
            aria-activedescendant={active >= 0 ? `sr-${active}` : undefined}
            enterKeyHint="search"
            maxLength={100}
          />
          {loading && <Loader2 className="size-5 shrink-0 animate-spin text-ivory/50" aria-label="Qidirilmoqda" />}
          {q && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                input.current?.focus();
              }}
              aria-label="Tozalash"
              className="grid size-9 shrink-0 place-items-center rounded-full text-ivory/60 hover:bg-ivory/10 hover:text-ivory"
            >
              <X className="size-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="hidden h-8 shrink-0 items-center rounded-lg border border-ivory/15 px-2 font-mono text-xs text-ivory/60 hover:text-ivory md:flex"
          >
            Esc
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Yopish"
            className="grid size-10 shrink-0 place-items-center rounded-full hover:bg-ivory/10 md:hidden"
          >
            <X className="size-5" />
          </button>
        </form>

        <div
          ref={list}
          id="search-results"
          role="listbox"
          aria-label="Natijalar"
          data-lenis-prevent
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-ivory/10 p-2"
        >
          {!ready ? (
            <div className="space-y-5 p-3">
              {recent.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-xs uppercase tracking-[0.16em] text-ivory/55">Oxirgi qidiruvlar</p>
                    <button
                      type="button"
                      onClick={() => {
                        setRecent([]);
                        writeRecent([]);
                      }}
                      className="text-xs text-ivory/55 hover:text-ivory"
                    >
                      tozalash
                    </button>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {recent.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => {
                          setQ(term);
                          input.current?.focus();
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ivory/15 px-3 py-1.5 text-sm hover:border-turq hover:text-turq"
                      >
                        <History className="size-3.5 opacity-60" /> {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-ivory/55">Tezkor o‘tish</p>
                <div className="mt-3 grid gap-1 sm:grid-cols-2">
                  {QUICK_LINKS.map(({ href, label, desc, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-ivory/[0.06]"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-turq/12 text-turq">
                        <Icon className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold group-hover:text-turq">{label}</span>
                        {desc && <span className="block truncate text-sm text-ivory/60">{desc}</span>}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ) : groups.length === 0 ? (
            loading ? (
              <div className="space-y-2 p-2" aria-hidden>
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-2xl bg-ivory/[0.05]" />
                ))}
              </div>
            ) : (
              <div className="px-6 py-10 text-center">
                <p className="font-display text-xl font-semibold">
                  {failed ? "Qidiruv vaqtincha ishlamayapti" : `«${query}» bo‘yicha hech narsa topilmadi`}
                </p>
                <p className="mt-2 text-ivory/65">
                  {failed ? "Birozdan so‘ng qayta urinib ko‘ring." : "Boshqa so‘z bilan urinib ko‘ring yoki bo‘limni tanlang:"}
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  {QUICK_LINKS.map(({ href, label }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className="rounded-full border border-ivory/15 px-3 py-1.5 text-sm hover:border-turq hover:text-turq"
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          ) : (
            <div className={cn("space-y-3 transition-opacity", loading && "opacity-60")}>
              {groups.map(({ kind, items, more, start }) => {
                const Icon = kindIcon(kind);
                return (
                  <section key={kind} aria-label={kind}>
                    <p className="flex items-center gap-2 px-3 pb-1 pt-2 font-mono text-xs uppercase tracking-[0.16em] text-ivory/55">
                      <Icon className="size-3.5 text-turq" /> {kind}
                    </p>
                    {items.map((r, j) => {
                      const i = start + j;
                      const on = i === active;
                      return (
                        <Link
                          key={r.url + r.title}
                          id={`sr-${i}`}
                          role="option"
                          aria-selected={on}
                          href={r.url}
                          onClick={() => {
                            keep(query);
                            onClose();
                          }}
                          onPointerMove={() => !on && setCursor({ key, i })}
                          className={cn(
                            "flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-colors",
                            on && "bg-ivory/[0.07]",
                          )}
                        >
                          <span className="min-w-0 flex-1">
                            <span className={cn("block truncate font-semibold", on && "text-turq")}>
                              <Highlight text={r.title} q={query} />
                            </span>
                            {r.text && (
                              <span className="mt-0.5 block truncate text-sm text-ivory/65">
                                <Highlight text={r.text} q={query} />
                              </span>
                            )}
                          </span>
                          {on ? (
                            <CornerDownLeft className="size-4 shrink-0 text-turq" />
                          ) : (
                            <ArrowUpRight className="size-4 shrink-0 text-ivory/35" />
                          )}
                        </Link>
                      );
                    })}
                    {more > 0 && (
                      <Link
                        href={fullResults(query, kind)}
                        onClick={(e) => {
                          e.preventDefault();
                          open(fullResults(query, kind));
                        }}
                        className="ml-3 mt-1 inline-flex items-center gap-1 text-sm font-semibold text-turq hover:underline"
                      >
                        yana {more} ta <ArrowRight className="size-3.5" />
                      </Link>
                    )}
                  </section>
                );
              })}
            </div>
          )}
        </div>

        {ready && total > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-ivory/10 px-5 py-3 text-sm">
            <span className="hidden text-ivory/55 md:inline">↑ ↓ tanlash · Enter — ochish · Esc — yopish</span>
            <Link
              href={fullResults(query)}
              onClick={(e) => {
                e.preventDefault();
                open(fullResults(query));
              }}
              className="ml-auto inline-flex items-center gap-1.5 font-semibold text-turq hover:underline"
            >
              Barcha natijalar ({total}) <ArrowRight className="size-4" />
            </Link>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
