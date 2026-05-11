'use client';

import { Card, CardContent, CardHeader } from './card';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface CollapsibleCardProps {
  children: React.ReactNode;
  header: React.ReactNode;
  defaultOpen?: boolean;
}

export function CollapsibleCard({ children, header, defaultOpen = true }: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left hover:bg-muted/30 transition-colors"
      >
        <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1">{header}</div>
            <ChevronDown
              className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                }`}
            />
          </div>
        </CardHeader>
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
          }`}
      >
        <CardContent className="p-0">{children}</CardContent>
      </div>
    </Card>
  );
}
















