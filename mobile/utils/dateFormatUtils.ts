/**
 * Date formatting utilities for transaction forms
 * Handles date conversion between API format (ISO strings) and Date objects
 */

/**
 * Formats a date to ISO string for API submission
 * @param date - Date to format (Date, null, or undefined)
 * @returns ISO string or undefined if date is invalid/null
 */
export function formatDateForAPI(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  
  if (!(date instanceof Date)) {
    console.warn("⚠️ formatDateForAPI: Invalid date type", typeof date);
    return undefined;
  }

  if (isNaN(date.getTime())) {
    console.warn("⚠️ formatDateForAPI: Invalid date value");
    return undefined;
  }

  try {
    return date.toISOString();
  } catch (error) {
    console.error("❌ Error formatting date for API:", error);
    return undefined;
  }
}

/**
 * Parses a date string from API to Date object
 * Handles various date formats including 2-digit years (assumes 20xx for years < 100)
 * @param dateString - ISO date string, MM-DD-YY, MM/DD/YY, or other date format from API
 * @returns Date object or null if invalid
 */
export function parseDateFromAPI(dateString: string | { normalized: string } | null | undefined): Date | null {
  if (!dateString) return null;

  try {
    // Handle normalized date format from backend: { normalized: "MM-DD-YYYY" }
    if (typeof dateString === 'object' && dateString !== null && 'normalized' in dateString) {
      const normalized = dateString.normalized;
      if (typeof normalized === 'string') {
        // Parse MM-DD-YYYY format
        const parts = normalized.split('-');
        if (parts.length === 3) {
          const month = parseInt(parts[0], 10) - 1; // Month is 0-indexed
          const day = parseInt(parts[1], 10);
          let year = parseInt(parts[2], 10);
          
          // Fix 2-digit years: if year < 100, assume 20xx
          if (year < 100) {
            year += 2000;
          }
          
          const date = new Date(year, month, day);
          
          if (!isNaN(date.getTime())) {
            return date;
          }
        }
      }
    }

    // Handle string dates - always try manual parsing first for MM-DD-YY/YYYY format
    // This prevents JavaScript's Date constructor from misinterpreting 2-digit years
    const datePattern = /^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/;
    const match = String(dateString).trim().match(datePattern);
    
    let date: Date | null = null;
    
    if (match) {
      // Manual parsing for MM-DD-YY or MM-DD-YYYY format
      const month = parseInt(match[1], 10) - 1; // Month is 0-indexed
      const day = parseInt(match[2], 10);
      let year = parseInt(match[3], 10);
      
      // Fix 2-digit years: if year < 100, assume 20xx
      if (year < 100) {
        year += 2000;
      }
      
      date = new Date(year, month, day);
    } else {
      // Fallback to standard Date parsing for other formats (ISO, etc.)
      date = new Date(dateString);
      const parsedYear = date.getFullYear();
      
      // If year is suspiciously low (< 100) or high (> 2100), try manual parsing as fallback
      if ((parsedYear < 100 || parsedYear > 2100) && !isNaN(date.getTime())) {
        // Try to extract date parts from the string
        const parts = String(dateString).split(/[-\/]/);
        if (parts.length === 3) {
          const m = parseInt(parts[0], 10);
          const d = parseInt(parts[1], 10);
          let y = parseInt(parts[2], 10);
          if (y < 100) {
            y += 2000;
          }
          if (m >= 1 && m <= 12 && d >= 1 && d <= 31 && y >= 1900 && y <= 2100) {
            date = new Date(y, m - 1, d);
          }
        }
      }
    }
    
    if (isNaN(date.getTime())) {
      console.warn("⚠️ parseDateFromAPI: Invalid date string", dateString);
      return null;
    }

    // Validate year is reasonable (between 1900 and 2100)
    const year = date.getFullYear();
    if (year < 1900 || year > 2100) {
      console.warn("⚠️ parseDateFromAPI: Year out of reasonable range", dateString, year);
      return null;
    }

    return date;
  } catch (error) {
    console.error("❌ Error parsing date from API:", error);
    return null;
  }
}

/**
 * Formats a date for display in the UI
 * @param date - Date to format
 * @returns Formatted date string (e.g., "Jan 22, 2026") or empty string if invalid
 */
export function formatDateForDisplay(date: Date | null | undefined): string {
  if (!date) return "";

  if (!(date instanceof Date)) {
    return "";
  }

  if (isNaN(date.getTime())) {
    return "";
  }

  try {
    const year = date.getFullYear();
    
    // Validate year before formatting
    if (year < 1900 || year > 2100) {
      console.warn("⚠️ formatDateForDisplay: Year out of reasonable range", year);
      return ""; // Return empty string for invalid years
    }
    
    const formatted = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    return formatted;
  } catch (error) {
    console.error("❌ Error formatting date for display:", error);
    return "";
  }
}

/**
 * Formats a date for display with time
 * @param date - Date to format
 * @returns Formatted date string with time or empty string if invalid
 */
export function formatDateTimeForDisplay(date: Date | null | undefined): string {
  if (!date) return "";

  if (!(date instanceof Date)) {
    return "";
  }

  if (isNaN(date.getTime())) {
    return "";
  }

  try {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    console.error("❌ Error formatting date/time for display:", error);
    return "";
  }
}

/**
 * Validates that a date is valid
 * @param date - Date to validate
 * @returns true if date is valid, false otherwise
 */
export function isValidDate(date: Date | null | undefined): boolean {
  if (!date) return false;
  if (!(date instanceof Date)) return false;
  return !isNaN(date.getTime());
}

/**
 * Validates that end date is after start date
 * @param startDate - Start date
 * @param endDate - End date
 * @returns true if end date is after start date, false otherwise
 */
export function isDateRangeValid(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined
): boolean {
  if (!startDate || !endDate) return true; // Allow if either is missing (handled by required validation)
  if (!isValidDate(startDate) || !isValidDate(endDate)) return false;
  return endDate > startDate;
}
