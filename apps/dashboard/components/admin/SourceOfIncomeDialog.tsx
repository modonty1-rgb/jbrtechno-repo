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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jbrtechno/ui";
import { Loader2 } from "lucide-react";
import type { SourceOfIncomeType } from "@jbrtechno/database";

interface SourceOfIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    label: string;
    type: SourceOfIncomeType;
    metadata?: any;
  }) => Promise<void>;
  editingSource?: {
    key: string;
    label: string;
    description: string | null;
    type: SourceOfIncomeType;
    order: number;
    metadata: any;
  } | null;
  locale: string;
}

export function SourceOfIncomeDialog({
  open,
  onOpenChange,
  onSubmit,
  editingSource,
  locale,
}: SourceOfIncomeDialogProps) {
  const isArabic = true;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    label: "",
    type: "SUBSCRIPTION" as SourceOfIncomeType,
    annualPrice: "",
  });

  useEffect(() => {
    if (open) {
      if (editingSource) {
        const metadata = editingSource.metadata || {};
        setFormData({
          label: editingSource.label,
          type: editingSource.type,
          annualPrice: metadata.annualPrice?.toString() || "",
        });
      } else {
        setFormData({
          label: "",
          type: "SUBSCRIPTION",
          annualPrice: "",
        });
      }
      setError(null);
    }
  }, [open, editingSource]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.label.trim()) {
      setError(isArabic ? "اسم المصدر مطلوب" : "Label is required");
      return;
    }

    if (formData.type === "SUBSCRIPTION") {
      if (!formData.annualPrice || parseFloat(formData.annualPrice) <= 0) {
        setError(isArabic ? "السعر مطلوب" : "Price is required");
        return;
      }
    }

    setSubmitting(true);

    try {
      let metadata: any = null;
      if (formData.type === "SUBSCRIPTION" && formData.annualPrice) {
        const planId = formData.label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
        metadata = {
          planId,
          annualPrice: parseFloat(formData.annualPrice),
          currency: "SAR",
        };
      }

      await onSubmit({
        label: formData.label.trim(),
        type: formData.type,
        metadata,
      });

      if (!editingSource) {
        setFormData({
          label: "",
          type: "SUBSCRIPTION",
          annualPrice: "",
        });
      }
      setError(null);
      onOpenChange(false);
    } catch (err) {
      setError(
        isArabic
          ? "حدث خطأ أثناء الحفظ"
          : "An error occurred while saving"
      );
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setError(null);
      onOpenChange(false);
    }
  };

  const typeLabels: Record<SourceOfIncomeType, { ar: string; en: string }> = {
    SUBSCRIPTION: { ar: "اشتراك", en: "Subscription" },
    ONE_TIME: { ar: "دفعة واحدة", en: "One-time" },
    RECURRING: { ar: "متكرر", en: "Recurring" },
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingSource
              ? isArabic
                ? "تعديل مصدر الدخل"
                : "Edit Source of Income"
              : isArabic
                ? "إضافة مصدر دخل جديد"
                : "Add New Source of Income"}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? "أدخل تفاصيل مصدر الدخل"
              : "Enter source of income details"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">
                {isArabic ? "الاسم *" : "Label *"}
              </Label>
              <Input
                id="label"
                value={formData.label}
                onChange={(e) =>
                  setFormData({ ...formData, label: e.target.value })
                }
                placeholder={isArabic ? "مثال: اشتراك قياسي" : "e.g., Standard Subscription"}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                {isArabic ? "النوع *" : "Type *"}
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) =>
                  setFormData({ ...formData, type: value as SourceOfIncomeType })
                }
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, labels]) => (
                    <SelectItem key={value} value={value}>
                      {isArabic ? labels.ar : labels.en}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {formData.type === "SUBSCRIPTION" && (
              <div className="space-y-2">
                <Label htmlFor="annualPrice">
                  {isArabic ? "السعر (ريال) *" : "Price (SAR) *"}
                </Label>
                <Input
                  id="annualPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.annualPrice}
                  onChange={(e) =>
                    setFormData({ ...formData, annualPrice: e.target.value })
                  }
                  placeholder={isArabic ? "مثال: 2499" : "e.g., 2499"}
                  required
                />
              </div>
            )}

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
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {isArabic ? "جاري الحفظ..." : "Saving..."}
                </>
              ) : editingSource ? (
                isArabic ? "حفظ التغييرات" : "Save Changes"
              ) : (
                isArabic ? "إضافة" : "Add"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}













