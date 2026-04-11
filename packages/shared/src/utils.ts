/**
 * Format a date to a human-readable string.
 */
export function formatDate(date: Date | number, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(typeof date === "number" ? new Date(date) : date);
}

/**
 * Truncate a string to a maximum length, appending ellipsis if needed.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength - 3)}...`;
}

/**
 * Sleep for a given number of milliseconds.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Assert that a value is not null or undefined (type narrowing helper).
 */
export function assertDefined<T>(value: T | null | undefined, message?: string): T {
  if (value == null) {
    throw new Error(message ?? "Value is null or undefined");
  }
  return value;
}

/**
 * Group an array of objects by a key.
 */
export function groupBy<T, K extends string | number | symbol>(
  items: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return items.reduce(
    (acc, item) => {
      const k = key(item);
      const group = acc[k] ?? [];
      acc[k] = group;
      group.push(item);
      return acc;
    },
    {} as Record<K, T[]>
  );
}
