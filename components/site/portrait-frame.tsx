import Image from "next/image";
import { useId } from "react";
import { initials } from "@/lib/format";
import { SECTOR_LABEL, type Sector } from "@/lib/sectors";
import { cn } from "@/lib/utils";

/**
 * A council portrait standing in a Samarqand "peshtoq" arch, on the ornament of the member's line of business:
 * anor and islimiy vines for the land and food, the girih star for industry, bodom and paxta for textiles,
 * a rumi palmette for medicine, Ulug‘bek's ten-point star for learning, ravoqlar for tourism.
 *
 * The council photos are cut out (no background) and scaled so every head is the same size at the same height;
 * a photo uploaded later straight from the admin just covers the frame, as before.
 */

const COLOR: Record<Sector, string> = {
  agro: "var(--color-turq)",
  industry: "var(--color-lapis)",
  textile: "var(--color-ember)",
  health: "#0d9488",
  education: "#b7791f",
  tourism: "var(--color-gold)",
  general: "#0e7490",
};

const W = 400;
const H = 500;
// the pointed arch — springs at y=210, its tip just above the head
const arch = (inset: number) => {
  const l = 62 - inset;
  const r = W - 62 + inset;
  const top = 46 - inset * 1.15;
  const spring = 210;
  return `M${l} ${H + 2}V${spring}C${l} ${spring - 92} ${W / 2 - 52} ${top + 34} ${W / 2} ${top}C${W / 2 + 52} ${top + 34} ${r} ${spring - 92} ${r} ${spring}V${H + 2}`;
};

function star(cx: number, cy: number, r: number, n: number, step: number) {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = (i * 2 * Math.PI) / n - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  let d = "";
  for (let i = 0, k = 0; i < n; i++, k = (k + step) % n) d += `${i ? "L" : "M"}${pts[k][0].toFixed(2)} ${pts[k][1].toFixed(2)}`;
  return d + "Z";
}

