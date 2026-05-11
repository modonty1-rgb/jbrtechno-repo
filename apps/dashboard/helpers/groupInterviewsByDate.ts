interface Interview {
  scheduledInterviewDate: Date | string | null;
  [key: string]: any;
}

export interface DayGroup {
  dateKey: string; // YYYY-MM-DD
  dayName: string; // Localized day name
  formattedDate: string; // Formatted date for display
  interviews: Interview[];
}

export function groupInterviewsByDate(
  interviews: Interview[],
  locale: string
): DayGroup[] {
  const groups = new Map<string, Interview[]>();

  // Group interviews by date
  interviews.forEach((interview) => {
    if (!interview.scheduledInterviewDate) return;

    const date = new Date(interview.scheduledInterviewDate);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD

    if (!groups.has(dateKey)) {
      groups.set(dateKey, []);
    }
    groups.get(dateKey)!.push(interview);
  });

  // Convert to array and add metadata
  const dayGroups: DayGroup[] = Array.from(groups.entries()).map(([dateKey, interviews]) => {
    const date = new Date(dateKey + 'T00:00:00');
    
    // Sort interviews within this day by time (ascending - earliest first)
    const sortedInterviews = [...interviews].sort((a, b) => {
      if (!a.scheduledInterviewDate || !b.scheduledInterviewDate) return 0;
      const timeA = new Date(a.scheduledInterviewDate).getTime();
      const timeB = new Date(b.scheduledInterviewDate).getTime();
      return timeA - timeB;
    });
    
    // Get day name
    const dayName = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
    }).format(date);

    // Format date for display
    const formattedDate = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);

    return {
      dateKey,
      dayName,
      formattedDate,
      interviews: sortedInterviews,
    };
  });

  // Sort chronologically (upcoming first, then past)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  dayGroups.sort((a, b) => {
    const dateA = new Date(a.dateKey);
    const dateB = new Date(b.dateKey);
    const todayTime = today.getTime();
    const timeA = dateA.getTime();
    const timeB = dateB.getTime();

    // Upcoming dates first (future dates before today)
    if (timeA >= todayTime && timeB >= todayTime) {
      return timeA - timeB; // Ascending for future dates
    }
    if (timeA >= todayTime) return -1; // Future before past
    if (timeB >= todayTime) return 1; // Future before past
    
    // Past dates in descending order (most recent first)
    return timeB - timeA;
  });

  return dayGroups;
}


