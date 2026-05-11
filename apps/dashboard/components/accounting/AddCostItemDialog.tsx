"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@jbrtechno/ui";
import { Button } from "@jbrtechno/ui";
import { Input } from "@jbrtechno/ui";
import { Label } from "@jbrtechno/ui";
import { Textarea } from "@jbrtechno/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jbrtechno/ui";
import { Loader2 } from "lucide-react";
import { getCategoryTree } from "@/actions/categories";
import { CategoryType } from "@jbrtechno/database";

interface AddCostItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (data: {
    categoryType: "fixed" | "variable";
    categoryId: string;
    item: {
      label: string;
      amount: number;
      details?: string;
    };
  }) => Promise<void>;
  categoryType: "fixed" | "variable";
}

interface Category {
  id: string;
  label: string;
  parentId: string | null;
  type: CategoryType;
  children?: Category[];
}

export function AddCostItemDialog({
  open,
  onOpenChange,
  onAdd,
  categoryType,
}: AddCostItemDialogProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    mainCategory: "",
    label: "",
    amount: "",
    details: "",
  });

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open, categoryType]);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = await getCategoryTree(CategoryType.EXPENSE);
      if (result.success && result.categories) {
        setCategories(result.categories);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.mainCategory) {
      setError("يرجى اختيار الفئة الرئيسية");
      return;
    }

    if (!formData.label.trim()) {
      setError("اسم العنصر مطلوب");
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) < 0) {
      setError("المبلغ مطلوب ويجب أن يكون أكبر من أو يساوي صفر");
      return;
    }

    setSubmitting(true);

    try {
      const newItem = {
        label: formData.label.trim(),
        amount: parseFloat(formData.amount),
        details: formData.details.trim() || undefined,
      };

      await onAdd({
        categoryType,
        categoryId: formData.mainCategory,
        item: newItem,
      });

      setFormData({
        mainCategory: "",
        label: "",
        amount: "",
        details: "",
      });
      setError(null);
      onOpenChange(false);
    } catch (err) {
      setError("حدث خطأ أثناء إضافة العنصر");
      console.error("Add item error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setFormData({
        mainCategory: "",
        label: "",
        amount: "",
        details: "",
      });
      setError(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة عنصر تكلفة جديد</DialogTitle>
          <DialogDescription>
            أضف عنصر تكلفة جديد إلى {categoryType === "fixed" ? "التكاليف الثابتة" : "التكاليف المتغيرة"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mainCategory">الفئة الرئيسية *</Label>
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              ) : (
                <Select
                  value={formData.mainCategory}
                  onValueChange={(value) => setFormData({ ...formData, mainCategory: value })}
                >
                  <SelectTrigger id="mainCategory">
                    <SelectValue placeholder="اختر الفئة الرئيسية" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="label">اسم العنصر *</Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder="مثال: راتب مطور"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">المبلغ *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">التفاصيل (اختياري)</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) =>
                  setFormData({ ...formData, details: e.target.value })
                }
                placeholder="أضف أي تفاصيل إضافية..."
                rows={3}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={submitting}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                "إضافة"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}













