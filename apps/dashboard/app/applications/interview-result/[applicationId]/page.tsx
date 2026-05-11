import { prisma } from '@jbrtechno/database';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { ArrowLeft, User, Briefcase } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { InterviewResultForm } from './InterviewResultForm';
import { getInterviewResult } from '@/actions/interviewResult';
import { notFound } from 'next/navigation';

interface InterviewResultPageProps {
  params: Promise<{ locale: string; applicationId: string }>;
}

export default async function InterviewResultPage({ params }: InterviewResultPageProps) {
  const { locale, applicationId } = await params;
  const isArabic = true;

  const [application, resultData] = await Promise.all([
    prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        applicantName: true,
        position: true,
        profileImageUrl: true,
      },
    }),
    getInterviewResult(applicationId),
  ]);

  if (!application) {
    notFound();
  }

  const interviewResult = resultData.success ? resultData.interviewResult : null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        {/* Back Button */}
        <Link
          href="/applications/interviews"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{isArabic ? 'العودة إلى المقابلات' : 'Back to Interviews'}</span>
        </Link>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link
            href="/applications/interviews"
            className="hover:text-foreground transition-colors"
          >
            {isArabic ? 'المقابلات' : 'Interviews'}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">
            {isArabic ? 'نتيجة المقابلة' : 'Interview Result'}
          </span>
        </nav>

        <div className="flex items-center gap-3 mb-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <User className="h-7 w-7 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-bold">
              {isArabic ? 'نتيجة المقابلة' : 'Interview Result'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isArabic ? 'تسجيل وتعديل نتيجة المقابلة' : 'Record and edit interview result'}
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-primary/20">
              <Image
                src={application.profileImageUrl}
                alt={application.applicantName}
                width={64}
                height={64}
                className="object-cover w-full h-full"
              />
            </div>
            <div>
              <p className="text-xl font-semibold">{application.applicantName}</p>
              <div className="flex items-center gap-2 mt-1">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{application.position}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {isArabic
              ? interviewResult
                ? 'تعديل نتيجة المقابلة'
                : 'إضافة نتيجة المقابلة'
              : interviewResult
              ? 'Edit Interview Result'
              : 'Add Interview Result'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InterviewResultForm
            applicationId={applicationId}
            application={application}
            existingResult={interviewResult}
            locale={locale}
          />
        </CardContent>
      </Card>
    </div>
  );
}

