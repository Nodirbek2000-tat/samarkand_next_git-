"use client";

import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { setTheme, useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className, withLabel = false }: { className?: string; withLabel?: boolean }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? "Kunduzgi rejim" : "Tungi rejim";

  return (
    <button
      type="button"
      data-cursor="hover"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex h-10 items-center gap-2 overflow-hidden rounded-full border border-ivory/15 px-2.5 text-ivory transition-colors hover:border-turq hover:text-turq",
        className,
      )}
    >
      <span className="relative grid size-5 place-items-center">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={theme}
            initial={{ y: 18, rotate: -90, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -18, rotate: 90, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="absolute"
          >
            {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
          </motion.span>
        </AnimatePresence>
      </span>
      {withLabel && <span className="pr-1 text-sm font-medium">{label}</span>}
    </button>
  );
}
