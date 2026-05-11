export interface PhoneValidationResult {
  valid: boolean;
  formatted: string;
  error?: string;
}

export function formatPhoneForWhatsApp(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return '';
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.length === 0) return '';
  return cleaned;
}

export function validateWhatsAppPhone(phoneNumber: string | null | undefined): PhoneValidationResult {
  if (!phoneNumber) {
    return { valid: false, formatted: '', error: 'Phone number is required' };
  }
  const formatted = formatPhoneForWhatsApp(phoneNumber);
  if (formatted.length === 0) {
    return { valid: false, formatted: '', error: 'Phone number must contain at least one digit' };
  }
  if (formatted.length < 7) {
    return { valid: false, formatted, error: 'Phone number is too short (minimum 7 digits required)' };
  }
  if (formatted.length > 15) {
    return { valid: false, formatted, error: 'Phone number is too long (maximum 15 digits allowed)' };
  }
  if (formatted.startsWith('0')) {
    return {
      valid: false,
      formatted,
      error: 'Phone number cannot start with 0. Use country code format (e.g., 966 for Saudi Arabia)',
    };
  }
  return { valid: true, formatted };
}

export function createWhatsAppUrl(
  phoneNumber: string | null | undefined,
  message?: string
): string {
  const validation = validateWhatsAppPhone(phoneNumber);
  if (!validation.valid || !validation.formatted) return '';
  const baseUrl = `https://wa.me/${validation.formatted}`;
  if (message) return `${baseUrl}?text=${encodeURIComponent(message)}`;
  return baseUrl;
}

function detectCountryCode(phoneNumber: string): string | null {
  if (!phoneNumber || phoneNumber.length === 0) return null;
  const withoutZero = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
  if (withoutZero.length === 0) return null;

  if (withoutZero.startsWith('05') || withoutZero.startsWith('01')) {
    if (withoutZero.startsWith('01')) {
      if (withoutZero.length === 10) return '966';
      if (withoutZero.length === 11) return '20';
    } else if (withoutZero.startsWith('05')) {
      if (withoutZero.length === 9 || withoutZero.length === 10) return '966';
    }
  }
  if (withoutZero.startsWith('02') && withoutZero.length === 10) return '20';
  if (withoutZero.startsWith('01') && withoutZero.length === 11) return '20';
  return '966';
}

export function validateAndFixWhatsAppPhone(
  phoneNumber: string | null | undefined,
  defaultCountryCode: string = '966'
): PhoneValidationResult {
  if (!phoneNumber) {
    return { valid: false, formatted: '', error: 'Phone number is required' };
  }
  let validation = validateWhatsAppPhone(phoneNumber);
  if (!validation.valid) {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    if (digitsOnly.startsWith('0') && digitsOnly.length > 1) {
      const formatted = formatPhoneForWhatsApp(phoneNumber);
      if (formatted.length > 0) {
        const withoutZero = formatted.substring(1);
        const countryCode = detectCountryCode(formatted) || defaultCountryCode;
        const fixedNumber = `${countryCode}${withoutZero}`;
        if (fixedNumber.length >= 7 && fixedNumber.length <= 15) {
          validation = validateWhatsAppPhone(fixedNumber);
        }
      }
    }
  }
  return validation;
}
