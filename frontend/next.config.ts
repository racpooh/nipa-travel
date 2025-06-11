import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Skip linting during production builds (for Docker)
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // Skip TypeScript type checking during builds (optional)
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Environment variables that should be available at build time
  env: {
    // Add your environment variables here
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://k8s-test.sudlor.me',
  },
  
  // If you're using images, configure domains
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
