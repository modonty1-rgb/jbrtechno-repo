'use client';

import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { SIDEBAR_STORAGE_KEY, SIDEBAR_COLLAPSED_ATTR } from '@/components/layout/uiState';

// Collapse state lives as an attribute on <html> + localStorage, styled purely
// with CSS — no React context, so the server-rendered sidebar tree is untouched.
export function SidebarToggleButton() {
  const toggle = () => {
    const collapsed = document.documentElement.toggleAttribute(SIDEBAR_COLLAPSED_ATTR);
    try {
      localStorage.setItem(SIDEBAR_STORAGE_KEY, collapsed ? '1' : '0');
    } catch {
      // localStorage unavailable — collapse still works for this page view
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'flex items-center justify-center w-9 h-9 rounded-lg transition-colors',
        'hover:bg-accent hover:text-accent-foreground'
      )}
      title="طي / فتح القائمة الجانبية"
    >
      <PanelRightClose className="h-5 w-5 [[data-sidebar-collapsed]_&]:hidden" />
      <PanelRightOpen className="h-5 w-5 hidden [[data-sidebar-collapsed]_&]:block" />
    </button>
  );
}
