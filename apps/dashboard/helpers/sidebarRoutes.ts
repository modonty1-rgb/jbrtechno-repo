import { buildLocalizedPath } from '@/lib/auth/utils';
import { messages } from '@/helpers/messages';
import {
  LayoutDashboard,
  Network,
  Mail,
  Briefcase,
  BriefcaseBusiness,
  CalendarClock,
  Users,
  Calculator,
  ListTodo,
  DollarSign,
  TrendingUp,
  Clock,
  StickyNote,
  FileSignature,
  CreditCard,
  BarChart3,
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
  '/contact-messages': Mail,
  '/positions': BriefcaseBusiness,
  '/applications': Briefcase,
  '/applications/interviews': CalendarClock,
  '/staff': Users,
  '/accounting': Calculator,
  '/categories': ListTodo,
  '/costs': DollarSign,
  '/source-of-income': TrendingUp,
  '/tasks': ListTodo,
  '/tasks/my-tasks': ListTodo,
  '/my-time': Clock,
  '/notes': StickyNote,
  '/contracts': FileSignature,
  '/customers': Users,
  '/subscriptions': CreditCard,
  '/reports': BarChart3,
  '/settings': Settings,
  '/settings/profile': User,
  '/users': Users,
  '/clockify-users': UserCog,
};

const routeLabels: Record<string, string> = {
  '/': messages.admin.dashboard,
  '/contact-messages': messages.admin.contactMessages,
  '/positions': 'الوظائف الشاغرة',
  '/applications': messages.admin.applications,
  '/applications/interviews': 'المقابلات',
  '/staff': messages.admin.staffManagement,
  '/accounting': messages.admin.accounting,
  '/categories': 'شجرة الحسابات',
  '/costs': messages.admin.costs,
  '/source-of-income': messages.admin.sourceOfIncome,
  '/tasks': messages.admin.tasks,
  '/tasks/my-tasks': 'مهامي',
  '/my-time': 'سجل الوقت',
  '/notes': messages.admin.administrativeNotes,
  '/contracts': messages.admin.contracts,
  '/customers': messages.admin.customers,
  '/subscriptions': messages.admin.subscriptions,
  '/reports': messages.admin.reports,
  '/settings': messages.admin.settings,
  '/settings/profile': 'الملف الشخصي',
  '/users': messages.admin.users,
  '/clockify-users': 'مستخدمو Clockify',
};

const routeGroups: Record<string, string[]> = {
  'core-operations': ['/contact-messages'],
  'hiring-recruitment': ['/positions', '/applications', '/applications/interviews', '/staff'],
  'financial-management': ['/accounting', '/categories', '/costs', '/source-of-income'],
  'operations-management': ['/tasks', '/contracts'],
  'business-development': ['/customers', '/subscriptions'],
  'reporting-analysis': ['/reports'],
  'administration': ['/settings', '/clockify-users', '/users'],
};

const sectionLabels: Record<string, string> = {
  'core-operations': 'الإدارة',
  'hiring-recruitment': 'شئون الموظفين والتوظيف',
  'financial-management': 'الإدارة المالية',
  'operations-management': 'إدارة العمليات',
  'business-development': 'تطوير الأعمال',
  'reporting-analysis': 'التقارير والتحليل',
  'administration': 'الإعدادات والمستخدمون',
};

export function getSidebarSections(
  accessibleRoutes: string[],
  locale: string,
  counts: { totalApplications?: number; contactMessages?: number },
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
        if (route === '/contact-messages' && counts.contactMessages) {
          item.count = counts.contactMessages;
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

