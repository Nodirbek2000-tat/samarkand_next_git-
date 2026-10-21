"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { useLenis } from "@/components/providers/smooth-scroll";
import { cn } from "@/lib/utils";

export type LightboxImage = { id: number; image: string; caption?: string };

/** Masonry-ish photo grid + fullscreen viewer (keyboard, swipe, captions). */
export function PhotoGrid({ images, className }: { images: LightboxImage[]; className?: string }) {
  const [index, setIndex] = useState<number | null>(null);
  const lenis = useLenis();

  useEffect(() => {
    if (index === null) lenis?.start();
    else lenis?.stop();
  }, [index, lenis]);

  const go = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, go]);

  if (!images.length) return null;

  return (
    <>
      <div className={cn("columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4", className)}>
        {images.map((img, i) => (
          <m.button
            key={img.id}
            type="button"
            data-cursor="view"
            data-cursor-label="Ochish"
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="group relative block w-full overflow-hidden rounded-[1.4rem] bg-ink-3"
          >
            <Image
              src={img.image}
              alt={img.caption || "Surat"}
              width={900}
              height={700}
              sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
              className="h-auto w-full transition-transform duration-[1.2s] ease-expo group-hover:scale-[1.05]"
            />
            <span className="absolute right-3 top-3 grid size-10 place-items-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur transition-opacity group-hover:opacity-100">
              <Expand className="size-4" />
            </span>
            {img.caption && (
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-4 text-left text-sm font-semibold text-white">
                {img.caption}
              </span>
            )}
          </m.button>
        ))}
      </div>

      <AnimatePresence>
        {index !== null && (
          <m.div
            className="fixed inset-0 z-[90] flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Suratlar"
          >
            <div className="flex items-center justify-between p-4 text-white">
              <span className="font-mono text-sm">
                {index + 1} / {images.length}
              </span>
              <button type="button" onClick={() => setIndex(null)} aria-label="Yopish" className="grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20">
                <X className="size-6" />
              </button>
            </div>
            <div className="relative flex-1">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.div
                  key={images[index].id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  onDragEnd={(_, info) => {
                    if (info.offset.x < -80) go(1);
                    if (info.offset.x > 80) go(-1);
                  }}
                >
                  <Image src={images[index].image} alt={images[index].caption || "Surat"} fill sizes="100vw" className="object-contain" priority />
                </m.div>
              </AnimatePresence>
              {images.length > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label="Oldingi" className="absolute left-3 top-1/2 grid size-14 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/25">
                    <ChevronLeft className="size-7" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label="Keyingi" className="absolute right-3 top-1/2 grid size-14 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/25">
                    <ChevronRight className="size-7" />
                  </button>
                </>
              )}
            </div>
            {images[index].caption && <p className="p-5 text-center text-lg text-white/90">{images[index].caption}</p>}
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
