// Ad-friendly position slug: lowercase, hyphens only — no spaces or encoded
// characters, so the URL can be pasted directly into ad campaigns.
// "Sales Representative - Telesales" -> "sales-representative-telesales"
export function positionSlug(titleEn: string): string {
  return titleEn
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
