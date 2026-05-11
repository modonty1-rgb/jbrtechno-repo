import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPositionById } from '@/actions/positions';
import { PositionForm } from '@/components/positions/PositionForm';
import { Button } from '@jbrtechno/ui';
import { ArrowRight } from 'lucide-react';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPositionPage({ params }: Props) {
  const { id } = await params;
  const position = await getPositionById(id);
  if (!position) notFound();

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">تعديل: {position.title}</h1>
          <p className="text-sm text-muted-foreground">{position.titleEn}</p>
        </div>
        <Link href="/positions"><Button variant="outline"><ArrowRight className="ml-2 h-4 w-4" />الرجوع</Button></Link>
      </div>
      <PositionForm initial={position} />
    </div>
  );
}
