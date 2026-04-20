import path from "node:path";
import type { NextConfig } from "next";

const API_ORIGIN =
  process.env.COCKPIT_API_ORIGIN ??
  process.env.API_URL ??
  "http://127.0.0.1:8081";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd(), ".."),
  },
  async rewrites() {
    return [
      {
        source: "/api-proxy/:path*",
        destination: `${API_ORIGIN}/:path*`,
      },
    ];
  },
};

export default nextConfig;
