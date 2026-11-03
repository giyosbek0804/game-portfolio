"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/store/useGameStore";
import { InteractionHint } from "./InteractionHint";
import { ProjectModal } from "./ProjectModal";

interface RoomHUDProps {
  hasInteracted: boolean;
  onDismissHint: () => void;
}

export const RoomHUD: React.FC<RoomHUDProps> = ({
  hasInteracted,
  onDismissHint,
}) => {
  const playerZone = useGameStore((state) => state.playerZone);
  const doorOpen = useGameStore((state) => state.doorOpen);
  const setDoorOpen = useGameStore((state) => state.setDoorOpen);
  const setWalkTarget = useGameStore((state) => state.setWalkTarget);
  const lights = useGameStore((state) => state.lights);
  const targetedInteractable = useGameStore(
    (state) => state.targetedInteractable
  );

  const isOutside = playerZone === "outside";

  const handleEnterHouse = () => {
    setDoorOpen(true);
    setWalkTarget([0, 1.6, -2.2]);
  };

  const handleExitToPorch = () => {
    setDoorOpen(true);
    setWalkTarget([0, 1.6, 4.2]);
  };

  // Human readable location title
  const locationLabel =
    playerZone === "outside"
      ? "Outside Porch"
      : playerZone === "living-room"
      ? "Living Room"
      : "Museum Exhibition Gallery";

  return (
    <>
      {/* Interactive Glassmorphism Project Modal */}
      <ProjectModal />

      <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-4 sm:p-6 select-none">
        {/* Top Bar: Navigation & Zone Indicator */}
        <header className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {/* Contextual Enter / Exit Button */}
            {isOutside ? (
              <button
                type="button"
                onClick={handleEnterHouse}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs sm:text-sm font-bold tracking-wide shadow-lg border border-amber-300/60 hover:scale-105 active:scale-95 transition-all"
                aria-label="Enter through front door into room"
              >
                <span>🚪</span>
                <span>{doorOpen ? "Step Inside" : "Open & Enter"}</span>
                <span className="text-xs">▶</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExitToPorch}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all"
                aria-label="Exit room to outside porch"
              >
                <span>←</span>
                <span>Exit to Porch</span>
              </button>
            )}

            {/* Static View Link */}
            <Link
              href="/portfolio"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all"
              aria-label="Switch to static scrolling portfolio"
            >
              <span>Static view</span>
              <span className="text-stone-400">📄</span>
            </Link>
          </div>

          {/* Status Badge: Current Location & Light Switches */}
          <div className="flex items-center gap-3">
            {/* Location Badge */}
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-800 text-xs text-stone-300 pointer-events-auto">
              <span
                className={`w-2 h-2 rounded-full ${
                  playerZone === "outside"
                    ? "bg-amber-400 animate-pulse"
                    : playerZone === "living-room"
                    ? "bg-emerald-400"
                    : "bg-purple-400 shadow-[0_0_8px_#a855f7]"
                }`}
              />
              <span className="font-medium">{locationLabel}</span>
            </div>

            {/* Light Switches Pill */}
            {!isOutside && (
              <div className="hidden md:flex items-center gap-2 bg-stone-900/80 backdrop-blur-md border border-stone-800 px-3 py-1.5 rounded-full text-xs text-stone-300 pointer-events-auto">
                <span className="text-stone-400 text-[11px]">Lights:</span>
                {lights.map((l) => (
                  <span
                    key={l.id}
                    className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded-full ${
                      l.on
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-stone-800 text-stone-500 border border-stone-700"
                    }`}
                  >
                    <span
                      className={`w-1 h-1 rounded-full ${
                        l.on ? "bg-amber-400" : "bg-stone-600"
                      }`}
                    />
                    {l.name.split(" ")[0]}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Center Targeting Reticle & Interactive Distance Prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`rounded-full transition-all duration-200 ${
              targetedInteractable
                ? "w-4 h-4 border-2 border-amber-400 bg-amber-400/25 scale-125"
                : "w-1.5 h-1.5 bg-white/60 ring-1 ring-black/40"
            }`}
          />
          {targetedInteractable && (
            <div className="mt-3 px-3.5 py-1.5 rounded-full bg-stone-900/95 border border-amber-400/70 text-amber-300 text-[11px] font-mono tracking-wide backdrop-blur-xl shadow-2xl flex items-center gap-2">
              <span className="px-1.5 py-0.5 bg-amber-500/25 rounded text-[10px] text-amber-200 font-bold border border-amber-400/50">
                Click / E
              </span>
              <span>{targetedInteractable.actionText}</span>
            </div>
          )}
        </div>

        {/* Bottom Center: Interaction Hint */}
        <div className="flex justify-center pb-16 sm:pb-4 w-full">
          <InteractionHint
            hasInteracted={hasInteracted}
            onDismiss={onDismissHint}
          />
        </div>
      </div>
    </>
  );
};
