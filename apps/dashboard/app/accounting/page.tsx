import { messages } from '@/helpers/messages';
import { Calculator } from 'lucide-react';
import { AccountingClient } from '@/components/accounting/AccountingClient';
import { getTransactions, getTrialBalance } from '@/actions/accounting';
import { getCategoryLabelMap } from '@/actions/categories';

export default async function AccountingPage() {

  const [transactions, trialBalance] = await Promise.all([
    getTransactions(),
    getTrialBalance(),
  ]);

  let categoryLabelMap: Record<string, string> = {};
  try {
    categoryLabelMap = await getCategoryLabelMap();
  } catch {
    categoryLabelMap = {};
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5">
            <Calculator className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-2">
              {messages.admin.accounting}
            </h1>
            <p className="text-muted-foreground text-lg">
              نظام محاسبة بسيط لتتبع مصاريف ومدخولات نظام جبرسيو - ينمو معنا
            </p>
          </div>
        </div>
      </div>

      <AccountingClient
        initialTransactions={transactions}
        initialTrialBalance={trialBalance}
        categoryLabelMap={categoryLabelMap}
      />
    </div>
  );
}

