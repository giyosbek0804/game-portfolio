"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { useGameStore } from "@/store/useGameStore";

export interface MobileMoveVector {
  x: number; // Strafe: -1 (left) to +1 (right)
  y: number; // Forward/Back: -1 (backward) to +1 (forward)
}

interface MobileControlsProps {
  onMove: (vector: MobileMoveVector) => void;
  onLook: (deltaX: number, deltaY: number) => void;
  onInteraction?: () => void;
  onAction?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onLook,
  onInteraction,
  onAction,
}) => {
  const [isTouch, setIsTouch] = useState(false);
  const targetedInteractable = useGameStore((state) => state.targetedInteractable);
  const activeProject = useGameStore((state) => state.activeProject);

  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  // Active touch tracking
  const joystickTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchStartTime = useRef<number>(0);
  const touchStartPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch(
        "ontouchstart" in window ||
          navigator.maxTouchPoints > 0 ||
          window.matchMedia("(pointer: coarse)").matches
      );
    };
    checkTouch();
  }, []);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (activeProject) return;
      onInteraction?.();
      const joystickRect = joystickRef.current?.getBoundingClientRect();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Check if touch is within bottom-left joystick region
        if (
          joystickRect &&
          touch.clientX >= joystickRect.left - 25 &&
          touch.clientX <= joystickRect.right + 25 &&
          touch.clientY >= joystickRect.top - 25 &&
          touch.clientY <= joystickRect.bottom + 25 &&
          joystickTouchId.current === null
        ) {
          joystickTouchId.current = touch.identifier;
        } else if (lookTouchId.current === null) {
          // Touch is in looking / tapping region
          lookTouchId.current = touch.identifier;
          lastLookPos.current = { x: touch.clientX, y: touch.clientY };
          touchStartPos.current = { x: touch.clientX, y: touch.clientY };
          touchStartTime.current = Date.now();
        }
      }
    },
    [onInteraction, activeProject]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (activeProject) return;
      const joystickRect = joystickRef.current?.getBoundingClientRect();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Handle Joystick move (Walking)
        if (touch.identifier === joystickTouchId.current && joystickRect) {
          const centerX = joystickRect.left + joystickRect.width / 2;
          const centerY = joystickRect.top + joystickRect.height / 2;
          const maxRadius = joystickRect.width / 2;

          let dx = touch.clientX - centerX;
          let dy = touch.clientY - centerY;
          const distance = Math.hypot(dx, dy);

          if (distance > maxRadius) {
            dx = (dx / distance) * maxRadius;
            dy = (dy / distance) * maxRadius;
          }

          if (knobRef.current) {
            knobRef.current.style.transform = `translate(${dx}px, ${dy}px)`;
          }

          // Invert dy so pushing up means moving forward (+1)
          onMove({
            x: dx / maxRadius,
            y: -dy / maxRadius,
          });
        }

        // Handle Drag-to-Look move (Camera rotation)
        if (touch.identifier === lookTouchId.current) {
          const deltaX = touch.clientX - lastLookPos.current.x;
          const deltaY = touch.clientY - lastLookPos.current.y;
          lastLookPos.current = { x: touch.clientX, y: touch.clientY };

          onLook(deltaX, deltaY);
        }
      }
    },
    [onMove, onLook, activeProject]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Release joystick
        if (touch.identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          if (knobRef.current) {
            knobRef.current.style.transform = "translate(0px, 0px)";
          }
          onMove({ x: 0, y: 0 });
        }

        // Release look touch -> Detect if it was a quick TAP
        if (touch.identifier === lookTouchId.current) {
          lookTouchId.current = null;
          const duration = Date.now() - touchStartTime.current;
          const moveDist = Math.hypot(
            touch.clientX - touchStartPos.current.x,
            touch.clientY - touchStartPos.current.y
          );

          // If finger tapped for < 240ms with < 12px drag, trigger action!
          if (duration < 240 && moveDist < 12) {
            onAction?.();
          }
        }
      }
    },
    [onMove, onAction]
  );

  useEffect(() => {
    if (!isTouch) return;

    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
      window.removeEventListener("touchcancel", handleTouchEnd);
    };
  }, [isTouch, handleTouchStart, handleTouchMove, handleTouchEnd]);

  if (!isTouch || activeProject) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 select-none touch-none"
      aria-hidden="true"
    >
      {/* 1. On-Screen Virtual Joystick at bottom-left */}
      <div className="absolute bottom-8 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-28 h-28 rounded-full bg-stone-900/60 backdrop-blur-md border-2 border-stone-600/50 flex items-center justify-center shadow-2xl"
        >
          {/* Directional ticks */}
          <div className="absolute top-2.5 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute bottom-2.5 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute left-2.5 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute right-2.5 w-1.5 h-1.5 rounded-full bg-white/20" />

          {/* Thumb stick knob */}
          <div
            ref={knobRef}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-lg border border-amber-200/50 flex items-center justify-center pointer-events-none"
          >
            <div className="w-3.5 h-3.5 rounded-full bg-stone-950/25" />
          </div>
        </div>
        <div className="text-[10px] text-center text-stone-400 font-mono mt-1 opacity-70">
          Walk
        </div>
      </div>

      {/* 2. Dedicated Mobile Action Button at bottom-right (when aiming at switch/door/pedestal) */}
      {targetedInteractable && (
        <div className="absolute bottom-8 right-6 pointer-events-auto flex flex-col items-center gap-1.5 animate-bounce">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAction?.();
            }}
            className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 border-2 border-amber-200 shadow-[0_0_25px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center text-stone-950 font-bold active:scale-90 transition-transform"
            aria-label={targetedInteractable.actionText}
          >
            <span className="text-2xl leading-none">
              {targetedInteractable.type === "switch"
                ? "💡"
                : targetedInteractable.type === "door"
                ? "🚪"
                : targetedInteractable.type === "visitor"
                ? "👋"
                : "🔍"}
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider mt-0.5 font-extrabold">
              {targetedInteractable.type === "pedestal"
                ? "Inspect"
                : targetedInteractable.type === "visitor"
                ? "Talk"
                : "Tap"}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};
