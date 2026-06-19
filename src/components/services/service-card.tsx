import { ArrowRight, Check } from "lucide-react";
import type { Service } from "@/types";
import { Button } from "@/components/ui/button";

/**
 * Service card used on the homepage overview and services page. A server
 * component (the hover lift is pure CSS) so it can receive the `Service`
 * object - including its Lucide icon component - without crossing a client
 * serialization boundary.
 */
export function ServiceCard({
  service,
  showBenefits = true,
}: {
  service: Service;
  showBenefits?: boolean;
}) {
  const Icon = service.icon;
  return (
    <div className="card-surface group flex h-full flex-col transition-transform duration-300 hover:-translate-y-1 hover:border-primary/40">
      <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
        <Icon className="size-6" />
      </div>

      <h3 className="font-heading text-xl font-semibold">{service.title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{service.summary}</p>

      {showBenefits && (
        <ul className="mt-4 flex flex-col gap-2">
          {service.benefits.slice(0, 3).map((benefit) => (
            <li key={benefit} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              {benefit}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex items-center pt-5">
        <Button href={service.cta.href} variant="ghost" size="sm" className="ml-auto">
          {service.cta.label}
          <ArrowRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
