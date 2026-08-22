import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Stable top-level in Next 16 (was experimental.typedRoutes).
  typedRoutes: true,

  images: {
    // `images.domains` is deprecated — remotePatterns only.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },

  // NOT set: output: "standalone" (Nixpacks runs `npm run start` on the full tree).
  // NOT set: cacheComponents (see CLAUDE.md §3.6 — separate, planned migration).
};

export default nextConfig;
