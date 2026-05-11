/**
 * Get department name from position title.
 * Pure pattern matching — no DB dependency.
 */
export function getDepartmentFromPosition(position: string): string {
  const t = position.toLowerCase();

  // Leadership / management
  if (t.includes('cto') || t.includes('ceo') || t.includes('head of') || t.includes('manager') || t.includes('lead')) {
    if (t.includes('marketing')) return 'Marketing';
    if (t.includes('operation')) return 'Operations';
    if (t.includes('technical') || t.includes('cto')) return 'Technology';
    return 'Leadership';
  }

  // Technical
  if (
    t.includes('developer') || t.includes('engineer') || t.includes('programmer') ||
    t.includes('technical') || t.includes('frontend') || t.includes('backend') ||
    t.includes('full-stack') || t.includes('devops') || t.includes('qa') ||
    t.includes('ui/ux') || t.includes('designer')
  ) return 'Technology';

  // Content
  if (
    t.includes('content') || t.includes('writer') || t.includes('editor') ||
    t.includes('copywriter') || t.includes('translator')
  ) return 'Content';

  // Marketing
  if (
    t.includes('marketing') || t.includes('seo') || t.includes('social media') ||
    t.includes('digital marketing')
  ) return 'Marketing';

  // Operations
  if (t.includes('operation') || t.includes('admin') || t.includes('coordinator') || t.includes('assistant')) return 'Operations';

  // Sales / Business Development
  if (t.includes('sales') || t.includes('business development')) return 'Sales';

  return 'General';
}

export function getDepartmentFromPositionAr(position: string): string {
  const department = getDepartmentFromPosition(position);
  const map: Record<string, string> = {
    Technology: 'التقنية',
    Marketing: 'التسويق',
    Content: 'المحتوى',
    Operations: 'العمليات',
    Sales: 'المبيعات',
    Leadership: 'الإدارة',
    General: 'عام',
  };
  return map[department] || department;
}
