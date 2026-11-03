"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/store/useGameStore";

export const WebGLFallback: React.FC = () => {
  const setDoorOpen = useGameStore((state) => state.setDoorOpen);

  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md bg-stone-900/90 border border-stone-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-4xl text-amber-500">⚠️</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            3D Graphics Unsupported
          </h2>
          <p className="text-sm text-stone-400 leading-relaxed">
            Your browser or device does not support WebGL hardware acceleration, or it is currently disabled.
          </p>
        </div>

        <p className="text-xs text-stone-500">
          You can browse the complete developer portfolio via the fast, accessible static view.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link
            href="/portfolio"
            className="px-6 py-3 rounded-lg bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-sm tracking-wide transition-colors"
          >
            Go to Static View 📄
          </Link>
          <Link
            href="/"
            onClick={() => setDoorOpen(false)}
            className="px-6 py-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium text-sm transition-colors border border-stone-700"
          >
            ← Return to Exterior
          </Link>
        </div>
      </div>
    </div>
  );
};

