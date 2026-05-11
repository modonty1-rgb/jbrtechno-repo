import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

// Validate required environment variable
if (!process.env.AUTH_SECRET) {
  throw new Error('AUTH_SECRET environment variable is required');
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: 'jwt' },
  trustHost: true,
});

