import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/blog";
import { siteConfig } from "@/lib/site";

export const alt = "DCW Digital blog post";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * Dynamic Open Graph / Twitter card for each blog post: an on-brand card
 * showing the post's category and title. Overrides the site-wide OG image for
 * /blog/[slug], so every post gets a distinct, readable share preview.
 */
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  const title = post?.title ?? siteConfig.name;
  const category = post?.category ?? "Blog";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#050816",
          backgroundImage:
            "radial-gradient(55% 55% at 15% 0%, rgba(0,229,255,0.22) 0%, rgba(5,8,22,0) 60%), radial-gradient(50% 50% at 95% 100%, rgba(124,58,237,0.24) 0%, rgba(5,8,22,0) 60%)",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        {/* Brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 64,
              height: 64,
              borderRadius: 14,
              border: "1px solid rgba(0,229,255,0.4)",
              background:
                "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(124,58,237,0.2))",
              color: "#00E5FF",
              fontSize: 34,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ color: "#F8FAFC", fontSize: 30, fontWeight: 700 }}>
            DCW Digital
          </div>
        </div>

        {/* Title block */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              color: "#00FFB3",
              fontSize: 24,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 2,
              border: "1px solid rgba(0,255,179,0.3)",
              borderRadius: 999,
              padding: "8px 18px",
              marginBottom: 28,
            }}
          >
            {category}
          </div>
          <div
            style={{
              color: "#F8FAFC",
              fontSize: title.length > 55 ? 56 : 68,
              fontWeight: 700,
              lineHeight: 1.08,
              maxWidth: 1000,
            }}
          >
            {title}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", gap: 10 }}>
            {["#00E5FF", "#00FFB3", "#7C3AED"].map((c) => (
              <div
                key={c}
                style={{
                  width: 90,
                  height: 8,
                  borderRadius: 999,
                  backgroundColor: c,
                }}
              />
            ))}
          </div>
          <div style={{ color: "#94A3B8", fontSize: 24, marginLeft: "auto" }}>
            dcw-digital.co.uk/blog
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
