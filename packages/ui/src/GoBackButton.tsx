'use client';

import { ArrowLeft } from 'lucide-react';
import { Button } from './button';

export function GoBackButton({ isRTL }: { isRTL: boolean }) {
  return (
    <Button
      variant="outline"
      size="lg"
      className="w-full sm:w-auto min-w-[220px] h-12 text-base font-semibold border-2 hover:bg-accent/50 transition-all duration-300 hover:scale-105"
      onClick={() => {
        if (typeof window !== 'undefined') {
          window.history.back();
        }
      }}
    >
      <div className="flex items-center justify-center gap-2">
        <ArrowLeft className="w-5 h-5" />
        {isRTL ? 'رجوع' : 'Go Back'}
      </div>
    </Button>
  );
}
















