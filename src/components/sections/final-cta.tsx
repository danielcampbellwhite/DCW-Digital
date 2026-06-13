import { ArrowRight, MessageCircle } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Atmosphere } from "@/components/brand/atmosphere";
import { Button } from "@/components/ui/button";

/** Closing call-to-action band. */
export function FinalCta() {
  return (
    <section className="relative overflow-hidden py-28">
      <Atmosphere particles={12} />
      <div className="container-px relative z-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-4xl font-bold sm:text-5xl">
            Let&apos;s Build Something{" "}
            <span className="text-gradient">Great Together</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-muted-foreground sm:text-lg">
            Have a project in mind, a role to fill, or just a question? I&apos;d
            love to hear from you. Let&apos;s turn your idea into something real,
            fast and built to last.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button href="/contact" variant="primary" size="lg">
              Start Your Project
              <ArrowRight className="size-4" />
            </Button>
            <Button href="/contact" variant="outline" size="lg">
              <MessageCircle className="size-4" />
              Let&apos;s Talk
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
