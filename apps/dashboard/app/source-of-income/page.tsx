import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@jbrtechno/database";
import { getAllSourcesOfIncome } from "@/actions/sourceOfIncome";
import { SourceOfIncomePageClient } from "./SourceOfIncomePageClient";

export default async function SourceOfIncomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  const { locale } = await params;

  // Only SUPER_ADMIN can access this page
  if (
    !session?.user ||
    session.user.role !== UserRole.SUPER_ADMIN
  ) {
    redirect('/');
  }

  const result = await getAllSourcesOfIncome();
  const sources = result.success ? result.sources || [] : [];

  return (
    <SourceOfIncomePageClient
      sources={sources}
      locale={locale}
      initialError={result.success ? "" : result.error || ""}
    />
  );
}













