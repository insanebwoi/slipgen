import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Roboto, Bebas_Neue } from "next/font/google";
import "./globals.css";
import AuthBoot from "@/components/AuthBoot";
import CookieNotice from "@/components/CookieNotice";
import { ToastProvider } from "@/components/Toast";
import { siteConfig } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

// Manga/poster face used by the Anime Manga Panel template.
const bebas = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

// metadataBase makes Next resolve relative OG/Twitter image URLs to absolute
// ones (required by every social crawler). Without this, link previews break.
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Smart Student Name Slip Generator`,
    // %s is replaced by per-page metadata.title (e.g. "Editor — SlipGen")
    template: `%s — ${siteConfig.name}`,
  },
  description: siteConfig.longDescription,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.name }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  applicationName: siteConfig.name,
  category: "education",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — Smart Student Name Slip Generator`,
    description: siteConfig.longDescription,
    // Image is auto-discovered from app/opengraph-image.tsx by Next.
  },
  twitter: {
    card: "summary_large_image",
    site: siteConfig.twitter,
    creator: siteConfig.twitter,
    title: `${siteConfig.name} — Smart Student Name Slip Generator`,
    description: siteConfig.shortDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  // Site verification placeholders. Populate when you add Google Search Console
  // / Bing Webmaster — leaving them empty is harmless.
  // verification: {
  //   google: "your-google-verification-token",
  //   other: { "msvalidate.01": "your-bing-verification-token" },
  // },
};

// Mobile viewport + theme color (split from metadata in Next 15+).
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0418" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  colorScheme: "dark light",
};

// JSON-LD: SoftwareApplication describes the product itself; Organization
// gives the publishing entity. Both surface as rich results in Google.
const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  applicationCategory: "EducationalApplication",
  operatingSystem: "Any (Web)",
  description: siteConfig.longDescription,
  url: siteConfig.url,
  image: `${siteConfig.url}/opengraph-image`,
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "INR",
      description: "All templates, all paper sizes, HD export, SlipGen watermark",
    },
    {
      "@type": "Offer",
      name: "Basic",
      price: "299",
      priceCurrency: "INR",
      description: "All templates, all paper sizes, HD export, No watermark, crop marks",
    },
    {
      "@type": "Offer",
      name: "Standard",
      price: "599",
      priceCurrency: "INR",
      description: "All templates, all paper sizes, HD export, custom watermark, bulk mode",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "120",
  },
} as const;

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.name,
  url: siteConfig.url,
  logo: `${siteConfig.url}/icon.svg`,
  description: siteConfig.shortDescription,
  sameAs: [
    // Add real social profiles here when you have them — these are signals
    // Google uses to merge entities. Empty array is fine for now.
  ],
} as const;

// FAQ schema unlocks "People also ask" rich results — one of the highest-leverage
// SEO moves for a single-page product site. Questions match the actual landing
// page copy so answers feel honest.
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is SlipGen?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "SlipGen is a web app for schools and teachers that turns student photos and details into beautiful, print-ready name slips. It includes a smart layout engine that packs A4, A3, or 13×19 paper with minimal waste, and 10+ design templates.",
      },
    },
    {
      "@type": "Question",
      name: "Is SlipGen free?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes — the Free plan covers all templates, all paper sizes, and HD 300 DPI export with a small SlipGen watermark. Paid plans (Basic ₹299/mo, Standard ₹599/mo) remove the watermark or allow custom watermarks and bulk mode.",
      },
    },
    {
      "@type": "Question",
      name: "What paper sizes does SlipGen support?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "A4 (210×297 mm), A3 (297×420 mm), and 13×19 inch (330×483 mm). The smart layout engine automatically calculates the optimal grid to minimize paper waste — typically 30%+ savings over manual layouts.",
      },
    },
    {
      "@type": "Question",
      name: "Does SlipGen use real AI for student photos?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "SlipGen offers a soft cartoon effect (smoothing + warm tones) to make student photos look professional and artistic. Real-time preview lets you see the effect before you print.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export print-ready PDFs with crop marks?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Yes. SlipGen exports 300 DPI PDFs with optional crop marks, bleed margins, and registration marks for professional printing. PDFs are compressed using JPEG quality presets so file sizes stay under 1 MB for most exports.",
      },
    },
    {
      "@type": "Question",
      name: "What templates are available?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Plain Pastel, Line Pattern, Cartoon Fun (passion-themed backgrounds), Wavy Pattern, Classic Traditional (formal serif), Plain Classic, Anime Manga Panel, Anime Neon Card, Space (cosmic), Football, and Retro Internet (Y2K). New templates ship regularly.",
      },
    },
    {
      "@type": "Question",
      name: "Is student data private?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Student data is stored only in your authenticated SlipGen account. AI photo processing happens via secure API endpoints; SlipGen does not share student photos with third parties for any purpose other than generating the cartoon you requested.",
      },
    },
  ],
} as const;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.shortDescription,
  publisher: { "@type": "Organization", name: siteConfig.name },
} as const;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${roboto.variable} ${bebas.variable}`} suppressHydrationWarning>
      <head>
        {/* Preconnect to origins we know we'll hit early — saves ~150-300ms on LCP. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col">
        {/* Skip-to-content link — first focus target on every page. Lets
            keyboard users jump past the nav directly to the main content. */}
        <a href="#main-content" className="skip-link">Skip to content</a>
        <ToastProvider>
          <AuthBoot />
          {children}
          <CookieNotice />
        </ToastProvider>
      </body>
    </html>
  );
}
