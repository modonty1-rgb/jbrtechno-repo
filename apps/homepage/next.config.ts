import { config as loadDotenv } from 'dotenv';
import path from 'node:path';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

// Load monorepo-level shared env vars (local dev only — Vercel uses Shared Env Vars tab).
// override:false (default) → homepage/.env.local > homepage/.env > .env.shared
loadDotenv({ path: path.resolve(process.cwd(), '../../.env.shared') });

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@jbrtechno/database', '@jbrtechno/shared', '@jbrtechno/ui'],
  // Monorepo: tell Next.js to trace files from the workspace root, not just this app.
  // Without this, packages/database/** is outside the trace root and gets dropped.
  outputFileTracingRoot: path.resolve(process.cwd(), '../../'),
  // Force-include Prisma's native query engine (custom output path, not @prisma/client).
  outputFileTracingIncludes: {
    '/**/*': [
      './packages/database/generated/client/libquery_engine-*',
      './packages/database/generated/client/schema.prisma',
    ],
  },
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

export default withNextIntl(nextConfig);
