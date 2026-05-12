import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms governing your use of ${siteConfig.name}, written in plain language for schools and teachers.`,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms of Service</h1>
      <p>Last updated: {siteConfig.lastLegalUpdate}</p>

      <p>
        These terms govern your use of {siteConfig.name} (the &ldquo;service&rdquo;). By creating an account or using the service, you agree to them.
        We&apos;ve kept them as plain as possible. If anything is unclear, write to{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>

      <h2>1. The service</h2>
      <p>
        {siteConfig.name} lets you generate print-ready student name slips with optimised layouts and optional AI photo cartoonisation.
        We provide the software; you provide the student data. You retain ownership of the data you enter — see the{" "}
        <Link href="/privacy">Privacy Policy</Link> for how we handle it.
      </p>

      <h2>2. Your account</h2>
      <ul>
        <li>You must be at least 18 years old to create an account.</li>
        <li>You are responsible for keeping your sign-in credentials secret. Don&apos;t share your password.</li>
        <li>You can sign up with email + password, or with Google.</li>
        <li>One person per account. If your school has multiple teachers, each should have their own account.</li>
      </ul>

      <h2>3. Plans and payments</h2>
      <p>
        SlipGen offers a Free tier and paid tiers (Basic, Standard). Plan limits and pricing are shown on the{" "}
        <Link href="/#pricing">pricing section</Link> of the home page. Paid plans are currently billed by direct payment via WhatsApp to the
        operator; we will update this page when self-serve billing is available.
      </p>
      <ul>
        <li>Payments are <strong>non-refundable</strong> except where required by law.</li>
        <li>We may change pricing with 30 days&apos; notice to active users. Existing paid subscriptions keep their original price until renewal.</li>
        <li>Daily AI quotas are enforced server-side. Unused daily quota does not carry over.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Upload data you don&apos;t have the right to use (e.g. photos of students without parental consent where the law requires it)</li>
        <li>Use the service to harass, defame, or otherwise harm any person, including the students whose data you enter</li>
        <li>Attempt to bypass rate limits, plan quotas, or security controls</li>
        <li>Reverse-engineer, scrape, or resell the service</li>
        <li>Upload content that is illegal, hateful, sexually explicit, or violates intellectual property</li>
      </ul>
      <p>
        We reserve the right to suspend or terminate accounts that violate these rules. In serious cases (e.g. child safety) we may
        cooperate with law enforcement.
      </p>

      <h2>5. Content you create</h2>
      <p>
        You own the slips you generate and the data you enter. You grant us a limited, non-exclusive licence to process that data
        only as needed to run the service (storing your account, fulfilling AI requests at your direction, generating exports in your browser).
        We do not claim any ownership of your content.
      </p>
      <p>
        AI-generated images returned by our providers (Pollinations.ai, fal.ai, Replicate) are subject to the licence terms of each provider.
        We make no warranty about the originality, accuracy, or suitability of AI-generated content. You are responsible for reviewing it
        before printing.
      </p>

      <h2>6. Service availability</h2>
      <p>
        SlipGen is offered &ldquo;as is&rdquo;. We aim for high uptime but make no guarantee. Scheduled maintenance, AI-provider outages,
        or hosting incidents may cause occasional disruption. We are not liable for losses arising from downtime — keep local backups of
        anything critical.
      </p>

      <h2>7. Termination</h2>
      <ul>
        <li>You can stop using SlipGen at any time. Email us to delete your account permanently.</li>
        <li>We can suspend or close accounts that violate these terms, or stop offering the service with reasonable notice to active users.</li>
        <li>Sections 4 (Acceptable use), 5 (Content), 8 (Liability), and 10 (Governing law) survive termination.</li>
      </ul>

      <h2>8. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, {siteConfig.name} and its operators are not liable for indirect, incidental, special, consequential,
        or punitive damages. Our total liability to you for any claim arising out of or relating to the service will not exceed the amount you paid us
        in the 12 months before the claim, or ₹1000, whichever is greater.
      </p>

      <h2>9. Indemnity</h2>
      <p>
        You agree to indemnify and hold harmless {siteConfig.name} from claims arising out of (a) data you uploaded without proper consent,
        (b) your violation of these terms, or (c) your violation of applicable law.
      </p>

      <h2>10. Governing law</h2>
      <p>
        These terms are governed by the laws of {siteConfig.jurisdiction}. Disputes will be resolved in the courts of {siteConfig.jurisdiction}.
      </p>

      <h2>11. Changes</h2>
      <p>
        We may update these terms. Material changes will be announced by email to active users at least 14 days before they take effect.
        Continued use after the effective date means you accept the new terms.
      </p>

      <h2>12. Contact</h2>
      <p>
        Questions, complaints, or notices under these terms: <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>
    </>
  );
}
