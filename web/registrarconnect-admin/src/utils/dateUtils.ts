/**
 * Date and time formatting utilities
 * Provides consistent date/time formatting across the application
 */

/**
 * Format date to local date string
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "01/15/2024")
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date to long format
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "January 15, 2024")
 */
export const formatDateLong = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time to local time string
 * @param date - Date string or Date object
 * @returns Formatted time string (e.g., "02:30 PM")
 */
export const formatTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Time';
  }
};

/**
 * Format date and time
 * @param date - Date string or Date object
 * @returns Formatted date and time string (e.g., "01/15/2024 02:30 PM")
 */
export const formatDateTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return `${formatDate(dateObj)} ${formatTime(dateObj)}`;
  } catch (error) {
    console.error('Error formatting datetime:', error);
    return 'Invalid Date/Time';
  }
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - Date string or Date object
 * @returns Formatted relative time string
 */
export const formatRelativeTime = (date: string | Date | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSeconds < 60) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return formatDate(dateObj);
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return 'Invalid Date';
  }
};

/**
 * Check if a date is today
 * @param date - Date string or Date object
 * @returns true if date is today
 */
export const isToday = (date: string | Date | null | undefined): boolean => {
  if (!date) return false;
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    return dateObj.toDateString() === today.toDateString();
  } catch (error) {
    console.error('Error checking if date is today:', error);
    return false;
  }
};

/**
 * Get time of day greeting
 * @returns "Good morning", "Good afternoon", or "Good evening"
 */
export const getTimeOfDayGreeting = (): string => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

/**
 * Format date for input fields (YYYY-MM-DD)
 * @param date - Date string or Date object
 * @returns Formatted date string for input fields
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

