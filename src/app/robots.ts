import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

// Crawl rules:
//   - Public marketing surface (/, anchors) is fully indexable.
//   - Anything behind auth, transactional, or API is excluded — it'd waste
//     crawl budget and surface dead-end URLs to users from search.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/editor",
          "/admin",
          "/api/",
          "/login",
          "/signup",
          "/banned",
        ],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
    host: siteConfig.url,
  };
}
