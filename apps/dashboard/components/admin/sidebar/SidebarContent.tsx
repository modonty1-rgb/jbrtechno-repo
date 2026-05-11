'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { SidebarSection } from './SidebarSection';
import type { SidebarSection as SidebarSectionType } from '@/helpers/sidebarRoutes';

interface SidebarContentProps {
  sections: SidebarSectionType[];
}

export function SidebarContent({ sections }: SidebarContentProps) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const manuallyClosedSections = useRef<Set<string>>(new Set());

  useEffect(() => {
    sections.forEach((section) => {
      const hasActiveItem = section.items.some((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname?.startsWith(item.href);
        return isActive;
      });

      if (hasActiveItem && !manuallyClosedSections.current.has(section.id)) {
        setOpenSections((prev) => {
          if (!prev.has(section.id)) {
            return new Set(prev).add(section.id);
          }
          return prev;
        });
      }
    });
  }, [pathname, sections]);

  const handleOpenChange = (sectionId: string, open: boolean) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (open) {
        next.add(sectionId);
        manuallyClosedSections.current.delete(sectionId);
      } else {
        next.delete(sectionId);
        manuallyClosedSections.current.add(sectionId);
      }
      return next;
    });
  };

  return (
    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
      {sections.map((section) => (
        <SidebarSection
          key={section.id}
          section={section}
          isOpen={openSections.has(section.id)}
          onOpenChange={(open) => handleOpenChange(section.id, open)}
        />
      ))}
    </nav>
  );
}




