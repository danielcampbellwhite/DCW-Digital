import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = `${siteConfig.name} - ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Dynamically generated Open Graph / Twitter card image. */
export default function OpengraphImage() {
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
            "radial-gradient(60% 60% at 20% 0%, rgba(0,229,255,0.20) 0%, rgba(5,8,22,0) 60%), radial-gradient(50% 50% at 90% 20%, rgba(124,58,237,0.22) 0%, rgba(5,8,22,0) 60%)",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 72,
              height: 72,
              borderRadius: 16,
              border: "1px solid rgba(0,229,255,0.4)",
              background: "linear-gradient(135deg, rgba(0,229,255,0.2), rgba(124,58,237,0.2))",
              color: "#00E5FF",
              fontSize: 40,
              fontWeight: 700,
            }}
          >
            D
          </div>
          <div style={{ color: "#F8FAFC", fontSize: 34, fontWeight: 700 }}>
            DCW Digital
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#F8FAFC",
              fontSize: 68,
              fontWeight: 700,
              lineHeight: 1.05,
              maxWidth: 980,
            }}
          >
            Building Modern Websites That Help Businesses Grow
          </div>
          <div style={{ color: "#94A3B8", fontSize: 30, marginTop: 24 }}>
            Daniel Campbell-White · Web Development, SEO &amp; Digital Solutions
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["#00E5FF", "#00FFB3", "#7C3AED"].map((c) => (
            <div
              key={c}
              style={{ width: 120, height: 8, borderRadius: 9999, backgroundColor: c }}
            />
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
