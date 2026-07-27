import { buildLocalizedPath } from '@/lib/auth/utils';
import { messages } from '@/helpers/messages';
import {
  ArrowUpDown,
  UserMinus,
  Wallet,
  LayoutDashboard,
  Briefcase,
  BriefcaseBusiness,
  CalendarClock,
  Users,
  Calculator,
  ListTodo,
  TrendingUp,
  Clock,
  StickyNote,
  FileSignature,
  Settings,
  UserCog,
  User,
} from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
  count?: number;
}

export interface SidebarSection {
  id: string;
  label: string;
  items: NavItem[];
}

const routeIcons: Record<string, React.ElementType> = {
  '/': LayoutDashboard,
  '/positions': BriefcaseBusiness,
  '/applications': Briefcase,
  '/applications/interviews': CalendarClock,
  '/staff': Users,
  '/adjustments': ArrowUpDown,
  '/payroll': Wallet,
  '/staff/offboard': UserMinus,
  '/accounting': Calculator,
  '/categories': ListTodo,
  '/source-of-income': TrendingUp,
  '/tasks': ListTodo,
  '/tasks/my-tasks': ListTodo,
  '/my-time': Clock,
  '/notes': StickyNote,
  '/contracts': FileSignature,
  '/settings': Settings,
  '/settings/profile': User,
  '/users': Users,
  '/clockify-users': UserCog,
};

const routeLabels: Record<string, string> = {
  '/': messages.admin.dashboard,
  '/positions': 'الوظائف الشاغرة',
  '/applications': messages.admin.applications,
  '/applications/interviews': 'المقابلات',
  '/staff': messages.admin.staffManagement,
  '/adjustments': 'الخصومات والحوافز',
  '/payroll': 'مسير الرواتب',
  '/staff/offboard': 'إنهاء الخدمات',
  '/accounting': messages.admin.accounting,
  '/categories': 'شجرة الحسابات',
  '/source-of-income': messages.admin.sourceOfIncome,
  '/tasks': messages.admin.tasks,
  '/tasks/my-tasks': 'مهامي',
  '/my-time': 'سجل الوقت',
  '/notes': messages.admin.administrativeNotes,
  '/contracts': messages.admin.contracts,
  '/settings': messages.admin.settings,
  '/settings/profile': 'الملف الشخصي',
  '/users': messages.admin.users,
  '/clockify-users': 'مستخدمو Clockify',
};

// Section order = business flow: build the team → manage the team → run the
// work → clients → money → insights → configuration.
// Contact messages live as a TopNavbar button, not a sidebar section.
const routeGroups: Record<string, string[]> = {
  'financial-management': ['/accounting', '/categories', '/source-of-income', '/contracts'],
  'staff-affairs': ['/staff', '/payroll', '/adjustments', '/staff/offboard'],
  'recruitment': ['/positions', '/applications', '/applications/interviews'],
  'administration': ['/settings', '/clockify-users', '/users'],
};

const sectionLabels: Record<string, string> = {
  'recruitment': 'التوظيف',
  'staff-affairs': 'شؤون الموظفين',
  'financial-management': 'الإدارة المالية',
  'administration': 'الإعدادات والمستخدمون',
};

export function getSidebarSections(
  accessibleRoutes: string[],
  locale: string,
  counts: { totalApplications?: number },
  userRole?: string
): SidebarSection[] {
  const accessibleRoutesSet = new Set(accessibleRoutes);

  const sections: SidebarSection[] = Object.entries(routeGroups).map(([sectionId, routes]) => {
    const items: NavItem[] = routes
      .filter((route) => {
        if (route === '/users' && userRole !== 'SUPER_ADMIN') {
          return false;
        }
        return accessibleRoutesSet.has(route);
      })
      .map((route) => {
        const href = buildLocalizedPath(route, locale);
        const icon = routeIcons[route] || ListTodo;
        const label = routeLabels[route] || route;

        const item: NavItem = {
          href,
          label,
          icon,
          exact: route === '/',
        };

        if (route === '/applications' && counts.totalApplications) {
          item.count = counts.totalApplications;
        }

        return item;
      });

    return {
      id: sectionId,
      label: sectionLabels[sectionId],
      items,
    };
  });

  return sections.filter((section) => section.items.length > 0);
}

