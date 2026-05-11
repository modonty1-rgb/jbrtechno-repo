import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { getCategoryTree } from '@/actions/categories';
import { CategoryTree } from '@/components/admin/CategoryTree';

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();

  if (
    !session?.user ||
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    redirect('/');
  }

  const result = await getCategoryTree();
  const initialCategories = result.success ? result.categories || [] : [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">
          {locale === 'ar' ? 'شجرة الحسابات' : 'Chart of Accounts'}
        </h1>
        <p className="text-muted-foreground">
          {locale === 'ar'
            ? 'إدارة شجرة الحسابات للمصروفات والإيرادات وربطها بالمعاملات.'
            : 'Manage the chart of accounts for expenses/revenues and link them to transactions.'}
        </p>
      </div>

      <CategoryTree locale={locale} initialCategories={initialCategories} />
    </div>
  );
}


