import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Prisma with Vercel
  serverExternalPackages: ["@prisma/client", "prisma"],
  
  // Disable static optimization for pages that use database
  experimental: {
    // This ensures dynamic routes work properly
  },
};

export default nextConfig;
