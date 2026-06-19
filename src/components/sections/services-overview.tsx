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
          eyebrow="What I Do"
          title="Helping your business grow online"
          description="Whatever's holding your website back - or wherever you want to take your business next - there's a straightforward way I can help. No jargon, just results you can see."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
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
