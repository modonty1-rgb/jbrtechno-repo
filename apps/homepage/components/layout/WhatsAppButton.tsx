'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { validateWhatsAppPhone, createWhatsAppUrl } from '@jbrtechno/shared';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  locale?: string;
}

// Official WhatsApp SVG Icon
export function WhatsAppIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="white"
      className={className}
      style={style}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        fill="white"
        d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
      />
    </svg>
  );
}

export function WhatsAppButton({ phoneNumber, locale = 'ar' }: WhatsAppButtonProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showPulse, setShowPulse] = useState(true);
  const pathname = usePathname();

  // Hide on modonty route
  if (pathname?.includes('/modonty')) {
    return null;
  }

  // Hide pulse after 10 seconds
  useEffect(() => {
    if (!phoneNumber) return;
    const timer = setTimeout(() => setShowPulse(false), 10000);
    return () => clearTimeout(timer);
  }, [phoneNumber]);

  if (!phoneNumber) return null;

  // Validate and format phone number
  const phoneValidation = validateWhatsAppPhone(phoneNumber);

  if (!phoneValidation.valid) {
    console.warn('Invalid WhatsApp phone number:', phoneValidation.error);
    return null;
  }

  const defaultMessage = locale === 'ar'
    ? 'اود الاستفسار'
    : 'I would like to inquire';

  const whatsappUrl = createWhatsAppUrl(phoneNumber, defaultMessage);

  if (!whatsappUrl) {
    console.warn('Failed to create WhatsApp URL');
    return null;
  }

  return (
    <>
      {/* Floating Button Container */}
      <div className="fixed bottom-6 right-6 z-50 no-print" style={{ position: 'fixed', bottom: '24px', right: '24px' }}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="group block relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          aria-label="Contact us on WhatsApp"
        >
          {/* Multiple Pulsing Rings with Stagger */}
          {showPulse && (
            <>
              <div
                className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping"
                style={{ animationDuration: '2s' }}
              />
              <div
                className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping"
                style={{ animationDuration: '2s', animationDelay: '0.5s' }}
              />
            </>
          )}

          {/* Outer Glow Ring */}
          <div className="absolute -inset-2 bg-gradient-to-r from-[#25D366]/0 via-[#25D366]/50 to-[#25D366]/0 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500" />

          {/* Main Button */}
          <div
            className={`
              relative flex items-center rounded-full
              bg-gradient-to-br from-[#25D366] via-[#20BA5A] to-[#128C7E]
              shadow-lg shadow-[#25D366]/30
              group-hover:shadow-2xl group-hover:shadow-[#25D366]/50
              transition-all duration-500 ease-out
              ${isHovered ? 'scale-105' : 'scale-100'}
            `}
            style={{
              minWidth: '64px',
              minHeight: '64px'
            }}
          >
            {/* Icon Container */}
            <div className="relative flex items-center justify-center" style={{ width: '64px', height: '64px' }}>
              {/* Icon Background Glow */}
              <div className="absolute inset-0 bg-white/20 rounded-full blur-sm group-hover:bg-white/30 transition-all duration-300" />

              {/* Icon */}
              <WhatsAppIcon
                className="relative z-10 group-hover:scale-110 transition-transform duration-300"
                style={{ width: '32px', height: '32px', display: 'block' }}
              />

              {/* Notification Dot */}
              {showPulse && (
                <div className="absolute -top-1 -right-1 z-20">
                  <div className="relative">
                    <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg" />
                    <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                  </div>
                </div>
              )}
            </div>

            {/* Expandable Text */}
            <div
              className={`
                overflow-hidden transition-all duration-500 ease-out whitespace-nowrap
                ${isHovered ? 'max-w-[200px] opacity-100 ml-2 mr-5' : 'max-w-0 opacity-0'}
              `}
            >
              <span className="text-white font-bold text-base tracking-wide drop-shadow-sm">
                {locale === 'ar' ? 'تواصل معنا' : 'Chat with us'}
              </span>
            </div>
          </div>

          {/* Hover Tooltip - Mobile */}
          <div className="absolute bottom-full right-0 mb-3 pointer-events-none md:hidden">
            <div className={`
              bg-gray-900 text-white text-sm rounded-xl py-3 px-4 shadow-2xl
              border border-gray-700 backdrop-blur-md bg-gray-900/95
              transition-all duration-300 whitespace-nowrap
              ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
            `}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium">
                  {locale === 'ar' ? 'تواصل عبر واتساب' : 'Chat on WhatsApp'}
                </span>
              </div>
              {/* Arrow */}
              <div className="absolute top-full right-6 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-transparent border-t-gray-900" />
            </div>
          </div>

          {/* Enhanced Tooltip - Desktop */}
          <div className="hidden md:block absolute bottom-full right-0 mb-3 pointer-events-none">
            <div className={`
              bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800
              text-white rounded-2xl py-4 px-5 shadow-2xl
              border border-gray-700/50 backdrop-blur-xl
              transition-all duration-500 ease-out
              min-w-[240px]
              ${isHovered ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
            `}>
              {/* Header */}
              <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700/50">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#25D366] to-[#128C7E] flex items-center justify-center shadow-lg">
                    <WhatsAppIcon className="h-5 w-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-gray-900" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-base mb-0.5">
                    {locale === 'ar' ? 'دردشة واتساب' : 'WhatsApp Chat'}
                  </div>
                  <div className="text-xs text-green-400 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    {locale === 'ar' ? 'متصل الآن' : 'Online now'}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="text-sm text-gray-300 leading-relaxed">
                {locale === 'ar'
                  ? '💬 نرد عادة خلال دقائق قليلة'
                  : '💬 We typically reply within minutes'}
              </div>

              {/* CTA Text */}
              <div className="mt-3 pt-3 border-t border-gray-700/50">
                <div className="text-xs text-gray-400 flex items-center gap-2">
                  <span>{locale === 'ar' ? 'انقر للمحادثة الآن' : 'Click to start chatting'}</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>

              {/* Arrow */}
              <div className="absolute top-full right-8 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-transparent border-t-gray-900" />
            </div>
          </div>
        </a>
      </div>

      {/* Background Blur Effect on Hover */}
      <div className={`
        fixed inset-0 bg-black/5 backdrop-blur-[1px] transition-opacity duration-500 pointer-events-none z-40 no-print
        ${isHovered ? 'opacity-100' : 'opacity-0'}
      `} />
    </>
  );
}
















