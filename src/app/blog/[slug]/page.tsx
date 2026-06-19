import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Clock, ArrowUpRight, Calendar } from "lucide-react";
import { buildMetadata, blogPostingSchema, breadcrumbSchema } from "@/lib/seo";
import {
  getPostBySlug,
  getPostSlugs,
  getRelatedPosts,
} from "@/lib/blog";
import { formatDate } from "@/lib/utils";
import { siteConfig } from "@/lib/site";
import { Atmosphere } from "@/components/brand/atmosphere";
import { PostCover } from "@/components/blog/post-cover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JsonLd } from "@/components/seo/json-ld";
import { mdxComponents } from "@/components/blog/mdx";

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return buildMetadata({ title: "Post not found" });

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    tags: post.tags,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const related = getRelatedPosts(post.slug, post.category);

  return (
    <>
      <JsonLd
        data={blogPostingSchema({
          title: post.title,
          description: post.description,
          date: post.date,
          slug: post.slug,
          cover: post.cover,
        })}
      />
      <JsonLd
        data={breadcrumbSchema([
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-border pt-28">
        <Atmosphere particles={8} />
        <div className="container-px relative z-10 pb-12">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" /> All articles
          </Link>
          <div className="mt-6 max-w-3xl">
            <Badge variant="primary">{post.category}</Badge>
            <h1 className="mt-4 text-balance text-3xl font-bold sm:text-5xl">
              {post.title}
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground sm:text-lg">
              {post.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Image
                  src={siteConfig.headshot}
                  alt={post.author}
                  width={28}
                  height={28}
                  className="size-7 rounded-full border border-primary/30 object-cover"
                />
                {post.author}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="size-4" /> {formatDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" /> {post.readingTime} min read
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="container-px py-16">
        <article className="mx-auto max-w-2xl">
          <PostCover cover={post.cover} alt={post.title} priority />
          <div className="mt-10">
            <MDXRemote
              source={post.content}
              components={mdxComponents}
              options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            />
          </div>

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-border pt-8">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-border bg-surface/50 px-3 py-1 text-xs text-muted-foreground"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="mt-12 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 to-card p-8 text-center">
            <h2 className="font-heading text-xl font-bold">
              Want this kind of thinking applied to your website?
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Get in touch and let&apos;s talk about your goals.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button href="/contact" variant="primary">
                Get in touch
              </Button>
              <Button href="/contact?service=Free+Website+Health+Check" variant="outline">
                Free Website Health Check
              </Button>
            </div>
          </div>
        </article>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mx-auto mt-20 max-w-5xl">
            <h2 className="font-heading text-2xl font-bold">Related articles</h2>
            <div className="mt-6 grid gap-6 md:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card p-3 transition-colors hover:border-primary/40"
                >
                  <PostCover cover={r.cover} alt={r.title} />
                  <div className="p-4">
                    <h3 className="font-heading font-semibold leading-snug">{r.title}</h3>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm text-primary">
                      Read
                      <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
