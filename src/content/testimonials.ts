import type { Testimonial } from "@/types";

/**
 * Testimonials, professional recommendations and employer references.
 * NOTE: placeholder content — replace with real, attributable quotes before
 * launch. Mix of client (40%) and employer/colleague (60%) reflects the
 * site's dual recruiter + client audience.
 */
export const testimonials: Testimonial[] = [
  {
    quote:
      "Daniel rebuilt our website from the ground up and our enquiries doubled within three months. He understood our business, not just the code — and the site has never been faster.",
    name: "Sarah Mitchell",
    role: "Managing Director",
    company: "Northwest Joinery Co.",
    type: "client",
    rating: 5,
  },
  {
    quote:
      "One of the most dependable engineers I've worked with. Daniel takes ownership of problems end to end, writes clean, maintainable code and raises the bar for everyone around him.",
    name: "James Okafor",
    role: "Engineering Manager",
    company: "Mersey Software Group",
    type: "employer",
    rating: 5,
  },
  {
    quote:
      "Our Core Web Vitals were a mess and it was hurting our rankings. Daniel's audit was clear and actionable, and the performance work he delivered moved us into the green across the board.",
    name: "Priya Sharma",
    role: "Marketing Lead",
    company: "Lumen Retail",
    type: "client",
    rating: 5,
  },
  {
    quote:
      "Daniel pairs strong technical instincts with genuine product thinking. He's equally comfortable shipping a feature, mentoring a junior or explaining a trade-off to non-technical stakeholders.",
    name: "Tom Bradley",
    role: "Technical Lead",
    company: "Vega Digital",
    type: "colleague",
    rating: 5,
  },
  {
    quote:
      "We needed a developer who could be trusted to deliver without hand-holding. Daniel scoped, built and launched our booking platform on time and has supported it flawlessly ever since.",
    name: "Hannah Lewis",
    role: "Founder",
    company: "Coastline Wellness",
    type: "client",
    rating: 5,
  },
  {
    quote:
      "A standout hire. Daniel consistently delivered high-quality work, communicated proactively, and brought a calm, problem-solving mindset to everything from architecture to last-minute fixes.",
    name: "David Chen",
    role: "CTO",
    company: "Atlas Commerce",
    type: "employer",
    rating: 5,
  },
];
