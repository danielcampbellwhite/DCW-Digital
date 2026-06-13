import { Home, ArrowLeft } from "lucide-react";
import { Atmosphere } from "@/components/brand/atmosphere";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden">
      <Atmosphere />
      <div className="container-px relative z-10 text-center">
        <p className="font-mono text-sm text-primary">Error 404</p>
        <h1 className="mt-3 font-heading text-6xl font-bold sm:text-8xl">
          <span className="text-gradient">Page not found</span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-muted-foreground">
          The page you&apos;re looking for has moved, been renamed, or never
          existed. Let&apos;s get you back on track.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button href="/" variant="primary">
            <Home className="size-4" /> Back to home
          </Button>
          <Button href="/projects" variant="outline">
            <ArrowLeft className="size-4" /> View projects
          </Button>
        </div>
      </div>
    </section>
  );
}
