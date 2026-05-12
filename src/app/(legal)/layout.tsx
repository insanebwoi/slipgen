import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { siteConfig } from "@/lib/site";

// Route group: pages under (legal) all share this chrome — back link, brand
// header, consistent typography. The parens stop "(legal)" from appearing
// in the URL, so /privacy and /terms live at the root.
export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen flex flex-col">
      <div className="mesh-gradient" />

      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
        <Link href="/" className="flex items-center gap-2 text-sm hover:text-white transition-colors" style={{ color: "var(--text-secondary)" }}>
          <ArrowLeft className="w-4 h-4" />
          <span>Back to SlipGen</span>
        </Link>
        <Link href="/" className="flex items-center gap-2">
          <Image src="/brand/logo-color.svg" alt="" width={22} height={22} aria-hidden="true" />
          <span className="font-bold text-sm" style={{ fontFamily: "var(--font-display)" }}>
            Slip<span className="gradient-text">Gen</span>
          </span>
        </Link>
      </header>

      <main id="main-content" className="relative z-10 flex-1 px-6 md:px-12 py-12 md:py-16">
        <article className="max-w-3xl mx-auto legal-prose">{children}</article>
      </main>

      <footer className="relative z-10 px-6 md:px-12 py-8 text-center text-xs" style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}>
        <p>© 2026 {siteConfig.name}. Last updated {siteConfig.lastLegalUpdate}.</p>
      </footer>
    </div>
  );
}
