"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  subtitle,
  icon: Icon,
  actions,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ComponentType<{ className?: string }>;
  actions?: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end"
    >
      <div className="flex items-center gap-4">
        {Icon && (
          <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-turq/20 to-lapis/15 text-turq">
            <Icon className="size-7" />
          </span>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
          {subtitle && <p className="mt-1 text-base text-ivory/70">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </motion.div>
  );
}

const BTN = {
  primary: "bg-ivory text-ink hover:bg-turq",
  turq: "bg-turq text-ink hover:brightness-110",
  ghost: "border border-ivory/15 text-ivory hover:border-turq hover:text-turq",
  danger: "bg-ember/10 text-ember hover:bg-ember hover:text-white",
};

export function Btn({
  variant = "primary",
  loading,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { variant?: keyof typeof BTN; loading?: boolean }) {
  return (
    <button
      type="button"
      {...props}
      disabled={props.disabled || loading}
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-[15px] font-semibold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60",
        BTN[variant],
        className,
      )}
    >
      {loading && <Loader2 className="size-4 animate-spin" />}
      {children}
    </button>
  );
}

export function Badge({ children, tone = "default" }: { children: React.ReactNode; tone?: "default" | "turq" | "gold" | "ember" | "muted" }) {
  const tones = {
    default: "bg-ivory/[0.08] text-ivory/85",
    turq: "bg-turq/15 text-turq",
    gold: "bg-gold/15 text-gold",
    ember: "bg-ember/15 text-ember",
    muted: "bg-ivory/[0.06] text-ivory/60",
  };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[13px] font-semibold", tones[tone])}>{children}</span>;
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-[1.4rem] border border-ivory/10 bg-ink-2 p-5 md:p-7", className)}>{children}</div>;
}

export function Switch({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label?: string; id?: string }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-7 w-12 shrink-0 rounded-full transition-colors duration-300", checked ? "bg-turq" : "bg-ivory/20")}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 32 }}
          className={cn("absolute top-1 size-5 rounded-full bg-white shadow", checked ? "right-1" : "left-1")}
        />
      </button>
      {label && <span className="text-[15px] font-semibold">{label}</span>}
    </label>
  );
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel = "O‘chirish",
  busy,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  text?: string;
  confirmLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[80] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <motion.div
            role="alertdialog"
            aria-modal="true"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md rounded-[1.6rem] border border-ivory/10 bg-ink-2 p-7 shadow-2xl"
          >
            <span className="grid size-14 place-items-center rounded-2xl bg-ember/15 text-ember">
              <AlertTriangle className="size-7" />
            </span>
            <h3 className="mt-5 font-display text-2xl font-semibold">{title}</h3>
            {text && <p className="mt-2 text-base text-ivory/75">{text}</p>}
            <div className="mt-7 flex justify-end gap-2">
              <Btn variant="ghost" onClick={onClose}>
                Bekor qilish
              </Btn>
              <Btn variant="danger" className="bg-ember text-white" loading={busy} onClick={onConfirm}>
                {confirmLabel}
              </Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-[1.4rem] border border-dashed border-ivory/20 px-6 py-16 text-center">
      <p className="font-display text-xl font-semibold">{title}</p>
      {text && <p className="mt-2 max-w-md text-base text-ivory/70">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const inputCls =
  "w-full rounded-xl border border-ivory/15 bg-ink px-4 py-3 text-[16px] text-ivory outline-none transition-[border-color,box-shadow] placeholder:text-ivory/40 focus:border-turq focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-turq)_15%,transparent)]";
