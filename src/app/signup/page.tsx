import { Suspense } from "react";
import type { Metadata } from "next";
import AuthForm from "../login/AuthForm";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your free SlipGen account — no credit card required.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/signup" },
};

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
