/**
 * Centralized Cache Tags and Key Definitions for Next.js Server Cache (libra25).
 * Enforces structured, predictable tag hierarchy across all domain services.
 */
export const CACHE_TAGS = {
  // Public Catalog & Discovery
  CATALOG: "catalog-books",
  CATEGORIES: "catalog-categories",
  TOP_DEMAND: "top-demand-books",

  // Specific Book Metadata & Availability (Parametric)
  BOOK: (bookId: string) => `book-${bookId}`,

  // Global & Admin Analytics
  ANALYTICS: "analytics",
  CIRCULATION_DESK: "circulation-desk",

  // User-Scoped Data (Strict Isolation - Parametric by Verified Student/User ID)
  USER_LOANS: (userId: string) => `user-${userId}-loans`,
  USER_RESERVATIONS: (userId: string) => `user-${userId}-reservations`,
} as const;

export const CACHE_TTL = {
  VERY_SHORT: 15,    // 15 seconds (for near-realtime dashboards)
  SHORT: 60,         // 1 minute (for default catalog page 1 & book details)
  MEDIUM: 120,       // 2 minutes (for aggregated analytics)
  LONG: 300,         // 5 minutes (for static categories & public metadata)
} as const;
