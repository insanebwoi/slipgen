import Link from "next/link";
import Image from "next/image";
import { Home, ArrowRight } from "lucide-react";

// Root not-found page. Matches the brand chrome so a misclick doesn't feel
// like the user has left the app entirely.
export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="mesh-gradient" />
      <div className="dots-pattern fixed inset-0 z-0 pointer-events-none" />

      <div className="relative z-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Image src="/brand/logo-color.svg" alt="" width={32} height={32} aria-hidden="true" />
          <span className="text-xl font-bold" style={{ fontFamily: "var(--font-display)" }}>
            Slip<span className="gradient-text">Gen</span>
          </span>
        </div>

        <div className="glass-card p-8 md:p-10">
          <div
            className="text-7xl md:text-8xl font-extrabold gradient-text mb-2"
            style={{ fontFamily: "var(--font-display)", letterSpacing: "-0.04em", lineHeight: 1 }}
          >
            404
          </div>
          <h1 className="text-xl md:text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>
            This slip got lost in the printer
          </h1>
          <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
            The page you&apos;re looking for doesn&apos;t exist or has moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Go home
            </Link>
            <Link
              href="/editor"
              className="btn-secondary inline-flex items-center justify-center gap-2"
            >
              Open editor
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <p className="text-xs mt-6" style={{ color: "var(--text-muted)" }}>
          Need help? <Link href="/contact" className="underline" style={{ color: "var(--primary-light)" }}>Contact us</Link>
        </p>
      </div>
    </div>
  );
}
