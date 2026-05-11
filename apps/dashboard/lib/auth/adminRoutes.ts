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
  '/organizational-structure',
];

// Operational routes - Can be assigned to STAFF users by SUPER_ADMIN
export const OPERATIONAL_ROUTES: AdminRoute[] = [
  { route: '/', label: 'dashboard' },
  { route: '/organizational-structure', label: 'organizationalStructure' },
  { route: '/positions', label: 'positions' },
  { route: '/applications', label: 'applications' },
  { route: '/applications/interviews', label: 'interviews' },
  { route: '/staff', label: 'staffManagement' },
  { route: '/contact-messages', label: 'contactMessages' },
  { route: '/accounting', label: 'accounting' },
  { route: '/categories', label: 'categories' },
  { route: '/costs', label: 'costs' },
  { route: '/source-of-income', label: 'sourceOfIncome' },
  { route: '/subscriptions', label: 'subscriptions' },
  { route: '/customers', label: 'customers' },
  { route: '/tasks', label: 'tasks' },
  { route: '/tasks/my-tasks', label: 'myTasks' },
  { route: '/my-time', label: 'myTime' },
  { route: '/notes', label: 'administrativeNotes' },
  { route: '/contracts', label: 'contracts' },
  { route: '/reports', label: 'reports' },
  { route: '/settings', label: 'settings' },
  { route: '/users', label: 'users' },
  { route: '/clockify-users', label: 'users' },
];

// Planning routes - Removed (pages deleted in Phase 2)
export const PLANNING_ROUTES: AdminRoute[] = [];

// All routes (for SUPER_ADMIN access) - only operational routes now
export const ALL_ADMIN_ROUTES: AdminRoute[] = OPERATIONAL_ROUTES;

// Routes that can be assigned to STAFF users (operational routes only)
// Exclude default routes since they're accessible to all authenticated users
export const ASSIGNABLE_ROUTES = OPERATIONAL_ROUTES.filter(
  (route) => !DEFAULT_ROUTES.includes(route.route)
);

// Backward compatibility - export ADMIN_ROUTES as ALL_ADMIN_ROUTES
export const ADMIN_ROUTES = ALL_ADMIN_ROUTES;


