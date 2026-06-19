import { Layout, Server, Boxes, Database, GitBranch, Gauge } from "lucide-react";
import type { ExpertiseArea, ProcessStep, Metric } from "@/types";
import {
  Compass,
  PencilRuler,
  Palette,
  Code2,
  TestTube2,
  Rocket,
  TrendingUp,
} from "lucide-react";

/** Core expertise cards for the homepage and About page. A broad, full-stack
 *  skill set spanning frontend, .NET & PHP backends, CMS platforms, databases,
 *  tooling and performance. */
export const expertise: ExpertiseArea[] = [
  {
    title: "Frontend",
    icon: Layout,
    description:
      "Accessible, responsive interfaces built on solid markup, modern frameworks and well-structured styling.",
    skills: [
      "HTML5",
      "CSS3",
      "JavaScript",
      "TypeScript",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Sass / LESS",
      "Responsive Design",
    ],
  },
  {
    title: "Backend & Languages",
    icon: Server,
    description:
      "Robust server-side applications and APIs across the .NET, PHP and Node ecosystems.",
    skills: [
      "C# / .NET",
      "ASP.NET MVC",
      "PHP",
      "Node.js",
      "REST APIs",
      "Authentication",
    ],
  },
  {
    title: "CMS & Platforms",
    icon: Boxes,
    description:
      "Building, customising and migrating sites on the content platforms businesses already rely on.",
    skills: ["WordPress", "Umbraco", "Concrete CMS", "Drupal", "Joomla"],
  },
  {
    title: "Databases & ORM",
    icon: Database,
    description:
      "Designing reliable data layers with relational databases and modern object-relational mappers.",
    skills: [
      "SQL Server",
      "MySQL",
      "Entity Framework",
      "Fluent NHibernate",
      "ORM Design",
    ],
  },
  {
    title: "Tooling, DevOps & AI",
    icon: GitBranch,
    description:
      "Shipping with confidence - version control, automated pipelines, integrations and AI-assisted workflows.",
    skills: [
      "Git",
      "CI/CD",
      "DevOps",
      "Hosting & Deployment",
      "AI Tooling",
      "APIs & Integrations",
    ],
  },
  {
    title: "SEO & Performance",
    icon: Gauge,
    description:
      "Fast, findable, accessible websites - strong technical foundations that rank well and convert.",
    skills: [
      "Technical SEO",
      "Core Web Vitals",
      "Performance",
      "Structured Data",
      "Accessibility",
    ],
  },
];

/** "How I Work" process steps. */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Discovery",
    description:
      "We start by understanding your goals, audience and constraints. No assumptions - just the right questions.",
    icon: Compass,
  },
  {
    step: 2,
    title: "Planning",
    description:
      "I map out scope, architecture, content and timelines so everyone knows exactly what we're building and why.",
    icon: PencilRuler,
  },
  {
    step: 3,
    title: "Design",
    description:
      "Clean, on-brand interface design focused on clarity, trust and conversion - reviewed together before a line of code.",
    icon: Palette,
  },
  {
    step: 4,
    title: "Development",
    description:
      "Production-grade, well-documented code built on a modern, scalable stack with accessibility baked in.",
    icon: Code2,
  },
  {
    step: 5,
    title: "Testing",
    description:
      "Cross-browser, cross-device, performance and accessibility testing to make sure everything is rock solid.",
    icon: TestTube2,
  },
  {
    step: 6,
    title: "Launch",
    description:
      "A smooth, monitored deployment with redirects, analytics and SEO essentials configured from day one.",
    icon: Rocket,
  },
  {
    step: 7,
    title: "Growth & Support",
    description:
      "Ongoing optimisation, maintenance and advice to keep your site fast, secure and growing.",
    icon: TrendingUp,
  },
];

/** Headline credibility metrics with animated counters. */
export const metrics: Metric[] = [
  {
    label: "Years Experience",
    value: 8,
    suffix: "+",
    description: "Designing and building for the web",
  },
  {
    label: "Projects Delivered",
    value: 60,
    suffix: "+",
    description: "Sites, apps and optimisations shipped",
  },
  {
    label: "Technologies Used",
    value: 30,
    suffix: "+",
    description: "Across the full web stack",
  },
];
