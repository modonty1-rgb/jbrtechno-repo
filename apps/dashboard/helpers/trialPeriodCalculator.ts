/**
 * Helper functions for calculating trial period dates
 */

/**
 * Calculate trial end date from start date and number of months
 * Handles month overflow correctly (e.g., Jan 31 + 1 month = Feb 28/29)
 */
export function calculateTrialEndDate(
  startDate: Date | string,
  months: number
): Date {
  // Parse date string with time component to avoid timezone issues
  let start: Date;
  if (typeof startDate === 'string') {
    // If it's a date string (YYYY-MM-DD), add time component to parse as local time
    const dateStr = startDate.includes('T') ? startDate : `${startDate}T00:00:00`;
    start = new Date(dateStr);
  } else {
    start = startDate;
  }

  const end = new Date(start);

  // Add months
  end.setMonth(end.getMonth() + months);

  // Handle month overflow (e.g., Jan 31 + 1 month)
  // If the day doesn't exist in the target month, set to last day of month
  const originalDay = start.getDate();
  const targetMonth = end.getMonth();
  const targetYear = end.getFullYear();
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();

  if (originalDay > lastDayOfTargetMonth) {
    end.setDate(lastDayOfTargetMonth);
  }

  return end;
}

/**
 * Calculate number of months between two dates
 */
export function calculateTrialMonths(
  startDate: Date | string,
  endDate: Date | string
): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const daysDiff = end.getDate() - start.getDate();

  // Calculate total months
  let totalMonths = yearsDiff * 12 + monthsDiff;

  // If end date is earlier in the month than start date, subtract one month
  if (daysDiff < 0) {
    totalMonths -= 1;
  }

  return Math.max(0, totalMonths);
}

/**
 * Validate trial period dates
 */
export function validateTrialPeriod(
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined,
  months: number | null | undefined
): { valid: boolean; error?: string } {
  if (!startDate) {
    return { valid: true }; // Optional field
  }

  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const now = new Date();

  // Start date cannot be in the future
  if (start > now) {
    return { valid: false, error: 'Trial start date cannot be in the future' };
  }

  if (endDate) {
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    // End date must be after start date
    if (end <= start) {
      return {
        valid: false,
        error: 'Trial end date must be after start date',
      };
    }

    // If months is provided, validate consistency
    if (months !== null && months !== undefined) {
      const calculatedEnd = calculateTrialEndDate(start, months);
      const daysDiff = Math.abs(
        (end.getTime() - calculatedEnd.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Allow 2 days tolerance for manual adjustments
      if (daysDiff > 2) {
        return {
          valid: false,
          error:
            'Trial end date does not match calculated date based on months',
        };
      }
    }
  }

  if (months !== null && months !== undefined) {
    if (months < 1 || months > 24) {
      return {
        valid: false,
        error: 'Trial months must be between 1 and 24',
      };
    }
  }

  return { valid: true };
}









