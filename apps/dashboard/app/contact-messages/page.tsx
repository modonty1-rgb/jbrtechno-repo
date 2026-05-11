import { prisma } from '@jbrtechno/database';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@jbrtechno/ui';

export default async function ContactMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: 'desc' },
  });

  const subjectLabels: Record<string, string> = {
    'general': 'عام',
    'support': 'دعم',
    'sales': 'مبيعات',
    'feedback': 'ملاحظات',
    'other': 'أخرى',
  };

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          رسائل الاتصال
        </h1>
        <p className="text-muted-foreground text-sm">
          عرض وإدارة جميع رسائل الاتصال الواردة
        </p>
      </div>

      <Card className="border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">
            إجمالي الرسائل
          </CardTitle>
          <CardDescription>رسائل الاتصال</CardDescription>
        </CardHeader>
        <CardContent className="pt-2">
          <p className="text-4xl font-black">{messages.length}</p>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-primary/10">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            رسائل الاتصال
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {messages.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              لا توجد رسائل اتصال
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>الاسم الكامل</TableHead>
                  <TableHead>البريد الإلكتروني</TableHead>
                  <TableHead>الهاتف</TableHead>
                  <TableHead>الموضوع</TableHead>
                  <TableHead>تاريخ الإرسال</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => {
                  const readableSubject =
                    subjectLabels[message.subject] ?? message.subject;
                  const submittedAt = dateFormatter.format(message.createdAt);
                  return (
                    <TableRow key={message.id} className="align-top">
                      <TableCell className="font-medium">
                        <div>{message.fullName}</div>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-3">
                          {message.message}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <a
                          href={`mailto:${message.email}`}
                          className="hover:underline text-primary"
                        >
                          {message.email}
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {message.phone ? (
                          <span dir="ltr" className="font-mono tracking-wide">
                            {message.phone}
                          </span>
                        ) : (
                          '—'
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <Badge variant="secondary">{readableSubject}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {submittedAt}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

