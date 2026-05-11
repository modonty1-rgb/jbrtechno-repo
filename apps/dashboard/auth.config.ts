import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@jbrtechno/database';
import { UserRole } from '@jbrtechno/database';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async redirect({ url, baseUrl }) {
      // If url is relative, prepend baseUrl
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }
      // If url is from same origin, allow it
      try {
        const urlObj = new URL(url);
        if (urlObj.origin === baseUrl) {
          return url;
        }
      } catch {
        // Invalid URL, fallback to baseUrl
      }
      // Default fallback to home dashboard
      return baseUrl;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }

      // Keep token in sync when session is updated from the client
      if (trigger === 'update' && session) {
        // NextAuth can pass updated fields either on session.user or top-level
        const updatedSession = session as { user?: { name?: string; email?: string }; name?: string; email?: string };
        const maybeSessionUser = updatedSession.user ?? updatedSession;

        if (maybeSessionUser?.name !== undefined) {
          token.name = maybeSessionUser.name;
        }
        if (maybeSessionUser?.email !== undefined) {
          token.email = maybeSessionUser.email;
        }
      }

      return token;
    },
    async session({ session, token }) {
      // Ensure session.user exists before assigning properties
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.email = token.email as string;
        session.user.name = token.name as string | null | undefined;
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email).trim().toLowerCase();
        const password = String(credentials.password).trim();

        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user || !user.isActive) {
            return null;
          }

          const dbPassword = user.password.trim();
          const isBcryptHash = dbPassword.startsWith('$2');

          let valid = false;
          if (isBcryptHash) {
            valid = await bcrypt.compare(password, dbPassword);
          } else {
            // Legacy plaintext — verify then auto-upgrade to bcrypt
            valid = dbPassword === password;
            if (valid) {
              const hashed = await bcrypt.hash(password, 10);
              await prisma.user.update({
                where: { id: user.id },
                data: { password: hashed },
              });
            }
          }

          if (!valid) {
            return null;
          }

          // Update last login and log activity (fire and forget, don't block auth)
          prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          }).catch((error) => {
            console.error('Failed to update user lastLogin:', error);
          });

          // Log login activity
          import('@/lib/activityLog').then(({ logActivity }) => {
            logActivity({
              userId: String(user.id),
              type: 'USER_LOGIN',
              description: `User logged in: ${user.email}`,
            }).catch((error) => {
              console.error('Failed to log login activity:', error);
            });
          });

          return {
            id: String(user.id),
            email: user.email,
            name: user.name || undefined,
            role: user.role,
          };
        } catch (error) {
          console.error('Authentication error:', error instanceof Error ? error.message : 'Unknown error');
          return null;
        }
      },
    }),
  ],
} satisfies NextAuthConfig;

