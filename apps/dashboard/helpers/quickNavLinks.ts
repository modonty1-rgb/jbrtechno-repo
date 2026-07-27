import { LayoutDashboard, ListTodo, Clock, StickyNote, Mail } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { messages } from '@/helpers/messages';

// Personal quick-access routes — not part of the permission-driven sidebar
// sections, so they're defined once here for both TopNavbar (desktop) and
// SidebarHeader (mobile drawer).
export interface QuickNavLink {
  route: string;
  title: string;
  icon: LucideIcon;
  exact?: boolean;
}

export const quickNavLinks: QuickNavLink[] = [
  { route: '/', title: messages.admin.dashboard, icon: LayoutDashboard, exact: true },
  { route: '/tasks/my-tasks', title: 'مهامي', icon: ListTodo },
  { route: '/my-time', title: 'سجل الوقت', icon: Clock },
  { route: '/notes', title: messages.admin.administrativeNotes, icon: StickyNote },
  { route: '/contact-messages', title: messages.admin.contactMessages, icon: Mail },
];
