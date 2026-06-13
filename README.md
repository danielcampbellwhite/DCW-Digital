# DCW Digital

**Daniel Campbell-White — Web Development, SEO & Digital Solutions.**

The flagship website and personal brand of Daniel Campbell-White, trading as
DCW Digital. It works as a **professional portfolio**, a **personal brand
site**, a **lead-generation engine** and a **digital consultancy** — built to
impress both recruiters/hiring managers and prospective clients.

Built as a production-ready Next.js application: fast, accessible, SEO-first
and easy to maintain.

---

## ✨ Highlights

- **Next.js 15 (App Router) + React 19 + TypeScript** (strict).
- **Tailwind CSS** design system with a custom dark, futuristic brand palette.
- **shadcn-style** component library (hand-authored, fully owned).
- **Framer Motion** animation system — scroll reveals, staggered grids,
  animated counters, an animated process timeline, and a scroll progress bar.
- **Command palette** (`⌘K` / `Ctrl+K`) for instant navigation.
- **Contact form** with React Hook Form + Zod validation, an API route with a
  honeypot, and loading / success / error states. Delivers via Resend when
  configured, otherwise logs in development.
- **MDX blog** with search, category filtering, featured + related posts.
- **Filterable, animated portfolio** with full case-study pages.
- **Production SEO**: Metadata API, dynamic OG images, canonical URLs,
  `sitemap.xml`, `robots.txt`, web manifest, and JSON-LD structured data
  (`Person`, `ProfessionalService`, `LocalBusiness`, `BlogPosting`,
  `BreadcrumbList`).
- **Accessibility**: semantic HTML, skip link, visible focus states, keyboard
  navigation, ARIA where needed, and full `prefers-reduced-motion` support.

---

## 🧱 Tech stack

| Area | Choice |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict, `noUncheckedIndexedAccess`) |
| Styling | Tailwind CSS + `tailwindcss-animate` |
| UI primitives | shadcn-style (CVA + `tailwind-merge`) |
| Animation | Framer Motion |
| Forms | React Hook Form + Zod + `@hookform/resolvers` |
| Content | MDX via `next-mdx-remote/rsc` + `gray-matter` |
| Icons | `lucide-react` |
| Fonts | Space Grotesk (headings), Inter (body), JetBrains Mono (code) via `next/font` |
| Hosting | Vercel-ready |

---

## 📁 Project structure

