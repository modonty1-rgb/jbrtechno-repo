'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CategoryType } from '@jbrtechno/database';
import { Plus, Pencil, Trash2, RefreshCw, ChevronDown } from 'lucide-react';
import { getCategories, deleteCategory, getCategoryUsageCounts } from '@/actions/categories';
import { Button } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@jbrtechno/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@jbrtechno/ui';
import { CategoryDialog, type CategoryFormValues, type CategoryOption } from './CategoryDialog';
import { cn } from '@jbrtechno/shared';

interface CategoryItem {
  id: string;
  label: string;
  parentId: string | null;
  type: CategoryType;
  order: number;
}

interface CategoryNode extends CategoryItem {
  children: CategoryNode[];
}

interface CategoryUsage {
  transactions: number;
  costs: number;
}

interface CategoryTreeProps {
  locale: string;
  initialCategories: Array<{
    id: string;
    label: string;
    parentId: string | null;
    type: CategoryType;
    order: number;
    children?: Array<{
      id: string;
      label: string;
      parentId: string | null;
      type: CategoryType;
      order: number;
    }>;
  }>;
}

export function CategoryTree({ locale, initialCategories }: CategoryTreeProps) {
  const isArabic = true;

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    interface InitNode {
      id: string;
      label: string;
      parentId: string | null;
      type: CategoryType;
      order: number;
      children?: InitNode[];
    }
    const flattened: CategoryItem[] = [];
    const pushNode = (node: InitNode) => {
      flattened.push({
        id: node.id,
        label: node.label,
        parentId: node.parentId,
        type: node.type,
        order: node.order,
      });
      for (const ch of node.children || []) pushNode(ch);
    };
    for (const c of initialCategories) pushNode(c);
    return flattened;
  });

  const [usageById, setUsageById] = useState<Record<string, CategoryUsage>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [dialogInitialValues, setDialogInitialValues] = useState<CategoryFormValues | undefined>(undefined);
  const [dialogDefaultParentId, setDialogDefaultParentId] = useState<string | null>(null);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const categoryOptions: CategoryOption[] = useMemo(
    () =>
      categories.map((c) => ({
        id: c.id,
        label: c.label,
        type: c.type,
        parentId: c.parentId,
      })),
    [categories]
  );

  const tree: CategoryNode[] = useMemo(() => {
    const byId = new Map<string, CategoryNode>();
    for (const c of categories) byId.set(c.id, { ...c, children: [] });

    const roots: CategoryNode[] = [];
    for (const node of byId.values()) {
      if (node.parentId && byId.has(node.parentId)) {
        byId.get(node.parentId)!.children.push(node);
      } else {
        roots.push(node);
      }
    }

    const sortTree = (nodes: CategoryNode[]) => {
      nodes.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));
      for (const n of nodes) if (n.children.length) sortTree(n.children);
    };
    sortTree(roots);

    return roots;
  }, [categories]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getCategories();
      const next = result.success ? (result.categories || []) : [];
      setCategories(next);
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      setError(isArabic ? 'فشل في تحميل الفئات' : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  }, [isArabic]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    let cancelled = false;
    const loadUsage = async () => {
      const ids = categories.map((c) => c.id);
      const entries = await Promise.all(
        ids.map(async (id) => {
          const usage = await getCategoryUsageCounts(id);
          return [id, usage] as const;
        })
      );

      if (cancelled) return;
      const next: Record<string, CategoryUsage> = {};
      for (const [id, usage] of entries) {
        next[id] = usage;
      }
      setUsageById(next);
    };

    if (categories.length > 0) {
      loadUsage().catch(() => {
        if (!cancelled) setUsageById({});
      });
    }

    return () => {
      cancelled = true;
    };
  }, [categories]);

  const openCreate = (parentId: string | null) => {
    setDialogMode('create');
    setDialogInitialValues(undefined);
    setDialogDefaultParentId(parentId);
    setDialogOpen(true);
  };

  const openEdit = (category: CategoryItem) => {
    setDialogMode('edit');
    setDialogDefaultParentId(null);
    setDialogInitialValues({
      id: category.id,
      label: category.label,
      type: category.type,
      parentId: category.parentId,
    });
    setDialogOpen(true);
  };

  const onDeleteRequested = (id: string) => {
    setDeleteId(id);
    setDeleteOpen(true);
  };

  const hasChildren = (id: string) => categories.some((c) => c.parentId === id);
  const usage = (id: string) => usageById[id] || { transactions: 0, costs: 0 };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    setError(null);
    try {
      const result = await deleteCategory(deleteId);
      if (!result.success) {
        setError(result.error || (isArabic ? 'فشل في حذف الفئة' : 'Failed to delete category'));
        return;
      }
      setDeleteOpen(false);
      setDeleteId(null);
      await refresh();
    } catch {
      setError(isArabic ? 'حدث خطأ غير متوقع' : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button onClick={() => openCreate(null)} disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {isArabic ? 'إضافة حساب' : 'Add Account'}
          </Button>
          <Button variant="outline" onClick={refresh} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            {isArabic ? 'تحديث' : 'Refresh'}
          </Button>
        </div>
        {error && <div className="text-sm text-destructive">{error}</div>}
      </div>

      <div className="grid gap-4">
        {tree.map((main) => {
          const mainUsage = usage(main.id);
          const mainHasChildren = hasChildren(main.id);
          const disableDelete = mainHasChildren || mainUsage.transactions > 0 || mainUsage.costs > 0;
          const hasChildrenToShow = main.children.length > 0;

          return (
            <Collapsible key={main.id} defaultOpen>
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {hasChildrenToShow ? (
                          <CollapsibleTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground data-[state=open]:[&>svg]:rotate-180"
                            >
                              <ChevronDown className="h-4 w-4 transition-transform" />
                            </Button>
                          </CollapsibleTrigger>
                        ) : (
                          <div className="h-7 w-7" />
                        )}

                        <CardTitle className="text-base flex items-center gap-2">
                          <span>{main.label}</span>
                          <Badge variant="outline">{main.type}</Badge>
                        </CardTitle>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {isArabic
                          ? `المعاملات: ${mainUsage.transactions} • التكاليف: ${mainUsage.costs}`
                          : `Transactions: ${mainUsage.transactions} • Costs: ${mainUsage.costs}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => openCreate(main.id)} disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" />
                        {isArabic ? 'حساب فرعي' : 'Subaccount'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEdit(main)} disabled={loading}>
                        <Pencil className="h-4 w-4 mr-2" />
                        {isArabic ? 'تعديل' : 'Edit'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteRequested(main.id)}
                        disabled={loading || disableDelete}
                        className={cn(disableDelete && 'opacity-50')}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {isArabic ? 'حذف' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {hasChildrenToShow && (
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {main.children.map((child) => {
                          const childUsage = usage(child.id);
                          const childHasChildren = hasChildren(child.id);
                          const childDisableDelete =
                            childHasChildren || childUsage.transactions > 0 || childUsage.costs > 0;

                          return (
                            <div
                              key={child.id}
                              className="flex items-center justify-between gap-3 rounded-md border p-3"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{child.label}</span>
                                  <Badge variant="outline">{child.type}</Badge>
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {isArabic
                                    ? `المعاملات: ${childUsage.transactions} • التكاليف: ${childUsage.costs}`
                                    : `Transactions: ${childUsage.transactions} • Costs: ${childUsage.costs}`}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="ghost" size="sm" onClick={() => openEdit(child)} disabled={loading}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  {isArabic ? 'تعديل' : 'Edit'}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => onDeleteRequested(child.id)}
                                  disabled={loading || childDisableDelete}
                                  className={cn(childDisableDelete && 'opacity-50')}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {isArabic ? 'حذف' : 'Delete'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                )}
              </Card>
            </Collapsible>
          );
        })}
      </div>

      <CategoryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        locale={locale}
        categories={categoryOptions}
        initialValues={dialogInitialValues}
        defaultParentId={dialogDefaultParentId}
        onSaved={refresh}
      />

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{isArabic ? 'تأكيد الحذف' : 'Confirm delete'}</AlertDialogTitle>
            <AlertDialogDescription>
              {isArabic
                ? 'هل أنت متأكد؟ لا يمكن التراجع عن هذا الإجراء.'
                : 'Are you sure? This action cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{isArabic ? 'إلغاء' : 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={loading}>
              {isArabic ? 'حذف' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}


