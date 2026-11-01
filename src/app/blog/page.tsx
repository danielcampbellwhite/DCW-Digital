import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getAllPostsMeta, getFeaturedPosts } from "@/lib/blog";
import { PageHeader } from "@/components/sections/page-header";
import { BlogIndex } from "@/components/blog/blog-index";

export const metadata: Metadata = buildMetadata({
  title: "Blog: Web Development, SEO & AI",
  description:
    "Practical articles on web development, SEO, site speed, AI tooling and growing a business online, from a working Liverpool web developer.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getAllPostsMeta();
  const featured = getFeaturedPosts();

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title={
          <>
            The DCW Digital <span className="text-gradient">blog</span>
          </>
        }
        description="Practical, no-fluff writing on building, optimising and growing modern websites - for business owners and developers alike."
      />

      <section className="py-16">
        <div className="container-px">
          <BlogIndex posts={posts} featured={featured} />
        </div>
      </section>
    </>
  );
}
