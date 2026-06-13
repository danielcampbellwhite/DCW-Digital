import type { TimelineEntry } from "@/types";

/**
 * Daniel's real career & development journey, ordered earliest → most recent
 * (the About page renders it top-to-bottom in this order). Employer names are
 * kept generic where not publicly attributed.
 */
export const careerTimeline: TimelineEntry[] = [
  {
    period: "2009 – 2012",
    title: "Where it all started",
    organisation: "School",
    description:
      "I wrote my first lines of code at school, around 14 years old. By 16 I knew — without a doubt — that building for the web was what I wanted to do for a living.",
  },
  {
    period: "2013 – 2016",
    title: "BSc Web Systems Development",
    organisation: "University",
    description:
      "I went to university to study Web Systems Development, getting a proper grounding in how the web works end to end — from front-end interfaces through to servers and databases.",
  },
  {
    period: "2014 – 2018",
    title: "Freelance & hands-on learning",
    organisation: "Self-employed",
    description:
      "Around my studies I took on as much freelance web work as I could — funding it with other jobs along the way — building real-world experience, a portfolio, and an understanding of what clients actually need.",
  },
  {
    period: "2018",
    title: "Junior Developer",
    organisation: "Digital Agency",
    description:
      "I landed my first professional developer role at an agency. A busy, real-world environment where I learned fast and shipped work for a wide range of clients.",
  },
  {
    period: "2019",
    title: "Front-End Developer",
    organisation: "Digital Agency",
    description:
      "I moved into a front-end focused role, honing my craft building polished, responsive, accessible interfaces that people genuinely enjoy using.",
  },
  {
    period: "2020 – 2024",
    title: "Full-Stack Developer",
    organisation: "Digital Agency",
    description:
      "As I learned more backend programming, I gradually grew into a full-stack role — owning features end to end, from the database right through to the interface.",
  },
  {
    period: "2025 – Present",
    title: "Digital Services Lead",
    organisation: "Behaviour Change Organisation",
    description:
      "I now run the digital offer for a behaviour change organisation, working with partners to make better happen for clients, people and communities — leading a team of developers and managing projects while staying hands-on with code myself.",
    highlights: [
      "Leading and mentoring a team of developers",
      "Managing projects while remaining hands-on with the build",
      "Taking on freelance projects for small businesses as DCW Digital",
    ],
  },
];
