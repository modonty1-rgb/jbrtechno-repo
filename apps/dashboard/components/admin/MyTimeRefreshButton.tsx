'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@jbrtechno/ui';
import { RotateCw } from 'lucide-react';

interface MyTimeRefreshButtonProps {
  className?: string;
}

export function MyTimeRefreshButton({ className }: MyTimeRefreshButtonProps) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();

  const handleClick = () => {
    startRefresh(() => {
      router.refresh();
    });
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="outline"
      className={className}
      onClick={handleClick}
      disabled={isRefreshing}
    >
      <RotateCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
    </Button>
  );
}



