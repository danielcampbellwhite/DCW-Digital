import { expertise } from "@/content/expertise";
import { SectionHeading } from "@/components/sections/section-heading";
import { StaggerGroup, StaggerItem } from "@/components/motion/reveal";

/** Core expertise cards grouping the tech across four disciplines. */
export function Expertise() {
  return (
    <section className="py-24">
      <div className="container-px">
        <SectionHeading
          eyebrow="Core Expertise"
          title="A full-stack skill set, focused on results"
          description="From pixel-perfect frontends to the infrastructure that keeps them online — the complete toolkit to design, build, optimise and maintain modern digital products."
        />

        <StaggerGroup className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {expertise.map((area) => {
            const Icon = area.icon;
            return (
              <StaggerItem key={area.title}>
                <div className="card-surface group h-full hover:border-primary/40">
                  <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110">
                    <Icon className="size-6" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold">{area.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {area.description}
                  </p>
                  <ul className="mt-4 flex flex-wrap gap-1.5">
                    {area.skills.map((skill) => (
                      <li
                        key={skill}
                        className="rounded-md border border-border bg-surface/60 px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerGroup>
      </div>
    </section>
  );
}
