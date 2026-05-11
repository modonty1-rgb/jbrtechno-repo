"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@jbrtechno/ui";
import { Input } from "@jbrtechno/ui";
import { Label } from "@jbrtechno/ui";
import { Textarea } from "@jbrtechno/ui";
import { Badge } from "@jbrtechno/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@jbrtechno/ui";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@jbrtechno/ui";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@jbrtechno/ui";
import { CollapsibleCard } from "@jbrtechno/ui";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Plus,
  Edit,
  ArrowUp,
  ArrowDown,
  FileText,
  Database,
} from "lucide-react";
import {
  updateSourceOfIncome,
  deleteSourceOfIncome,
} from "@/actions/sourceOfIncome";
import type { SourceOfIncomeType } from "@jbrtechno/database";

interface SourceOfIncome {
  id: string;
  key: string;
  label: string;
  description: string | null;
  type: SourceOfIncomeType;
  isActive: boolean;
  metadata: any;
}

interface Description {
  id: string;
  title?: string;
  text: string;
  order: number;
}

interface SourceOfIncomeDetailClientProps {
  source: SourceOfIncome;
  locale: string;
}

export function SourceOfIncomeDetailClient({
  source,
  locale,
}: SourceOfIncomeDetailClientProps) {
  const router = useRouter();
  const isArabic = true;
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    label: source.label,
    description: source.description || "",
    type: source.type,
    isActive: source.isActive,
    annualPrice: source.metadata?.annualPrice?.toString() || "",
  });

  const MONTHS_DURATION = 12; // Fixed duration in months

  const calculateMonthlyRevenue = (annualPrice: string): number => {
    const price = parseFloat(annualPrice);
    if (isNaN(price) || price <= 0) return 0;
    const result = price / MONTHS_DURATION;
    return Math.round(result * 100) / 100; // Round to 2 decimal places
  };

  const [descriptions, setDescriptions] = useState<Description[]>(() => {
    const descs = source.metadata?.descriptions || [];
    return Array.isArray(descs) && descs.length > 0
      ? descs.map((d: any, idx: number) => ({
        id: d.id || `desc-${Date.now()}-${idx}`,
        title: d.title || "",
        text: d.text || "",
        order: d.order ?? idx,
      }))
      : [];
  });

  const [editingDescription, setEditingDescription] = useState<Description | null>(null);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [descriptionForm, setDescriptionForm] = useState({ title: "", text: "" });

  const typeLabels: Record<SourceOfIncomeType, { ar: string; en: string }> = {
    SUBSCRIPTION: { ar: "اشتراك", en: "Subscription" },
    ONE_TIME: { ar: "دفعة واحدة", en: "One-time" },
    RECURRING: { ar: "متكرر", en: "Recurring" },
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const existingMetadata = source.metadata || {};

      let metadata: any = {
        ...existingMetadata,
        descriptions: descriptions
          .sort((a, b) => a.order - b.order)
          .map(({ id, ...rest }) => rest),
      };

      if (formData.type === "SUBSCRIPTION") {
        const annualPrice = formData.annualPrice ? parseFloat(formData.annualPrice) : null;
        const monthlyRecognizedRevenue = annualPrice ? calculateMonthlyRevenue(formData.annualPrice) : null;

        metadata = {
          ...metadata,
          planId: source.key.replace("subscription-", ""),
          annualPrice,
          monthlyRecognizedRevenue,
          duration: MONTHS_DURATION,
          currency: metadata.currency || "SAR",
        };
      }

      const result = await updateSourceOfIncome(source.id, {
        label: formData.label,
        description: formData.description || null,
        type: formData.type,
        isActive: formData.isActive,
        metadata,
      });

      if (result.success) {
        setSuccess(isArabic ? "تم الحفظ بنجاح" : "Saved successfully");
        router.refresh();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || (isArabic ? "فشل في الحفظ" : "Failed to save"));
      }
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل في الحفظ" : "Failed to save"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddDescription = () => {
    setEditingDescription(null);
    setDescriptionForm({ title: "", text: "" });
    setIsDescriptionDialogOpen(true);
  };

  const handleEditDescription = (desc: Description) => {
    setEditingDescription(desc);
    setDescriptionForm({ title: desc.title || "", text: desc.text });
    setIsDescriptionDialogOpen(true);
  };

  const handleSaveDescription = () => {
    if (!descriptionForm.text.trim()) {
      setError(isArabic ? "نص الوصف مطلوب" : "Description text is required");
      return;
    }

    if (editingDescription) {
      setDescriptions(
        descriptions.map((d) =>
          d.id === editingDescription.id
            ? {
              ...d,
              title: descriptionForm.title.trim() || undefined,
              text: descriptionForm.text.trim(),
            }
            : d
        )
      );
    } else {
      const newDesc: Description = {
        id: `desc-${Date.now()}-${Math.random()}`,
        title: descriptionForm.title.trim() || undefined,
        text: descriptionForm.text.trim(),
        order: descriptions.length > 0 ? Math.max(...descriptions.map((d) => d.order)) + 1 : 0,
      };
      setDescriptions([...descriptions, newDesc]);
    }

    setIsDescriptionDialogOpen(false);
    setEditingDescription(null);
    setDescriptionForm({ title: "", text: "" });
  };

  const handleDeleteDescription = (id: string) => {
    setDescriptions(descriptions.filter((d) => d.id !== id));
  };

  const handleMoveDescription = (id: string, direction: "up" | "down") => {
    const sorted = [...descriptions].sort((a, b) => a.order - b.order);
    const index = sorted.findIndex((d) => d.id === id);
    if (index === -1) return;

    if (direction === "up" && index > 0) {
      [sorted[index].order, sorted[index - 1].order] = [
        sorted[index - 1].order,
        sorted[index].order,
      ];
    } else if (direction === "down" && index < sorted.length - 1) {
      [sorted[index].order, sorted[index + 1].order] = [
        sorted[index + 1].order,
        sorted[index].order,
      ];
    }

    setDescriptions(sorted);
  };

  const handleDelete = async () => {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await deleteSourceOfIncome(source.id);
      if (result.success) {
        router.push('/source-of-income');
      } else {
        setError(result.error || (isArabic ? "فشل في الحذف" : "Failed to delete"));
        setIsDeleteOpen(false);
      }
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل في الحذف" : "Failed to delete"));
      setIsDeleteOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async () => {
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    try {
      const result = await updateSourceOfIncome(source.id, {
        isActive: !formData.isActive,
      });

      if (result.success) {
        setFormData({ ...formData, isActive: !formData.isActive });
        setSuccess(isArabic ? "تم التحديث بنجاح" : "Updated successfully");
        router.refresh();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(result.error || (isArabic ? "فشل في التحديث" : "Failed to update"));
      }
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل في التحديث" : "Failed to update"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/source-of-income')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {isArabic ? "تفاصيل مصدر الدخل" : "Source of Income Details"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic
                ? "عرض وتعديل تفاصيل مصدر الدخل"
                : "View and edit source of income details"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={formData.isActive ? "default" : "secondary"}
            onClick={handleToggleActive}
            disabled={isSubmitting}
          >
            {formData.isActive
              ? isArabic
                ? "نشط"
                : "Active"
              : isArabic
                ? "غير نشط"
                : "Inactive"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteOpen(true)}
            disabled={isSubmitting}
          >
            <Trash2 className="h-4 w-4 ml-2" />
            {isArabic ? "حذف" : "Delete"}
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="text-sm text-green-600 bg-green-50 dark:bg-green-950 p-3 rounded-md">
          {success}
        </div>
      )}

      <div className="space-y-6">
        <CollapsibleCard
          defaultOpen={true}
          header={
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-muted-foreground" />
              <span className="font-semibold">
                {isArabic ? "البيانات الأساسية" : "Basic Data"}
              </span>
            </div>
          }
        >
          <div className="p-6 space-y-4">
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
              <Label htmlFor="description">
                {isArabic ? "الوصف" : "Description"}
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder={
                  isArabic
                    ? "وصف اختياري لمصدر الدخل"
                    : "Optional description"
                }
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <>
                  <div className="space-y-2">
                    <Label htmlFor="annualPrice">
                      {isArabic ? "السعر السنوي (ريال) *" : "Annual Price (SAR) *"}
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

                  <div className="space-y-2">
                    <Label htmlFor="monthlyRecognizedRevenue">
                      {isArabic ? "الإيراد الشهري المعترف به (ريال)" : "Monthly Recognized Revenue (SAR)"}
                    </Label>
                    <Input
                      id="monthlyRecognizedRevenue"
                      type="text"
                      value={
                        formData.annualPrice
                          ? calculateMonthlyRevenue(formData.annualPrice).toFixed(2)
                          : "0.00"
                      }
                      readOnly
                      className="bg-muted cursor-not-allowed font-mono"
                    />
                    <p className="text-xs text-muted-foreground">
                      {isArabic
                        ? `محسوب تلقائياً: السعر السنوي ÷ ${MONTHS_DURATION} شهر`
                        : `Auto-calculated: Annual price ÷ ${MONTHS_DURATION} months`}
                    </p>
                  </div>
                </>
              )}
            </div>

          </div>
        </CollapsibleCard>

        <CollapsibleCard
          defaultOpen={true}
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <span className="font-semibold">
                  {isArabic ? "الميزات والوصف" : "Features/Descriptions"}
                </span>
              </div>
              <Badge variant="secondary">
                {descriptions.length} {isArabic ? "عنصر" : "items"}
              </Badge>
            </div>
          }
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddDescription}
              >
                <Plus className="h-4 w-4 ml-2" />
                {isArabic ? "إضافة وصف" : "Add Description"}
              </Button>
            </div>

            {descriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>
                  {isArabic
                    ? "لا توجد أوصاف. أضف وصفًا جديدًا للبدء."
                    : "No descriptions yet. Add a new description to get started."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {[...descriptions]
                  .sort((a, b) => a.order - b.order)
                  .map((desc, idx) => {
                    const sorted = [...descriptions].sort((a, b) => a.order - b.order);
                    const currentIndex = sorted.findIndex((d) => d.id === desc.id);
                    const canMoveUp = currentIndex > 0;
                    const canMoveDown = currentIndex < sorted.length - 1;

                    return (
                      <div
                        key={desc.id}
                        className="border rounded-lg p-4 space-y-2 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 space-y-2">
                            {desc.title && (
                              <h4 className="font-medium text-sm">{desc.title}</h4>
                            )}
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                              {desc.text}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMoveDescription(desc.id, "up")}
                              disabled={!canMoveUp}
                              title={isArabic ? "نقل لأعلى" : "Move up"}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleMoveDescription(desc.id, "down")}
                              disabled={!canMoveDown}
                              title={isArabic ? "نقل لأسفل" : "Move down"}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEditDescription(desc)}
                              title={isArabic ? "تعديل" : "Edit"}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteDescription(desc.id)}
                              title={isArabic ? "حذف" : "Delete"}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </CollapsibleCard>

        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => router.push('/source-of-income')}
            disabled={isSubmitting}
          >
            {isArabic ? "إلغاء" : "Cancel"}
          </Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                {isArabic ? "جاري الحفظ..." : "Saving..."}
              </>
            ) : (
              <>
                <Save className="ml-2 h-4 w-4" />
                {isArabic ? "حفظ" : "Save"}
              </>
            )}
          </Button>
        </div>
      </div>

      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingDescription
                ? isArabic
                  ? "تعديل الوصف"
                  : "Edit Description"
                : isArabic
                  ? "إضافة وصف جديد"
                  : "Add New Description"}
            </DialogTitle>
            <DialogDescription>
              {isArabic
                ? "أضف عنوانًا ووصفًا للميزة. سيتم استخدام هذا عند إنشاء البطاقات والخدمات."
                : "Add a title and description for the feature. This will be used when creating cards and services."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="desc-title">
                {isArabic ? "العنوان (اختياري)" : "Title (Optional)"}
              </Label>
              <Input
                id="desc-title"
                value={descriptionForm.title}
                onChange={(e) =>
                  setDescriptionForm({ ...descriptionForm, title: e.target.value })
                }
                placeholder={
                  isArabic
                    ? "مثال: ميزة رئيسية"
                    : "e.g., Key Feature"
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc-text">
                {isArabic ? "النص *" : "Text *"}
              </Label>
              <Textarea
                id="desc-text"
                value={descriptionForm.text}
                onChange={(e) =>
                  setDescriptionForm({ ...descriptionForm, text: e.target.value })
                }
                placeholder={
                  isArabic
                    ? "أدخل نص الوصف..."
                    : "Enter description text..."
                }
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDescriptionDialogOpen(false);
                setEditingDescription(null);
                setDescriptionForm({ title: "", text: "" });
              }}
            >
              {isArabic ? "إلغاء" : "Cancel"}
            </Button>
            <Button onClick={handleSaveDescription}>
              {isArabic ? "حفظ" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isArabic ? "تأكيد الحذف" : "Confirm Delete"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? "هل أنت متأكد من حذف هذا المصدر؟ لا يمكن التراجع عن هذا الإجراء."
                : "Are you sure you want to delete this source? This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <div>
              <p className="text-sm font-medium mb-1">
                {isArabic ? "الاسم:" : "Label:"}
              </p>
              <p className="text-sm text-muted-foreground">
                {source.label}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium mb-1">
                {isArabic ? "النوع:" : "Type:"}
              </p>
              <p className="text-sm text-muted-foreground">
                {isArabic ? typeLabels[source.type].ar : typeLabels[source.type].en}
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {isArabic ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                  {isArabic ? "جاري الحذف..." : "Deleting..."}
                </>
              ) : (
                isArabic ? "حذف" : "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}












