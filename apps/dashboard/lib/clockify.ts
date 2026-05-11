/**
 * Clockify API Client
 * Handles communication with Clockify API for time tracking data
 */

const CLOCKIFY_API_BASE = 'https://api.clockify.me/api/v1';

interface ClockifyTimeEntry {
  id: string;
  description: string;
  userId: string;
  billable: boolean;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  timeInterval: {
    start: string; // ISO 8601 datetime
    end: string; // ISO 8601 datetime
    duration: string; // ISO 8601 duration (e.g., "PT2H30M15S")
  };
  tags?: Array<{
    id: string;
    name: string;
  }>;
}

interface ClockifyUser {
  id: string;
  email: string;
  name: string;
  status: string;
}

export interface TimeEntry {
  id: string;
  description: string;
  start: Date;
  end: Date;
  duration: number; // in milliseconds
  billable: boolean;
  projectId?: string;
  projectName?: string;
  taskId?: string;
  tags?: string[];
}

export interface TimeSummary {
  totalHours: number;
  totalMinutes: number;
  totalSeconds: number;
  entries: TimeEntry[];
  dailyBreakdown: {
    date: string; // YYYY-MM-DD
    hours: number;
    minutes: number;
    entries: TimeEntry[];
  }[];
}

/**
 * Convert ISO 8601 duration to milliseconds
 * Examples: "PT2H30M15S" -> 9015000ms, "PT1H" -> 3600000ms
 *
 * Clockify can sometimes return null/empty duration for running or invalid entries,
 * so we defensively handle falsy values.
 */
function parseDurationToMs(duration: string | null | undefined): number {
  if (!duration) {
    return 0;
  }

  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = duration.match(regex);

  if (!matches) return 0;

  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}

/**
 * Make authenticated request to Clockify API
 */
async function clockifyRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const apiKey = process.env.CLOCKIFY_API_KEY;
  const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;

  if (!apiKey) {
    throw new Error('CLOCKIFY_API_KEY environment variable is not set');
  }

  if (!workspaceId) {
    throw new Error('CLOCKIFY_WORKSPACE_ID environment variable is not set');
  }

  const url = `${CLOCKIFY_API_BASE}${endpoint}`;
  const headers = {
    'X-Api-Key': apiKey,
    'Content-Type': 'application/json',
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('Clockify API rate limit exceeded. Please try again later.');
    }
    if (response.status === 401) {
      // Don't log as error - this is expected if API key is invalid/missing
      // The calling function will handle this gracefully
      throw new Error('Clockify API authentication failed. Check your API key.');
    }
    if (response.status === 404) {
      throw new Error('Clockify resource not found. Check workspace ID and user ID.');
    }

    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`Clockify API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Get all users in the workspace
 */
export async function getClockifyUsers(): Promise<ClockifyUser[]> {
  const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;
  if (!workspaceId) {
    throw new Error('CLOCKIFY_WORKSPACE_ID environment variable is not set');
  }

  return clockifyRequest<ClockifyUser[]>(`/workspaces/${workspaceId}/users`);
}

/**
 * Find Clockify user by email
 */
export async function findClockifyUserByEmail(email: string): Promise<ClockifyUser | null> {
  const users = await getClockifyUsers();
  return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) || null;
}

/**
 * Get time entries for a specific user within a date range
 */
export async function getUserTimeEntries(
  clockifyUserId: string,
  startDate: Date,
  endDate: Date
): Promise<TimeEntry[]> {
  const workspaceId = process.env.CLOCKIFY_WORKSPACE_ID;
  if (!workspaceId) {
    throw new Error('CLOCKIFY_WORKSPACE_ID environment variable is not set');
  }

  // Format dates as ISO 8601 strings (Clockify expects UTC)
  const startISO = startDate.toISOString();
  const endISO = endDate.toISOString();

  // Build query parameters
  const params = new URLSearchParams({
    start: startISO,
    end: endISO,
    'page-size': '5000', // Maximum allowed
  });

  const endpoint = `/workspaces/${workspaceId}/user/${clockifyUserId}/time-entries?${params.toString()}`;

  const entries = await clockifyRequest<ClockifyTimeEntry[]>(endpoint);

  // Transform Clockify time entries to our TimeEntry format
  return entries.map((entry) => {
    const durationMs = parseDurationToMs(entry.timeInterval.duration);

    // If entry is running (no end time), calculate duration from start to now
    let endDate: Date;
    let actualDurationMs: number;

    if (entry.timeInterval.end) {
      endDate = new Date(entry.timeInterval.end);
      actualDurationMs = durationMs;
    } else {
      // Running timer - calculate from start to now
      endDate = new Date();
      const startDate = new Date(entry.timeInterval.start);
      actualDurationMs = endDate.getTime() - startDate.getTime();
    }

    return {
      id: entry.id,
      description: entry.description || 'No description',
      start: new Date(entry.timeInterval.start),
      end: endDate,
      duration: actualDurationMs,
      billable: entry.billable,
      projectId: entry.projectId,
      projectName: entry.projectName,
      taskId: entry.taskId,
      tags: entry.tags?.map((tag) => tag.name) || [],
    };
  });
}

/**
 * Calculate total hours from time entries
 */
export function calculateTotalHours(timeEntries: TimeEntry[]): number {
  const totalMs = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  return totalMs / (1000 * 60 * 60); // Convert milliseconds to hours
}

/**
 * Group time entries by day and calculate summary
 */
export function calculateTimeSummary(
  timeEntries: TimeEntry[],
  startDate: Date,
  endDate: Date
): TimeSummary {
  // Group entries by date (YYYY-MM-DD)
  const entriesByDate = new Map<string, TimeEntry[]>();

  timeEntries.forEach((entry) => {
    const dateKey = entry.start.toISOString().split('T')[0];
    if (!entriesByDate.has(dateKey)) {
      entriesByDate.set(dateKey, []);
    }
    entriesByDate.get(dateKey)!.push(entry);
  });

  // Create daily breakdown
  const dailyBreakdown: TimeSummary['dailyBreakdown'] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayEntries = entriesByDate.get(dateKey) || [];
    const dayTotalMs = dayEntries.reduce((sum, entry) => sum + entry.duration, 0);
    const dayHours = dayTotalMs / (1000 * 60 * 60);
    const dayMinutes = (dayTotalMs / (1000 * 60)) % 60;

    dailyBreakdown.push({
      date: dateKey,
      hours: dayHours,
      minutes: dayMinutes,
      entries: dayEntries.sort((a, b) => a.start.getTime() - b.start.getTime()),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Sort by date (most recent first)
  dailyBreakdown.sort((a, b) => b.date.localeCompare(a.date));

  // Calculate totals
  const totalMs = timeEntries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalHours = totalMs / (1000 * 60 * 60);
  const totalMinutes = (totalMs / (1000 * 60)) % 60;
  const totalSeconds = (totalMs / 1000) % 60;

  return {
    totalHours,
    totalMinutes,
    totalSeconds,
    entries: timeEntries.sort((a, b) => b.start.getTime() - a.start.getTime()),
    dailyBreakdown,
  };
}




