import type { NextConfig } from "next";

/**
 * Static export: satu build yang sama dipakai untuk
 *  - hosting web (Vercel / Cloudflare Pages / Netlify)
 *  - PWA yang bisa dipasang
 *  - dibungkus Capacitor menjadi aplikasi Android (Play Store)
 */
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
