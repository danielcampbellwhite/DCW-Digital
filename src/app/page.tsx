import { Hero } from "@/components/sections/hero";
import { Metrics } from "@/components/sections/metrics";
import { AboutPreview } from "@/components/sections/about-preview";
import { Expertise } from "@/components/sections/expertise";
import { TrustedBy } from "@/components/sections/trusted-by";
import { ServicesOverview } from "@/components/sections/services-overview";
import { ProcessTimeline } from "@/components/sections/process-timeline";
import { AudienceCta } from "@/components/sections/audience-cta";
import { LeadMagnet } from "@/components/sections/lead-magnet";
import { FinalCta } from "@/components/sections/final-cta";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Metrics />
      <AboutPreview />
      <Expertise />
      <TrustedBy />
      <ServicesOverview />
      <ProcessTimeline />
      <AudienceCta />
      <LeadMagnet />
      <FinalCta />
    </>
  );
}
