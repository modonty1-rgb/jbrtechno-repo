/**
 * Normalize route path for permission checking
 * Routes are now direct paths without /admin prefix
 */
export function normalizeRoute(pathname: string): string {
  return pathname.startsWith('/') ? pathname : `/${pathname}`;
}

/**
 * Extract locale from pathname
 * Returns 'ar' or 'en' or null if not found
 */
export function extractLocale(_pathname: string): string | null {
  return null;
}

/**
 * Normalize callbackUrl to ensure it has the correct locale prefix
 * If callbackUrl doesn't have a locale, prepend the provided locale
 */
export function normalizeCallbackUrl(callbackUrl: string, _locale: string): string {
  try {
    callbackUrl = decodeURIComponent(callbackUrl);
  } catch {
    // ignore decode errors
  }
  return callbackUrl.startsWith('/') ? callbackUrl : `/${callbackUrl}`;
}

/**
 * Build a localized path with proper locale prefix
 */
export function buildLocalizedPath(path: string, _locale: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return cleanPath;
}

