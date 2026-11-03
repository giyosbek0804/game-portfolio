"use client";

import React, { useEffect, useState } from "react";

export const RotatePrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Check if touch device
      const isTouch =
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        window.matchMedia("(pointer: coarse)").matches;

      // Check if in portrait (height > width)
      const isPortrait = window.innerHeight > window.innerWidth;

      // Show only if touch device in portrait mode and screen isn't giant tablet/desktop
      const isMobileSize = Math.min(window.innerWidth, window.innerHeight) < 768;

      if (isTouch && isPortrait && isMobileSize && !dismissed) {
        setShowPrompt(true);
      } else {
        setShowPrompt(false);
      }
    };

    checkOrientation();
    window.addEventListener("resize", checkOrientation);
    window.addEventListener("orientationchange", checkOrientation);

    return () => {
      window.removeEventListener("resize", checkOrientation);
      window.removeEventListener("orientationchange", checkOrientation);
    };
  }, [dismissed]);

  if (!showPrompt) return null;

  return (
    <div
      role="alertdialog"
      aria-label="Rotate device to landscape"
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-950/90 backdrop-blur-xl select-none animate-fade-in"
    >
      <div className="max-w-xs text-center space-y-6">
        {/* Animated Rotating Phone Graphic */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-amber-500/15 animate-ping" />
          <div className="relative w-14 h-14 rounded-2xl bg-stone-900 border-2 border-amber-400/80 shadow-2xl flex items-center justify-center text-3xl animate-[rotatePhone_2.4s_ease-in-out_infinite]">
            📱
          </div>
        </div>

        {/* Text Instructions */}
        <div className="space-y-2">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Rotate to Landscape
          </h2>
          <p className="text-xs text-stone-300 leading-relaxed">
            For the best gaming experience with full dual-thumb controls and wide vision, please turn your phone sideways.
          </p>
        </div>

        {/* Action Button to bypass if rotation lock is enabled */}
        <button
          type="button"
          onClick={() => {
            setDismissed(true);
            setShowPrompt(false);
          }}
          className="px-5 py-2.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700 text-xs font-semibold tracking-wide transition-colors"
        >
          Continue in Portrait anyway
        </button>
      </div>

      {/* Embedded keyframe for phone rotate animation */}
      <style jsx global>{`
        @keyframes rotatePhone {
          0%,
          20% {
            transform: rotate(0deg);
          }
          50%,
          80% {
            transform: rotate(90deg);
          }
          100% {
            transform: rotate(0deg);
          }
        }
      `}</style>
    </div>
  );
};

