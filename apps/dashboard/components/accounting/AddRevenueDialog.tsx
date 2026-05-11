'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Loader2 } from 'lucide-react';
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
import { addRevenue } from '@/actions/accounting';
import { getActiveCategoryTreeByType } from '@/actions/categories';

interface AddRevenueDialogProps {
  onSuccess?: () => void;
}

interface CategoryNode {
  id: string;
  label: string;
  parentId: string | null;
  type: 'EXPENSE' | 'REVENUE';
  order: number;
  children?: CategoryNode[];
}

export function AddRevenueDialog({ onSuccess }: AddRevenueDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryNode[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    mainCategory: '',
    subcategory: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setCategoriesLoading(true);
    setError(null);

    getActiveCategoryTreeByType('REVENUE')
      .then((result) => {
        if (cancelled) return;
        setCategories(result.success ? result.categories || [] : []);
        if (!result.success && result.error) {
          setError(result.error);
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
  }, [open]);

  const selectedMainCategory = categories.find((c) => c.id === formData.mainCategory);
  const subcategories = selectedMainCategory?.children || [];
  const resolvedCategoryId = formData.subcategory || formData.mainCategory || undefined;

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
      const result = await addRevenue({
        amount: parseFloat(formData.amount),
        description: formData.description.trim(),
        categoryId: resolvedCategoryId,
        date: new Date(formData.date),
      });

      if (result.success) {
        setOpen(false);
        setFormData({
          amount: '',
          description: '',
          mainCategory: '',
          subcategory: '',
          date: new Date().toISOString().split('T')[0],
        });
        setError(null);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(result.error || 'فشل في إضافة الإيراد');
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
        <Button variant="default" className="bg-teal-600 hover:bg-teal-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          {'إضافة إيراد'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{'إضافة إيراد'}</DialogTitle>
          <DialogDescription>
            {'قم بإضافة إيراد جديد'}
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
            <Label htmlFor="mainCategory">
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
              placeholder="وصف الإيراد..."
            />
          </div>

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
                  {'جاري الإضافة...'}
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {'إضافة'}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
















