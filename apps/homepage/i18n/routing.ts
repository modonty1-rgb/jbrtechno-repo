export const locales = ['ar', 'en'] as const;
export const defaultLocale = 'ar' as const;

export const pathnames = {
  '/': '/',
  '/careers': '/careers',
  '/careers/apply/[position]': '/careers/apply/[position]',
  '/interview/[token]': '/interview/[token]',
  '/contact': '/contact',
  '/privacy': '/privacy',
} as const;

export const routing = {
  locales,
  defaultLocale,
  pathnames,
  localeDetection: false,
};

