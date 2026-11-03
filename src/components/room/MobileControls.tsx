"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

export interface MobileMoveVector {
  x: number; // Strafe: -1 (left) to +1 (right)
  y: number; // Forward/Back: -1 (backward) to +1 (forward)
}

interface MobileControlsProps {
  onMove: (vector: MobileMoveVector) => void;
  onLook: (deltaX: number, deltaY: number) => void;
  onInteraction?: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMove,
  onLook,
  onInteraction,
}) => {
  const [isTouch, setIsTouch] = useState(false);
  const joystickRef = useRef<HTMLDivElement>(null);
  const knobRef = useRef<HTMLDivElement>(null);

  // Active touch tracking
  const joystickTouchId = useRef<number | null>(null);
  const lookTouchId = useRef<number | null>(null);
  const lastLookPos = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

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
      onInteraction?.();
      const joystickRect = joystickRef.current?.getBoundingClientRect();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Check if touch is within bottom-left joystick region
        if (
          joystickRect &&
          touch.clientX >= joystickRect.left - 20 &&
          touch.clientX <= joystickRect.right + 20 &&
          touch.clientY >= joystickRect.top - 20 &&
          touch.clientY <= joystickRect.bottom + 20 &&
          joystickTouchId.current === null
        ) {
          joystickTouchId.current = touch.identifier;
        } else if (lookTouchId.current === null) {
          // Touch is in looking region
          lookTouchId.current = touch.identifier;
          lastLookPos.current = { x: touch.clientX, y: touch.clientY };
        }
      }
    },
    [onInteraction]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      const joystickRect = joystickRef.current?.getBoundingClientRect();

      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        // Handle Joystick move
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

        // Handle Drag-to-Look move
        if (touch.identifier === lookTouchId.current) {
          const deltaX = touch.clientX - lastLookPos.current.x;
          const deltaY = touch.clientY - lastLookPos.current.y;
          lastLookPos.current = { x: touch.clientX, y: touch.clientY };

          onLook(deltaX, deltaY);
        }
      }
    },
    [onMove, onLook]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];

        if (touch.identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          if (knobRef.current) {
            knobRef.current.style.transform = "translate(0px, 0px)";
          }
          onMove({ x: 0, y: 0 });
        }

        if (touch.identifier === lookTouchId.current) {
          lookTouchId.current = null;
        }
      }
    },
    [onMove]
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

  if (!isTouch) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-20 select-none"
      aria-hidden="true"
    >
      {/* On-screen virtual joystick container at bottom-left */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-28 h-28 rounded-full bg-stone-900/50 backdrop-blur-md border-2 border-stone-600/40 flex items-center justify-center shadow-2xl"
        >
          {/* Subtle directional indicators */}
          <div className="absolute top-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute bottom-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute left-2 w-1.5 h-1.5 rounded-full bg-white/20" />
          <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/20" />

          {/* Joystick movable thumb knob */}
          <div
            ref={knobRef}
            className="w-12 h-12 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-md border border-amber-200/50 flex items-center justify-center"
          >
            <div className="w-4 h-4 rounded-full bg-stone-950/20" />
          </div>
        </div>
      </div>
    </div>
  );
};

