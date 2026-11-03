"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameStore } from "@/store/useGameStore";

interface DoorwayTransitionProps {
  onZoomChange?: (isZooming: boolean) => void;
}

/**
 * DoorwayTransition coordinates the cinematic zoom and fade into "/house"
 * once the door has opened.
 * It strictly honors the `prefers-reduced-motion` media query by skipping
 * the animation and navigating instantly.
 */
export const DoorwayTransition: React.FC<DoorwayTransitionProps> = ({
  onZoomChange,
}) => {
  const router = useRouter();
  const doorOpen = useGameStore((state) => state.doorOpen);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (!doorOpen) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = mediaQuery.matches;

    if (prefersReducedMotion) {
      // Skip animation completely
      router.push("/house");
      return;
    }

    // Step 1: Let the door begin opening (350ms)
    const zoomTimer = setTimeout(() => {
      onZoomChange?.(true);
    }, 350);

    // Step 2: Fade the screen to darkness/warmth (800ms)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 800);

    // Step 3: Navigate to 3D room route "/house" (1400ms)
    const navTimer = setTimeout(() => {
      router.push("/house");
    }, 1400);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [doorOpen, onZoomChange, router]);

  if (!doorOpen) return null;

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 bg-stone-950 transition-fade-screen ${
        isFading ? "fading" : ""
      }`}
    />
  );
};

