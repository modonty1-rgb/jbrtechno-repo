export interface AdminRoute {
  route: string; // e.g. "/applications"
  label: string; // translation key used with getTranslations('admin')
}

// Default routes accessible to all authenticated users (not assignable)
export const DEFAULT_ROUTES: string[] = [
  '/',
  '/settings/profile',
  '/tasks/my-tasks',
  '/my-time',
  '/notes',
];

// Operational routes - Can be assigned to STAFF users by SUPER_ADMIN
// (labels are shown as-is in the permissions UI)
export const OPERATIONAL_ROUTES: AdminRoute[] = [
  { route: '/', label: 'لوحة التحكم' },
  { route: '/positions', label: 'الوظائف الشاغرة' },
  { route: '/applications', label: 'طلبات التوظيف' },
  { route: '/applications/interviews', label: 'المقابلات' },
  { route: '/staff', label: 'إدارة الموظفين' },
  { route: '/adjustments', label: 'الخصومات والحوافز' },
  { route: '/payroll', label: 'مسير الرواتب' },
  { route: '/staff/offboard', label: 'إنهاء الخدمات' },
  { route: '/contact-messages', label: 'رسائل التواصل' },
  { route: '/accounting', label: 'المحاسبة' },
  { route: '/categories', label: 'شجرة الحسابات' },
  { route: '/tasks', label: 'المهام' },
  { route: '/tasks/my-tasks', label: 'مهامي' },
  { route: '/my-time', label: 'سجل الوقت' },
  { route: '/notes', label: 'الملاحظات الإدارية' },
  { route: '/contracts', label: 'العقود والاتفاقيات' },
  { route: '/settings', label: 'الإعدادات' },
  { route: '/users', label: 'المستخدمون' },
  { route: '/clockify-users', label: 'مستخدمو Clockify' },
];

// Planning routes - Removed (pages deleted in Phase 2)
export const PLANNING_ROUTES: AdminRoute[] = [];

// HR data (salaries, bank details, offboarding) is SUPER_ADMIN-only:
// the HR server actions require that role, so granting these routes to STAFF
// would only produce broken pages. Kept out of the assignable list.
export const SUPER_ADMIN_ONLY_ROUTES: string[] = [
  '/staff',
  '/payroll',
  '/adjustments',
  '/staff/offboard',
];

// All routes (for SUPER_ADMIN access) - only operational routes now
export const ALL_ADMIN_ROUTES: AdminRoute[] = OPERATIONAL_ROUTES;

// Routes that can be assigned to STAFF users (operational routes only)
// Exclude default routes since they're accessible to all authenticated users
export const ASSIGNABLE_ROUTES = OPERATIONAL_ROUTES.filter(
  (route) => !DEFAULT_ROUTES.includes(route.route) && !SUPER_ADMIN_ONLY_ROUTES.includes(route.route)
);

// Backward compatibility - export ADMIN_ROUTES as ALL_ADMIN_ROUTES
export const ADMIN_ROUTES = ALL_ADMIN_ROUTES;


