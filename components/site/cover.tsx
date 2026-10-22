import Image from "next/image";
import { hashString } from "@/lib/format";
import { cn } from "@/lib/utils";

const PALETTES = [
  ["#007f78", "#2340d4", "#0b1424"],
  ["#a5620b", "#cf4d14", "#1c0d04"],
  ["#2340d4", "#34d07a", "#050a22"],
  ["#cf4d14", "#7a1fff", "#140517"],
  ["#a5620b", "#007f78", "#04110f"],
  ["#0f7a3d", "#ff8a1f", "#0b1424"],
];

/**
 * Uploaded image when present; otherwise deterministic generative artwork (girih + aurora),
 * so cards never look empty while editors are still adding photos.
 */
export function Cover({
  src,
  alt,
  seed,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  label,
  priority = false,
}: {
  src?: string | null;
  alt: string;
  seed?: string;
  className?: string;
  sizes?: string;
  label?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-ink-3", className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </div>
    );
  }
  const h = hashString(seed ?? alt);
  const [a, b, c] = PALETTES[h % PALETTES.length];
  const rot = h % 90;
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      role="img"
      aria-label={alt}
      // soft "aurora" drawn by gradients alone — no blur filter, so dozens of cards stay cheap
      style={{
        background: `radial-gradient(90% 80% at ${20 + (rot % 50)}% 70%, ${a}e6, transparent 70%), radial-gradient(80% 90% at 85% 15%, ${b}d9, transparent 65%), ${c}`,
      }}
    >
      <svg
        viewBox="0 0 200 200"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full opacity-25"
        fill="none"
        stroke="#fff"
        strokeWidth="0.6"
        aria-hidden
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <rect key={i} x="45" y="45" width="110" height="110" transform={`rotate(${rot + i * 9} 100 100)`} />
        ))}
        <circle cx="100" cy="100" r="92" />
        <path d="M62 200 V128 A38 38 0 0 1 100 82 A38 38 0 0 1 138 128 V200" strokeWidth="1.4" />
      </svg>
      {label && (
        <span className="absolute bottom-4 left-4 right-4 line-clamp-2 font-display text-lg font-semibold leading-tight text-white/90 drop-shadow">
          {label}
        </span>
      )}
    </div>
  );
}
