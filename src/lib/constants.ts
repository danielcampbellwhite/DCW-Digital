import type { PostCategory } from "@/types";

/**
 * Client-safe constants. Kept separate from `@/lib/blog` (which uses Node's
 * `fs`) so they can be imported into client components without bundling
 * server-only modules.
 */
export const postCategories: PostCategory[] = [
  "Web Development",
  "SEO",
  "Performance",
  "Technology",
  "Business Growth",
];
