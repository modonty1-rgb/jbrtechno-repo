'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';

interface AdminMobileSidebarProps {
  children: React.ReactNode;
}

export function AdminMobileSidebar({ children }: AdminMobileSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-2 px-4 py-3 border-b bg-background/95 backdrop-blur">
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold text-muted-foreground">
            لوحة التحكم
          </span>
          <span className="text-xs text-muted-foreground">
            JbrTecno
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-accent hover:text-accent-foreground"
        >
          <Menu className="h-4 w-4" />
          <span>القائمة</span>
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="إغلاق القائمة"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-72 max-w-full bg-muted/30 border-l border-border shadow-xl flex">
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}







