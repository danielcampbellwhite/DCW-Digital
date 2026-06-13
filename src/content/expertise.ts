import { Layout, Server, Search, Cloud } from "lucide-react";
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

/** Core expertise cards for the homepage. */
export const expertise: ExpertiseArea[] = [
  {
    title: "Frontend",
    icon: Layout,
    description:
      "Interfaces that are fast, accessible and a pleasure to use — built with a modern component architecture.",
    skills: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS"],
  },
  {
    title: "Backend",
    icon: Server,
    description:
      "Reliable APIs, authentication and data layers that scale with your business.",
    skills: ["Node.js", "APIs", "Authentication", "Databases"],
  },
  {
    title: "SEO & Performance",
    icon: Search,
    description:
      "Technical foundations that help you rank, load instantly and convert more visitors.",
    skills: [
      "Technical SEO",
      "Core Web Vitals",
      "Content Optimisation",
      "Structured Data",
    ],
  },
  {
    title: "Infrastructure",
    icon: Cloud,
    description:
      "Deployment, hosting and pipelines that keep your site secure, online and effortless to update.",
    skills: ["Hosting", "Deployment", "CI/CD", "Maintenance"],
  },
];

/** "How I Work" process steps. */
export const processSteps: ProcessStep[] = [
  {
    step: 1,
    title: "Discovery",
    description:
      "We start by understanding your goals, audience and constraints. No assumptions — just the right questions.",
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
      "Clean, on-brand interface design focused on clarity, trust and conversion — reviewed together before a line of code.",
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
    value: 25,
    suffix: "+",
    description: "Across the modern web stack",
  },
  {
    label: "Client Satisfaction",
    value: 98,
    suffix: "%",
    description: "Would recommend DCW Digital",
  },
];
