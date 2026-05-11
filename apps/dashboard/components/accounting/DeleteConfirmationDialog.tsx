"use client";

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
import { formatCurrency } from "@/helpers/financialCalculations";
import type { CostItem } from "@/helpers/financialCalculations";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  item: CostItem;
  currency: string;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  item,
  currency,
}: DeleteConfirmationDialogProps) {
  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="p-4 bg-muted rounded-lg space-y-2">
          <div>
            <p className="text-sm font-medium mb-1">اسم العنصر:</p>
            <p className="text-sm text-muted-foreground">{item.label}</p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">المبلغ:</p>
            <p className="text-sm text-muted-foreground">
              {formatCurrency(item.amount, currency)}
            </p>
          </div>
          {item.details && (
            <div>
              <p className="text-sm font-medium mb-1">التفاصيل:</p>
              <p className="text-sm text-muted-foreground">{item.details}</p>
            </div>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            حذف
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}













