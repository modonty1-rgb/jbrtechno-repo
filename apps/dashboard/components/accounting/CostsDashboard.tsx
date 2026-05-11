"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@jbrtechno/ui";
import { Badge } from "@jbrtechno/ui";
import { Button } from "@jbrtechno/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@jbrtechno/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@jbrtechno/ui";
import { Info, ChevronDown, Edit, Plus, Trash2, Loader2 } from "lucide-react";
import type { FinanceData, CostItem } from "@/helpers/financialCalculations";
import {
  calculateFinanceTotals,
  calculateCategoryTotal,
  formatCurrency,
  calculateBreakEvenFromFinance,
  buildFinanceDataCostsStructure,
} from "@/helpers/financialCalculations";
import { getCostsAggregated, getCosts, createCost, updateCost, deleteCost } from "@/actions/costs";
import { CostType } from "@jbrtechno/database";
import { AddCostItemDialog } from "./AddCostItemDialog";
import { EditCostItemDialog } from "./EditCostItemDialog";
import { DeleteConfirmationDialog } from "./DeleteConfirmationDialog";

interface CostsDashboardProps {
  finance: FinanceData;
}

export function CostsDashboard({
  finance: initialFinance,
}: CostsDashboardProps) {
  const [finance, setFinance] = useState<FinanceData>(initialFinance);
  const [costsMap, setCostsMap] = useState<Map<string, string>>(new Map()); // Map: item label+amount -> costId
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addDialogCategoryType, setAddDialogCategoryType] = useState<"fixed" | "variable">("fixed");

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<{
    costId: string;
    categoryKey: string;
    costType: CostType;
    item: CostItem;
  } | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    costId: string;
    item: CostItem;
  } | null>(null);

  // Load costs from Cost table and rebuild FinanceData structure
  const loadCosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Get all costs with IDs
      const allCostsResult = await getCosts();
      if (allCostsResult.success && allCostsResult.costs) {
        // Build map: label+amount -> costId (for finding cost ID when editing/deleting)
        const map = new Map<string, string>();
        for (const cost of allCostsResult.costs) {
          const key = `${cost.label}|${cost.amount}|${cost.categoryKey}`;
          map.set(key, cost.id);
        }
        setCostsMap(map);
      }

      // Get aggregated costs for structure
      const costsResult = await getCostsAggregated();
      if (costsResult.success && costsResult.costs) {
        // Normalize null to undefined for description to match expected type
        const normalizedCosts = {
          fixed: Object.fromEntries(
            Object.entries(costsResult.costs.fixed).map(([key, items]) => [
              key,
              items.map(item => ({
                ...item,
                description: item.description ?? undefined,
              })),
            ])
          ),
          variable: Object.fromEntries(
            Object.entries(costsResult.costs.variable).map(([key, items]) => [
              key,
              items.map(item => ({
                ...item,
                description: item.description ?? undefined,
              })),
            ])
          ),
        };
        const costsStructure = buildFinanceDataCostsStructure(normalizedCosts);
        const updatedFinance: FinanceData = {
          ...finance,
          costs: costsStructure,
        };
        setFinance(updatedFinance);
      } else {
        setError("فشل في تحميل التكاليف");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحميل التكاليف");
      console.error("Load costs error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCosts();
  }, []);

  const totals = calculateFinanceTotals(finance);
  const breakEven = calculateBreakEvenFromFinance(finance);

  const getCategoryPropertyName = (categoryKey: string): string => {
    const mapping: Record<string, string> = {
      "marketing-sales": "marketingSales",
    };
    return mapping[categoryKey] || categoryKey;
  };

  const getCategoryLabel = (categoryKey: string): string => {
    const labels: Record<string, string> = {
      "leadership": "فريق القيادة",
      "technical": "الفريق التقني",
      "content": "فريق المحتوى",
      "marketing-sales": "التسويق والمبيعات",
      "operations": "الفريق التشغيلي",
      "infrastructure": "البنية التحتية والتقنية",
      "overhead": "المصروفات الإدارية",
      "marketing": "التسويق والإعلان",
    };
    return labels[categoryKey] || categoryKey;
  };

  const handleAdd = async (data: {
    categoryType: "fixed" | "variable";
    categoryId: string;
    item: CostItem;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await createCost({
        label: data.item.label,
        amount: data.item.amount,
        description: data.item.details || null,
        categoryId: data.categoryId,
        costType: data.categoryType === "fixed" ? CostType.FIXED : CostType.VARIABLE,
      });

      if (result.success) {
        await loadCosts();
        setAddDialogOpen(false);
      } else {
        setError(result.error || "فشل في إضافة التكلفة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء إضافة التكلفة");
      console.error("Add cost error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async (data: {
    categoryType: "fixed" | "variable";
    categoryId: string;
    itemIndex: number;
    item: CostItem;
  }) => {
    if (!editingItem) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await updateCost(editingItem.costId, {
        label: data.item.label,
        amount: data.item.amount,
        description: data.item.details || null,
        categoryId: data.categoryId,
        costType: data.categoryType === "fixed" ? CostType.FIXED : CostType.VARIABLE,
      });

      if (result.success) {
        await loadCosts();
        setEditDialogOpen(false);
        setEditingItem(null);
      } else {
        setError(result.error || "فشل في تحديث التكلفة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء تحديث التكلفة");
      console.error("Update cost error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingItem) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await deleteCost(deletingItem.costId);

      if (result.success) {
        await loadCosts();
        setDeleteDialogOpen(false);
        setDeletingItem(null);
      } else {
        setError(result.error || "فشل في حذف التكلفة");
      }
    } catch (err) {
      setError("حدث خطأ أثناء حذف التكلفة");
      console.error("Delete cost error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (
    categoryType: "fixed" | "variable",
    categoryKey: string,
    itemIndex: number,
    item: CostItem,
    costId: string
  ) => {
    setEditingItem({
      costId,
      categoryKey,
      costType: categoryType === "fixed" ? CostType.FIXED : CostType.VARIABLE,
      item
    });
    setEditDialogOpen(true);
  };

  const openDeleteDialog = (
    categoryType: "fixed" | "variable",
    categoryKey: string,
    itemIndex: number,
    item: CostItem,
    costId: string
  ) => {
    setDeletingItem({ costId, item });
    setDeleteDialogOpen(true);
  };

  const openAddDialog = (categoryType: "fixed" | "variable") => {
    setAddDialogCategoryType(categoryType);
    setAddDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div></div>
          <div className="flex gap-2">
            <Button
              onClick={() => openAddDialog("fixed")}
              size="sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  جاري التحميل...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة تكلفة جديدة
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive bg-destructive/10">
            <CardContent className="p-4">
              <p className="text-sm text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">إجمالي التكاليف</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">شهرياً</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(totals.total, finance.currency)}
                  </p>
                </div>
                <div className="border-t pt-2">
                  <p className="text-xs text-muted-foreground mb-1">سنوياً</p>
                  <p className="text-xl font-semibold">
                    {formatCurrency(totals.total * 12, finance.currency)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">نقطة التعادل (عملاء)</CardTitle>
            </CardHeader>
            <CardContent>
              {breakEven ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      يحتاج اكتساب شهرياً
                    </p>
                    <div className="flex items-center gap-2 text-xl font-semibold">
                      {breakEven.clientsPerMonth.toFixed(1)}
                      <Badge variant="secondary">عميل/شهر</Badge>
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-xs text-muted-foreground mb-1">
                      إجمالي العملاء المطلوبين سنوياً
                    </p>
                    <div className="flex items-center gap-2 text-lg font-semibold">
                      {breakEven.clientsPerYear}
                      <Badge variant="outline">عميل/سنة</Badge>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">حساب نقطة التعادل</CardTitle>
            </CardHeader>
            <CardContent>
              {breakEven ? (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    محسوبة: التكاليف السنوية (
                    {formatCurrency(breakEven.annualCosts, finance.currency)}) ÷
                    سعر الباقة القياسية (
                    {formatCurrency(
                      breakEven.annualPricePerClient,
                      finance.currency
                    )}
                    /سنة) = {breakEven.clientsPerYear} عميل/سنة
                  </p>
                  <p className="text-xs text-muted-foreground/70 pt-2 border-t">
                    العملاء يدفعون سنوياً مقدماً (
                    {formatCurrency(
                      breakEven.annualPricePerClient,
                      finance.currency
                    )}
                    )، لذا نحسب على أساس سنوي
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">تفصيل التكاليف</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Fixed Costs */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground border-b pb-2">
                التكاليف الثابتة
              </h4>
              {[
                { key: "leadership", data: finance.costs.fixed.leadership },
                { key: "technical", data: finance.costs.fixed.technical },
                { key: "content", data: finance.costs.fixed.content },
                {
                  key: "marketing-sales",
                  data: finance.costs.fixed.marketingSales,
                },
                { key: "operations", data: finance.costs.fixed.operations },
                {
                  key: "infrastructure",
                  data: finance.costs.fixed.infrastructure,
                },
                { key: "overhead", data: finance.costs.fixed.overhead },
              ].map(({ key, data }) => {
                const categoryTotal = calculateCategoryTotal(data.items);
                return (
                  <Collapsible key={key} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="w-full flex justify-between items-center p-3 hover:bg-muted/50 transition-colors rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                          <div className="text-sm font-semibold text-foreground">
                            {getCategoryLabel(key)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(categoryTotal, finance.currency)}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="space-y-1 p-3 pt-0 border-t">
                          {data.items.map((item, idx) => {
                            const costKey = `${item.label}|${item.amount}|${key}`;
                            const costId = costsMap.get(costKey) || '';
                            return (
                              <div
                                key={`${key}-${idx}`}
                                className="flex justify-between items-start gap-2 text-sm py-2 border-b last:border-0 group"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-muted-foreground">
                                    {item.label}
                                  </span>
                                  {item.details && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                          aria-label="معلومات إضافية"
                                        >
                                          <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="left"
                                        className="max-w-xs text-xs bg-popover text-popover-foreground border border-border shadow-lg"
                                      >
                                        <p className="whitespace-normal">
                                          {item.details}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-foreground">
                                    {formatCurrency(item.amount, finance.currency)}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        openEditDialog("fixed", key, idx, item, costId)
                                      }
                                      disabled={!costId}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() =>
                                        openDeleteDialog("fixed", key, idx, item, costId)
                                      }
                                      disabled={!costId}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>

            {/* Variable Costs */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-foreground border-b pb-2">
                التكاليف المتغيرة
              </h4>
              {[
                { key: "marketing", data: finance.costs.variable.marketing },
              ].map(({ key, data }) => {
                const categoryTotal = calculateCategoryTotal(data.items);
                return (
                  <Collapsible key={key} defaultOpen={true}>
                    <div className="border rounded-lg">
                      <CollapsibleTrigger className="w-full flex justify-between items-center p-3 hover:bg-muted/50 transition-colors rounded-t-lg">
                        <div className="flex items-center gap-2">
                          <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                          <div className="text-sm font-semibold text-foreground">
                            {getCategoryLabel(key)}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatCurrency(categoryTotal, finance.currency)}
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                        <div className="space-y-1 p-3 pt-0 border-t">
                          {data.items.map((item, idx) => {
                            const costKey = `${item.label}|${item.amount}|${key}`;
                            const costId = costsMap.get(costKey) || '';
                            return (
                              <div
                                key={`${key}-${idx}`}
                                className="flex justify-between items-start gap-2 text-sm py-2 border-b last:border-0 group"
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  <span className="text-muted-foreground">
                                    {item.label}
                                  </span>
                                  {item.details && (
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <button
                                          type="button"
                                          className="inline-flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                          aria-label="معلومات إضافية"
                                        >
                                          <Info className="h-3.5 w-3.5 text-muted-foreground/60 hover:text-muted-foreground transition-colors" />
                                        </button>
                                      </TooltipTrigger>
                                      <TooltipContent
                                        side="left"
                                        className="max-w-xs text-xs bg-popover text-popover-foreground border border-border shadow-lg"
                                      >
                                        <p className="whitespace-normal">
                                          {item.details}
                                        </p>
                                      </TooltipContent>
                                    </Tooltip>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-foreground">
                                    {item.amount > 0
                                      ? formatCurrency(item.amount, finance.currency)
                                      : "—"}
                                  </span>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() =>
                                        openEditDialog("variable", key, idx, item, costId)
                                      }
                                      disabled={!costId}
                                    >
                                      <Edit className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() =>
                                        openDeleteDialog("variable", key, idx, item, costId)
                                      }
                                      disabled={!costId}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          </CardContent>
        </Card>


        {/* Add Dialog */}
        <AddCostItemDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onAdd={handleAdd}
          categoryType={addDialogCategoryType}
        />

        {/* Edit Dialog */}
        {editingItem && (
          <EditCostItemDialog
            open={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (!open) {
                setEditingItem(null);
              }
            }}
            onEdit={handleEdit}
            categoryType={editingItem.costType === CostType.FIXED ? "fixed" : "variable"}
            categoryKey={editingItem.categoryKey}
            itemIndex={0}
            item={editingItem.item}
            costId={editingItem.costId}
          />
        )}

        {/* Delete Confirmation Dialog */}
        {deletingItem && (
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            onConfirm={handleDelete}
            item={deletingItem.item}
            currency={finance.currency}
          />
        )}
      </div>
    </TooltipProvider>
  );
}
