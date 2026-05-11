'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole } from '@jbrtechno/database';
import { Button } from '@jbrtechno/ui';
import { Checkbox } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';
import { Input } from '@jbrtechno/ui';
import { ArrowLeft, Loader2, Save, Search, CheckCircle2, XCircle, Shield, User as UserIcon } from 'lucide-react';
import { updateUserRoutePermissions } from '@/actions/userPermissions';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
}

interface RouteItem {
  route: string;
  label: string;
}

interface UserPermissionsPageClientProps {
  user: User;
  initialRoutes: string[];
  allRoutes: RouteItem[];
  locale: string;
}

// Group routes by business category (operational routes only - planning routes not assignable to STAFF)
// Default routes are excluded since they're accessible to all authenticated users
const routeCategories = [
  {
    id: 'operations',
    label: 'operations',
    routes: [
      '/applications',
      '/applications/interviews',
      '/staff',
      '/contact-messages',
      '/tasks',
    ],
  },
  {
    id: 'financial',
    label: 'financial',
    routes: ['/accounting', '/costs', '/source-of-income', '/subscriptions', '/customers'],
  },
  {
    id: 'management',
    label: 'management',
    routes: [
      '/contracts',
      '/reports',
      '/settings',
      '/users',
      '/clockify-users',
    ],
  },
];

export function UserPermissionsPageClient({
  user,
  initialRoutes,
  allRoutes,
  locale,
}: UserPermissionsPageClientProps) {
  const router = useRouter();
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(initialRoutes);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const isRTL = true;

  // Group routes by category
  const groupedRoutes = useMemo(() => {
    return routeCategories.map((category) => ({
      ...category,
      items: allRoutes.filter((route) => category.routes.includes(route.route)),
    }));
  }, [allRoutes]);

  // Filter routes based on search
  const filteredGroupedRoutes = useMemo(() => {
    if (!searchQuery.trim()) return groupedRoutes;

    const query = searchQuery.toLowerCase();
    const getLabel = (label: string) => {
      const labels: Record<string, { ar: string; en: string }> = {
        'operations': { ar: 'العمليات', en: 'Operations' },
        'financial': { ar: 'المالية', en: 'Financial' },
        'management': { ar: 'الإدارة', en: 'Management' },
      };
      return labels[label]?.['ar'] || label;
    };
    
    return groupedRoutes.map((category) => ({
      ...category,
      items: category.items.filter(
        (item) => {
          const routeLabel = allRoutes.find(r => r.route === item.route)?.label || item.route;
          return (
            getLabel(routeLabel).toLowerCase().includes(query) ||
            item.route.toLowerCase().includes(query)
          );
        }
      ),
    })).filter((category) => category.items.length > 0);
  }, [groupedRoutes, searchQuery, locale, allRoutes]);

  const handleRouteToggle = (route: string) => {
    setSelectedRoutes((prev) =>
      prev.includes(route)
        ? prev.filter((r) => r !== route)
        : [...prev, route]
    );
  };

  const handleGrantAllRoutes = () => {
    setSelectedRoutes(allRoutes.map((r) => r.route));
  };

  const handleRevokeAllRoutes = () => {
    setSelectedRoutes([]);
  };

  const handleSave = async () => {
    setError('');
    setIsSubmitting(true);

    try {
      await updateUserRoutePermissions(user.id, selectedRoutes);
      // Navigate back to users page on success
      router.push('/users');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to update permissions');
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.push('/users');
  };

  const hasChanges = useMemo(() => {
    if (selectedRoutes.length !== initialRoutes.length) return true;
    return !selectedRoutes.every((route) => initialRoutes.includes(route));
  }, [selectedRoutes, initialRoutes]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="space-y-4">
        <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            disabled={isSubmitting}
            className={isRTL ? 'flex-row-reverse' : ''}
          >
            <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
            رجوع
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">إدارة الصلاحيات</h1>
            <p className="text-muted-foreground mt-1">
              إدارة المسارات والصلاحيات المتاحة لهذا المستخدم
            </p>
          </div>
        </div>

        {/* User Info Card */}
        <Card>
          <CardContent className="pt-6">
            <div className={`flex items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="p-3 rounded-full bg-primary/10">
                <UserIcon className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{user.email}</p>
                  <Badge variant="secondary">{user.role}</Badge>
                </div>
                {user.name && (
                  <p className="text-sm text-muted-foreground">{user.name}</p>
                )}
              </div>
              <div className={`text-right ${isRTL ? 'text-left' : ''}`}>
                <div className="text-2xl font-bold text-primary">{selectedRoutes.length}</div>
                <div className="text-xs text-muted-foreground">
                  المسارات المحددة
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Quick Actions */}
      <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder="البحث في المسارات..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={isRTL ? 'pr-10' : 'pl-10'}
          />
        </div>
        <Button
          variant="outline"
          onClick={handleGrantAllRoutes}
          disabled={isSubmitting || selectedRoutes.length === allRoutes.length}
          size="sm"
        >
          <CheckCircle2 className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          منح جميع المسارات
        </Button>
        <Button
          variant="outline"
          onClick={handleRevokeAllRoutes}
          disabled={isSubmitting || selectedRoutes.length === 0}
          size="sm"
        >
          <XCircle className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          إلغاء جميع المسارات
        </Button>
      </div>

      {/* Route Categories */}
      <div className="space-y-4">
        {filteredGroupedRoutes.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="text-lg">
                {category.label === 'operations' ? 'العمليات' :
                 category.label === 'financial' ? 'المالية' :
                 category.label === 'management' ? 'الإدارة' :
                 category.label}
              </CardTitle>
              <CardDescription>
                {category.items.length} مسارات •{' '}
                {category.items.filter((item) => selectedRoutes.includes(item.route)).length}{' '}
                محدد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {category.items.map((routeItem) => {
                  const isChecked = selectedRoutes.includes(routeItem.route);
                  return (
                    <div
                      key={routeItem.route}
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isChecked
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-background hover:bg-muted/50'
                        } ${isRTL ? 'flex-row-reverse' : ''}`}
                    >
                      <Checkbox
                        id={`route-${routeItem.route}`}
                        checked={isChecked}
                        onCheckedChange={() => handleRouteToggle(routeItem.route)}
                        disabled={isSubmitting}
                      />
                      <Label
                        htmlFor={`route-${routeItem.route}`}
                        className="flex-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{routeItem.label}</span>
                          {isChecked && (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono">
                          {routeItem.route}
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredGroupedRoutes.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              لم يتم العثور على مسارات تطابق البحث
            </CardContent>
          </Card>
        )}
      </div>

      {/* Summary and Actions */}
      {selectedRoutes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="py-6 text-center">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground font-medium">
              لم يتم تحديد أي مسارات
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              حدد المسارات أعلاه لمنح الوصول
            </p>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <XCircle className="h-5 w-5" />
              <p className="font-medium">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className={`flex items-center justify-between pt-4 border-t ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="text-sm text-muted-foreground">
          {hasChanges && (
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
              لديك تغييرات غير محفوظة
            </span>
          )}
        </div>
        <div className={`flex gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Button variant="outline" onClick={handleBack} disabled={isSubmitting}>
            إلغاء
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSubmitting || !hasChanges}
            size="lg"
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                جاري الحفظ...
              </>
            ) : (
              <>
                <Save className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                حفظ
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

