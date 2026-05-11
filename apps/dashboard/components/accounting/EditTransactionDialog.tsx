'use client';

import { useState, useEffect } from 'react';
import { Edit, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Textarea } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { InvoiceImageUpload } from './InvoiceImageUpload';
import { updateTransaction } from '@/actions/accounting';
import { getActiveCategoryTreeByType } from '@/actions/categories';

interface Transaction {
  id: string;
  type: 'EXPENSE' | 'REVENUE';
  amount: number;
  description: string;
  categoryId: string | null;
  date: Date;
  invoiceImageUrl: string | null;
  invoiceImagePublicId: string | null;
}

interface CategoryNode {
  id: string;
  label: string;
  parentId: string | null;
  type: 'EXPENSE' | 'REVENUE';
  order: number;
  children?: CategoryNode[];
}

interface EditTransactionDialogProps {
  transaction: Transaction;
  onSuccess?: () => void;
}

export function EditTransactionDialog({ transaction, onSuccess }: EditTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: transaction.amount.toString(),
    description: transaction.description,
    mainCategory: '',
    subcategory: '',
    date: new Date(transaction.date).toISOString().split('T')[0],
    invoiceImageUrl: transaction.invoiceImageUrl || '',
    invoiceImagePublicId: transaction.invoiceImagePublicId || '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        amount: transaction.amount.toString(),
        description: transaction.description,
        mainCategory: '',
        subcategory: '',
        date: new Date(transaction.date).toISOString().split('T')[0],
        invoiceImageUrl: transaction.invoiceImageUrl || '',
        invoiceImagePublicId: transaction.invoiceImagePublicId || '',
      });
      setError(null);
    }
  }, [open, transaction]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setCategoriesLoading(true);

    getActiveCategoryTreeByType(transaction.type)
      .then((result) => {
        if (cancelled) return;
        const nextCategories = result.success ? result.categories || [] : [];
        setCategories(nextCategories);
        if (!result.success && result.error) {
          setError(result.error);
        }

        const existingCategoryId = transaction.categoryId || '';
        if (!existingCategoryId) return;

        // If existing id matches a main category
        const mainMatch = nextCategories.find((c) => c.id === existingCategoryId);
        if (mainMatch) {
          setFormData((prev) => ({ ...prev, mainCategory: mainMatch.id, subcategory: '' }));
          return;
        }

        // If existing id matches a subcategory, set parent + child
        for (const main of nextCategories) {
          const child = main.children?.find((ch) => ch.id === existingCategoryId);
          if (child) {
            setFormData((prev) => ({ ...prev, mainCategory: main.id, subcategory: child.id }));
            return;
          }
        }
      })
      .catch(() => {
        if (cancelled) return;
        setCategories([]);
        setError('فشل في تحميل الفئات');
      })
      .finally(() => {
        if (cancelled) return;
        setCategoriesLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [open, transaction.type, transaction.categoryId]);

  const selectedMainCategory = categories.find((c) => c.id === formData.mainCategory);
  const subcategories = selectedMainCategory?.children || [];
  const resolvedCategoryId =
    formData.subcategory || formData.mainCategory || transaction.categoryId || undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('المبلغ مطلوب ويجب أن يكون أكبر من صفر');
      return;
    }

    if (!formData.description.trim()) {
      setError('الوصف مطلوب');
      return;
    }

    setSubmitting(true);

    try {
      const result = await updateTransaction(transaction.id, {
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        categoryId: resolvedCategoryId,
        date: new Date(formData.date),
        ...(transaction.type === 'EXPENSE' ? {
          invoiceImageUrl: formData.invoiceImageUrl || undefined,
          invoiceImagePublicId: formData.invoiceImagePublicId || undefined,
        } : {}),
      });

      if (result.success) {
        setOpen(false);
        setError(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || 'فشل في تعديل المعاملة');
      }
    } catch {
      setError('حدث خطأ غير متوقع');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Edit className="h-4 w-4 mr-2" />
          تعديل
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {'تعديل المعاملة'}
          </DialogTitle>
          <DialogDescription>
            {'قم بتعديل بيانات المعاملة'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                {'المبلغ'} *
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                disabled={submitting}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">
                {'التاريخ'} *
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
                disabled={submitting}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">
              {'الحساب'} (اختياري / Optional)
            </Label>
            <Select
              value={formData.mainCategory}
              onValueChange={(value) => setFormData({ ...formData, mainCategory: value, subcategory: '' })}
              disabled={submitting || categoriesLoading}
            >
              <SelectTrigger id="mainCategory">
                <SelectValue
                  placeholder={
                    categoriesLoading
                      ? 'جاري التحميل...'
                      : 'اختر الحساب'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {formData.mainCategory && subcategories.length > 0 && (
              <div className="space-y-2 pt-2">
                <Label htmlFor="subcategory">
                  {'الحساب الفرعي'} (اختياري / Optional)
                </Label>
                <Select
                  value={formData.subcategory || undefined}
                  onValueChange={(value) => setFormData({ ...formData, subcategory: value })}
                  disabled={submitting || categoriesLoading}
                >
                  <SelectTrigger id="subcategory">
                    <SelectValue placeholder="اختر الحساب الفرعي" />
                  </SelectTrigger>
                  <SelectContent>
                    {subcategories.map((subcategory) => (
                      <SelectItem key={subcategory.id} value={subcategory.id}>
                        {subcategory.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              {'الوصف'} *
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              disabled={submitting}
              rows={3}
              placeholder="وصف المعاملة..."
            />
          </div>

          {transaction.type === 'EXPENSE' && (
            <div className="space-y-2">
              <Label>
                {'صورة الفاتورة'} (اختياري / Optional)
              </Label>
              <InvoiceImageUpload
                currentImageUrl={formData.invoiceImageUrl}
                onUploadSuccess={(url, publicId) => {
                  setFormData({ ...formData, invoiceImageUrl: url, invoiceImagePublicId: publicId });
                }}
                onUploadError={(error) => {
                  setError(error);
                }}
                disabled={submitting}
              />
            </div>
          )}

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              {'إلغاء'}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {'جاري الحفظ...'}
                </>
              ) : (
                <>
                  <Edit className="h-4 w-4 mr-2" />
                  {'حفظ'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
















