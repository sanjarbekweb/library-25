"use client";

import { useEffect, useRef } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { ReactNode } from "react";

interface LenisProviderProps {
  children: ReactNode;
}

/**
 * Advanced Scrollbar Drag & Momentum Interruption Sync.
 * Halts smooth scroll momentum on scrollbar click without calling lenis.stop() (which would add overflow:hidden and hide the scrollbar).
 */
function LenisScrollbarSync() {
  const lenis = useLenis();
  const isDraggingScrollbar = useRef(false);

  useEffect(() => {
    if (!lenis) return;

    const handlePointerDown = (e: MouseEvent | PointerEvent) => {
      // Calculate viewport vs document width to find native scrollbar bounds
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      const isRightScrollbarClick = e.clientX >= window.innerWidth - Math.max(scrollbarWidth, 24);

      if (isRightScrollbarClick) {
        isDraggingScrollbar.current = true;
        // Immediately halt active momentum by setting immediate target (DO NOT call lenis.stop() as it triggers overflow:hidden)
        lenis.scrollTo(window.scrollY, { immediate: true });
      }
    };

    const handlePointerUp = () => {
      if (isDraggingScrollbar.current) {
        isDraggingScrollbar.current = false;
        if (lenis) {
          lenis.scrollTo(window.scrollY, { immediate: true });
        }
      }
    };

    const handleNativeScroll = () => {
      if (!lenis) return;

      const currentScroll = window.scrollY;

      // If user is actively dragging scrollbar thumb or if native scroll position diverges from Lenis target
      if (isDraggingScrollbar.current || (lenis.isScrolling && Math.abs(currentScroll - lenis.scroll) > 6)) {
        lenis.scrollTo(currentScroll, { immediate: true });
      }
    };

    window.addEventListener("pointerdown", handlePointerDown, { capture: true, passive: true });
    window.addEventListener("mousedown", handlePointerDown, { capture: true, passive: true });
    window.addEventListener("pointerup", handlePointerUp, { capture: true, passive: true });
    window.addEventListener("mouseup", handlePointerUp, { capture: true, passive: true });
    window.addEventListener("scroll", handleNativeScroll, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("mousedown", handlePointerDown, { capture: true });
      window.removeEventListener("pointerup", handlePointerUp, { capture: true });
      window.removeEventListener("mouseup", handlePointerUp, { capture: true });
      window.removeEventListener("scroll", handleNativeScroll);
    };
  }, [lenis]);

  return null;
}

export function LenisProvider({ children }: LenisProviderProps) {
  return (
    <ReactLenis
      root
      options={{
        duration: 0.9,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.2,
        autoToggle: true,
        prevent: (node) =>
          node.classList.contains("lenis-prevent") || node.hasAttribute("data-lenis-prevent"),
      }}
    >
      <LenisScrollbarSync />
      {children}
    </ReactLenis>
  );
}
