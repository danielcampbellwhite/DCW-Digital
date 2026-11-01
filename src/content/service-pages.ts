/**
 * Long-form content for the individual service landing pages at
 * /services/[slug]. Each page targets one search intent (e.g. "website audit
 * UK") so it can rank on its own, rather than everything competing on the
 * single /services overview.
 *
 * Keyed by the service slug in `services.ts`.
 */

export interface ServicePageContent {
  /** <title> - keep under ~45 chars so " · DCW Digital" still fits in 60. */
  seoTitle: string;
  /** Meta description - aim for 130-155 characters. */
  seoDescription: string;
  /** Visible H1. */
  headline: string;
  /** Short line under the H1. */
  lede: string;
  /** Opening paragraphs. */
  intro: string[];
  /** "Who it's for" bullet points. */
  whoFor: string[];
  /** Detailed breakdown of what's involved. */
  sections: { title: string; body: string }[];
  /** How the work runs, step by step. */
  steps: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  /** Blog posts to link to (slugs). */
  relatedPosts: string[];
}

export const servicePages: Record<string, ServicePageContent> = {
  "website-development": {
    seoTitle: "Website Development in Liverpool",
    seoDescription:
      "Bespoke website and web app development from a Liverpool developer. Fast, accessible sites built with Next.js, with SEO set up properly from day one.",
    headline: "Website development that's built to last",
    lede: "Bespoke websites and web apps for businesses in Liverpool and across the UK, built by the person you actually talk to.",
    intro: [
      "Most small business websites are either a template that looks like everyone else's, or something an agency built years ago that nobody can update. I build sites that sit in between: designed around what your business needs, quick to load, and simple for you to keep up to date.",
      "I work mainly with Next.js, React and TypeScript, the same tools used by a lot of the big sites you use every day. You don't need to care about any of that. What it means for you is a site that loads fast, ranks well and doesn't fall apart the first time someone needs to change it.",
    ],
    whoFor: [
      "Businesses whose current site looks dated or doesn't bring in enquiries",
      "New businesses that want to start with something solid",
      "Organisations that need more than a brochure site: bookings, accounts, dashboards",
      "Anyone stuck with a site they can't update without calling a developer",
    ],
    sections: [
      {
        title: "Business and brochure websites",
        body: "A clear, well-structured site that explains what you do, builds trust and makes it easy to get in touch. Every page has a job, and the contact route is never more than a click away.",
      },
      {
        title: "Landing pages and campaign sites",
        body: "Focused pages for a single product, offer or campaign. Built quickly, tested on real phones, and set up so you can tell whether they're working.",
      },
      {
        title: "Online shops",
        body: "Shops that are quick to browse and easy to check out from, using a platform that suits the size of your catalogue, whether that's Shopify or something custom.",
      },
      {
        title: "Web apps and booking systems",
        body: "When off-the-shelf doesn't fit: booking flows, customer portals, internal tools and dashboards. Properly planned, tested and documented so you're not tied to me forever.",
      },
      {
        title: "SEO and speed as standard",
        body: "Proper page titles, structured data, a sitemap, good Core Web Vitals and accessible markup are part of the build, not an extra you pay for later.",
      },
    ],
    steps: [
      { title: "A chat", body: "We talk about what the site needs to do, who it's for and what you've got already." },
      { title: "A plan", body: "I put together pages, features, timings and a fixed quote, so there are no surprises." },
      { title: "Design", body: "You see how the key pages will look and we tweak them together before I build." },
      { title: "Build and test", body: "I build it, you review it on a private link, and I test it on real devices." },
      { title: "Launch and support", body: "We go live, I check everything is indexed and working, and I'm on hand afterwards." },
    ],
    faqs: [
      {
        q: "How much does a website cost?",
        a: "It depends on what the site needs to do. A small business site is a very different job to a booking system. After a quick chat I'll give you a fixed quote, so you know the cost before anything starts.",
      },
      {
        q: "How long does it take?",
        a: "A straightforward business site usually takes a few weeks from sign-off to launch. Bigger builds and web apps take longer, and I'll give you a realistic timeline in the plan.",
      },
      {
        q: "Will I be able to update the site myself?",
        a: "Yes, if you want to. I can set up a simple content editor for the parts you'll change often, like news, services or team members. If you'd rather not, a support plan covers changes for you.",
      },
      {
        q: "Do you only work with businesses in Liverpool?",
        a: "No. I'm based in Liverpool and happy to meet locally, but I work with businesses across the UK. Most of the work happens remotely anyway.",
      },
      {
        q: "Can you redesign my existing website?",
        a: "Yes. I'll usually start with a quick review of your current site so we keep what's working, like pages that already rank well, and fix what isn't.",
      },
    ],
    relatedPosts: [
      "why-i-build-with-nextjs",
      "turn-your-website-into-a-lead-engine",
      "why-your-business-website-should-be-fast",
    ],
  },

  "website-auditing": {
    seoTitle: "Website Audits: Speed, SEO & Security",
    seoDescription:
      "A clear, prioritised website audit covering speed, SEO, accessibility, UX and security. Plain-English findings and a fix list you can hand to any developer.",
    headline: "A website audit that tells you what to fix first",
    lede: "Find out what's holding your site back, in plain English, with the quick wins split from the bigger jobs.",
    intro: [
      "If your website isn't bringing in the enquiries it should, there's usually a reason. It might be slow on phones, missing basic SEO, confusing to use, or sitting on out-of-date software. Often it's a bit of everything.",
      "An audit looks at the whole thing properly and gives you a prioritised list of what to fix. You can bring the fixes to me, hand them to your existing developer, or do some of them yourself. Either way, you'll know where the problems are.",
    ],
    whoFor: [
      "Sites that get visitors but not enquiries",
      "Sites that have dropped in Google or never ranked at all",
      "Businesses about to redesign who want to know what to keep",
      "Anyone who's been told their site is 'fine' but isn't so sure",
    ],
    sections: [
      {
        title: "Performance and Core Web Vitals",
        body: "How fast the site loads on a real phone, what's slowing it down (usually images, scripts or hosting), and how it measures up against the Core Web Vitals Google uses for ranking.",
      },
      {
        title: "Technical SEO",
        body: "Indexing, page titles and descriptions, headings, internal links, structured data, sitemaps, redirects and duplicate content. The technical side that decides whether Google can find and understand your pages.",
      },
      {
        title: "UX and conversion",
        body: "Whether visitors can quickly work out what you do and how to contact you. I look at navigation, calls to action, forms and mobile layout through the eyes of a first-time visitor.",
      },
      {
        title: "Accessibility",
        body: "Checked against WCAG guidelines: contrast, keyboard use, screen reader labels, form errors. This is a legal expectation for many organisations, and it makes the site better for everyone.",
      },
      {
        title: "Security",
        body: "Out-of-date plugins and software, missing security headers, exposed admin areas, SSL setup and backups. The things that turn into an emergency if they're ignored.",
      },
    ],
    steps: [
      { title: "Tell me about the site", body: "What it's for, what's bothering you about it, and any goals you have." },
      { title: "I run the audit", body: "Automated testing plus a proper manual review. Tools find a lot, but not everything." },
      { title: "You get the report", body: "A written report with findings ranked by impact and effort, in plain English." },
      { title: "We go through it", body: "A call to talk through the findings and answer questions, so nothing is left unclear." },
    ],
    faqs: [
      {
        q: "What do I get at the end?",
        a: "A written report with every finding explained in plain English, ranked by how much it matters and how hard it is to fix. Quick wins are separated out so you can start straight away.",
      },
      {
        q: "Do I have to use you to fix the problems?",
        a: "No. The report is written so any competent developer can work from it. If you'd like me to make the fixes, I'm happy to quote for that separately.",
      },
      {
        q: "Does it matter what my site is built with?",
        a: "Not really. I can audit WordPress, Shopify, Wix, Squarespace or custom-built sites. Some fixes depend on the platform, and the report will say where that's the case.",
      },
      {
        q: "How long does an audit take?",
        a: "Usually a few working days, depending on the size of the site. I'll give you a date when we agree the audit.",
      },
    ],
    relatedPosts: [
      "technical-seo-checklist-2026",
      "automating-website-audits-with-claude-and-github-actions",
      "why-your-business-website-should-be-fast",
    ],
  },

  "support-maintenance": {
    seoTitle: "Website Support & Maintenance Plans",
    seoDescription:
      "Monthly website support and maintenance plans from £75. Updates, backups, monitoring and a real developer on hand for changes. Liverpool-based, UK-wide.",
    headline: "Website support and maintenance, sorted",
    lede: "Monthly care plans that keep your site secure, backed up and running, with a real person to call when you need a change.",
    intro: [
      "A website isn't something you build once and forget about. Software needs updating, plugins go out of date, hosting has the odd wobble, and sooner or later you'll want something changed. Left alone, small problems turn into a hacked site or a page that's quietly been broken for months.",
      "My care plans take that off your plate. Updates, backups and monitoring happen in the background, and when you need a change you message me and it gets done. One fixed monthly cost, no chasing an agency that's moved on to the next client.",
    ],
    whoFor: [
      "Businesses that rely on their website for enquiries or sales",
      "Site owners who don't have time to keep on top of updates",
      "Anyone whose previous developer has disappeared",
      "WordPress sites that haven't been updated in a while",
    ],
    sections: [
      {
        title: "Updates and security",
        body: "Software, theme and plugin updates applied and checked, so you're not running known security holes. If an update breaks something, I fix it.",
      },
      {
        title: "Backups you can actually restore",
        body: "Regular off-site backups, so if the worst happens we can roll back. Backups are only useful if they actually restore, so they get checked.",
      },
      {
        title: "Uptime monitoring",
        body: "Your site is checked around the clock. If it goes down, I know about it, usually before you do.",
      },
      {
        title: "Changes and help",
        body: "Each plan includes time for content updates, small fixes and questions. New page, updated prices, a change to the contact form: just ask.",
      },
    ],
    steps: [
      { title: "Pick a plan", body: "Choose Bronze, Silver or Gold. Not sure? We can talk it through." },
      { title: "Onboarding", body: "I get access, take a full backup, check the site over and fix anything urgent." },
      { title: "Ongoing care", body: "Updates, backups and monitoring run every month without you lifting a finger." },
      { title: "Ask any time", body: "Send changes and questions whenever you need, and they're handled within your plan's response time." },
    ],
    faqs: [
      {
        q: "Can I cancel?",
        a: "Yes. Monthly plans run month to month, so you're not locked in. Yearly plans are paid up front and get you two months free.",
      },
      {
        q: "Do you look after sites you didn't build?",
        a: "Yes. Most of the sites I look after were built by someone else. I'll check yours over at the start so I know what I'm working with.",
      },
      {
        q: "What if I need more changes than my plan includes?",
        a: "I'll let you know before going over, and any extra time is charged at an agreed hourly rate. If it keeps happening, it's probably worth moving up a plan.",
      },
      {
        q: "Does it include hosting?",
        a: "Plans cover looking after the site. Hosting can stay where it is, or I can help you move to something faster and more reliable.",
      },
    ],
    relatedPosts: [
      "why-vercel-is-the-deployment-tool-everyones-talking-about",
      "php2shell-and-the-claude-code-extension-backdoor",
      "from-support-ticket-to-pull-request",
    ],
  },

  "digital-partner": {
    seoTitle: "Freelance Digital Partner for Businesses",
    seoDescription:
      "An on-call web developer and digital adviser for your business. Advice, small jobs and tech decisions, charged only for the time you use and invoiced monthly.",
    headline: "A developer in your corner, when you need one",
    lede: "Advice and ad-hoc web work without hiring anyone or committing to a big project. You only pay for the time you use.",
    intro: [
      "Lots of businesses don't need a full-time developer or a big project. They need someone reliable to ask: is this quote fair, which booking system should we use, can you just fix this form, why has our traffic dropped?",
      "That's what a digital partner is. I get to know your business and your systems, and I'm on hand when something comes up. Work is logged as it happens and invoiced monthly, so there's no retainer to justify and no big upfront bill.",
    ],
    whoFor: [
      "Small businesses without an in-house developer",
      "Teams that need a second opinion on tech decisions or agency quotes",
      "Businesses with a steady trickle of small website jobs",
      "Organisations that want advice on using AI tools safely",
    ],
    sections: [
      {
        title: "Advice and second opinions",
        body: "Choosing a platform, reviewing a quote from an agency, deciding whether to redesign or fix what you've got. An honest answer from someone with nothing to sell you.",
      },
      {
        title: "Small fixes and changes",
        body: "The jobs that are too small for a project but still need doing properly: a broken form, a new landing page, a tracking code, an email that keeps going to spam.",
      },
      {
        title: "Tech and tooling decisions",
        body: "Picking the right tools for bookings, payments, email, CRM or analytics, and getting them talking to each other.",
      },
      {
        title: "Using AI properly",
        body: "Where AI tools can genuinely save your team time, where they can't, and how to use them without leaking client data. I use them every day and I'm upfront about the risks.",
      },
    ],
    steps: [
      { title: "Intro call", body: "We talk about your business, your current setup and what tends to come up." },
      { title: "Get set up", body: "I get the access I need and an overview of your systems, so I'm ready when you call." },
      { title: "Ask when you need", body: "Message me with questions or jobs. I'll tell you roughly how long something will take first." },
      { title: "Monthly invoice", body: "Time is logged as it's used and invoiced at the end of the month. Nothing used, nothing to pay." },
    ],
    faqs: [
      {
        q: "Is there a minimum commitment?",
        a: "No. There's no retainer. You're charged for the time you actually use, invoiced monthly.",
      },
      {
        q: "How is this different from a support plan?",
        a: "A support plan is a fixed monthly fee for looking after one website. Being your digital partner is broader and pay-as-you-go: advice, decisions and jobs across all your digital tools, not just the site.",
      },
      {
        q: "How quickly will you respond?",
        a: "Usually within a working day. If something is urgent, say so and I'll prioritise it where I can.",
      },
    ],
    relatedPosts: [
      "the-tools-i-actually-use",
      "the-day-claude-went-down",
      "turn-your-website-into-a-lead-engine",
    ],
  },
};
