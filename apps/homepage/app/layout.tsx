import type { Metadata } from 'next';

const logoUrl = 'https://res.cloudinary.com/dhjy2k0fu/image/upload/v1762694663/logo_e6nxja.png';
const ogImageUrl = 'https://res.cloudinary.com/dhjy2k0fu/image/upload/v1762694429/jbrseo_og_image_no_text_final_rjgtcc.png';

export const metadata: Metadata = {
  title: 'JbrTecno',
  description: 'Comprehensive business plan for launching an SEO SaaS platform for Saudi e-commerce stores',
  icons: {
    icon: [{ url: logoUrl }],
    shortcut: [{ url: logoUrl }],
  },
  openGraph: {
    title: 'JbrTecno',
    description: 'Comprehensive business plan for launching an SEO SaaS platform for Saudi e-commerce stores',
    type: 'website',
    images: [
      {
        url: ogImageUrl,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'JbrTecno',
    description: 'Comprehensive business plan for launching an SEO SaaS platform for Saudi e-commerce stores',
    images: [ogImageUrl],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

