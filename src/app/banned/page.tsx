import type { Metadata } from "next";
import { signOutAction } from "../login/actions";

export const metadata: Metadata = {
  title: "Account suspended",
  robots: { index: false, follow: false, nocache: true },
};

export default function BannedPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6">
      <div className="mesh-gradient" />
      <div className="relative z-10 max-w-md text-center glass-card p-8">
        <h1 className="text-2xl font-bold mb-2" style={{ fontFamily: "var(--font-display)" }}>Account suspended</h1>
        <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
          Your account has been suspended. If you think this is a mistake, contact support on WhatsApp at +91 95444 64144.
        </p>
        <form action={signOutAction}>
          <button type="submit" className="btn-secondary w-full">Sign out</button>
        </form>
      </div>
    </div>
  );
}
