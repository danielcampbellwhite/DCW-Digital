import Image from "next/image";
import { ProjectVisual } from "@/components/projects/project-visual";

/**
 * Blog post cover. Renders a real image when `cover` is a path (starts with
 * "/"), otherwise falls back to the branded gradient placeholder keyed by
 * preset name ("cyan" | "violet" | "emerald").
 */
export function PostCover({
  cover,
  alt,
  priority = false,
}: {
  cover?: string;
  alt: string;
  priority?: boolean;
}) {
  if (cover && cover.startsWith("/")) {
    return (
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-border">
        <Image
          src={cover}
          alt={alt}
          fill
          priority={priority}
          sizes="(max-width: 768px) 100vw, 700px"
          className="object-cover"
        />
      </div>
    );
  }

  return <ProjectVisual preset={cover ?? "cyan"} />;
}
