'use client';

import { useEffect, useMemo, useState } from 'react';
import { CategoryType } from '@jbrtechno/database';
import { createCategory, updateCategory } from '@/actions/categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@jbrtechno/ui';
import { Button } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';

export interface CategoryFormValues {
  id: string;
  label: string;
  type: CategoryType;
  parentId: string | null;
}

export interface CategoryOption {
  id: string;
  label: string;
  type: CategoryType;
  parentId: string | null;
}

interface CategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  locale: string;
  categories: CategoryOption[];
  initialValues?: CategoryFormValues;
  defaultParentId?: string | null;
  onSaved: () => void;
}

export function CategoryDialog({
  open,
  onOpenChange,
  mode,
  locale,
  categories,
  initialValues,
  defaultParentId,
  onSaved,
}: CategoryDialogProps) {
  const isArabic = true;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [values, setValues] = useState<CategoryFormValues>(() => ({
    id: initialValues?.id ?? '',
    label: initialValues?.label ?? '',
    type: initialValues?.type ?? CategoryType.EXPENSE,
    parentId: initialValues?.parentId ?? defaultParentId ?? null,
  }));

  useEffect(() => {
    if (!open) return;
    setError(null);
    setSubmitting(false);
    setValues({
      id: initialValues?.id ?? '',
      label: initialValues?.label ?? '',
      type: initialValues?.type ?? CategoryType.EXPENSE,
      parentId: initialValues?.parentId ?? defaultParentId ?? null,
    });
  }, [open, initialValues, defaultParentId]);

  const parentType = useMemo(() => {
    if (!values.parentId) return null;
    return categories.find((c) => c.id === values.parentId)?.type ?? null;
  }, [categories, values.parentId]);

  const effectiveType = parentType ?? values.type;

  const mainCategoryOptions = useMemo(() => {
    return categories.filter((c) => {
      if (c.parentId) return false;
      if (c.type !== effectiveType) return false;
      if (mode === 'edit' && c.id === values.id) return false;
      return true;
    });
  }, [categories, effectiveType, mode, values.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!values.label.trim()) {
      setError(isArabic ? 'الاسم مطلوب' : 'Label is required');
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'create') {
        const result = await createCategory({
          label: values.label.trim(),
          type: effectiveType,
          parentId: values.parentId,
          order: 0,
        });
        if (!result.success) {
          setError(result.error || (isArabic ? 'فشل في إنشاء الفئة' : 'Failed to create category'));
          return;
        }
      } else {
        const result = await updateCategory(values.id, {
          label: values.label.trim(),
          type: effectiveType,
          parentId: values.parentId,
        });
        if (!result.success) {
          setError(result.error || (isArabic ? 'فشل في تحديث الفئة' : 'Failed to update category'));
          return;
        }
      }

      onOpenChange(false);
      onSaved();
    } catch {
      setError(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {mode === 'create'
              ? isArabic
                ? 'إضافة حساب'
                : 'Add Account'
              : isArabic
                ? 'تعديل حساب'
                : 'Edit Account'}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? 'إدارة شجرة الحسابات للمصروفات والإيرادات.'
              : 'Manage the chart of accounts for expenses and revenues.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">{isArabic ? 'الاسم' : 'Label'}</Label>
            <Input
              id="label"
              value={values.label}
              onChange={(e) => setValues((p) => ({ ...p, label: e.target.value }))}
              disabled={submitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{isArabic ? 'النوع' : 'Type'}</Label>
              <Select
                value={effectiveType}
                onValueChange={(value) =>
                  setValues((p) => ({
                    ...p,
                    type: value as CategoryType,
                    parentId: null,
                  }))
                }
                disabled={submitting || !!values.parentId || mode === 'edit'}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'اختر النوع' : 'Select type'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={CategoryType.EXPENSE}>
                    {isArabic ? 'مصروفات' : 'Expense'}
                  </SelectItem>
                  <SelectItem value={CategoryType.REVENUE}>
                    {isArabic ? 'إيرادات' : 'Revenue'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{isArabic ? 'الحساب الرئيسي' : 'Parent account (optional)'}</Label>
              <Select
                value={values.parentId ?? '__none__'}
                onValueChange={(value) =>
                  setValues((p) => ({
                    ...p,
                    parentId: value === '__none__' ? null : value,
                  }))
                }
                disabled={submitting || !!defaultParentId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={isArabic ? 'بدون' : 'None'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{isArabic ? 'بدون' : 'None'}</SelectItem>
                  {mainCategoryOptions.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              {isArabic ? 'إلغاء' : 'Cancel'}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (isArabic ? 'جاري الحفظ...' : 'Saving...') : isArabic ? 'حفظ' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


