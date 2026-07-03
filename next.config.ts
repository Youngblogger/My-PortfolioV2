import type { NextConfig } from "next";

const API_PROXY_TARGET = process.env.API_PROXY_TARGET || "http://localhost:8000";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/login",
        destination: "/auth/login",
        permanent: false,
      },
      {
        source: "/hire",
        destination: "/services",
        permanent: true,
      },
      {
        source: "/projects",
        destination: "/work",
        permanent: true,
      },
      {
        source: "/projects/:path*",
        destination: "/work/:path*",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${API_PROXY_TARGET}/api/v1/:path*`,
      },
      {
        source: "/sanctum/:path*",
        destination: `${API_PROXY_TARGET}/sanctum/:path*`,
      },
    ];
  },
};

export default nextConfig;
