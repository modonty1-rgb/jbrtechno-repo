'use client';

import { ChevronDown } from 'lucide-react';
import { cn } from '@jbrtechno/shared';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@jbrtechno/ui';
import { SidebarNavItem } from './SidebarNavItem';
import type { SidebarSection as SidebarSectionType } from '@/helpers/sidebarRoutes';

interface SidebarSectionProps {
  section: SidebarSectionType;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SidebarSection({ section, isOpen, onOpenChange }: SidebarSectionProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors group">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider group-hover:text-accent-foreground">
          {section.label}
        </h3>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform duration-200 flex-shrink-0',
            isOpen && 'rotate-180',
            'group-hover:text-accent-foreground'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        <div className="space-y-1 pt-1">
          {section.items.map((item) => (
            <SidebarNavItem key={item.href} item={item} />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}




