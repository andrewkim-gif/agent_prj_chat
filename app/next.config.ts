import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set the correct workspace root to avoid lockfile conflicts
  outputFileTracingRoot: __dirname,
  serverExternalPackages: [],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Disable turbopack for stability
  experimental: {
    turbo: undefined,
  },
  // Set asset prefix for external access
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://ara-app.to.nexus' : '',
  // Use different build directories for dev and production to avoid conflicts
  distDir: process.env.NODE_ENV === 'production' ? '.next-prod' : '.next-dev',
  // Disable caching for .riv files
  async headers() {
    return [
      {
        source: '/assets/ani/:path*.riv',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ]
  },
};

export default nextConfig;