function hexagram(cx: number, cy: number, r: number) {
  const tri = (from: number) =>
    [0, 2, 4].map((k, i) => {
      const a = ((from + k) * Math.PI) / 3 - Math.PI / 2;
      return `${i ? "L" : "M"}${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    }).join("") + "Z";
  return tri(0) + tri(1);
}
const ravoq = (cx: number, base: number) =>
  `M${cx - 10} ${base}V${base - 12}C${cx - 10} ${base - 18} ${cx - 5} ${base - 21} ${cx} ${base - 26}C${cx + 5} ${base - 21} ${cx + 10} ${base - 18} ${cx + 10} ${base - 12}V${base}`;

/** One tile of each ornament, drawn with the current colour. */
const TILES: Record<Sector, { w: number; h: number; body: React.ReactNode }> = {
  // anor (pomegranate) on an islimiy vine
  agro: {
    w: 64,
    h: 64,
    body: (
      <>
        <path d="M0 8C10 0 22 0 32 8S54 16 64 8" />
        <ellipse cx="16" cy="4.5" rx="4" ry="1.8" transform="rotate(-25 16 4.5)" />
        <ellipse cx="48" cy="11.5" rx="4" ry="1.8" transform="rotate(-25 48 11.5)" />
        <path d="M29 28.6C21 30.5 20.5 45 27 48.5c3 1.6 7 1.6 10 0 6.5-3.5 6-18-2-19.9" />
        <path d="M28.5 29.5l-1.5-5.5 3.2 2.6L32 22.5l1.8 4.1 3.2-2.6-1.5 5.5" />
        <path d="M26.5 35.5c-.8 4 .6 8 4 10" />
        <path d="M32 48c-6 6-14 6-18 2 5-4 12-5 18-2zM32 48c6 6 14 6 18 2-5-4-12-5-18-2z" />
      </>
    ),
  },
  // girih: the eight-point star and cross of the Registan tile panels
  industry: {
    w: 56,
    h: 56,
    body: (
      <>
        <rect x="17" y="17" width="22" height="22" />
        <path d="M12.44 28L28 12.44 43.56 28 28 43.56Z" />
        <path d="M12.44 28H0M43.56 28H56M28 12.44V0M28 43.56V56" />
        <path d="M17 17L5.66 5.66M39 17L50.34 5.66M17 39L5.66 50.34M39 39L50.34 50.34" />
        <path d="M-8 0L0-8 8 0 0 8ZM48 0L56-8 64 0 56 8ZM-8 56L0 48 8 56 0 64ZM48 56L56 48 64 56 56 64Z" />
      </>
    ),
  },
  // bodom (the almond / paisley of suzani and atlas) with a cotton boll
  textile: {
    w: 72,
    h: 72,
    body: (
      <>
        <path d="M24 42C11 42 9 25 19 17c6-5 14-4 14-12 6 10 4 37-9 37z" />
        <path d="M24 36c-7 0-8-9-3-13 3-2 7-2 7-6 3 5 2 19-4 19z" />
        <g transform="rotate(180 54 54)">
          <path d="M54 66C45 66 43.6 54 50.6 48.4c4.2-3.5 9.8-2.8 9.8-8.4 4.2 7 2.8 26-6.4 26z" />
        </g>
        <circle cx="53" cy="18" r="4" />
        <circle cx="61" cy="18" r="4" />
        <circle cx="57" cy="11.5" r="4" />
        <path d="M57 22v6M53 26l4 2 4-2" />
        <circle cx="8" cy="60" r="1.6" />
        <circle cx="38" cy="58" r="1.6" />
      </>
    ),
  },
  // rumi palmette — the leaf of the islimiy, for medicine and herbs
  health: {
    w: 64,
    h: 64,
    body: (
      <>
        <path d="M32 12c8 10 8 22 0 32-8-10-8-22 0-32z" />
        <path d="M32 44c-12 0-20-10-16-20 2-4 6-4 6 0M32 44c12 0 20-10 16-20-2-4-6-4-6 0" />
        <path d="M32 44v10" />
        <path d="M0-4v8M-4 0h8M64-4v8M60 0h8M0 60v8M-4 64h8M64 60v8M60 64h8" />
        <circle cx="0" cy="0" r="3" />
        <circle cx="64" cy="0" r="3" />
        <circle cx="0" cy="64" r="3" />
        <circle cx="64" cy="64" r="3" />
      </>
    ),
  },
  // Ulug‘bek madrasasi's ten-point star
  education: {
    w: 70,
    h: 60,
    body: (
      <>
        <path d={star(17.5, 15, 13, 10, 3)} />
        <path d={star(52.5, 45, 13, 10, 3)} />
        <circle cx="17.5" cy="15" r="2.5" />
        <circle cx="52.5" cy="45" r="2.5" />
      </>
    ),
  },
  // ravoqlar — rows of arches, as in the courtyard of a madrasa or a caravanserai
  tourism: {
    w: 60,
    h: 56,
    body: (
      <>
        <path d={ravoq(30, 27)} />
        <path d={ravoq(0, 55)} />
        <path d={ravoq(60, 55)} />
        <circle cx="30" cy="-1" r="1.6" />
        <circle cx="0" cy="27" r="1.6" />
        <circle cx="60" cy="27" r="1.6" />
        <path d="M0 27.5H60M0 55.5H60" strokeDasharray="1 5" />
      </>
    ),
  },
  // Shohi Zinda's six-point star lattice
  general: {
    w: 48,
    h: 83.14,
    body: (
      <>
        <path d={hexagram(24, 20.78, 11)} />
        <path d={hexagram(0, 62.35, 11)} />
        <path d={hexagram(48, 62.35, 11)} />
        <path d="M24 31.8V51.3M24 9.8V-9.8M0 51.3L24 31.8 48 51.3M0 73.4V93M48 73.4V93" opacity="0.6" />
      </>
    ),
  },
};

export function PortraitFrame({
  name,
  photo,
  sector,
  sizes,
  priority,
  hoverZoom,
  className,
  initialsClassName = "text-6xl",
  children,
}: {
  name: string;
  photo: string | null;
  sector: Sector;
  sizes: string;
  priority?: boolean;
  hoverZoom?: boolean;
  className?: string;
  initialsClassName?: string;
  children?: React.ReactNode;
}) {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const tile = TILES[sector];
  const color = COLOR[sector];

  return (
    <div
      className={cn("relative isolate aspect-[4/5] overflow-hidden", className)}
      style={
        {
          color,
          background: `linear-gradient(165deg, color-mix(in oklab, ${color} 7%, var(--color-ink-2)), color-mix(in oklab, ${color} 20%, var(--color-ink-2)))`,
        } as React.CSSProperties
      }
      title={SECTOR_LABEL[sector]}
    >
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" className="absolute inset-0 size-full" aria-hidden>
        <defs>
          <pattern id={`${id}t`} width={tile.w} height={tile.h} patternUnits="userSpaceOnUse" patternTransform="translate(6 4)">
            <g fill="none" stroke="currentColor" strokeWidth="1.15" strokeLinecap="round" strokeLinejoin="round">
              {tile.body}
            </g>
          </pattern>
        </defs>
        <rect width={W} height={H} fill={`url(#${id}t)`} opacity="0.42" />
        {/* the arch: a calm field behind the head, a bead row between two lines around it */}
        <path d={arch(0)} fill="var(--color-ink-2)" fillOpacity="0.82" />
        <path d={arch(0)} fill={`url(#${id}t)`} opacity="0.08" />
        <g fill="none" stroke="currentColor" strokeLinecap="round">
          <path d={arch(0)} strokeWidth="1.6" opacity="0.75" />
          <path d={arch(9)} strokeWidth="2.2" strokeDasharray="0 9" opacity="0.8" />
          <path d={arch(18)} strokeWidth="1.2" opacity="0.6" />
        </g>
      </svg>

      {photo ? (
        <Image
          src={photo}
          alt={name}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            "object-cover",
            hoverZoom && "origin-bottom transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.04]",
          )}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center pt-[8%]">
          <span className={cn("font-display font-bold opacity-85", initialsClassName)}>{initials(name)}</span>
        </div>
      )}
      {children}
    </div>
  );
}
