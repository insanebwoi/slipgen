import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "./AuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your SlipGen account to create and export student name slips.",
  // Auth pages have no SEO value; keep them out of search.
  robots: { index: false, follow: false },
  alternates: { canonical: "/login" },
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="login" />
    </Suspense>
  );
}
