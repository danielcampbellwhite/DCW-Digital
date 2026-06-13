import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  /** Stacked = "DCW / DIGITAL"; inline = "DCW Digital". */
  variant?: "inline" | "stacked";
  href?: string | null;
}

/**
 * DCW Digital text-based logo. A monogram mark ("DCW") sits beside the
 * wordmark. Pure typography + spacing — no raster assets, so it stays crisp
 * at any size and theme.
 */
export function Logo({ className, variant = "inline", href = "/" }: LogoProps) {
  const mark = (
    <span
      className={cn(
        "flex items-center gap-2.5 font-heading font-bold tracking-tight",
        className
      )}
    >
      <span
        aria-hidden
        className="grid size-9 place-items-center rounded-lg border border-primary/30 bg-gradient-to-br from-primary/20 to-secondary/20 text-sm font-bold text-primary shadow-[0_0_20px_-6px_hsl(var(--primary)/0.6)]"
      >
        D
      </span>
      {variant === "inline" ? (
        <span className="text-lg leading-none">
          DCW <span className="text-gradient">Digital</span>
        </span>
      ) : (
        <span className="flex flex-col leading-none">
          <span className="text-base">DCW</span>
          <span className="text-xs tracking-[0.32em] text-muted-foreground">
            DIGITAL
          </span>
        </span>
      )}
    </span>
  );

  if (href === null) return mark;

  return (
    <Link href={href} aria-label="DCW Digital — home" className="inline-flex">
      {mark}
    </Link>
  );
}
