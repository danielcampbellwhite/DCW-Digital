import { FolderGit2, Briefcase, Search, FileText } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";

/**
 * Split "two audiences" CTA - recruiters/employers on the left, prospective
 * clients on the right. Serves both of the site's core conversion goals.
 */
export function AudienceCta() {
  return (
    <section className="py-24">
      <div className="container-px">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Employers / recruiters */}
          <Reveal direction="right">
            <div className="relative h-full overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-card to-card p-8 sm:p-10">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-primary/20 blur-3xl" />
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <Briefcase className="size-3.5" /> For employers & recruiters
              </span>
              <h3 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">
                Looking for a developer?
              </h3>
              <p className="mt-3 text-muted-foreground">
                I&apos;m open to permanent, contract and remote roles. Have a look
                at my experience and the work I&apos;ve shipped, and get in touch
                if it&apos;s a fit.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/about" variant="primary">
                  <FileText className="size-4" /> View Experience
                </Button>
                <Button href="/projects" variant="outline">
                  <FolderGit2 className="size-4" /> View Projects
                </Button>
              </div>
            </div>
          </Reveal>

          {/* Clients */}
          <Reveal>
            <div className="relative h-full overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-secondary/10 via-card to-card p-8 sm:p-10">
              <div className="absolute -right-12 -top-12 size-40 rounded-full bg-secondary/20 blur-3xl" />
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 px-3 py-1 text-xs font-medium text-violet-300">
                <Search className="size-3.5" /> For businesses
              </span>
              <h3 className="mt-5 font-heading text-2xl font-bold sm:text-3xl">
                Need help with your website?
              </h3>
              <p className="mt-3 text-muted-foreground">
                New site, tired old one, or something that&apos;s just not working
                right - tell me what you&apos;re after and I&apos;ll tell you
                straight what I&apos;d do.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="/contact?service=Free+Website+Health+Check" variant="secondary">
                  <Search className="size-4" /> Get a website health check
                </Button>
                <Button href="/contact" variant="outline">
                  Get a Quote
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
