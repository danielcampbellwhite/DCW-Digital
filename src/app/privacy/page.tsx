import type { Metadata } from "next";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { siteConfig } from "@/lib/site";
import { PageHeader } from "@/components/sections/page-header";

export const metadata: Metadata = buildMetadata({
  title: "Privacy Policy",
  description:
    "How DCW Digital collects, uses and protects your personal data, including contact form enquiries, business outreach and your rights under UK GDPR.",
  path: "/privacy",
});

const lastUpdated = "3 November 2026";

const linkCls = "text-primary underline-offset-4 hover:underline";

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
              personal data when you use this website, get in touch, or when I
              contact your business. I am the data controller for the purposes of
              UK GDPR and the Data Protection Act 2018.
            </p>

            <Block title="1. Information I collect">
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground">When you use the contact form:</strong>{" "}
                  your name and email address, plus anything else you choose to
                  give me: company, phone number, budget, the service you&apos;re
                  interested in, and your message.
                </li>
                <li>
                  <strong className="text-foreground">When you email or message me:</strong>{" "}
                  your contact details and whatever you include in your message.
                </li>
                <li>
                  <strong className="text-foreground">When I contact your business:</strong>{" "}
                  business contact details that are publicly available, such as
                  the email address or phone number published on your website, or
                  details from Companies House or the Charity Commission register.
                  If I mention your website, I may also note publicly visible
                  information about it, such as how quickly it loads.
                </li>
                <li>
                  <strong className="text-foreground">Website health check:</strong>{" "}
                  the address you enter is sent to Google&apos;s PageSpeed
                  Insights service to run the test, and the results may be
                  cached for a few hours. If you ask for the full report, your
                  name, email and the results are sent to me like a normal
                  contact form message.
                </li>
                <li>
                  <strong className="text-foreground">&quot;Ask DCW&quot; assistant:</strong>{" "}
                  if you use the chat assistant, your questions and the
                  conversation so far are sent to Anthropic, which provides the
                  AI model, to generate a reply. I don&apos;t store chats on my
                  servers, and your browser only keeps the conversation until
                  you close the tab. Please don&apos;t include personal or
                  sensitive details in your questions.
                </li>
                <li>
                  <strong className="text-foreground">Game leaderboards:</strong>{" "}
                  if you finish a game on the{" "}
                  <Link href="/play" className={linkCls}>
                    Play
                  </Link>{" "}
                  page, your score is added to a weekly leaderboard along with a
                  random player ID created in your browser. Players are shown
                  only by a randomly generated name (like &quot;Async Otter
                  42&quot;), so nothing on the leaderboard identifies you.
                </li>
                <li>
                  <strong className="text-foreground">Technical information:</strong>{" "}
                  to stop spam, the contact form briefly holds your IP address in
                  memory to limit repeated submissions. My hosting provider also
                  keeps standard server logs (such as IP address, browser type and
                  the pages requested) to keep the site secure and running.
                </li>
              </ul>
              <p className="mt-3">
                This site does not use analytics, advertising or tracking tools.
              </p>
            </Block>

            <Block title="2. How I use your information">
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>To reply to your enquiry and provide the services you ask for.</li>
                <li>To send you things you&apos;ve asked for, such as a quote or a website health check.</li>
                <li>To contact businesses about services that may be useful to them, such as a free website health check.</li>
                <li>To answer your questions in the chat assistant.</li>
                <li>To keep this website secure and protect it from spam and abuse.</li>
              </ul>
              <p className="mt-3">
                I will never sell your data, and I don&apos;t use it for
                automated decision-making or profiling.
              </p>
            </Block>

            <Block title="3. Legal basis for processing">
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground">Steps before a contract</strong>{" "}
                  - when you ask me about a project or service.
                </li>
                <li>
                  <strong className="text-foreground">Contract</strong> - when
                  we&apos;re working together.
                </li>
                <li>
                  <strong className="text-foreground">Legitimate interests</strong>{" "}
                  - replying to enquiries, contacting businesses about relevant
                  services, and keeping the website secure. I only rely on this
                  where it doesn&apos;t override your rights and interests.
                </li>
                <li>
                  <strong className="text-foreground">Legal obligation</strong>{" "}
                  - keeping business and financial records for tax purposes.
                </li>
              </ul>
            </Block>

            <Block title="4. If I contacted your business">
              <p>
                I sometimes email businesses and organisations to offer a free
                website health check or other services. I only use business
                contact details that the organisation has published itself, I
                keep messages relevant to the organisation, and every email tells
                you how to opt out. If you&apos;d rather not hear from me, just
                reply and say so, or use the{" "}
                <Link href="/contact" className={linkCls}>
                  contact form
                </Link>
                . I&apos;ll stop straight away and keep only a minimal note of
                your details so that I don&apos;t contact you again.
              </p>
            </Block>

            <Block title="5. Who I share your data with">
              <p>
                I don&apos;t share your data with anyone for their own use. It is
                processed on my behalf by a small number of trusted providers
                that help run this website and my business:
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-foreground">Vercel</strong> - website
                  hosting.
                </li>
                <li>
                  <strong className="text-foreground">Resend</strong> - delivering
                  contact form messages to my inbox.
                </li>
                <li>
                  <strong className="text-foreground">My email provider</strong> -
                  storing and sending email.
                </li>
                <li>
                  <strong className="text-foreground">Google</strong> - running
                  the website health check (PageSpeed Insights).
                </li>
                <li>
                  <strong className="text-foreground">Anthropic</strong> -
                  generating replies in the &quot;Ask DCW&quot; chat assistant.
                  Anthropic doesn&apos;t use these conversations to train its
                  models.
                </li>
                <li>
                  <strong className="text-foreground">Upstash</strong> - storing
                  the weekly game leaderboards.
                </li>
              </ul>
              <p className="mt-3">
                I may also share information where the law requires it.
              </p>
            </Block>

            <Block title="6. International transfers">
              <p>
                Some of these providers may process data outside the UK, including
                in the United States. Where that happens, the transfer is
                protected by appropriate safeguards, such as the UK&apos;s
                adequacy arrangements (including the UK-US data bridge) or the
                UK&apos;s approved contract clauses for international transfers.
              </p>
            </Block>

            <Block title="7. How long I keep it">
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>
                  Enquiries that don&apos;t lead to any work: up to two years
                  after we were last in touch.
                </li>
                <li>
                  Client records: for as long as we work together, then for as
                  long as the law requires for tax and accounting purposes
                  (usually six years).
                </li>
                <li>
                  Business outreach with no reply: deleted within 12 months.
                </li>
                <li>
                  Opt-out requests: a minimal record is kept so I can respect
                  your choice.
                </li>
                <li>
                  Game leaderboards: reset every week and deleted automatically
                  after five weeks.
                </li>
              </ul>
            </Block>

            <Block title="8. Cookies and local storage">
              <p>
                This site doesn&apos;t set any cookies. The games on the{" "}
                <Link href="/play" className={linkCls}>
                  Play
                </Link>{" "}
                page save your best scores, badges, sound setting and settings for hidden extras in your
                browser&apos;s local storage so they&apos;re still there next
                time. This stays on your device and you can clear it at any time
                through your browser settings. To make the site work offline,
                your browser also saves copies of its pages and images. These
                contain nothing about you and are refreshed automatically. The only exception is the random
                player ID, which is sent along with your score when you finish a
                game so the weekly leaderboard knows which scores are yours.
              </p>
            </Block>

            <Block title="9. Your rights">
              <p>Under UK GDPR you have the right to:</p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                <li>access the personal data I hold about you;</li>
                <li>have inaccurate data corrected;</li>
                <li>have your data deleted;</li>
                <li>restrict how I use your data;</li>
                <li>
                  object to how I use your data, including an absolute right to
                  object to direct marketing;
                </li>
                <li>receive your data in a portable format, where this applies.</li>
              </ul>
              <p className="mt-3">
                To use any of these rights, get in touch via the{" "}
                <Link href="/contact" className={linkCls}>
                  contact form
                </Link>
                . There&apos;s no charge, and I&apos;ll reply within one month.
              </p>
            </Block>

            <Block title="10. Keeping your data safe">
              <p>
                This website is served over an encrypted (HTTPS) connection, and
                I limit access to personal data to what&apos;s needed to run my
                business. The accounts and services I use are protected with
                strong passwords and two-factor authentication where available.
              </p>
            </Block>

            <Block title="11. Complaints">
              <p>
                If you&apos;re unhappy with how I&apos;ve handled your data,
                please get in touch first and I&apos;ll do my best to put it
                right. You also have the right to complain to the
                Information Commissioner&apos;s Office (ICO), the UK&apos;s data
                protection regulator, at{" "}
                <a
                  href="https://ico.org.uk/make-a-complaint/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={linkCls}
                >
                  ico.org.uk/make-a-complaint
                </a>{" "}
                or on 0303 123 1113.
              </p>
            </Block>

            <Block title="12. Changes to this policy">
              <p>
                I&apos;ll update this policy if the way I handle data changes.
                The date at the top shows when it was last updated.
              </p>
            </Block>

            <Block title="13. Contact">
              <p>
                Questions about this policy or your data? Get in touch via the{" "}
                <Link href="/contact" className={linkCls}>
                  contact form
                </Link>
                .
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
