"use client";

import * as React from "react";
import { Check, Star } from "lucide-react";
import type { SupportPackage } from "@/types";
import { Button } from "@/components/ui/button";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type Billing = "monthly" | "yearly";

/** Pay for 10 months, get 12 (2 months free) when billed annually. */
const MONTHS_PER_YEAR_BILLED = 10;

function gbp(value: number): string {
  return `£${value.toLocaleString("en-GB", { maximumFractionDigits: 2 })}`;
}

/**
 * Support & maintenance pricing with a monthly / yearly toggle. Yearly is
 * billed at 10x the monthly rate - two months free.
 */
export function PricingPackages({ packages }: { packages: SupportPackage[] }) {
  const [billing, setBilling] = React.useState<Billing>("monthly");
  const yearly = billing === "yearly";

  return (
    <div>
      {/* Billing toggle */}
      <div className="mt-10 flex flex-col items-center gap-3">
        <div
          role="tablist"
          aria-label="Billing period"
          className="inline-flex items-center rounded-full border border-border bg-surface/60 p-1"
        >
          {(["monthly", "yearly"] as const).map((period) => {
            const active = billing === period;
            return (
              <button
                key={period}
                role="tab"
                aria-selected={active}
                onClick={() => setBilling(period)}
                className={cn(
                  "relative rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {period === "monthly" ? "Monthly" : "Yearly"}
              </button>
            );
          })}
        </div>
        <p className="text-xs text-accent">
          Pay yearly and get <strong>2 months free</strong> (≈ 17% off)
        </p>
      </div>

      <StaggerGroup className="mt-10 grid gap-6 lg:grid-cols-3">
        {packages.map((pkg) => {
          const annual = pkg.priceMonthly * MONTHS_PER_YEAR_BILLED;
          const effectiveMonthly = annual / 12;
          return (
            <StaggerItem key={pkg.name} className="h-full">
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                  pkg.featured
                    ? "border-primary/60 shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]"
                    : "border-border"
                )}
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Star className="size-3 fill-current" /> Most popular
                  </span>
                )}
                <h3 className="font-heading text-xl font-bold">{pkg.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{pkg.description}</p>

                <div className="mt-5">
                  <div className="flex items-baseline gap-1">
                    <span className="font-heading text-4xl font-bold">
                      {yearly ? gbp(annual) : gbp(pkg.priceMonthly)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {yearly ? "/year" : "/month"}
                    </span>
                  </div>
                  <p className="mt-1 h-4 text-xs text-accent">
                    {yearly
                      ? `Just ${gbp(effectiveMonthly)}/mo · 2 months free`
                      : " "}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {pkg.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  href={`/contact?service=Support+%26+maintenance&plan=${pkg.name}${
                    yearly ? "+(yearly)" : ""
                  }`}
                  variant={pkg.featured ? "primary" : "outline"}
                  className="mt-7 w-full"
                >
                  Choose {pkg.name}
                </Button>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Prices exclude VAT. Yearly plans are billed at 10 months&apos; cost - two
        months free. Need something more bespoke? Just ask.
      </p>
    </div>
  );
}
