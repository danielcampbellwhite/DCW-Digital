import { ArrowRight } from "lucide-react";
import { services } from "@/content/services";
import { SectionHeading } from "@/components/sections/section-heading";
import { ServiceCard } from "@/components/services/service-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/** Services overview grid for the homepage. */
export function ServicesOverview() {
  return (
    <section className="bg-surface/30 py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Services"
          title="How DCW Digital can help your business"
          description="Whether you need a brand-new website, better rankings or an expert pair of hands to keep things running, there's a service built around the outcome you're after."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <StaggerItem key={service.slug} className="h-full">
              <ServiceCard service={service} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 flex justify-center">
          <Button href="/services" variant="primary">
            Explore all services
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
