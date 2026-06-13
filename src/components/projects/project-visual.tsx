import { cn } from "@/lib/utils";

const PRESETS: Record<string, string> = {
  cyan: "from-primary/30 via-surface to-secondary/20",
  violet: "from-secondary/30 via-surface to-primary/20",
  emerald: "from-accent/30 via-surface to-primary/20",
};

/**
 * Branded gradient artwork used in place of raster screenshots. Deterministic
 * and dependency-free, so the portfolio always looks sharp and loads instantly.
 * Replace with <Image> + real screenshots when available.
 */
export function ProjectVisual({
  preset = "cyan",
  label,
  className,
}: {
  preset?: string;
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-gradient-to-br",
        PRESETS[preset] ?? PRESETS.cyan,
        className
      )}
      role="img"
      aria-label={label ? `${label} preview` : "Project preview"}
    >
      {/* grid + glow accents */}
      <div className="absolute inset-0 bg-grid bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      <div className="absolute -left-10 -top-10 size-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 size-40 rounded-full bg-secondary/20 blur-3xl" />
      {label && (
        <span className="relative z-10 px-6 text-center font-heading text-lg font-semibold text-foreground/90">
          {label}
        </span>
      )}
    </div>
  );
}
