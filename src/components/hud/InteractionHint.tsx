"use client";

import React, { useEffect, useState } from "react";

interface InteractionHintProps {
  hasInteracted: boolean;
  onDismiss?: () => void;
}

export const InteractionHint: React.FC<InteractionHintProps> = ({
  hasInteracted,
  onDismiss,
}) => {
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Detect touch / mobile
    const checkTouch = () => {
      setIsTouchDevice(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkTouch();
  }, []);

  useEffect(() => {
    if (hasInteracted) {
      // Fade out and unmount
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [hasInteracted, onDismiss]);

  if (!visible) return null;

  return (
    <aside
      aria-label="Control instructions"
      className={`pointer-events-auto transition-opacity duration-500 ${
        hasInteracted ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="bg-stone-900/85 backdrop-blur-md border border-stone-700/60 text-stone-200 px-5 py-3 rounded-xl shadow-2xl flex items-center gap-4 text-xs sm:text-sm">
        <div className="text-xl text-amber-400">
          {isTouchDevice ? "📱" : "🎮"}
        </div>
        <div>
          <span className="font-semibold text-white block">
            {isTouchDevice ? "Touch Controls" : "Desktop Controls"}
          </span>
          <span className="text-stone-400 text-xs">
            {isTouchDevice
              ? "Drag to look • Joystick to walk • Tap switches beside door & paintings"
              : "Click to look around • WASD to walk • Click switches beside door & paintings"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          className="ml-2 text-stone-400 hover:text-white px-2 py-1 rounded bg-stone-800/80 hover:bg-stone-700 text-[11px] font-medium transition-colors"
          aria-label="Dismiss controls instruction"
        >
          Got it
        </button>
      </div>
    </aside>
  );
};

