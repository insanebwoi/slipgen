// Single source of truth for site-wide SEO/branding values. Imported by the
// root layout, sitemap, robots, and any page that needs absolute URLs.
//
// To change the production URL, set NEXT_PUBLIC_SITE_URL in the deployment
// environment (Vercel envs) — do not hardcode it in components.

const FALLBACK_URL = "https://www.slipgen.in";

export const siteConfig = {
  name: "SlipGen",
  url: (process.env.NEXT_PUBLIC_SITE_URL || FALLBACK_URL).replace(/\/$/, ""),
  shortDescription:
    "Student name slip generator with smart print-ready layouts.",
  longDescription:
    "SlipGen turns student photos and details into beautiful, print-ready name slips. Smart layout engine packs A4/A3/13×19 paper with minimal waste, and 10+ templates cover everything from classic to anime to retro Y2K — built for schools, teachers, and event organizers.",
  ogImage: "/og.png",
  twitter: "@slipgenapp",
  // Legal / contact — change these in the dashboard env or here directly when the
  // brand identity is finalised. Used in privacy, terms, and the footer.
  supportEmail: "hello@slipgen.in",
  operator: "SlipGen, operated from India",
  jurisdiction: "India",
  lastLegalUpdate: "May 2026",
  keywords: [
    "student name slip generator",
    "name slip maker",
    "school name card generator",
    "print-ready name slips",
    "school ID card maker",
    "AI cartoon student photo",
    "name slip template",
    "classroom printable",
    "A4 layout generator",
    "school printable PDF",
    "student name card",
    "bulk name slips",
    "school stationery",
    "name slip software India",
  ],
};

export type SiteConfig = typeof siteConfig;
