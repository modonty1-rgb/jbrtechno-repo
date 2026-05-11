import { Briefcase, Code, Users, FileText, ShoppingCart } from 'lucide-react';
import type React from 'react';

export type RoleConfig = {
  title: string;
  icon: React.ElementType;
  color: string;
  filled?: boolean;
  email?: string;
  temporary?: boolean;
  filledByEn?: string;
  filledByAr?: string;
};

export const ceoRole: RoleConfig & { email?: string } = {
  title: 'CEO',
  icon: Briefcase,
  color: 'border-indigo-400',
  filled: true,
  email: 'khalid@jbrtechno.com',
  filledByEn: 'Eng. Khalid',
  filledByAr: 'المهندس خالد',
};

export const leadershipRoles: RoleConfig[] = [
  {
    title: 'CTO',
    icon: Code,
    color: 'border-blue-500',
    filled: true,
    email: 'khalid@jbrtechno.com',
    filledByEn: 'Eng. Khalid',
    filledByAr: 'المهندس خالد',
  },
  {
    title: 'Ops',
    icon: Users,
    color: 'border-orange-500',
    filled: true,
    email: 'ops@jbrtechno.com',
    filledByEn: 'Eng. Abdulaziz',
    filledByAr: 'المهندس عبدالعزيز',
  },
  {
    title: 'HR',
    icon: Users,
    color: 'border-amber-500',
    filled: true,
    email: 'hr@jbrtechno.com',
    filledByEn: 'Mr. Ahmed',
    filledByAr: 'الأستاذ أحمد',
  },
  {
    title: 'Finance',
    icon: Briefcase,
    color: 'border-emerald-500',
    filled: true,
    email: 'finance@jbrtechno.com',
    filledByEn: 'Mr. Waleed',
    filledByAr: 'الأستاذ وليد',
  },
  {
    title: 'Marketing',
    icon: ShoppingCart,
    color: 'border-pink-500',
    filled: true,
    email: 'marketing@jbrtechno.com',
    filledByEn: 'Mohab & Nada',
  },
];

export const opsHrFinanceRoles: RoleConfig[] = [
  {
    title: 'TA Specialist',
    icon: Users,
    color: 'border-amber-500',
    email: 'talent@jbrtechno.com',
  },
  {
    title: 'Accountant',
    icon: FileText,
    color: 'border-emerald-500',
    email: 'accounting@jbrtechno.com',
  },
];

export const techRoles: RoleConfig[] = [
  {
    title: 'Frontend Dev',
    icon: Code,
    color: 'border-blue-500',
    filled: true,
    email: 'frontend@jbrtechno.com',
    filledByEn: 'Mohammed',
    filledByAr: 'محمد',
  },
  {
    title: 'Backend Dev',
    icon: Code,
    color: 'border-blue-500',
    filled: true,
    email: 'backend@jbrtechno.com',
    filledByEn: 'Mustafa',
    filledByAr: 'مصطفى',
  },
  {
    title: 'RN Dev',
    icon: Code,
    color: 'border-blue-500',
    email: 'mobile@jbrtechno.com',
  },
  {
    title: 'Designer',
    icon: Briefcase,
    color: 'border-blue-500',
    filled: true,
    temporary: true,
    email: 'design@jbrtechno.com',
    filledByAr: 'عبدالعزيز',
  },
  {
    title: 'UI/UX Designer',
    icon: Briefcase,
    color: 'border-blue-500',
    email: 'uiux@jbrtechno.com',
  },
];

export const marketingTeamRoles: RoleConfig[] = [
  {
    title: 'Content & SEO',
    icon: FileText,
    color: 'border-pink-500',
    filled: true,
    email: 'content@jbrtechno.com',
  },
  {
    title: 'Sales Rep (Field)',
    icon: ShoppingCart,
    color: 'border-pink-500',
    email: 'sales.field@jbrtechno.com',
  },
  {
    title: 'Sales Rep (Phone)',
    icon: ShoppingCart,
    color: 'border-pink-500',
    email: 'sales.phone@jbrtechno.com',
  },
  {
    title: 'Content #1',
    icon: FileText,
    color: 'border-pink-500',
    email: 'content1@jbrtechno.com',
  },
  {
    title: 'Content #2',
    icon: FileText,
    color: 'border-pink-500',
    email: 'content2@jbrtechno.com',
  },
];
