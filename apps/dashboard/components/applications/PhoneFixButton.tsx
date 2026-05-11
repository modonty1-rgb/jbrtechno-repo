'use client';

import { Button } from '@jbrtechno/ui';
import { Loader2, RefreshCw } from 'lucide-react';
import { validateAndFixWhatsAppPhone } from '@jbrtechno/shared';

interface PhoneFixButtonProps {
  phone: string;
  onPhoneUpdate: (newPhone: string) => Promise<{ success: boolean; error?: string }>;
  onUpdateComplete: (newPhone: string) => void;
  locale: string;
  disabled?: boolean;
}

export function PhoneFixButton({
  phone,
  onPhoneUpdate,
  onUpdateComplete,
  locale,
  disabled = false,
}: PhoneFixButtonProps) {
  const handleAnalyzePhone = async () => {
    const phoneValidation = validateAndFixWhatsAppPhone(phone);
    const fixedPhone = phoneValidation.formatted || phone;

    if (fixedPhone === phone) {
      return;
    }

    const result = await onPhoneUpdate(fixedPhone);

    if (result.success) {
      onUpdateComplete(fixedPhone);
    }
  };

  return (
    <Button
      onClick={handleAnalyzePhone}
      variant="ghost"
      size="sm"
      className="h-6 w-6 p-0"
      disabled={disabled}
      title={locale === 'ar' ? 'تحليل وتحديث رقم الهاتف' : 'Analyze and update phone number'}
    >
      {disabled ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <RefreshCw className="h-3 w-3" />
      )}
    </Button>
  );
}



















