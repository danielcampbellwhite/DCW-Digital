import { cn } from "@/lib/utils";

/**
 * Premium technology atmosphere: an aurora gradient wash, a faded grid and
 * subtle floating particles. Purely decorative (aria-hidden).
 *
 * Server component with CSS-only animations (transform + opacity), so it ships
 * no JavaScript and runs on the compositor instead of the main thread.
 * Reduced-motion users get a static version via the global media query.
 */
export function Atmosphere({
  className,
  particles = 18,
  grid = true,
}: {
  className?: string;
  particles?: number;
  grid?: boolean;
}) {
  // Deterministic positions so the markup is identical on every render.
  const dots = Array.from({ length: particles }, (_, i) => {
    const seed = (i + 1) * 9301;
    return {
      left: ((seed % 97) / 97) * 100,
      top: (((seed * 1.7) % 89) / 89) * 100,
      delay: (i % 6) * 0.8,
      duration: 6 + (i % 5),
      size: 1 + (i % 3),
    };
  });

  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Aurora gradient wash */}
      <div className="absolute inset-0 bg-aurora animate-aurora-shift" />

      {/* Faded grid */}
      {grid && (
        <div className="absolute inset-0 bg-grid bg-grid [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
      )}

      {/* Floating particles */}
      {dots.map((d, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-primary/60 opacity-20 animate-particle will-change-transform"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animationDuration: `${d.duration}s`,
            animationDelay: `${d.delay}s`,
          }}
        />
      ))}

      {/* Top + bottom vignette to blend into the page */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-background to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </div>
  );
}
