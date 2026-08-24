import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: ['via.placeholder.com', 'localhost'],
  },
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;