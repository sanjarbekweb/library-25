"use client";

import { useEffect, useRef } from "react";
import { useLenis } from "lenis/react";

const SCROLL_KEY = "shelfsync_catalog_scroll_y";

export function CatalogScrollRestoration() {
  const lenis = useLenis();
  const isRestoringRef = useRef(false);

  // Restore scroll position on mount with smooth animational Lenis physics
  useEffect(() => {
    const savedPos = sessionStorage.getItem(SCROLL_KEY);
    if (savedPos) {
      const targetY = parseInt(savedPos, 10);
      if (!isNaN(targetY) && targetY > 0) {
        isRestoringRef.current = true;

        const timer = setTimeout(() => {
          if (lenis) {
            lenis.scrollTo(targetY, {
              duration: 1.5,
              easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
              onComplete: () => {
                isRestoringRef.current = false;
              },
            });
          } else {
            window.scrollTo({ top: targetY, behavior: "smooth" });
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 1000);
          }
        }, 60);

        return () => clearTimeout(timer);
      }
    }
  }, [lenis]);

  // Save scroll position on scroll (ignoring transient scrolls during Lenis restoration)
  useEffect(() => {
    const handleScroll = () => {
      if (!isRestoringRef.current && window.scrollY > 0) {
        sessionStorage.setItem(SCROLL_KEY, window.scrollY.toString());
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return null;
}
