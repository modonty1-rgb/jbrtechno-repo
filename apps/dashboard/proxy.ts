import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { hasRoutePermission } from '@/lib/auth/permissions';
import { normalizeRoute } from '@/lib/auth/utils';
import { ADMIN_ROUTES } from '@/lib/auth/adminRoutes';
import { prisma } from '@jbrtechno/database';

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public API routes and auth routes
  if (
    pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/upload') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  const normalizedPath = pathname;

  const protectedBasePaths = ADMIN_ROUTES.map((route) => route.route);

  const isLoginRoute = normalizedPath === '/login';
  const isNoPermissionsRoute = normalizedPath === '/no-permissions';

  const isProtectedRoute =
    protectedBasePaths.some(
      (base) => normalizedPath === base || (base !== '/' && normalizedPath.startsWith(`${base}/`))
    ) && !isLoginRoute && !isNoPermissionsRoute;

  // Allow no-permissions route to be accessed (it handles its own auth)
  if (isNoPermissionsRoute) {
    return NextResponse.next();
  }

  if (isProtectedRoute && !isLoginRoute) {
    // IMPORTANT: Delete old adminToken cookie if it exists (migration from old auth)
    const oldAdminToken = request.cookies.get('adminToken');

    // Get NextAuth session (REQUIRED - old auth no longer works)
    // In middleware, auth() automatically uses headers() from Next.js
    // But we need to ensure it has access to cookies for session validation
    const session = await auth();

    // Strict validation: Must have NextAuth session with user data
    // Old adminToken cookie will NOT work - only NextAuth session is valid
    // Check if session exists AND has required user properties
    const hasValidSession =
      session?.user &&
      typeof session.user.id === 'string' &&
      session.user.role &&
      typeof session.user.email === 'string';

    if (!hasValidSession) {
      // Clear any old cookies and redirect to login
      const loginUrl = new URL('/login', request.nextUrl.origin);
      loginUrl.searchParams.set('callbackUrl', normalizedPath);
      const redirectResponse = NextResponse.redirect(loginUrl);

      // Delete old cookie if it exists (cleanup)
      if (oldAdminToken) {
        redirectResponse.cookies.delete('adminToken');
      }

      return redirectResponse;
    }

    const normalizedRoute = normalizeRoute(normalizedPath);

    // Check route permissions (using userId instead of userRole)
    const hasPermission = await hasRoutePermission(
      normalizedRoute,
      session.user.id
    );

    if (!hasPermission) {
      // Check if user has ANY routes assigned
      const userRoutes = await prisma.userRoutePermission.findMany({
        where: { userId: session.user.id },
        select: { route: true },
        take: 1, // Just check if any exist
      });

      // If user has no routes at all, redirect to no-permissions page (prevents redirect loop)
      if (userRoutes.length === 0 && normalizedRoute !== '/no-permissions') {
        const noPermissionsUrl = new URL('/no-permissions', request.nextUrl.origin);
        const redirectResponse = NextResponse.redirect(noPermissionsUrl);

        if (oldAdminToken) {
          redirectResponse.cookies.delete('adminToken');
        }

        return redirectResponse;
      }

      // If user has some routes but not this one, redirect to no-permissions page
      // But allow access to no-permissions page itself
      if (normalizedRoute !== '/no-permissions') {
        const noPermissionsUrl = new URL('/no-permissions', request.nextUrl.origin);
        const redirectResponse = NextResponse.redirect(noPermissionsUrl);

        if (oldAdminToken) {
          redirectResponse.cookies.delete('adminToken');
        }

        return redirectResponse;
      }

      // If we're already on no-permissions page, allow it
      // (fall through to continue processing)
    }

    // User is authenticated and has permission
    // Delete old cookie if it exists
    const response = NextResponse.next();
    if (oldAdminToken) {
      response.cookies.delete('adminToken');
    }

    return response;
  }

  // If authenticated and on login page, redirect appropriately
  if (isLoginRoute) {
    const session = await auth();
    if (session?.user && session.user.id && session.user.role && session.user.email) {
      // Check if user has any routes assigned
      const userRoutes = await prisma.userRoutePermission.findMany({
        where: { userId: session.user.id },
        select: { route: true },
        take: 1,
      });

      // If user has no routes, redirect to no-permissions page instead of home
      if (userRoutes.length === 0) {
        return NextResponse.redirect(new URL('/no-permissions', request.nextUrl.origin));
      }

      // Check if there's a callbackUrl in query params
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl');

      // Normalize callbackUrl if present, otherwise default to home
      let redirectPath = '/';
      if (callbackUrl) {
        try {
          // Decode and validate callbackUrl
          const decodedUrl = decodeURIComponent(callbackUrl);
          const cleanUrl = decodedUrl.startsWith('/') ? decodedUrl : `/${decodedUrl}`;
          redirectPath = cleanUrl;
        } catch {
          // If URL parsing fails, use default
          redirectPath = '/';
        }
      }

      return NextResponse.redirect(new URL(redirectPath, request.nextUrl.origin));
    }

    // Not authenticated - allow access to login page
    // Delete old cookie on login page
    const oldAdminToken = request.cookies.get('adminToken');
    if (oldAdminToken) {
      const response = NextResponse.next();
      response.cookies.delete('adminToken');
      return response;
    }

    // Allow login page to render (no auth required)
    return NextResponse.next();
  }

  // Continue for non-admin routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - … if they start with `/api`, `/_next` or `/_vercel`
    // - … the ones containing a dot (e.g. `favicon.ico`)
    '/((?!api|_next|_vercel|.*\\..*).*)',
  ],
};
