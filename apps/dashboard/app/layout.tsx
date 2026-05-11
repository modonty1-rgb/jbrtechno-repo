// app/layout.tsx
import type { Metadata } from 'next';
import { Tajawal } from 'next/font/google';
import { LayoutWrapper } from '@/components/layout/LayoutWrapper';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SessionProviderWrapper } from '@/components/layout/SessionProviderWrapper';
import './globals.css';

export const dynamic = 'force-dynamic';

const logoUrl =
  'https://res.cloudinary.com/dhjy2k0fu/image/upload/v1762694663/logo_e6nxja.png';

export const metadata: Metadata = {
  title: 'JbrTecno',
  icons: {
    icon: [{ url: logoUrl }],
    shortcut: [{ url: logoUrl }],
  },
};

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '700', '800', '900'],
  display: 'swap',
  variable: '--font-tajawal',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      suppressHydrationWarning
      className={`${tajawal.variable} dark`}
    >
      <body className={tajawal.className}>
        <LayoutWrapper
          dashboardLayout={<DashboardLayout>{children}</DashboardLayout>}
          minimalLayout={<SessionProviderWrapper>{children}</SessionProviderWrapper>}
        />
      </body>
    </html>
  );
}