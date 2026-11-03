"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/store/useGameStore";

interface EntranceButtonsProps {
  className?: string;
}

/**
 * EntranceButtons renders the two primary actions next to the house entrance:
 * 1. "Enter" -> Opens the front door
 * 2. "Static view" -> Navigates to the standard scrolling portfolio (/portfolio)
 */
export const EntranceButtons: React.FC<EntranceButtonsProps> = ({
  className = "",
}) => {
  const doorOpen = useGameStore((state) => state.doorOpen);
  const setDoorOpen = useGameStore((state) => state.setDoorOpen);

  const handleEnterClick = () => {
    setDoorOpen(true);
  };

  return (
    <nav
      aria-label="Entrance navigation"
      className={`flex flex-col gap-4 w-full max-w-xs ${className}`}
    >
      {/* Enter Button */}
      <button
        type="button"
        onClick={handleEnterClick}
        disabled={doorOpen}
        aria-label="Enter the 3D portfolio house"
        className={`group relative overflow-hidden px-6 py-3.5 rounded-lg font-bold text-sm sm:text-base tracking-wider uppercase transition-all duration-300 shadow-lg border ${
          doorOpen
            ? "bg-amber-600/50 text-amber-200 border-amber-500/40 cursor-default"
            : "bg-amber-600 hover:bg-amber-500 text-stone-950 border-amber-300/60 shadow-amber-900/30 hover:shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98]"
        }`}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          <span>{doorOpen ? "Door Opening..." : "Enter"}</span>
          <span className="text-xs transition-transform group-hover:translate-x-1">
            ▶
          </span>
        </span>
        {/* Glow sheen */}
        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </button>

      {/* Static View Link */}
      <Link
        href="/portfolio"
        className="group relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg font-medium text-sm sm:text-base tracking-wide text-stone-200 bg-stone-800/90 hover:bg-stone-700/90 border border-stone-600/50 hover:border-stone-400/80 shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
        aria-label="Switch to static scrolling portfolio"
      >
        <span>Static view</span>
        <span className="text-xs text-stone-400 group-hover:text-stone-200 transition-colors">
          📄
        </span>
      </Link>
    </nav>
  );
};

