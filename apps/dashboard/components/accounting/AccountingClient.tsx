'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { AddExpenseDialog } from './AddExpenseDialog';
import { AddRevenueDialog } from './AddRevenueDialog';
import { EditTransactionDialog } from './EditTransactionDialog';
import { Calculator, TrendingUp, TrendingDown, Eye, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@jbrtechno/ui';
import { getTransactions, getTrialBalance, deleteTransaction } from '@/actions/accounting';
import type { TrialBalance } from '@/actions/accounting';

interface Transaction {
  id: string;
  type: 'EXPENSE' | 'REVENUE';
  amount: number;
  description: string;
  categoryId: string | null;
  date: Date;
  invoiceImageUrl: string | null;
  invoiceImagePublicId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface AccountingClientProps {
  initialTransactions: Transaction[];
  initialTrialBalance: TrialBalance;
  categoryLabelMap: Record<string, string>;
}

export function AccountingClient({
  initialTransactions,
  initialTrialBalance,
  categoryLabelMap,
}: AccountingClientProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [trialBalance, setTrialBalance] = useState<TrialBalance>(initialTrialBalance);
  const [loading, setLoading] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; transactionId: string | null }>({
    open: false,
    transactionId: null,
  });
  const [deleting, setDeleting] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    try {
      const [newTransactions, newTrialBalance] = await Promise.all([
        getTransactions(),
        getTrialBalance(),
      ]);
      setTransactions(newTransactions as Transaction[]);
      setTrialBalance(newTrialBalance);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getCategoryLabel = (categoryId: string | null) => {
    if (!categoryId) return 'غير محدد';
    return categoryLabelMap[categoryId] ?? 'غير محدد';
  };

  const handleDelete = async () => {
    if (!deleteConfirm.transactionId) return;

    setDeleting(true);
    try {
      const result = await deleteTransaction(deleteConfirm.transactionId);
      if (result.success) {
        setDeleteConfirm({ open: false, transactionId: null });
        await refreshData();
      } else {
        alert(result.error || 'فشل في حذف المعاملة');
      }
    } catch {
      alert('حدث خطأ غير متوقع');
    } finally {
      setDeleting(false);
    }
  };

  const getTransactionToDelete = () => {
    if (!deleteConfirm.transactionId) return null;
    return transactions.find(t => t.id === deleteConfirm.transactionId);
  };

  return (
    <>
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 justify-end">
        <AddExpenseDialog onSuccess={refreshData} />
        <AddRevenueDialog onSuccess={refreshData} />
      </div>

      {/* Trial Balance Card */}
      <Card className="mb-8 border-emerald-200 dark:border-emerald-900/30 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-950/20">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            {'الميزان التجريبي'}
          </CardTitle>
          <CardDescription>
            {'ملخص شامل للمصاريف والإيرادات'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  {'إجمالي المصاريف'}
                </span>
              </div>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(trialBalance.totalExpenses)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                  {'إجمالي الإيرادات'}
                </span>
              </div>
              <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(trialBalance.totalRevenue)}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${trialBalance.netProfit >= 0
              ? 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 dark:border-teal-900/30'
              : 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/30'
              }`}>
              <div className="flex items-center gap-2 mb-2">
                <Calculator className={`h-5 w-5 ${trialBalance.netProfit >= 0
                  ? 'text-teal-600 dark:text-teal-400'
                  : 'text-orange-600 dark:text-orange-400'
                  }`} />
                <span className={`text-sm font-medium ${trialBalance.netProfit >= 0
                  ? 'text-teal-700 dark:text-teal-300'
                  : 'text-orange-700 dark:text-orange-300'
                  }`}>
                  {'صافي الربح/الخسارة'}
                </span>
              </div>
              <p className={`text-2xl font-bold ${trialBalance.netProfit >= 0
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-orange-600 dark:text-orange-400'
                }`}>
                {formatCurrency(trialBalance.netProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>{'جميع المعاملات'}</CardTitle>
          <CardDescription>
            {'قائمة بجميع المصاريف والإيرادات'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              {'جاري التحديث...'}
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {'لا توجد معاملات'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{'التاريخ'}</TableHead>
                  <TableHead>{'النوع'}</TableHead>
                  <TableHead>{'الوصف'}</TableHead>
                  <TableHead>{'الفئة'}</TableHead>
                  <TableHead className="text-right">{'المبلغ'}</TableHead>
                  <TableHead>{'الفاتورة'}</TableHead>
                  <TableHead className="text-center">{'الإجراءات'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.type === 'EXPENSE' ? 'destructive' : 'default'}
                        className={
                          transaction.type === 'EXPENSE'
                            ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                            : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        }
                      >
                        {transaction.type === 'EXPENSE' ? 'مصروف' : 'إيراد'}
                      </Badge>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {getCategoryLabel(transaction.categoryId)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>
                      {transaction.invoiceImageUrl ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(transaction.invoiceImageUrl!)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          {'عرض'}
                        </Button>
                      ) : (
                        <span className="text-muted-foreground text-sm">
                          {'لا يوجد'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center">
                        <EditTransactionDialog
                          transaction={transaction}
                          onSuccess={refreshData}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteConfirm({ open: true, transactionId: transaction.id })}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          {'حذف'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invoice View Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{'صورة الفاتورة'}</DialogTitle>
            <DialogDescription>
              {'عرض صورة الفاتورة'}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <div className="relative w-full h-[600px] rounded-lg border overflow-hidden bg-muted">
              <Image
                src={selectedInvoice}
                alt="Invoice"
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirm.open} onOpenChange={(open) => setDeleteConfirm({ open, transactionId: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{'تأكيد الحذف'}</DialogTitle>
            <DialogDescription>
              {'هل أنت متأكد من حذف هذه المعاملة؟ لا يمكن التراجع عن هذا الإجراء.'}
            </DialogDescription>
          </DialogHeader>
          {getTransactionToDelete() && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="font-medium mb-2">
                {'تفاصيل المعاملة:'}
              </p>
              <p className="text-sm text-muted-foreground">
                {'النوع:'}{' '}
                {getTransactionToDelete()!.type === 'EXPENSE' ? 'مصروف' : 'إيراد'}
              </p>
              <p className="text-sm text-muted-foreground">
                {'المبلغ:'} {formatCurrency(getTransactionToDelete()!.amount)}
              </p>
              <p className="text-sm text-muted-foreground">
                {'الوصف:'} {getTransactionToDelete()!.description}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirm({ open: false, transactionId: null })}
              disabled={deleting}
            >
              {'إلغاء'}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {'جاري الحذف...'}
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {'حذف'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
















