import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        // Cache agresivo y seguro para imágenes estáticas
        source: "/:path*.(webp|avif|png|jpg|jpeg|gif|svg)",
        headers: [
          { key: "Cache-Control", value: "public, immutable, max-age=31536000" },
        ],
      },
      {
        // Cache para assets generados por Next
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, immutable, max-age=31536000" },
        ],
      },
      {
        // Cache moderado para fuentes
        source: "/:path*.(woff|woff2|ttf|otf)",
        headers: [
          { key: "Cache-Control", value: "public, immutable, max-age=31536000" },
        ],
      },
    ]
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
};

export default nextConfig;