```
DCW-Digital/
├── content/
│   └── blog/                  # MDX blog posts (frontmatter + body)
├── public/                    # Static assets (favicon, CV, future images)
├── src/
│   ├── app/                   # App Router routes
│   │   ├── about/             # /about
│   │   ├── api/contact/       # POST contact handler
│   │   ├── blog/              # /blog and /blog/[slug]
│   │   ├── contact/           # /contact
│   │   ├── privacy/           # /privacy
│   │   ├── projects/          # /projects and /projects/[slug]
│   │   ├── services/          # /services
│   │   ├── globals.css        # Design tokens + base styles
│   │   ├── layout.tsx         # Root layout, fonts, global chrome, schema
│   │   ├── manifest.ts        # PWA web manifest
│   │   ├── not-found.tsx      # 404
│   │   ├── opengraph-image.tsx# Dynamic OG/Twitter card image
│   │   ├── page.tsx           # Homepage (composed of sections)
│   │   ├── robots.ts          # robots.txt
│   │   └── sitemap.ts         # sitemap.xml
│   ├── components/
│   │   ├── blog/              # Blog index + MDX renderer
│   │   ├── brand/             # Logo, atmosphere (grid/aurora/particles)
│   │   ├── command/           # ⌘K command palette
│   │   ├── contact/           # Contact form
│   │   ├── layout/            # Navbar, footer, scroll progress
│   │   ├── motion/            # Reveal, stagger, animated counter
│   │   ├── projects/          # Project card, grid, gradient visual
│   │   ├── sections/          # Homepage + shared page sections
│   │   ├── seo/               # JSON-LD component
│   │   ├── services/          # Service card
│   │   └── ui/                # Button, Card, Input, Badge, etc.
│   ├── content/               # Typed content collections (services, projects,
│   │                          #   expertise, testimonials, timeline)
│   ├── lib/                   # site config, seo helpers, blog reader,
│   │                          #   validations, constants, utils
│   └── types/                 # Shared TypeScript types
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

### Content management

Content lives in two places, both designed to be edited without touching
component code:

- **Typed collections** in `src/content/` — `services.ts`, `projects.ts`,
  `expertise.ts`, `testimonials.ts`, `timeline.ts`. Strongly typed against
  `src/types`, so editing is safe and autocompleted.
- **Blog posts** in `content/blog/*.mdx` — standard frontmatter (`title`,
  `description`, `date`, `category`, `tags`, `author`, `featured`, `cover`)
  plus an MDX body. Drop in a new `.mdx` file and it's automatically picked up
  by the index, sitemap and static generation.

---

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local   # then fill in values

# 3. Run the dev server
npm run dev                  # http://localhost:3000

# Other scripts
npm run build                # production build
npm run start                # run the production build
npm run lint                 # ESLint
npm run typecheck            # tsc --noEmit
```

---

## 🔐 Environment variables

See [`.env.example`](./.env.example). All are optional for local development.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | Recommended | Canonical site URL for metadata, sitemap, schema. |
| `NEXT_PUBLIC_BOOKING_URL` | Optional | "Book a Discovery Call" link (Cal.com/Calendly). |
| `RESEND_API_KEY` | For email | Enables contact-form email delivery via Resend. Without it, submissions are logged. |
| `CONTACT_TO_EMAIL` | For email | Where enquiries are sent. |
| `CONTACT_FROM_EMAIL` | For email | Verified sender address for Resend. |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Optional | Enables privacy-friendly analytics. |

---

## ☁️ Deployment (Vercel)

1. Push this repository to GitHub (already configured).
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected). No build overrides needed.
4. Add the environment variables above in **Project Settings → Environment
   Variables**.
5. Deploy. Set your custom domain and update `NEXT_PUBLIC_SITE_URL` to match.

The app builds cleanly with `next build` and can also be deployed to any
Node host that supports Next.js 15.

---

## ✅ Production launch checklist

**Content**
- [ ] Replace `public/daniel-campbell-white-cv.pdf` with the real CV.
- [ ] Replace gradient placeholders with real project screenshots + a headshot.
- [ ] Replace placeholder testimonials with real, attributable quotes.
- [ ] Review the career timeline, metrics and copy for accuracy.
- [ ] Update social links in `src/lib/site.ts`.

**Configuration**
- [ ] Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- [ ] Configure `RESEND_API_KEY` + contact emails and send a test enquiry.
- [ ] Set `NEXT_PUBLIC_BOOKING_URL` to the real booking link.

**SEO & analytics**
- [ ] Verify the domain in Google Search Console and submit `sitemap.xml`.
- [ ] Confirm OG image renders (`/opengraph-image`) via a social debugger.
- [ ] Validate structured data with the Rich Results Test.
- [ ] Enable analytics if desired.

**Quality**
- [ ] Run Lighthouse — target **95+** across Performance, A11y, Best
      Practices, SEO.
- [ ] Test keyboard navigation and the `⌘K` palette.
- [ ] Test on mobile + with reduced-motion enabled.
- [ ] `npm run build && npm run lint && npm run typecheck` all green.

---

## 🎨 Design system

Brand tokens are defined as HSL CSS variables in `src/app/globals.css` and
exposed through `tailwind.config.ts`:

| Token | Value |
| --- | --- |
| Background | `#050816` |
| Surface | `#0B1020` |
| Primary | `#00E5FF` |
| Secondary | `#7C3AED` |
| Accent | `#00FFB3` |
| Text | `#F8FAFC` |
| Muted | `#94A3B8` |

Reusable helpers: `.glass`, `.text-gradient`, `.eyebrow`, `.card-surface`,
`.container-px`.

---

© Daniel Campbell-White · DCW Digital. All rights reserved.
