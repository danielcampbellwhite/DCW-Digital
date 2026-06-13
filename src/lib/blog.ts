import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { readingTime } from "@/lib/utils";
import type { Post, PostMeta, PostCategory } from "@/types";

export { postCategories } from "@/lib/constants";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

/** Read and parse all MDX posts from /content/blog, newest first. */
function readAllPosts(): Post[] {
  if (!fs.existsSync(BLOG_DIR)) return [];

  const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));

  const posts = files.map((file) => {
    const slug = file.replace(/\.mdx$/, "");
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf8");
    const { data, content } = matter(raw);

    const meta: PostMeta = {
      slug,
      title: String(data.title ?? slug),
      description: String(data.description ?? ""),
      date: String(data.date ?? new Date().toISOString()),
      category: (data.category ?? "Web Development") as PostCategory,
      tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
      author: String(data.author ?? "Daniel Campbell-White"),
      featured: Boolean(data.featured ?? false),
      cover: data.cover ? String(data.cover) : undefined,
      readingTime: readingTime(content),
    };

    return { ...meta, content };
  });

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export function getAllPosts(): Post[] {
  return readAllPosts();
}

export function getAllPostsMeta(): PostMeta[] {
  // Strip the MDX body; callers of this function only need metadata.
  return readAllPosts().map(({ content: _body, ...meta }) => meta);
}

export function getPostBySlug(slug: string): Post | undefined {
  return readAllPosts().find((p) => p.slug === slug);
}

export function getFeaturedPosts(): PostMeta[] {
  const all = getAllPostsMeta();
  const featured = all.filter((p) => p.featured);
  return featured.length > 0 ? featured : all.slice(0, 1);
}

export function getRelatedPosts(slug: string, category: PostCategory): PostMeta[] {
  return getAllPostsMeta()
    .filter((p) => p.slug !== slug && p.category === category)
    .slice(0, 3);
}

export function getPostSlugs(): string[] {
  return readAllPosts().map((p) => p.slug);
}
