"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";

interface CSSDoorProps {
  textureUrl?: string;
  doorColor?: string;
  className?: string;
}

/**
 * CSSDoor provides a 3D door with hinge rotation on one side.
 * Supports image textures via props or CSS custom properties.
 * Interacting with the handle opens the door and triggers state in useGameStore.
 */
export const CSSDoor: React.FC<CSSDoorProps> = ({
  textureUrl,
  doorColor,
  className = "",
}) => {
  const doorOpen = useGameStore((state) => state.doorOpen);
  const setDoorOpen = useGameStore((state) => state.setDoorOpen);

  const handleDoorClick = () => {
    setDoorOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setDoorOpen(true);
    }
  };

  const doorSurfaceStyle: React.CSSProperties = {
    backgroundColor: doorColor || "var(--door-color)",
    backgroundImage: textureUrl
      ? `url(${textureUrl})`
      : "var(--door-texture, var(--door-wood-grain))",
    backgroundSize: textureUrl ? "cover" : "auto",
  };

  return (
    <div
      className={`relative w-48 h-80 sm:w-56 sm:h-96 md:w-64 md:h-[420px] bg-stone-900 border-8 border-stone-800 rounded-t-sm shadow-2xl ${className}`}
      aria-label="House Entrance Doorway"
    >
      {/* Door frame shadow / interior glow visible when door swings open */}
      <div className="absolute inset-0 bg-stone-950 flex flex-col justify-end items-center overflow-hidden">
        {/* Warm light radiating from inside the first room */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-amber-600/30 via-amber-400/10 to-transparent transition-opacity duration-1000 ${
            doorOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        {/* Silhouette hint inside doorway */}
        <div className="w-16 h-36 bg-amber-500/10 rounded-full blur-xl mb-4" />
      </div>

      {/* 3D Perspective container holding the hinged door */}
      <div className="perspective-container relative w-full h-full">
        <div
          className={`door-panel relative w-full h-full border border-stone-800/80 shadow-2xl flex flex-col justify-between p-4 cursor-pointer select-none ${
            doorOpen ? "door-open pointer-events-none" : ""
          }`}
          style={doorSurfaceStyle}
          onClick={handleDoorClick}
          role="button"
          tabIndex={doorOpen ? -1 : 0}
          aria-label={doorOpen ? "Door is open" : "Front door, click or press Enter to open"}
          onKeyDown={handleKeyDown}
        >
          {/* Subtle wood bevel highlights */}
          <div className="absolute inset-0 border-2 border-amber-900/30 pointer-events-none" />

          {/* Top Decorative Panels */}
          <div className="grid grid-cols-2 gap-3 h-28 pointer-events-none">
            <div className="border-4 border-black/30 bg-black/10 rounded-sm shadow-inner" />
            <div className="border-4 border-black/30 bg-black/10 rounded-sm shadow-inner" />
          </div>

          {/* Door Handle & Lock Plate (right side) */}
          <div className="relative flex justify-end items-center my-auto pr-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleDoorClick();
              }}
              className="group relative flex items-center justify-center w-8 h-16 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-700 rounded-sm shadow-md border border-amber-300/40 hover:scale-105 active:scale-95 transition-transform focus-visible:ring-2 focus-visible:ring-amber-300"
              aria-label="Door handle - Click to open front door"
              tabIndex={doorOpen ? -1 : 0}
            >
              {/* Door handle lever */}
              <div className="absolute -left-3 top-4 w-6 h-3 bg-amber-300 rounded-l-full shadow-lg border border-amber-200" />
              {/* Keyhole */}
              <div className="w-1.5 h-3 bg-stone-900 rounded-full mt-3 opacity-80" />
            </button>
          </div>

          {/* Bottom Decorative Panels */}
          <div className="grid grid-cols-2 gap-3 h-28 pointer-events-none">
            <div className="border-4 border-black/30 bg-black/10 rounded-sm shadow-inner" />
            <div className="border-4 border-black/30 bg-black/10 rounded-sm shadow-inner" />
          </div>

          {/* Brass Kickplate at bottom */}
          <div className="h-6 -mx-4 -mb-4 bg-gradient-to-r from-amber-700 via-amber-500 to-amber-700 border-t border-amber-300/30 opacity-75" />
        </div>
      </div>
    </div>
  );
};

