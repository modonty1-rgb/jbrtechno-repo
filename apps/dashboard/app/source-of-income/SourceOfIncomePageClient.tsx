"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@jbrtechno/ui";
import { Button } from "@jbrtechno/ui";
import { Badge } from "@jbrtechno/ui";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
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
  createSourceOfIncome,
  updateSourceOfIncome,
  deleteSourceOfIncome,
} from "@/actions/sourceOfIncome";
import { SourceOfIncomeDialog } from "@/components/admin/SourceOfIncomeDialog";
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

interface SourceOfIncomePageClientProps {
  sources: SourceOfIncome[];
  locale: string;
  initialError?: string;
}

export function SourceOfIncomePageClient({
  sources,
  locale,
  initialError = "",
}: SourceOfIncomePageClientProps) {
  const router = useRouter();
  const isArabic = true;
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingSource, setDeletingSource] = useState<SourceOfIncome | null>(
    null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(initialError);

  const openDeleteDialog = (source: SourceOfIncome, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingSource(source);
    setIsDeleteOpen(true);
  };

  const handleRowClick = (source: SourceOfIncome) => {
    router.push(`/source-of-income/${source.id}`);
  };

  const handleCreate = async (data: {
    label: string;
    type: SourceOfIncomeType;
    metadata?: any;
  }) => {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await createSourceOfIncome({
        label: data.label,
        type: data.type,
        metadata: data.metadata,
      });
      if (result.success) {
        setIsCreateOpen(false);
        router.refresh();
      } else {
        setError(result.error || (isArabic ? "فشل في الإنشاء" : "Failed to create"));
      }
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل في الإنشاء" : "Failed to create"));
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDelete = async () => {
    if (!deletingSource) return;

    setError("");
    setIsSubmitting(true);

    try {
      const result = await deleteSourceOfIncome(deletingSource.id);
      if (result.success) {
        setIsDeleteOpen(false);
        setDeletingSource(null);
        router.refresh();
      } else {
        setError(result.error || (isArabic ? "فشل في الحذف" : "Failed to delete"));
      }
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل في الحذف" : "Failed to delete"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (source: SourceOfIncome) => {
    setError("");
    setIsSubmitting(true);

    try {
      const result = await updateSourceOfIncome(source.id, {
        isActive: !source.isActive,
      });

      if (result.success) {
        router.refresh();
      } else {
        setError(result.error || (isArabic ? "فشل في التحديث" : "Failed to update"));
      }
    } catch (err: any) {
      setError(err.message || (isArabic ? "فشل في التحديث" : "Failed to update"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeLabel = (type: SourceOfIncomeType): string => {
    const labels: Record<SourceOfIncomeType, { ar: string; en: string }> = {
      SUBSCRIPTION: { ar: "اشتراك", en: "Subscription" },
      ONE_TIME: { ar: "دفعة واحدة", en: "One-time" },
      RECURRING: { ar: "متكرر", en: "Recurring" },
    };
    return isArabic ? labels[type].ar : labels[type].en;
  };

  const getTypeBadgeVariant = (type: SourceOfIncomeType) => {
    switch (type) {
      case "SUBSCRIPTION":
        return "default";
      case "ONE_TIME":
        return "outline";
      case "RECURRING":
        return "secondary";
      default:
        return "outline";
    }
  };

  const formatPrice = (source: SourceOfIncome): string => {
    if (source.type === "SUBSCRIPTION" && source.metadata?.annualPrice) {
      return `${source.metadata.annualPrice.toLocaleString()} ${source.metadata.currency || "SAR"}`;
    }
    return "-";
  };

  return (
    <div className="p-6 space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {isArabic ? "مصادر الدخل" : "Sources of Income"}
          </h1>
          <p className="text-muted-foreground">
            {isArabic
              ? "إدارة مصادر الدخل والإيرادات"
              : "Manage sources of income and revenue"}
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          {isArabic ? "إضافة مصدر جديد" : "Add New Source"}
        </Button>
      </div>

      {error && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {error}
        </div>
      )}

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isArabic ? "الاسم" : "Label"}</TableHead>
              <TableHead>{isArabic ? "النوع" : "Type"}</TableHead>
              <TableHead>{isArabic ? "السعر" : "Price"}</TableHead>
              <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
              <TableHead className={isArabic ? "text-left" : "text-right"}>
                {isArabic ? "الإجراءات" : "Actions"}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sources.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-muted-foreground"
                >
                  {isArabic
                    ? "لا توجد مصادر دخل"
                    : "No sources of income found"}
                </TableCell>
              </TableRow>
            ) : (
              sources.map((source) => (
                <TableRow
                  key={source.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleRowClick(source)}
                >
                  <TableCell className="font-medium">{source.label}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(source.type)}>
                      {getTypeLabel(source.type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatPrice(source)}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleActive(source);
                      }}
                      disabled={isSubmitting}
                      className="cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Badge variant={source.isActive ? "default" : "secondary"}>
                        {source.isActive
                          ? isArabic
                            ? "نشط"
                            : "Active"
                          : isArabic
                            ? "غير نشط"
                            : "Inactive"}
                      </Badge>
                    </button>
                  </TableCell>
                  <TableCell className={isArabic ? "text-left" : "text-right"}>
                    <div
                      className={`flex items-center gap-2 ${isArabic ? "justify-start" : "justify-end"
                        }`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRowClick(source)}
                        disabled={isSubmitting}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => openDeleteDialog(source, e)}
                        disabled={isSubmitting}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Create Dialog */}
      <SourceOfIncomeDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        onSubmit={handleCreate}
        editingSource={null}
        locale={locale}
      />


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
          {deletingSource && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div>
                <p className="text-sm font-medium mb-1">
                  {isArabic ? "الاسم:" : "Label:"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {deletingSource.label}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {isArabic ? "المفتاح:" : "Key:"}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  {deletingSource.key}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">
                  {isArabic ? "النوع:" : "Type:"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {getTypeLabel(deletingSource.type)}
                </p>
              </div>
            </div>
          )}
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













