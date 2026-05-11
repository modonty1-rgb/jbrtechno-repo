import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import type { NextConfig } from 'next';

// Load monorepo-level shared env vars (local dev only — Vercel uses Shared Env Vars tab).
// override:false (default) → dashboard/.env.local > dashboard/.env > .env.shared
loadDotenv({ path: path.resolve(process.cwd(), '../../.env.shared') });

const nextConfig: NextConfig = {
  transpilePackages: ['@jbrtechno/database', '@jbrtechno/shared', '@jbrtechno/ui'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
