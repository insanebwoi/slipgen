import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${siteConfig.name} collects, uses, and protects your data and the student information you upload.`,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>Last updated: {siteConfig.lastLegalUpdate}</p>

      <p>
        This policy explains what data {siteConfig.name} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) collects, why we collect it, and the choices you have.
        We&apos;ve written it in plain language because most schools and teachers using SlipGen aren&apos;t lawyers — if anything is unclear, email{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> and we&apos;ll explain.
      </p>

      <h2>Who we are</h2>
      <p>
        {siteConfig.operator}. The data controller is the operator of {siteConfig.url}. You can reach us at{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>

      <h2>What we collect</h2>
      <p>We try to collect as little as possible. The data we hold falls into three buckets:</p>

      <h3>1. Your account</h3>
      <ul>
        <li>Your email address (used to sign in and contact you about your account)</li>
        <li>Your full name, if you provided one at sign-up or through Google sign-in</li>
        <li>Your plan tier (Free / Basic / Standard) and whether your account is active or suspended</li>
        <li>Timestamps of account creation and last update</li>
      </ul>

      <h3>2. Student data you enter</h3>
      <p>
        When you use the editor, you provide student details (name, class, division, roll number, subject, optional photo, optional aspiration tag).
        This data is stored <strong>only in your browser</strong> during a session — we do <strong>not</strong> store it on our servers or share it with any third party for marketing.
      </p>
      <p>
        If you upload a student photo, it is automatically compressed in your browser before any AI request. The original file never leaves your device.
        The compressed image is only sent to our AI provider (see &ldquo;Third parties&rdquo; below) when you explicitly ask for AI cartoonisation.
      </p>

      <h3>3. Usage telemetry</h3>
      <p>To run the service we record:</p>
      <ul>
        <li>The number of slips you export (so we know how much paper SlipGen has helped save)</li>
        <li>The number of AI cartoonisations you run (so we can enforce daily plan quotas)</li>
        <li>The provider that fulfilled an AI request (e.g. Pollinations.ai), for debugging</li>
      </ul>
      <p>
        We do not log student names, photos, or any other slip content. We do not use cookies for advertising or third-party tracking.
        We do not sell, rent, or share your data.
      </p>

      <h2>How we use the data</h2>
      <ul>
        <li><strong>To run your account</strong> — authenticating you, applying your plan limits, showing your usage</li>
        <li><strong>To deliver the service</strong> — processing AI requests when you ask for them, generating PDFs in your browser</li>
        <li><strong>To improve the product</strong> — aggregate counts of how many AI runs / exports happen so we can plan capacity</li>
        <li><strong>To contact you</strong> — account emails (sign-up confirmation, password reset). We do not send marketing emails.</li>
      </ul>

      <h2>Third parties</h2>
      <p>SlipGen uses the following external services. Each only sees the minimum data needed to do its job.</p>
      <ul>
        <li><strong>Supabase</strong> — stores your account row (email, name, plan, role) and authenticates you. Hosted on AWS infrastructure.</li>
        <li><strong>Google</strong> — if you choose to sign in with Google, Google sees your sign-in attempt. We receive only your email, name, and profile picture URL.</li>
        <li><strong>Pollinations.ai / fal.ai / Replicate</strong> — when you trigger AI cartoonisation, the student photo and a text prompt are sent to whichever provider responds. Your account ID is not shared.</li>
        <li><strong>Vercel</strong> — our hosting provider. Receives standard web-server logs (IP address, request paths) for the duration needed to serve your request.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use a single category of cookies: <strong>essential</strong> cookies that keep you signed in (the Supabase auth cookie).
        Without it, you would have to sign in on every page load. We do not use any tracking, advertising, or analytics cookies.
      </p>

      <h2>How long we keep data</h2>
      <ul>
        <li>Account data is kept as long as your account exists. Delete your account by emailing us — we will wipe it within 7 days.</li>
        <li>Slip/student data is not stored server-side at all. Closing the browser tab erases it.</li>
        <li>Usage telemetry is retained for 12 months in aggregate; individual rows are pruned after 90 days.</li>
      </ul>

      <h2>Your rights</h2>
      <p>
        Under India&apos;s Digital Personal Data Protection Act, 2023 and equivalent laws in other regions, you can:
      </p>
      <ul>
        <li>Access the personal data we hold about you</li>
        <li>Correct anything that&apos;s wrong</li>
        <li>Ask us to delete your account and personal data</li>
        <li>Withdraw consent for processing (this will close your account)</li>
        <li>Lodge a complaint with the Data Protection Board of India</li>
      </ul>
      <p>
        To exercise any of these, email <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>. We respond within 7 working days.
      </p>

      <h2>Children</h2>
      <p>
        SlipGen is intended for teachers, school staff, and event organisers — adults responsible for student records.
        It is not intended for use by children under 18 directly. If you are a school using SlipGen with student data, you are responsible for ensuring you have appropriate consent
        from parents or guardians under applicable law.
      </p>

      <h2>Security</h2>
      <p>
        Authentication uses industry-standard practices (HttpOnly cookies, rate-limited login, password hashing). Row-level security in our database means
        users can only read their own rows. We use HTTPS everywhere. No security is perfect, but we treat this seriously and welcome reports of issues
        at <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a>.
      </p>

      <h2>Changes</h2>
      <p>
        We&apos;ll update this page if our practices change. The &ldquo;Last updated&rdquo; date at the top reflects the most recent change.
        Material changes will be notified to active users by email.
      </p>
    </>
  );
}
