'use client';

import { Input } from '@jbrtechno/ui';
import { Label } from '@jbrtechno/ui';
import type { EmergencyContact } from '@/actions/staff';

interface EmergencyContactFormProps {
  contact: EmergencyContact | null;
  onChange: (contact: EmergencyContact | null) => void;
  locale: string;
  label: string;
  disabled?: boolean;
}

export function EmergencyContactForm({
  contact,
  onChange,
  locale,
  label,
  disabled = false,
}: EmergencyContactFormProps) {
  const isArabic = true;

  const handleChange = (field: keyof EmergencyContact, value: string) => {
    if (!contact) {
      onChange({
        name: field === 'name' ? value : '',
        phone: field === 'phone' ? value : '',
        relationship: field === 'relationship' ? value : undefined,
      });
    } else {
      onChange({
        ...contact,
        [field]: value || undefined,
      });
    }
  };

  const handleClear = () => {
    onChange(null);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">{label}</Label>
        {contact && (
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-sm text-muted-foreground hover:text-destructive"
          >
            {isArabic ? 'مسح' : 'Clear'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${label}-name`}>
            {isArabic ? 'الاسم' : 'Name'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${label}-name`}
            value={contact?.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder={isArabic ? 'اسم جهة الاتصال' : 'Contact name'}
            disabled={disabled}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor={`${label}-phone`}>
            {isArabic ? 'الهاتف' : 'Phone'} <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${label}-phone`}
            value={contact?.phone || ''}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder={isArabic ? 'رقم الهاتف' : 'Phone number'}
            disabled={disabled}
            required
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor={`${label}-relationship`}>
            {isArabic ? 'العلاقة' : 'Relationship'} ({isArabic ? 'اختياري' : 'Optional'})
          </Label>
          <Input
            id={`${label}-relationship`}
            value={contact?.relationship || ''}
            onChange={(e) => handleChange('relationship', e.target.value)}
            placeholder={
              isArabic
                ? 'مثال: زوج/زوجة، والد/والدة، صديق'
                : 'e.g., Spouse, Parent, Friend'
            }
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
}









