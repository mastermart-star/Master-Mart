import type { MetadataRoute } from "next";
import { siteConfig } from "@/core/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/track"] },
    sitemap: `${siteConfig.siteUrl}/sitemap.xml`,
  };
}
