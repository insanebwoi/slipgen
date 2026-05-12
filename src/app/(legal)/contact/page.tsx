import type { Metadata } from "next";
import { siteConfig } from "@/lib/site";
import { Mail, MessageSquare, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description: `Get in touch with the ${siteConfig.name} team — support, billing, privacy, or feedback.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <h1>Contact</h1>
      <p>The fastest way to reach us is by email. We read every message.</p>

      <div style={{
        display: "grid",
        gap: "1rem",
        gridTemplateColumns: "1fr",
        margin: "2rem 0",
      }}>
        <ContactCard
          icon={<Mail className="w-5 h-5" />}
          title="Support & general questions"
          body="Help with the editor, billing, account issues, plan upgrades."
          email={siteConfig.supportEmail}
        />
        <ContactCard
          icon={<ShieldCheck className="w-5 h-5" />}
          title="Privacy & data requests"
          body="Access, correct, or delete your data. We respond within 7 working days."
          email={siteConfig.supportEmail}
        />
        <ContactCard
          icon={<MessageSquare className="w-5 h-5" />}
          title="Feedback & feature requests"
          body="Tell us what's missing or what you'd love to see in SlipGen."
          email={siteConfig.supportEmail}
        />
      </div>

      <h2>WhatsApp</h2>
      <p>
        For plan upgrades or quick chats, message us on WhatsApp:{" "}
        <a href="https://wa.me/919544464144" target="_blank" rel="noopener noreferrer">
          +91 95444 64144
        </a>
        . Office hours: Mon–Sat, 10:00–18:00 IST.
      </p>

      <h2>Reporting a security issue</h2>
      <p>
        Found a bug that could affect user data? Email{" "}
        <a href={`mailto:${siteConfig.supportEmail}`}>{siteConfig.supportEmail}</a> with the subject line{" "}
        <code>SECURITY</code> and a description of the issue. We&apos;ll acknowledge within 48 hours and won&apos;t pursue
        action against good-faith researchers.
      </p>

      <h2>Operating from</h2>
      <p>{siteConfig.operator}.</p>
    </>
  );
}

function ContactCard({ icon, title, body, email }: { icon: React.ReactNode; title: string; body: string; email: string }) {
  return (
    <a
      href={`mailto:${email}`}
      className="glass-card"
      style={{
        display: "flex",
        gap: "1rem",
        padding: "1.25rem",
        textDecoration: "none",
        color: "inherit",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "rgba(99, 102, 241, 0.12)",
          color: "var(--primary-light)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 2 }}>{title}</div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6 }}>{body}</div>
        <div style={{ fontSize: "0.85rem", color: "var(--primary-light)" }}>{email}</div>
      </div>
    </a>
  );
}
