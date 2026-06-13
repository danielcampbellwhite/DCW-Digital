import { z } from "zod";

/** Services a visitor can enquire about (kept in sync with the service CTAs).
 *  Plain-language labels aimed at business owners, not jargon. */
export const serviceOptions = [
  "Build a new website",
  "Get found by more customers",
  "Website health check",
  "Make my website faster",
  "Website care & support",
  "Advice to grow online",
  "Free Website Health Check",
  "Employment Opportunity",
  "Something else",
] as const;

export const budgetOptions = [
  "Under £1,000",
  "£1,000 – £3,000",
  "£3,000 – £7,500",
  "£7,500 – £15,000",
  "£15,000+",
  "Not sure yet",
] as const;

/** Zod schema shared between the client form and the API route. */
export const contactSchema = z.object({
  name: z
    .string()
    .min(2, "Please enter your name")
    .max(80, "That name seems too long"),
  email: z.string().email("Please enter a valid email address"),
  company: z.string().max(120).optional().or(z.literal("")),
  phone: z
    .string()
    .max(30)
    .optional()
    .or(z.literal("")),
  budget: z.enum(budgetOptions).optional().or(z.literal("")),
  service: z.enum(serviceOptions, {
    errorMap: () => ({ message: "Please choose a service" }),
  }),
  message: z
    .string()
    .min(20, "Please tell me a little more (at least 20 characters)")
    .max(4000, "That message is a bit long — please trim it down"),
  // Honeypot: must stay empty. Real users never fill this.
  website: z.string().max(0).optional(),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
