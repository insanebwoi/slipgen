import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// PWA / install metadata. Doesn't ship a service worker (we don't need offline),
// but having a manifest gives Google/iOS the brand name + icons used for
// "Add to Home Screen", correct theme color in Chrome's tab UI, and cleaner
// previews when shared as a link.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — Smart Student Name Slip Generator`,
    short_name: siteConfig.name,
    description: siteConfig.shortDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#0b0418",
    theme_color: "#7c3aed",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    categories: ["education", "productivity", "utilities"],
  };
}
