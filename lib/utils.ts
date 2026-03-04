/**
 * Utility Functions
 * 
 * Common helper functions used throughout the application.
 */

/**
 * Combines class names, filtering out falsy values
 * Useful for conditional styling with Tailwind CSS
 * 
 * @example
 * cn("base-class", condition && "conditional-class")
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formats a date string to a readable format
 * 
 * @param dateString - ISO date string
 * @param options - Intl.DateTimeFormatOptions
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return new Date(dateString).toLocaleDateString("en-US", options);
}

/**
 * Truncates text to a specified length
 * 
 * @param text - Text to truncate
 * @param length - Maximum length
 * @param suffix - Suffix to add (default: "...")
 */
export function truncate(text: string, length: number, suffix: string = "..."): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + suffix;
}

