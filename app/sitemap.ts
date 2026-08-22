import type { MetadataRoute } from "next";
import { siteConfig } from "@/core/config";
import { getProductSlugs } from "@/modules/products";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProductSlugs().catch(() => []); // never fail the build
  return [
    { url: siteConfig.siteUrl, changeFrequency: "daily", priority: 1 },
    ...slugs.slice(0, 1000).map((slug) => ({
      url: `${siteConfig.siteUrl}/products/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
