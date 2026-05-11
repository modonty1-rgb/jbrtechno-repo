import type { Metadata } from "next";
import { CostsDashboard } from "@/components/accounting/CostsDashboard";
import { NoFinanceDataAlert } from "@/components/admin/NoFinanceDataAlert";
import { getFinanceData } from "@/lib/finance-data";

export const metadata: Metadata = {
  title: "التكاليف التشغيلية - Modonty",
  description: "تفاصيل شاملة للتكاليف التشغيلية لمشروع Modonty",
};

export default async function CostsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const finance = await getFinanceData();

  if (!finance) {
    return <NoFinanceDataAlert />;
  }

  return (
    <div className="min-h-screen bg-muted" dir="rtl">
      <section className="py-16">
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <CostsDashboard finance={finance} />
          </div>
        </div>
      </section>
    </div>
  );
}

