import { ArrowRight } from "lucide-react";
import { getFeaturedClients } from "@/content/clients";
import { withLogos } from "@/lib/logos";
import { SectionHeading } from "@/components/sections/section-heading";
import { ClientLogo } from "@/components/clients/client-logo";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/** Homepage "trusted by" logo strip - real organisations DCW Digital has
 *  worked with, across the NHS, public health, legal and commercial sectors. */
export function TrustedBy() {
  const featured = withLogos(getFeaturedClients());

  return (
    <section className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Selected Work"
          title="Trusted by organisations that matter"
          description="A mix of NHS trusts, public-health services and national charities - some of the organisations whose sites and apps I've built or looked after over the years."
        />

        <StaggerGroup className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((client) => (
            <StaggerItem key={client.slug}>
              <ClientLogo client={client} />
            </StaggerItem>
          ))}
        </StaggerGroup>

        <div className="mt-12 flex justify-center">
          <Button href="/projects" variant="outline">
            See everyone I&apos;ve worked with
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
