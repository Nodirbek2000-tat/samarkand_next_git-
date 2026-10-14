import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CalendarDays, Camera, Clock, Eye, MapPin, Play } from "lucide-react";
import type { Announcement, BoardMember, CouncilMember, Film, Gallery, Leader, NewsItem, Project } from "@/lib/api/types";
import { dayMonth, formatDate, formatDateTime, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Cover } from "./cover";

const card =
  "group relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-ivory/10 bg-ink-2 transition-[transform,box-shadow,border-color] duration-700 ease-expo hover:-translate-y-1.5 hover:border-turq/40 hover:shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--color-turq)_55%,transparent)]";
const zoom = "transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.06]";

export function ProjectCard({ project, className }: { project: Project; className?: string }) {
  return (
    <Link href={`/projects/${project.slug}`} data-cursor="view" data-cursor-label="Ochish" className={cn(card, className)}>
      <div className="relative aspect-[16/10] overflow-hidden">
        <Cover src={project.cover} alt={project.title} seed={project.slug} className={cn("absolute inset-0", zoom)} />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[13px] font-semibold text-[#0b1424]">{project.category_label}</span>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-[13px] font-semibold",
              project.status === "completed" ? "bg-[#a5620b] text-white" : "bg-[#007f78] text-white",
            )}
          >
            {project.status_label}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <h3 className="font-display text-xl font-semibold leading-snug md:text-2xl">{project.title}</h3>
        {project.summary && <p className="mt-3 line-clamp-3 text-base leading-relaxed text-ivory/80">{project.summary}</p>}
        {project.stats?.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-3 border-t border-ivory/10 pt-5">
            {project.stats.slice(0, 2).map((s) => (
              <div key={s.label}>
                <dt className="font-display text-2xl font-semibold text-turq">{s.value}</dt>
                <dd className="mt-1 text-sm text-ivory/70">{s.label}</dd>
              </div>
            ))}
          </dl>
        )}
        <span className="mt-auto flex items-center gap-2 pt-6 font-semibold text-turq">
          Batafsil <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}

