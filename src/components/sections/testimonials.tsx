import { testimonials } from "@/content/testimonials";
import { SectionHeading } from "@/components/sections/section-heading";
import { TestimonialCard } from "@/components/sections/testimonial-card";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";

/** Testimonials + professional recommendations grid. */
export function Testimonials() {
  return (
    <section className="bg-surface/30 py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Testimonials"
          title="Trusted by clients and colleagues alike"
          description="Feedback from the businesses I've helped grow and the teams I've built alongside."
        />

        <StaggerGroup className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <StaggerItem key={t.name} className="h-full">
              <TestimonialCard testimonial={t} className="h-full" />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
