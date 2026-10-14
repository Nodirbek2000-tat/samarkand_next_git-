import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/btn relative inline-flex items-center justify-center gap-3 overflow-hidden whitespace-nowrap rounded-full font-mono text-[12.5px] uppercase tracking-[0.22em] transition-[color,background-color,border-color,box-shadow] duration-500 ease-expo focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-turq/70 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-ivory text-ink shadow-[0_0_0_1px_rgb(255_255_255/0.2),0_20px_60px_-20px_rgb(46_232_214/0.6)] hover:shadow-[0_0_0_1px_rgb(46_232_214/0.6),0_20px_80px_-10px_rgb(46_232_214/0.8)]",
        ghost: "glass text-ivory hover:border-turq/50 hover:text-turq",
        outline: "border border-ivory/20 text-ivory hover:border-gold/70 hover:text-gold",
      },
      size: {
        default: "h-12 px-7",
        lg: "h-14 px-9",
        icon: "size-12",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  },
);

export interface ButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  asChild?: false;
}

function Button({ className, variant, size, children, ...props }: ButtonProps) {
  return (
    <button data-cursor="hover" className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {variant === "primary" && (
        <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgb(46_232_214/0.35),transparent)] transition-transform duration-700 ease-expo group-hover/btn:translate-x-full" />
      )}
      <span className="relative z-10 inline-flex items-center gap-3">{children}</span>
    </button>
  );
}

function ButtonLink({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<"a"> & VariantProps<typeof buttonVariants>) {
  return (
    <a data-cursor="hover" className={cn(buttonVariants({ variant, size, className }))} {...props}>
      {variant !== "ghost" && variant !== "outline" && (
        <span className="absolute inset-0 -translate-x-full bg-[linear-gradient(110deg,transparent,rgb(46_232_214/0.35),transparent)] transition-transform duration-700 ease-expo group-hover/btn:translate-x-full" />
      )}
      <span className="relative z-10 inline-flex items-center gap-3">{children}</span>
    </a>
  );
}

export { Button, ButtonLink, buttonVariants };
