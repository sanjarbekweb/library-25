import { revalidateTag, revalidatePath } from "next/cache";
import { CACHE_TAGS } from "./tags";

/**
 * Invalidates cache for a specific book title and related public views.
 * Call only AFTER a successful database mutation commit.
 */
export function invalidateBookCache(bookId?: string) {
  try {
    revalidateTag(CACHE_TAGS.CATALOG, "max");
    revalidateTag(CACHE_TAGS.TOP_DEMAND, "max");
    revalidateTag(CACHE_TAGS.ANALYTICS, "max");

    if (bookId) {
      revalidateTag(CACHE_TAGS.BOOK(bookId), "max");
      revalidatePath(`/books/${bookId}`);
    }
    revalidatePath("/catalog");
  } catch (error) {
    console.warn(`[Cache Invalidation Warning] Failed to revalidate book cache for ${bookId}:`, error);
  }
}

/**
 * Invalidates user-specific loan cache and circulation analytics.
 */
export function invalidateUserLoansCache(userId: string) {
  try {
    revalidateTag(CACHE_TAGS.USER_LOANS(userId), "max");
    revalidateTag(CACHE_TAGS.ANALYTICS, "max");
    revalidatePath("/loans");
    revalidatePath("/admin/analytics");
  } catch (error) {
    console.warn(`[Cache Invalidation Warning] Failed to revalidate loan cache for user ${userId}:`, error);
  }
}

/**
 * Invalidates user-specific reservation cache.
 */
export function invalidateUserReservationsCache(userId: string) {
  try {
    revalidateTag(CACHE_TAGS.USER_RESERVATIONS(userId), "max");
    revalidateTag(CACHE_TAGS.ANALYTICS, "max");
    revalidatePath("/reservations");
  } catch (error) {
    console.warn(`[Cache Invalidation Warning] Failed to revalidate reservation cache for user ${userId}:`, error);
  }
}

/**
 * Invalidates system analytics cache.
 */
export function invalidateAnalyticsCache() {
  try {
    revalidateTag(CACHE_TAGS.ANALYTICS, "max");
    revalidatePath("/admin/analytics");
  } catch (error) {
    console.warn("[Cache Invalidation Warning] Failed to revalidate analytics cache:", error);
  }
}

/**
 * Invalidates category catalog taxonomy cache.
 */
export function invalidateCategoriesCache() {
  try {
    revalidateTag(CACHE_TAGS.CATEGORIES, "max");
    revalidateTag(CACHE_TAGS.CATALOG, "max");
    revalidatePath("/catalog");
  } catch (error) {
    console.warn("[Cache Invalidation Warning] Failed to revalidate categories cache:", error);
  }
}
