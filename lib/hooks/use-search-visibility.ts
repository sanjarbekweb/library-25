"use client";

import { useEffect, useState } from "react";

/**
 * Custom hook that observes whether a DOM element (by elementId)
 * is obscured above the screen or scrolled past the sticky header.
 *
 * @param elementId The HTML element ID to observe (e.g. "catalog-search-bar")
 * @param headerOffset Offset in pixels (defaults to 64px for standard navbar height)
 * @returns boolean `isSearchObscured`
 */
export function useSearchVisibility(elementId: string, headerOffset = 64): boolean {
  const [isSearchObscured, setIsSearchObscured] = useState(false);

  useEffect(() => {
    let targetEl: HTMLElement | null = null;
    let observer: IntersectionObserver | null = null;

    const checkVisibility = () => {
      if (!targetEl) {
        targetEl = document.getElementById(elementId);
      }

      if (!targetEl) {
        setIsSearchObscured(false);
        return;
      }

      const rect = targetEl.getBoundingClientRect();
      // If the top/bottom of the search element is at or above the sticky header offset, it's obscured
      const isPastHeader = rect.bottom <= headerOffset || rect.top <= headerOffset;
      setIsSearchObscured(isPastHeader);
    };

    // Initial check
    checkVisibility();

    // Setup scroll & resize listeners for real-time responsiveness
    window.addEventListener("scroll", checkVisibility, { passive: true });
    window.addEventListener("resize", checkVisibility, { passive: true });

    // Setup IntersectionObserver for low-overhead observation
    targetEl = document.getElementById(elementId);
    if (targetEl && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        () => {
          checkVisibility();
        },
        {
          rootMargin: `-${headerOffset}px 0px 0px 0px`,
          threshold: [0, 1],
        }
      );
      observer.observe(targetEl);
    }

    return () => {
      window.removeEventListener("scroll", checkVisibility);
      window.removeEventListener("resize", checkVisibility);
      if (observer && targetEl) {
        observer.unobserve(targetEl);
        observer.disconnect();
      }
    };
  }, [elementId, headerOffset]);

  return isSearchObscured;
}
