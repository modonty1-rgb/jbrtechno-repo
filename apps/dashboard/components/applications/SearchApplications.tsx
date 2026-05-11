'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@jbrtechno/ui';
import { Search, X } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { useEffect, useState, useCallback } from 'react';

interface SearchApplicationsProps {
  locale: string;
  currentSearch?: string;
}

export function SearchApplications({ locale, currentSearch = '' }: SearchApplicationsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(currentSearch);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const handleSearch = useCallback((value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value.trim()) {
      params.set('search', value.trim());
    } else {
      params.delete('search');
    }
    router.push(`?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    if (searchValue === currentSearch) return; // Don't search if value matches current search
    
    const timeoutId = setTimeout(() => {
      handleSearch(searchValue);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchValue, currentSearch, handleSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  const handleClear = () => {
    setSearchValue('');
    const params = new URLSearchParams(searchParams.toString());
    params.delete('search');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder={locale === 'ar' ? 'البحث بجزء من البريد الإلكتروني أو الهاتف...' : 'Search by part of email or phone...'}
        value={searchValue}
        onChange={handleInputChange}
        className="pl-9 pr-9"
      />
      {searchValue && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
















