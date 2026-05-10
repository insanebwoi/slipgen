import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

// 1200×630 is the canonical OG/Twitter card size.
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — Smart Student Name Slip Generator`;

// Programmatically generated so the OG image stays in sync with the brand
// palette and tagline. Edit copy here, no design tool needed.
export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background:
            "linear-gradient(135deg, #0b0418 0%, #1e0a3c 45%, #3a0d3a 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
          padding: "80px",
        }}
      >
        {/* Mesh accent */}
        <div
          style={{
            position: "absolute",
            top: "-40%",
            right: "-20%",
            width: "70%",
            height: "120%",
            background:
              "radial-gradient(circle, rgba(168,85,247,0.45) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-30%",
            left: "-10%",
            width: "60%",
            height: "100%",
            background:
              "radial-gradient(circle, rgba(236,72,153,0.35) 0%, transparent 60%)",
          }}
        />

        {/* Brand row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            zIndex: 1,
          }}
        >
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: "linear-gradient(135deg,#874df8,#7b00fa)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
              color: "white",
            }}
          >
            S
          </div>
          <div
            style={{
              fontSize: 40,
              fontWeight: 800,
              color: "white",
              letterSpacing: -1,
            }}
          >
            SlipGen
          </div>
        </div>

        {/* Headline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: "auto",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              color: "white",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Beautiful name slips.
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              background:
                "linear-gradient(135deg,#f0abfc 0%,#22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              lineHeight: 1.05,
              letterSpacing: -2,
            }}
          >
            Zero waste.
          </div>
          <div
            style={{
              fontSize: 32,
              color: "rgba(255,255,255,0.78)",
              marginTop: 24,
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            AI-enhanced, print-ready student name slips with smart layouts that
            save paper and look stunning.
          </div>
        </div>

        {/* Footer pills */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginTop: 40,
            zIndex: 1,
          }}
        >
          {["10+ Templates", "AI Cartoons", "A4 / A3 / 13×19", "Print-Ready PDF"].map(
            (label) => (
              <div
                key={label}
                style={{
                  padding: "12px 24px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.18)",
                  color: "white",
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
            ),
          )}
        </div>
      </div>
    ),
    { ...size },
  );
}
