'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';
import { WhatsAppButton } from '@/components/layout/WhatsAppButton';

interface PublicShellProps {
  children: ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  const params = useParams();
  const locale = (params.locale as string) || 'ar';
  const navTranslations = useTranslations('nav');
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <>
      <Navigation />
      <main className="min-h-screen">
        {children}
      </main>
      <footer className="border-t py-8 mt-16 no-print">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground space-y-3">
          <nav className="flex items-center justify-center gap-4 flex-wrap text-xs uppercase tracking-wider text-muted-foreground/80">
            <Link
              href={`/${locale}/contact`}
              className="hover:text-primary transition-colors"
            >
              {navTranslations('contact')}
            </Link>
            <span className="text-muted-foreground/40">•</span>
            <Link
              href={`/${locale}/privacy`}
              className="hover:text-primary transition-colors"
            >
              {navTranslations('privacy')}
            </Link>
          </nav>
          <p>© 2024 JBRtechno. All rights reserved.</p>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton phoneNumber={whatsappNumber} locale={locale} />
    </>
  );
}