export function NewsCard({ item, featured = false, className }: { item: NewsItem; featured?: boolean; className?: string }) {
  return (
    <Link href={`/news/${item.slug}`} data-cursor="view" data-cursor-label="O‘qish" className={cn(card, featured && "lg:flex-row", className)}>
      <div className={cn("relative overflow-hidden", featured ? "aspect-[16/10] lg:aspect-auto lg:w-[58%]" : "aspect-[16/10]")}>
        <Cover src={item.cover} alt={item.title} seed={item.slug} className={cn("absolute inset-0", zoom)} sizes={featured ? "60vw" : undefined} />
        <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[13px] font-semibold text-[#0b1424]">
          {item.category_label}
        </span>
      </div>
      <div className={cn("flex flex-1 flex-col p-6 md:p-7", featured && "lg:p-10")}>
        <div className="flex flex-wrap items-center gap-4 text-sm text-ivory/70">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="size-4 text-turq" /> {formatDate(item.published_at)}
          </span>
          {item.views > 0 && (
            <span className="flex items-center gap-1.5">
              <Eye className="size-4" /> {item.views}
            </span>
          )}
        </div>
        <h3 className={cn("mt-4 font-display font-semibold leading-snug", featured ? "text-2xl md:text-4xl" : "text-xl md:text-2xl")}>
          {item.title}
        </h3>
        {item.excerpt && (
          <p className={cn("mt-3 text-base leading-relaxed text-ivory/80", featured ? "line-clamp-5 md:text-lg" : "line-clamp-3")}>
            {item.excerpt}
          </p>
        )}
        <span className="mt-auto flex items-center gap-2 pt-6 font-semibold text-turq">
          O‘qish <ArrowUpRight className="size-4 transition-transform duration-500 ease-expo group-hover:rotate-45" />
        </span>
      </div>
    </Link>
  );
}

type PersonLike = Pick<CouncilMember, "full_name" | "photo" | "slug"> & { subtitle?: string; meta?: string };

export function PersonCard({ person, href, badge, className }: { person: PersonLike; href?: string; badge?: string; className?: string }) {
  const body = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-gradient-to-br from-turq/15 via-lapis/10 to-gold/15">
        {person.photo ? (
          <Image src={person.photo} alt={person.full_name} fill sizes="(min-width:1024px) 25vw, 50vw" className={cn("object-cover", zoom)} />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <svg viewBox="0 0 200 200" className="absolute inset-0 size-full opacity-[0.18]" fill="none" stroke="currentColor" strokeWidth="0.6" aria-hidden>
              {Array.from({ length: 8 }).map((_, i) => (
                <rect key={i} x="40" y="40" width="120" height="120" transform={`rotate(${i * 11.25} 100 100)`} />
              ))}
            </svg>
            <span className="relative font-display text-6xl font-bold text-turq/80">{initials(person.full_name)}</span>
          </div>
        )}
        {badge && (
          <span className="absolute left-4 top-4 rounded-full bg-[#a5620b] px-3 py-1 text-[13px] font-semibold text-white">{badge}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3 className="font-display text-lg font-semibold leading-snug md:text-xl">{person.full_name}</h3>
        {person.subtitle && <p className="mt-2 text-[15px] leading-relaxed text-ivory/80">{person.subtitle}</p>}
        {person.meta && <p className="mt-auto pt-4 text-sm font-semibold text-turq">{person.meta}</p>}
      </div>
    </>
  );
  return href ? (
    <Link href={href} data-cursor="view" data-cursor-label="Profil" className={cn(card, className)}>
      {body}
    </Link>
  ) : (
    <div className={cn(card, className)}>{body}</div>
  );
}

export const memberToPerson = (m: CouncilMember): PersonLike => ({
  ...m,
  subtitle: m.company,
  meta: m.position,
});
export const boardToPerson = (m: BoardMember): PersonLike => ({ ...m, subtitle: m.workplace, meta: m.role_label });
export const leaderToPerson = (m: Leader): PersonLike => ({
  ...m,
  subtitle: [m.position, m.organization].filter(Boolean).join(" · "),
  meta: m.reception_hours ? `Qabul: ${m.reception_hours}` : undefined,
});

export function GalleryCard({ gallery, className }: { gallery: Gallery; className?: string }) {
  const previews = gallery.preview.length ? gallery.preview : [];
  return (
    <Link href={`/gallery/${gallery.slug}`} data-cursor="view" data-cursor-label="Ko‘rish" className={cn(card, className)}>
      <div className="relative aspect-[4/3] overflow-hidden">
        {previews.length >= 3 ? (
          <div className={cn("absolute inset-0 grid grid-cols-3 grid-rows-2 gap-1", zoom)}>
            {previews.slice(0, 3).map((src, i) => (
              <div key={src} className={cn("relative", i === 0 && "col-span-2 row-span-2")}>
                <Image src={src} alt="" fill sizes="30vw" className="object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <Cover src={gallery.cover || previews[0]} alt={gallery.title} seed={gallery.slug} className={cn("absolute inset-0", zoom)} />
        )}
        <span className="absolute bottom-4 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[13px] font-semibold text-white backdrop-blur">
          <Camera className="size-4" /> {gallery.images_count} ta surat
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="flex items-center gap-1.5 text-sm text-ivory/70">
          <CalendarDays className="size-4 text-turq" /> {formatDate(gallery.event_date || gallery.published_at)}
        </p>
        <h3 className="mt-3 font-display text-xl font-semibold leading-snug">{gallery.title}</h3>
      </div>
    </Link>
  );
}

export function AnnouncementCard({ item, className }: { item: Announcement; className?: string }) {
  const dm = dayMonth(item.event_date || item.published_at);
  return (
    <Link href={`/announcements/${item.slug}`} data-cursor="view" data-cursor-label="Ochish" className={cn(card, "sm:flex-row", className)}>
      <div className="flex shrink-0 flex-row items-center gap-3 border-b border-ivory/10 bg-gradient-to-br from-turq/15 to-lapis/10 p-6 sm:w-40 sm:flex-col sm:justify-center sm:border-b-0 sm:border-r">
        <span className="font-display text-5xl font-bold leading-none text-turq">{dm?.day ?? "—"}</span>
        <span className="text-base font-semibold capitalize">{dm?.month}</span>
        <span className="text-sm text-ivory/60">{dm?.year}</span>
      </div>
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-turq/12 px-3 py-1 text-[13px] font-semibold text-turq">{item.kind_label}</span>
          {item.is_upcoming ? (
            <span className="rounded-full bg-[#007f78] px-3 py-1 text-[13px] font-semibold text-white">Yaqinda</span>
          ) : (
            <span className="rounded-full bg-ivory/10 px-3 py-1 text-[13px] font-semibold text-ivory/70">O‘tgan</span>
          )}
        </div>
        <h3 className="mt-4 font-display text-xl font-semibold leading-snug md:text-2xl">{item.title}</h3>
        {item.excerpt && <p className="mt-3 line-clamp-2 text-base text-ivory/80">{item.excerpt}</p>}
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-5 text-sm text-ivory/75">
          {item.event_date && (
            <span className="flex items-center gap-1.5">
              <Clock className="size-4 text-turq" /> {formatDateTime(item.event_date)}
            </span>
          )}
          {item.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4 text-turq" /> {item.location}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function FilmCard({ film, className }: { film: Film; className?: string }) {
  return (
    <Link href={`/news/films/${film.slug}`} data-cursor="view" data-cursor-label="Ko‘rish" className={cn(card, className)}>
      <div className="relative aspect-video overflow-hidden">
        <Cover src={film.cover} alt={film.title} seed={film.slug} className={cn("absolute inset-0", zoom)} />
        <span className="absolute inset-0 grid place-items-center">
          <span className="grid size-16 place-items-center rounded-full bg-white/90 text-[#0b1424] shadow-xl transition-transform duration-700 ease-expo group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" />
          </span>
        </span>
        {film.duration && (
          <span className="absolute bottom-3 right-3 rounded-md bg-black/70 px-2 py-1 text-[13px] font-semibold text-white">{film.duration}</span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <p className="text-sm font-semibold text-turq">{film.company}</p>
        <h3 className="mt-2 font-display text-xl font-semibold leading-snug">{film.title}</h3>
        {film.owner_name && <p className="mt-2 text-sm text-ivory/70">{film.owner_name}</p>}
      </div>
    </Link>
  );
}
