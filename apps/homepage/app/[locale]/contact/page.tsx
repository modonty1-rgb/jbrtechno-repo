import { getTranslations } from 'next-intl/server';
import { ContactForm } from '@/components/forms/ContactForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@jbrtechno/ui';
import { Mail, MapPin, Users } from 'lucide-react';
import { WhatsAppIcon } from '@/components/layout/WhatsAppButton';
import { PublicShell } from '@/components/layout/PublicShell';

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'contact' });
  const whatsappNumberEnv = process.env.NEXT_PUBLIC_JBRTECHNO_WHATSAPP_NUMBER;
  const whatsappDisplayNumber = whatsappNumberEnv
    ? whatsappNumberEnv.startsWith('+')
      ? whatsappNumberEnv
      : `+${whatsappNumberEnv}`
    : '+966 9200 00000';

  const subjectOptions = t.raw('subjectOptions') as Record<string, string>;
  const subjectOptionEntries = Object.entries(subjectOptions).map(
    ([value, label]) => ({
      value,
      label,
    })
  );

  return (
    <PublicShell>
      <div className="container mx-auto px-4 py-16 max-w-5xl space-y-12">
      <section className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
          <Users className="h-3.5 w-3.5" />
          <span>{t('badge')}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight">
          {t('title')}
        </h1>
        <p className="max-w-3xl mx-auto text-muted-foreground text-base leading-relaxed">
          {t('subtitle')}
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-8">
        <Card className="border-primary/20 h-full">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {t('infoTitle')}
            </CardTitle>
            <CardDescription className="leading-relaxed">
              {t('infoDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">{t('addressLabel')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('addressValue')}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">{t('emailLabel')}</p>
                <p className="text-sm text-muted-foreground">
                  hello@jbrtechno.com
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#25D366] shadow-sm">
                <WhatsAppIcon className="h-4 w-4" />
              </span>
              <div>
                <p className="text-sm font-semibold">{t('phoneLabel')}</p>
                <p className="text-sm text-muted-foreground">
                  <span dir="ltr" className="font-mono tracking-wide">
                    {whatsappDisplayNumber}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {t('formTitle')}
            </CardTitle>
            <CardDescription>{t('formDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <ContactForm
              locale={locale}
              copy={{
                fullName: t('fullName'),
                fullNamePlaceholder: t('fullNamePlaceholder'),
                email: t('email'),
                emailPlaceholder: t('emailPlaceholder'),
                phone: t('phone'),
                phonePlaceholder: t('phonePlaceholder'),
                subject: t('subject'),
                subjectPlaceholder: t('subjectPlaceholder'),
                message: t('message'),
                messagePlaceholder: t('messagePlaceholder'),
                submit: t('submit'),
                submitting: t('submitting'),
                successTitle: t('successTitle'),
                successDescription: t('successDescription'),
                errorTitle: t('errorTitle'),
                errorDescription: t('errorDescription'),
                requiredNote: t('requiredNote'),
              }}
              subjectOptions={subjectOptionEntries}
            />
          </CardContent>
        </Card>
      </div>
    </div>
    </PublicShell>
  );
}

