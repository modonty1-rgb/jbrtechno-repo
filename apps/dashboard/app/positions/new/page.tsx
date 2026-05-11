import Link from 'next/link';
import { PositionForm } from '@/components/positions/PositionForm';
import { Button } from '@jbrtechno/ui';
import { ArrowRight } from 'lucide-react';

export default function NewPositionPage() {
  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">وظيفة جديدة</h1>
        <Link href="/positions"><Button variant="outline"><ArrowRight className="ml-2 h-4 w-4" />الرجوع</Button></Link>
      </div>
      <PositionForm />
    </div>
  );
}
