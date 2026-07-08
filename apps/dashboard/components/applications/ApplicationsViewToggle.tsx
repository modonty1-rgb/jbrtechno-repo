'use client';

import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { APPS_VIEW_STORAGE_KEY, APPS_VIEW_ATTR } from '@/components/layout/uiState';

// Same CSS-attribute pattern as the sidebar collapse: the preference lives on
// <html> + localStorage and both lists toggle via CSS only — no re-render.
function setView(view: 'rows' | 'cards') {
  if (view === 'cards') {
    document.documentElement.setAttribute(APPS_VIEW_ATTR, 'cards');
  } else {
    document.documentElement.removeAttribute(APPS_VIEW_ATTR);
  }
  try {
    localStorage.setItem(APPS_VIEW_STORAGE_KEY, view);
  } catch {
    // localStorage unavailable — the toggle still works for this page view
  }
}

const btnBase =
  'flex items-center gap-1.5 px-3.5 py-2 text-[13px] font-bold transition-colors';

export function ApplicationsViewToggle() {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden shrink-0">
      <button
        type="button"
        onClick={() => setView('rows')}
        className={cn(
          btnBase,
          'bg-primary text-primary-foreground [[data-applications-view=cards]_&]:bg-card [[data-applications-view=cards]_&]:text-muted-foreground'
        )}
      >
        <List className="h-4 w-4" />
        صفوف
      </button>
      <button
        type="button"
        onClick={() => setView('cards')}
        className={cn(
          btnBase,
          'bg-card text-muted-foreground [[data-applications-view=cards]_&]:bg-primary [[data-applications-view=cards]_&]:text-primary-foreground'
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        كروت
      </button>
    </div>
  );
}
