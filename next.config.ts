import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase limit for base64 encoded images
    },
  },
  // Disable static page generation for dynamic pages
  output: 'standalone',
};

export default nextConfig;
