import { getTranslations } from 'next-intl/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@jbrtechno/ui';
import { PublicShell } from '@/components/layout/PublicShell';

interface PrivacySection {
  title: string;
  items: string[];
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'privacy' });

  const sections = t.raw('sections') as PrivacySection[];

  return (
    <PublicShell>
      <div className="container mx-auto px-4 py-16 max-w-4xl space-y-8">
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          {t('updated')}
        </div>
        <h1 className="text-4xl font-black tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          {t('intro')}
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title} className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-muted-foreground leading-relaxed list-disc pl-5">
                {section.items.map((item, index) => (
                  <li key={`${section.title}-${index}`}>{item}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-primary/30 bg-primary/10">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {locale === 'ar' ? 'للتواصل' : 'Contact'}
          </CardTitle>
          <CardDescription>{t('contact')}</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>privacy@jbrtechno.com</p>
        </CardContent>
      </Card>
    </div>
    </PublicShell>
  );
}

