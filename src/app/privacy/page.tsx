import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/sections/page-header";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses and protects your personal data.`,
  path: "/privacy",
});

const lastUpdated = "13 June 2026";

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        description={`How ${siteConfig.name} handles your data. Last updated ${lastUpdated}.`}
      />

      <section className="py-16">
        <div className="container-px mx-auto max-w-2xl">
          <div className="space-y-8 text-muted-foreground">
            <p>
              This privacy policy explains how {siteConfig.owner}, trading as{" "}
              {siteConfig.name} (&quot;I&quot;, &quot;me&quot;), collects and uses
              your personal data when you use this website or contact me. I am the
              data controller for the purposes of UK GDPR.
            </p>

            <Block title="1. Information I collect">
              <p>
                I only collect data you choose to provide — primarily through the
                contact form: your name, email address, and optionally your company,
                phone number, budget, the service you&apos;re interested in, and your
                message. Basic, anonymised analytics may also be collected to
                understand how the site is used.
              </p>
            </Block>

            <Block title="2. How I use your information">
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>To respond to your enquiry and provide the services you request.</li>
                <li>To send you information you&apos;ve specifically asked for, such as a quote or audit.</li>
                <li>To improve the website and understand how it&apos;s used.</li>
              </ul>
              <p className="mt-3">
                I will never sell your data, and I will only contact you about
                matters relevant to your enquiry.
              </p>
            </Block>

            <Block title="3. Legal basis for processing">
              <p>
                I process your contact data on the basis of taking steps at your
                request prior to entering into a contract, and my legitimate
                interest in responding to enquiries about my services.
              </p>
            </Block>

            <Block title="4. Data sharing">
              <p>
                Your data may be processed by trusted third-party providers that
                power this website, such as hosting (Vercel) and email delivery
                (Resend). These providers process data on my behalf under
                appropriate agreements and never use it for their own purposes.
              </p>
            </Block>

            <Block title="5. Data retention">
              <p>
                I keep enquiry data only for as long as necessary to respond to you
                and fulfil any resulting engagement, after which it is deleted or
                anonymised.
              </p>
            </Block>

            <Block title="6. Your rights">
              <p>
                Under UK GDPR you have the right to access, correct, delete or
                restrict the processing of your personal data, and to object to
                processing. To exercise any of these rights, get in touch via the{" "}
                <Link
                  href="/contact"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  contact form
                </Link>
                .
              </p>
            </Block>

            <Block title="7. Cookies">
              <p>
                This site uses only essential cookies required for it to function,
                and privacy-friendly, anonymised analytics. No advertising or
                cross-site tracking cookies are used.
              </p>
            </Block>

            <Block title="8. Contact">
              <p>
                Questions about this policy or your data? Get in touch via the{" "}
                <Link
                  href="/contact"
                  className="text-primary underline-offset-4 hover:underline"
                >
                  contact form
                </Link>
                . You also have the right to complain to the UK&apos;s Information
                Commissioner&apos;s Office (ICO).
              </p>
            </Block>
          </div>
        </div>
      </section>
    </>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-foreground">{title}</h2>
      <div className="mt-2">{children}</div>
    </div>
  );
}
