"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  Printer,
  Sparkles,
  Layout,
  FileDown,
  Users,
  ChevronRight,
  Zap,
  Shield,
  ArrowRight,
  Star,
  Check,
  LogIn,
} from "lucide-react";

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? null);
      setChecking(false);
    });
  }, []);
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Mesh gradient background */}
      <div className="mesh-gradient" />
      <div className="dots-pattern fixed inset-0 z-0 pointer-events-none" />

      {/* ===== NAVBAR ===== */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "var(--gradient-primary)" }}
          >
            <Printer className="w-5 h-5 text-white" />
          </div>
          <span
            className="text-xl font-bold"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Slip<span className="gradient-text">Gen</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[var(--text-secondary)]">
          <a href="#features" className="hover:text-white transition-colors">
            Features
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            How it Works
          </a>
          <a href="#pricing" className="hover:text-white transition-colors">
            Pricing
          </a>
        </div>
        <div className="flex items-center gap-3">
          {checking ? (
            <div className="w-20 h-9 rounded-lg animate-pulse" style={{ background: "var(--surface-elevated)" }} />
          ) : isLoggedIn ? (
            <>
              <Link href="/editor" className="btn-primary text-sm px-5 py-2.5 inline-flex items-center gap-2">
                Open Editor
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/editor"
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                style={{ background: "var(--gradient-primary)" }}
                title={userEmail || "Account"}
              >
                {(userEmail?.[0] || "U").toUpperCase()}
              </Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm hidden md:inline-flex items-center gap-1.5" style={{ color: "var(--text-secondary)" }}>
                <LogIn className="w-3.5 h-3.5" />
                Sign in
              </Link>
              <Link href="/editor" className="btn-primary text-sm px-5 py-2.5">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-16 pb-24 md:pt-28 md:pb-36">
        {/* Badge */}
        <div
          className="animate-fade-in-up mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "rgba(99, 102, 241, 0.1)",
            border: "1px solid rgba(99, 102, 241, 0.2)",
            color: "var(--primary-light)",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Smart Print Automation for Schools
        </div>

        {/* Heading */}
        <h1
          className="animate-fade-in-up text-4xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-4xl"
          style={{
            fontFamily: "var(--font-display)",
            animationDelay: "0.1s",
          }}
        >
          Beautiful Name Slips,{" "}
          <span className="gradient-text">Zero Waste</span>
        </h1>

        {/* Subheading */}
        <p
          className="animate-fade-in-up mt-6 text-lg md:text-xl max-w-2xl leading-relaxed"
          style={{
            color: "var(--text-secondary)",
            animationDelay: "0.2s",
          }}
        >
          Generate AI-enhanced, print-ready student name slips with optimized
          layouts that save paper and look stunning.
        </p>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up mt-10 flex flex-col sm:flex-row gap-4"
          style={{ animationDelay: "0.3s" }}
        >
          <Link
            href="/editor"
            className="btn-primary inline-flex items-center gap-2 text-base px-8 py-3.5"
          >
            {isLoggedIn ? "Continue to Editor" : "Start Creating"}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#how-it-works"
            className="btn-secondary inline-flex items-center gap-2 text-base px-8 py-3.5"
          >
            See How it Works
          </a>
        </div>

        {/* Stats */}
        <div
          className="animate-fade-in-up mt-16 grid grid-cols-3 gap-8 md:gap-16"
          style={{ animationDelay: "0.4s" }}
        >
          {[
            { value: "30%+", label: "Paper Saved" },
            { value: "<1min", label: "Per Slip" },
            { value: "5+", label: "Templates" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div
                className="text-2xl md:text-3xl font-bold gradient-text"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {stat.value}
              </div>
              <div
                className="mt-1 text-xs md:text-sm"
                style={{ color: "var(--text-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section
        id="features"
        className="relative z-10 px-6 md:px-12 py-20 md:py-28"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--primary-light)" }}
            >
              Features
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Everything You Need
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Users className="w-6 h-6" />,
                title: "Bulk Student Input",
                desc: "Add students with names, class, photo, and passion. Supports batch entry.",
                color: "#6366F1",
              },
              {
                icon: <Layout className="w-6 h-6" />,
                title: "Smart Layout Engine",
                desc: "Auto-arranges slips on A4/A3/13×19 paper with minimal waste and optimal spacing.",
                color: "#8B5CF6",
              },
              {
                icon: <Sparkles className="w-6 h-6" />,
                title: "Beautiful Templates",
                desc: "5+ curated templates with custom colors, fonts, and frame styles.",
                color: "#EC4899",
              },
              {
                icon: <Printer className="w-6 h-6" />,
                title: "Print-Ready Export",
                desc: "300 DPI PDF exports with crop marks, bleed margins, and registration marks.",
                color: "#10B981",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Instant Preview",
                desc: "Real-time preview as you customize. What you see is what you print.",
                color: "#F59E0B",
              },
              {
                icon: <Shield className="w-6 h-6" />,
                title: "Secure & Private",
                desc: "All student data is encrypted and stored securely. GDPR compliant.",
                color: "#0EA5E9",
              },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-6 group">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{
                    background: `${feature.color}15`,
                    color: feature.color,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section
        id="how-it-works"
        className="relative z-10 px-6 md:px-12 py-20 md:py-28"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--primary-light)" }}
            >
              How It Works
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Three Simple Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Add Students",
                desc: "Enter student details and upload photos. Supports bulk input for entire classes.",
                icon: <Users className="w-8 h-8" />,
              },
              {
                step: "02",
                title: "Choose Template",
                desc: "Pick a beautiful template, customize colors, fonts, and layout to match your brand.",
                icon: <Layout className="w-8 h-8" />,
              },
              {
                step: "03",
                title: "Export & Print",
                desc: "Smart layout engine optimizes placement. Export as print-ready PDF.",
                icon: <FileDown className="w-8 h-8" />,
              },
            ].map((item, i) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-block mb-6">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto animate-pulse-glow"
                    style={{
                      background: "var(--gradient-primary)",
                    }}
                  >
                    {item.icon}
                  </div>
                  <span
                    className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
                    style={{
                      background: "var(--accent)",
                      color: "#000",
                    }}
                  >
                    {item.step}
                  </span>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {item.title}
                </h3>
                <p
                  className="text-sm leading-relaxed max-w-xs mx-auto"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {item.desc}
                </p>
                {i < 2 && (
                  <ChevronRight
                    className="hidden md:block absolute top-1/2 right-0 transform -translate-y-1/2 w-6 h-6"
                    style={{ color: "var(--text-muted)" }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== PRICING SECTION ===== */}
      <section
        id="pricing"
        className="relative z-10 px-6 md:px-12 py-20 md:py-28"
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--primary-light)" }}
            >
              Pricing
            </p>
            <h2
              className="text-3xl md:text-5xl font-bold"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Simple, Transparent Pricing
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                name: "Free",
                price: "₹0",
                period: "forever",
                features: [
                  "2 AI-enhanced images",
                  "3 basic templates",
                  "A4 layout only",
                  "SlipGen watermark",
                  "Standard export",
                ],
                cta: "Start Free",
                featured: false,
                whatsapp: false,
              },
              {
                name: "Basic",
                price: "₹299",
                period: "/ month",
                features: [
                  "4 AI-enhanced images",
                  "All templates",
                  "A4 + A3 layouts",
                  "Light watermark",
                  "HD export (300 DPI)",
                  "Crop marks",
                ],
                cta: "Get Basic on WhatsApp",
                featured: true,
                whatsapp: true,
              },
              {
                name: "Standard",
                price: "₹599",
                period: "/ month",
                features: [
                  "Real AI Pixar/Disney cartoon",
                  "All templates",
                  "All paper sizes",
                  "Custom watermark + logo",
                  "Bulk mode",
                  "Priority support",
                ],
                cta: "Go Standard on WhatsApp",
                featured: false,
                whatsapp: true,
              },
            ].map((plan) => {
              const waHref = `https://wa.me/919544464144?text=${encodeURIComponent(
                `Hi! I'd like to upgrade to the SlipGen ${plan.name} plan (${plan.price}${plan.period}).`
              )}`;
              return (
                <div
                  key={plan.name}
                  className={`glass-card p-8 flex flex-col ${
                    plan.featured ? "ring-2 ring-[var(--primary)] relative" : ""
                  }`}
                >
                  {plan.featured && (
                    <div
                      className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                      style={{
                        background: "var(--gradient-primary)",
                        color: "white",
                      }}
                    >
                      <Star className="w-3 h-3 inline mr-1" />
                      Most Popular
                    </div>
                  )}
                  <h3
                    className="text-xl font-bold mb-1"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-6">
                    <span
                      className="text-4xl font-extrabold"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {plan.price}
                    </span>
                    <span
                      className="text-sm"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {plan.period}
                    </span>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li
                        key={f}
                        className="flex items-center gap-2 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        <Check
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: "var(--success)" }}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.whatsapp ? (
                    <a
                      href={waHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={
                        plan.featured
                          ? "btn-primary w-full text-center"
                          : "btn-secondary w-full text-center"
                      }
                    >
                      {plan.cta}
                    </a>
                  ) : (
                    <Link
                      href="/editor"
                      className={
                        plan.featured
                          ? "btn-primary w-full text-center"
                          : "btn-secondary w-full text-center"
                      }
                    >
                      {plan.cta}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ===== CTA SECTION ===== */}
      <section className="relative z-10 px-6 md:px-12 py-20 md:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="glass-card p-12 md:p-16"
            style={{
              background:
                "linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(139, 92, 246, 0.08))",
            }}
          >
            <h2
              className="text-3xl md:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Ready to Save Paper & Time?
            </h2>
            <p
              className="text-base mb-8 max-w-lg mx-auto"
              style={{ color: "var(--text-secondary)" }}
            >
              Join hundreds of schools already using SlipGen to create beautiful,
              waste-free student name slips.
            </p>
            <Link
              href="/editor"
              className="btn-primary inline-flex items-center gap-2 text-base px-10 py-4"
            >
              {isLoggedIn ? "Open Editor" : "Create Your First Slip"}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer
        className="relative z-10 px-6 md:px-12 py-8 text-center text-sm"
        style={{ color: "var(--text-muted)", borderTop: "1px solid var(--border)" }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Printer className="w-4 h-4" style={{ color: "var(--primary)" }} />
          <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
            SlipGen
          </span>
        </div>
        <p>© 2026 SlipGen. Smart Print Automation for Student Identity Materials.</p>
      </footer>
    </div>
  );
}
