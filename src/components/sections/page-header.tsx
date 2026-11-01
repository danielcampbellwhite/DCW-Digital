import { Atmosphere } from "@/components/brand/atmosphere";

interface PageHeaderProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * Consistent hero band used at the top of every interior page. Rendered on
 * the server and visible from the first paint (the entrance animation only
 * moves it, never hides it), so the heading isn't held back by JavaScript.
 */
export function PageHeader({ eyebrow, title, description, children }: PageHeaderProps) {
  return (
    <header className="relative overflow-hidden border-b border-border pt-32">
      <Atmosphere particles={10} />
      <div className="container-px relative z-10 pb-16">
        <div className="mx-auto max-w-3xl animate-rise text-center">
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
        </div>
      </div>
    </header>
  );
}
