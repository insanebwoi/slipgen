import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import AuthBoot from "@/components/AuthBoot";

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

export const metadata: Metadata = {
  title: "SlipGen — Smart Student Name Slip Generator",
  description:
    "AI-enhanced, print-ready student name slips with minimal effort. Optimized layouts, reduced paper waste, beautiful templates.",
  keywords: [
    "student name slips",
    "name slip generator",
    "print layout",
    "school ID",
    "name card",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col">
        <AuthBoot />
        {children}
      </body>
    </html>
  );
}
