'use client';

import { Input } from '@jbrtechno/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@jbrtechno/ui';
import { NoteType, TargetAudience } from '@jbrtechno/database';
import { Search, X, Filter } from 'lucide-react';
import { Button } from '@jbrtechno/ui';
import { Checkbox } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import { Badge } from '@jbrtechno/ui';

interface NoteFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  typeFilter: string;
  onTypeFilterChange: (type: string) => void;
  audienceFilter: string;
  onAudienceFilterChange: (audience: string) => void;
  importantFilter: boolean | null;
  onImportantFilterChange: (important: boolean | null) => void;
  locale?: string;
  hideAudienceFilter?: boolean;
}

export function NoteFilters({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeFilterChange,
  audienceFilter,
  onAudienceFilterChange,
  importantFilter,
  onImportantFilterChange,
  locale = 'en',
  hideAudienceFilter = false,
}: NoteFiltersProps) {
  const isRTL = true;
  const hasFilters =
    searchQuery ||
    (typeFilter && typeFilter !== 'all') ||
    (!hideAudienceFilter && audienceFilter && audienceFilter !== 'all') ||
    importantFilter !== null;

  const activeFilterCount = [
    searchQuery,
    typeFilter && typeFilter !== 'all',
    !hideAudienceFilter && audienceFilter && audienceFilter !== 'all',
    importantFilter !== null,
  ].filter(Boolean).length;

  const clearFilters = () => {
    onSearchChange('');
    onTypeFilterChange('all');
    onAudienceFilterChange('all');
    onImportantFilterChange(null);
  };

  return (
    <div className={`space-y-4 ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {hasFilters && (
        <div className={`flex items-center gap-2 flex-wrap ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{locale === 'ar' ? 'فلاتر نشطة:' : 'Active filters:'}</span>
          {searchQuery && (
            <Badge variant="secondary" className="gap-1">
              {locale === 'ar' ? 'بحث' : 'Search'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onSearchChange('')}
              />
            </Badge>
          )}
          {typeFilter && typeFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {locale === 'ar' ? 'النوع' : 'Type'}: {typeFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onTypeFilterChange('all')}
              />
            </Badge>
          )}
          {!hideAudienceFilter && audienceFilter && audienceFilter !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {locale === 'ar' ? 'الجمهور' : 'Audience'}: {audienceFilter}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onAudienceFilterChange('all')}
              />
            </Badge>
          )}
          {importantFilter !== null && (
            <Badge variant="secondary" className="gap-1">
              {locale === 'ar' ? 'عاجل فقط' : 'Urgent Only'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onImportantFilterChange(null)}
              />
            </Badge>
          )}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className={`absolute top-2.5 h-4 w-4 text-muted-foreground ${isRTL ? 'right-3' : 'left-3'}`} />
          <Input
            placeholder={locale === 'ar' ? 'بحث في الملاحظات...' : 'Search notes...'}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={isRTL ? 'pr-9' : 'pl-9'}
          />
        </div>

        <Select value={typeFilter} onValueChange={onTypeFilterChange}>
          <SelectTrigger className={`w-full sm:w-[180px] ${typeFilter && typeFilter !== 'all' ? 'border-primary' : ''}`}>
            <SelectValue
              placeholder={locale === 'ar' ? 'النوع' : 'Type'}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {locale === 'ar' ? 'جميع الأنواع' : 'All Types'}
            </SelectItem>
            <SelectItem value={NoteType.ANNOUNCEMENT}>
              {locale === 'ar' ? 'إعلان' : 'Announcement'}
            </SelectItem>
            <SelectItem value={NoteType.TASK}>
              {locale === 'ar' ? 'مهمة' : 'Task'}
            </SelectItem>
            <SelectItem value={NoteType.REWARD}>
              {locale === 'ar' ? 'مكافأة' : 'Reward'}
            </SelectItem>
            <SelectItem value={NoteType.GENERAL}>
              {locale === 'ar' ? 'عام' : 'General'}
            </SelectItem>
          </SelectContent>
        </Select>

        {!hideAudienceFilter && (
          <Select value={audienceFilter} onValueChange={onAudienceFilterChange}>
            <SelectTrigger className={`w-full sm:w-[180px] ${audienceFilter && audienceFilter !== 'all' ? 'border-primary' : ''}`}>
              <SelectValue
                placeholder={locale === 'ar' ? 'الجمهور' : 'Audience'}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {locale === 'ar' ? 'جميع الجماهير' : 'All Audiences'}
              </SelectItem>
              <SelectItem value={TargetAudience.STAFF}>
                {locale === 'ar' ? 'الموظفين' : 'Staff'}
              </SelectItem>
              <SelectItem value={TargetAudience.ADMIN}>
                {locale === 'ar' ? 'المديرين' : 'Admin'}
              </SelectItem>
              <SelectItem value={TargetAudience.SPECIFIC_DEPARTMENT}>
                {locale === 'ar' ? 'قسم محدد' : 'Specific Department'}
              </SelectItem>
              <SelectItem value={TargetAudience.SPECIFIC_USER}>
                {locale === 'ar' ? 'مستخدم محدد' : 'Specific User'}
              </SelectItem>
            </SelectContent>
          </Select>
        )}

        <div className={`flex items-center gap-2 p-2 rounded-lg border transition-colors ${importantFilter !== null
          ? 'border-primary bg-primary/5'
          : 'border-border'
          }`}>
          <Checkbox
            id="importantFilter"
            checked={importantFilter === true}
            onCheckedChange={(checked) => {
              if (checked) {
                onImportantFilterChange(true);
              } else if (importantFilter === true) {
                onImportantFilterChange(null);
              }
            }}
          />
          <Label
            htmlFor="importantFilter"
            className="text-sm font-medium leading-none cursor-pointer whitespace-nowrap"
          >
            {locale === 'ar' ? 'عاجل فقط' : 'Urgent Only'}
          </Label>
        </div>

        {hasFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="whitespace-nowrap"
          >
            <X className="h-4 w-4 mr-2" />
            {locale === 'ar' ? 'مسح الكل' : 'Clear All'}
          </Button>
        )}
      </div>
    </div>
  );
}








