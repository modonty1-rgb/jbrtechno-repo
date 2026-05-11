import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { UserRole } from "@jbrtechno/database";
import { getSourceOfIncomeById } from "@/actions/sourceOfIncome";
import { SourceOfIncomeDetailClient } from "./SourceOfIncomeDetailClient";

export default async function SourceOfIncomeDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const session = await auth();
  const { locale, id } = await params;

  // Only SUPER_ADMIN can access this page
  if (
    !session?.user ||
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    redirect('/');
  }

  const result = await getSourceOfIncomeById(id);

  if (!result.success || !result.source) {
    notFound();
  }

  return <SourceOfIncomeDetailClient source={result.source} locale={locale} />;
}












