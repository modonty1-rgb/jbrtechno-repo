// Arabic relative dates («قبل 3 أيام») with Western numerals, matching the
// dashboard's number style. Full date goes in the element's title attribute.
const rtf = new Intl.RelativeTimeFormat('ar-SA-u-nu-latn', { numeric: 'auto' });

export function formatRelativeAr(date: Date | string): string {
  const then = new Date(date).getTime();
  const diffMs = then - Date.now();
  const diffDays = Math.round(diffMs / 86_400_000);

  if (Math.abs(diffDays) < 1) return 'اليوم';
  if (Math.abs(diffDays) < 7) return rtf.format(diffDays, 'day');
  if (Math.abs(diffDays) < 30) return rtf.format(Math.round(diffDays / 7), 'week');
  if (Math.abs(diffDays) < 365) return rtf.format(Math.round(diffDays / 30), 'month');
  return rtf.format(Math.round(diffDays / 365), 'year');
}

export function formatFullDateAr(date: Date | string): string {
  return new Date(date).toLocaleDateString('ar-SA-u-nu-latn-ca-gregory', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
