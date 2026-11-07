# Weekly tech roundup: editorial brief

This is the brief for the scheduled weekly post, **"This Week in Tech"**, on the DCW
Digital blog. A scheduled session reads this file every Friday, researches the news,
writes one post, checks it builds, and publishes it by pushing to `main`. Edit this file
to change how the posts are written. The schedule itself lives in Claude's scheduled
tasks.

## Who it's for

Developers, and business owners who are curious about tech. Write it so a developer
learns something and a business owner doesn't get lost. It sits on a web developer's
site, so web, security and AI topics matter most.

## What to cover

The news from the **last 7 days**. Go back as far as **14 days** if the week was quiet
or a story is still unfolding. Never cover anything older as if it were news.

Search widely, using several searches per area, and read the actual articles, not just
the headlines:

- **Security:** hacks, breaches, vulnerabilities and CVEs (especially ones being actively
  exploited or listed in CISA's KEV catalogue), supply-chain attacks (npm, PyPI,
  extensions, CI/CD), ransomware hitting well-known organisations, and UK-relevant alerts
  from the NCSC.
- **AI:** model releases, AI developer tools and agents, research that changes what's
  possible, and regulation (UK, EU, US).
- **Web platform and software engineering:** browsers, Baseline features, JavaScript and
  TypeScript, React and Next.js, Node, CSS, accessibility, performance, and major
  framework or tooling releases.
- **Cloud and infrastructure:** big outages, important pricing or policy changes, and
  hosting platforms.
- **Innovations and trends:** notable launches, open-source milestones, hardware that
  matters to developers, and wider industry shifts.

Before choosing stories, read the previous roundups (`content/blog/this-week-in-tech-*.mdx`)
and the other posts from the last month. Don't repeat a story that's already been covered
unless something significant has changed, and if it has, say what's new.

### Choosing stories

- Cover **5 to 7 stories** in total: **3 to 4 main stories** and **2 to 4 quick hits**.
- Lead with the most significant story.
- Include at least one security story and one AI story when there's anything worth
  saying about them.
- Pick what matters to people who build or run websites and software. Skip stock-market,
  celebrity or gossip angles.

## Accuracy rules (non-negotiable)

1. **Every fact needs a source.** Link every claim, date, number, version and CVE ID to
   where you found it. Prefer primary sources: vendor advisories and release notes,
   CISA, the NCSC, NVD, official engineering blogs, and the original research. Use
   reputable reporting (for example The Register, BleepingComputer, The Hacker News, Ars
   Technica, The Verge, TechCrunch) to back them up.
2. **Security incidents and CVEs need two independent sources**, one of them primary
   where possible. If you can't confirm something, leave it out.
3. **Never make anything up.** That means no invented quotes, numbers, CVE IDs, versions,
   dates or URLs. Only link to URLs you actually found and opened during research.
4. **Say how certain things are.** Mark what is *confirmed* separately from what is
   *reported* or *claimed*, and credit claims to whoever made them ("according to...").
   Don't speculate about who is to blame or why.
5. **No exploit code or step-by-step attack instructions.** Explain how something works
   only as far as it helps people protect themselves.
6. **Write in your own words.** Paraphrase. Keep any quote to one short sentence, with
   credit.
7. If research tools fail, or there isn't enough properly sourced news, **don't
   publish**. Stop and say why. A thin or unsourced post is worse than no post.

## Voice and style

- Follow the voice of the existing posts, especially
  `content/blog/php2shell-and-the-claude-code-extension-backdoor.mdx`: a first-person
  developer voice, plain English, practical and calm, with no hype.
- Use British English spelling.
- **Use plain hyphens ( - ). Never use em dashes (—) or en dashes (–).**
- Aim for about **900 to 1,500 words**.
- Don't mention prices, except the care plans if they're genuinely relevant (£75, £150
  and £250 a month). Don't include email addresses. Don't link to social media.
- Don't name any client or invent experiences ("a client of mine...").

## Structure

```
<intro: 2-3 sentences on the week's theme>

## 1. <Main story headline>
What happened (facts, dates and versions, all linked).
**Why it matters:** ...
**What to do:** ... (only when there's something useful to do)

## 2. ...   (3-4 main stories in total)

## Quick hits
- **<Short headline>:** one or two sentences, with a link.

## What I'd do this week
A short, practical checklist (3-5 items) drawn from the stories above.

---

**Sources:** [Name](url) · [Name](url) · ...

*This roundup is researched and written with the help of AI, using the sources linked
above. Spotted a mistake? [Let me know](/contact).*

*<one-line, low-key pointer to something relevant, such as the
[free website health check](/website-health-check) or a
[website audit](/services/website-auditing)>*
```

## File and frontmatter

- File: `content/blog/this-week-in-tech-YYYY-MM-DD.mdx`, using today's date (the date
  it's published).
- Frontmatter:

```yaml
---
title: "<Name the top 1-2 stories>: This Week in Tech"   # under 90 characters, specific, not clickbait
description: "<150-200 characters summing up the week>"
seoTitle: "<under 45 characters>"
seoDescription: "<130-155 characters>"
date: "YYYY-MM-DD"
category: "Tech News"
tags: ["Weekly Roundup", "<4-6 topical tags, such as Security, AI, JavaScript>"]
author: "Daniel Campbell-White"
featured: false
cover: "<cyan | violet | emerald - a different one from the last roundup>"
---
```

## MDX gotchas

The body is MDX, so `<` and `{` in normal text are read as code and break the build.
Write "under 5ms" rather than "<5ms", and put code, HTML tags, generics and braces in
backticks. Use standard Markdown links only, with no raw HTML.

## Before publishing

1. Install dependencies if `node_modules` is missing (`npm ci`).
2. `npm run build` must succeed.
3. Start the built site (`npx next start -p 3999`). Check that `/blog/<slug>` returns 200
   and shows the title, and that `/blog` lists the new post. Then stop the server you
   started.
4. Re-read the post once against the accuracy rules. Check that every link is one you
   actually opened, every date falls inside the window, and there are no em dashes
   (search the file for `—` and `–`).
5. Commit just the new post (plus any image you deliberately added) with the message
   `This Week in Tech: <date>`, then push straight to `main`. Vercel deploys it
   automatically.
6. Finish with a short report: the post title, its URL
   (`https://www.dcw-digital.co.uk/blog/<slug>`), and the stories covered.
