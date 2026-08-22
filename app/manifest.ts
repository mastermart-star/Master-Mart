import type { MetadataRoute } from "next";
import { siteConfig } from "@/core/config";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: siteConfig.themeColor,
    icons: [{ src: "/icon-512.png", sizes: "512x512", type: "image/png" }],
  };
}
