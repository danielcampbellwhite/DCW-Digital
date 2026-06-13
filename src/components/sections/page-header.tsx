import { Atmosphere } from "@/components/brand/atmosphere";
import { Reveal } from "@/components/motion/reveal";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

/** Consistent hero band used at the top of every interior page. */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-border pt-32">
      <Atmosphere particles={10} />
      <div className="container-px relative z-10 pb-16">
        <Reveal className="mx-auto max-w-3xl text-center">
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1 className="mt-5 text-balance text-4xl font-bold sm:text-5xl md:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mx-auto mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
              {description}
            </p>
          )}
          {children && <div className="mt-8 flex justify-center">{children}</div>}
        </Reveal>
      </div>
    </header>
  );
}
