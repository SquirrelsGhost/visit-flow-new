import type { NextConfig } from "next";

/** Ziel der API-Weiterleitung. In der Entwicklung die v2-API auf Port 3002, in Produktion übernimmt Nginx /api. */
const API_ORIGIN = process.env.API_ORIGIN ?? "http://localhost:3002";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Das Shared-Paket liegt als TypeScript im Monorepo und wird mitkompiliert
  transpilePackages: ["@visit-flow/shared"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Gleicher Ursprung für /api, damit das Refresh-Cookie (SameSite=Strict) mitgeht
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_ORIGIN}/api/:path*` }];
  },
};

export default nextConfig;
