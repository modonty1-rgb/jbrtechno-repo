'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import { Button } from '@jbrtechno/ui';
import { Languages, Menu, X, Facebook } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../common/ThemeToggle';
import Image from 'next/image';

export function Navigation() {
  const t = useTranslations('nav');
  const params = useParams();
  const pathname = usePathname();
  const locale = params.locale as string;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { href: `/${locale}`, label: t('home') },
    { href: `/${locale}/careers`, label: t('careers') },
    { href: `/${locale}/contact`, label: t('contact') },
  ];

  const toggleLanguage = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const path = pathname.replace(`/${locale}`, `/${newLocale}`);
    window.location.href = path;
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 no-print">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href={`/${locale}`} className="flex items-center gap-2">
              <Image
                src="https://res.cloudinary.com/dhjy2k0fu/image/upload/v1762694663/logo_e6nxja.png"
                alt="JBRtechno logo"
                width={36}
                height={36}
                className="h-9 w-9"
                priority
              />
              <span className="sr-only">JBRtechno</span>
            </Link>

            <div className="hidden md:flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              title={t('language')}
            >
              <Languages className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>

            <Link
              href="https://www.facebook.com/profile.php?id=61583291444031"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="ghost"
                size="icon"
                title={
                  locale === 'ar'
                    ? 'تابعنا على فيسبوك'
                    : 'Follow us on Facebook'
                }
                aria-label={
                  locale === 'ar'
                    ? 'تابعنا على فيسبوك'
                    : 'Follow us on Facebook'
                }
                className="bg-[#1877F2] text-white hover:bg-[#166fe0]"
              >
                <Facebook className="h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary px-2 py-1 ${pathname === item.href
                    ? 'text-primary'
                    : 'text-muted-foreground'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
















