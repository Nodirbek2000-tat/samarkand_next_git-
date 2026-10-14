"use client";

import { useState } from "react";
import { Check, Link2, Printer, Send } from "lucide-react";
import { cn } from "@/lib/utils";

export function ShareBar({ title, className }: { title: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const url = () => window.location.href;

  const btn =
    "inline-flex h-12 items-center gap-2 rounded-full border border-ivory/15 px-5 text-base font-semibold transition-colors hover:border-turq hover:text-turq";

  return (
    <div className={cn("flex flex-wrap items-center gap-3 border-t border-ivory/10 pt-8", className)}>
      <span className="mr-2 text-base text-ivory/70">Ulashish:</span>
      <button
        type="button"
        className={btn}
        onClick={() => window.open(`https://t.me/share/url?url=${encodeURIComponent(url())}&text=${encodeURIComponent(title)}`, "_blank", "noopener")}
      >
        <Send className="size-5" /> Telegram
      </button>
      <button
        type="button"
        className={btn}
        onClick={async () => {
          await navigator.clipboard?.writeText(url());
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1800);
        }}
      >
        {copied ? <Check className="size-5 text-turq" /> : <Link2 className="size-5" />} {copied ? "Nusxalandi" : "Havolani nusxalash"}
      </button>
      <button type="button" className={btn} onClick={() => window.print()}>
        <Printer className="size-5" /> Chop etish
      </button>
    </div>
  );
}
