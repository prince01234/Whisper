import { 
    format, 
    formatDistanceToNow, 
    formatRelative, 
    differenceInDays,
    differenceInHours,
    differenceInMinutes,
    isToday, 
    isYesterday,
    parseISO,
    addDays
  } from 'date-fns';
  
  /**
   * Safely parses a date string into a Date object
   * @param {string|Date} dateInput - Date string or Date object
   * @returns {Date|null} - Date object or null if invalid
   */
  export const parseDate = (dateInput) => {
    if (!dateInput) return null;
    
    try {
      // If it's already a Date object, return it
      if (dateInput instanceof Date) return dateInput;
      
      // If it's a string, parse it
      return typeof dateInput === 'string' ? parseISO(dateInput) : null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  };
  
  /**
   * Format time to hours and minutes (e.g., "3:45 PM")
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted time
   */
  export const formatTime = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      return format(date, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };
  
  /**
   * Format date to full date (e.g., "January 15, 2023")
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date
   */
  export const formatFullDate = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error('Error formatting full date:', error);
      return '';
    }
  };
  
  /**
   * Format date to short date (e.g., "Jan 15, 2023")
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date
   */
  export const formatShortDate = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.error('Error formatting short date:', error);
      return '';
    }
  };
  
  /**
   * Format date to numeric date (e.g., "01/15/2023")
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date
   */
  export const formatNumericDate = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      return format(date, 'MM/dd/yyyy');
    } catch (error) {
      console.error('Error formatting numeric date:', error);
      return '';
    }
  };
  
  /**
   * Format date for message headers (Today, Yesterday, or date)
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted date for message headers
   */
  export const formatMessageDate = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      if (isToday(date)) {
        return 'Today';
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else {
        // Get the difference in days
        const diffDays = differenceInDays(new Date(), date);
        
        // If less than 7 days ago, show the day name
        if (diffDays < 7) {
          return format(date, 'EEEE'); // e.g., "Monday"
        } else {
          return formatShortDate(date);
        }
      }
    } catch (error) {
      console.error('Error formatting message date:', error);
      return '';
    }
  };
  
  /**
   * Format a date as a relative time (e.g., "5 minutes ago", "2 days ago")
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Relative time
   */
  export const formatRelativeTime = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Error formatting relative time:', error);
      return '';
    }
  };
  
  /**
   * Format last seen status
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted last seen status
   */
  export const formatLastSeen = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return 'Never';
    
    try {
      const now = new Date();
      const diffMinutes = differenceInMinutes(now, date);
      
      if (diffMinutes < 1) {
        return 'Just now';
      } else if (diffMinutes < 60) {
        return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
      } else {
        const diffHours = differenceInHours(now, date);
        
        if (diffHours < 24) {
          return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else if (isYesterday(date)) {
          return `Yesterday at ${formatTime(date)}`;
        } else {
          return formatRelative(date, now);
        }
      }
    } catch (error) {
      console.error('Error formatting last seen:', error);
      return '';
    }
  };
  
  /**
   * Format time for chat list (smart format based on message age)
   * @param {string|Date} dateInput - Date to format
   * @returns {string} Formatted time for chat list
   */
  export const formatChatListTime = (dateInput) => {
    const date = parseDate(dateInput);
    if (!date) return '';
    
    try {
      const now = new Date();
    const diffHours = differenceInHours(now, date);
    
    // Use hours for more granular display of today's messages
    if (isToday(date)) {
      if (diffHours < 1) {
        const diffMins = differenceInMinutes(now, date);
        if (diffMins < 5) return 'Just now';
        return `${diffMins}m ago`;
      } else if (diffHours < 6) {
        return `${diffHours}h ago`;
      } else {
        return formatTime(date);
      }
    }
      const diffDays = differenceInDays(now, date);
      
      if (isToday(date)) {
        return formatTime(date);
      } else if (isYesterday(date)) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return format(date, 'EEEE'); // e.g., "Monday"
      } else {
        return formatNumericDate(date);
      }
    } catch (error) {
      console.error('Error formatting chat list time:', error);
      return '';
    }
  };
  
  /**
   * Formats a timestamp for display in chat bubbles
   * @param {string|Date} dateInput - The date to format
   * @returns {string} Formatted time
   */
  export const formatMessageTime = (dateInput) => {
    return formatTime(dateInput);
  };
  
  /**
   * Check if two dates are on the same day
   * @param {string|Date} date1 - First date
   * @param {string|Date} date2 - Second date
   * @returns {boolean} True if dates are on the same day
   */
  export const isSameDay = (date1, date2) => {
    const parsedDate1 = parseDate(date1);
    const parsedDate2 = parseDate(date2);
    
    if (!parsedDate1 || !parsedDate2) return false;
    
    try {
      return format(parsedDate1, 'yyyy-MM-dd') === format(parsedDate2, 'yyyy-MM-dd');
    } catch (error) {
      console.error('Error comparing dates:', error);
      return false;
    }
  };
  
  /**
   * Check if a date is within the given minutes from now
   * @param {string|Date} dateInput - Date to check
   * @param {number} minutes - Number of minutes
   * @returns {boolean} True if date is within the given minutes
   */
  export const isWithinMinutes = (dateInput, minutes) => {
    const date = parseDate(dateInput);
    if (!date) return false;
    
    try {
      const diffMinutes = Math.abs(differenceInMinutes(new Date(), date));
      return diffMinutes <= minutes;
    } catch (error) {
      console.error('Error checking if date is within minutes:', error);
      return false;
    }
  };
  
  /**
   * Get date ranges for common filters
   * @returns {Object} Object with date ranges
   */
  export const getDateRanges = () => {
    const today = new Date();
    
    return {
      today: {
        start: new Date(today.setHours(0, 0, 0, 0)),
        end: new Date(today.setHours(23, 59, 59, 999))
      },
      yesterday: {
        start: new Date(addDays(new Date().setHours(0, 0, 0, 0), -1)),
        end: new Date(addDays(new Date().setHours(23, 59, 59, 999), -1))
      },
      lastWeek: {
        start: new Date(addDays(new Date().setHours(0, 0, 0, 0), -7)),
        end: new Date(today.setHours(23, 59, 59, 999))
      },
      lastMonth: {
        start: new Date(addDays(new Date().setHours(0, 0, 0, 0), -30)),
        end: new Date(today.setHours(23, 59, 59, 999))
      }
    };
  };
  
  /**
   * Format a duration in milliseconds to a human-readable string
   * @param {number} milliseconds - Duration in milliseconds
   * @returns {string} Formatted duration
   */
  export const formatDuration = (milliseconds) => {
    if (!milliseconds || isNaN(milliseconds)) return '0:00';
    
    try {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Error formatting duration:', error);
      return '0:00';
    }
  };
  
  export default {
    parseDate,
    formatTime,
    formatFullDate,
    formatShortDate,
    formatNumericDate,
    formatMessageDate,
    formatRelativeTime,
    formatLastSeen,
    formatChatListTime,
    formatMessageTime,
    isSameDay,
    isWithinMinutes,
    getDateRanges,
    formatDuration
  };