import { Quote, Star, Briefcase, UserCheck, Users } from "lucide-react";
import type { Testimonial } from "@/types";
import { cn } from "@/lib/utils";

const TYPE_META = {
  client: { label: "Client", icon: Briefcase },
  employer: { label: "Employer reference", icon: UserCheck },
  colleague: { label: "Colleague", icon: Users },
} as const;

/** Reusable testimonial / recommendation card. */
export function TestimonialCard({
  testimonial,
  className,
}: {
  testimonial: Testimonial;
  className?: string;
}) {
  const meta = TYPE_META[testimonial.type];
  const TypeIcon = meta.icon;

  return (
    <figure
      className={cn(
        "flex h-full flex-col rounded-2xl border border-border bg-card p-6",
        className
      )}
    >
      <Quote className="size-7 text-primary/60" aria-hidden />
      {testimonial.rating && (
        <div className="mt-3 flex gap-0.5" aria-label={`${testimonial.rating} out of 5`}>
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="size-4 fill-accent text-accent" />
          ))}
        </div>
      )}
      <blockquote className="mt-4 flex-1 text-pretty text-sm leading-relaxed text-foreground/90">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6 border-t border-border pt-4">
        <div className="font-heading font-semibold text-foreground">
          {testimonial.name}
        </div>
        <div className="text-sm text-muted-foreground">
          {testimonial.role}, {testimonial.company}
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-primary">
          <TypeIcon className="size-3.5" />
          {meta.label}
        </div>
      </figcaption>
    </figure>
  );
}
