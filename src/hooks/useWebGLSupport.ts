"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect whether the user's browser and hardware support WebGL.
 */
export function useWebGLSupport(): { isChecking: boolean; isSupported: boolean } {
  const [isChecking, setIsChecking] = useState(true);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");

      setIsSupported(Boolean(gl));
    } catch {
      setIsSupported(false);
    } finally {
      setIsChecking(false);
    }
  }, []);

  return { isChecking, isSupported };
}

