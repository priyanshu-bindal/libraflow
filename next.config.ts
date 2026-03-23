import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: '*.uploadthing.com',
      },
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },

  typescript: {
    tsconfigPath: './tsconfig.json',
  },

  experimental: {
    optimizePackageImports: ['@radix-ui/*', 'lucide-react'],
  },

  env: {},
};

export default nextConfig;
