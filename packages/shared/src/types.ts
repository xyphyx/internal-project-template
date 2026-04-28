/**
 * Utility type — make specific keys of T optional.
 */
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Utility type — make specific keys of T required.
 */
export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

/**
 * Utility type — deep partial.
 */
export type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

/**
 * Utility type — extract the resolved type from a Promise.
 */
export type Awaited<T> = T extends Promise<infer U> ? U : T;

/**
 * Standard paginated response shape.
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

/**
 * Standard API error shape.
 */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}
