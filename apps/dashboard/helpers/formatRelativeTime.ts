export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'الآن';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `منذ ${diffInMinutes} ${diffInMinutes === 1 ? 'دقيقة' : 'دقائق'}`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `منذ ${diffInHours} ${diffInHours === 1 ? 'ساعة' : 'ساعات'}`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `منذ ${diffInDays} ${diffInDays === 1 ? 'يوم' : 'أيام'}`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `منذ ${diffInWeeks} ${diffInWeeks === 1 ? 'أسبوع' : 'أسابيع'}`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `منذ ${diffInMonths} ${diffInMonths === 1 ? 'شهر' : 'أشهر'}`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `منذ ${diffInYears} ${diffInYears === 1 ? 'سنة' : 'سنوات'}`;
}








