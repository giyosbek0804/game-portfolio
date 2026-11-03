"use client";

import React, { useState } from "react";
import { CSSWall } from "./CSSWall";
import { CSSDoor } from "./CSSDoor";
import { EntranceButtons } from "./EntranceButtons";
import { DoorwayTransition } from "@/components/transition/DoorwayTransition";

interface HouseExteriorProps {
  wallTextureUrl?: string;
  doorTextureUrl?: string;
}

/**
 * HouseExterior coordinates the Phase 1 exterior scene & Phase 2 transition:
 * - Roof eave and porch overhang
 * - CSS walls with customizable textures/colors
 * - 3D hinged front door with interactive handle
 * - Entrance buttons (Enter / Static view)
 * - Porch light ambiance and welcoming aesthetic
 * - Phase 2 zoom/fade doorway transition into the 3D room
 */
export const HouseExterior: React.FC<HouseExteriorProps> = ({
  wallTextureUrl,
  doorTextureUrl,
}) => {
  const [isZooming, setIsZooming] = useState(false);

  return (
    <main className="relative min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden select-none">
      {/* Phase 2: Fade overlay & navigation controller */}
      <DoorwayTransition onZoomChange={setIsZooming} />

      {/* Night Sky / Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-stone-950 to-black pointer-events-none" />

      {/* Subtle Star / Night Sparkles */}
      <div
        className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_20%_20%,_white_1px,_transparent_1px),radial-gradient(circle_at_80%_30%,_white_1px,_transparent_1px),radial-gradient(circle_at_45%_15%,_white_1px,_transparent_1px)] bg-[size:180px_180px]"
        aria-hidden="true"
      />

      {/* Top Header / Brand Title */}
      <header
        className={`relative z-10 w-full px-6 py-6 flex justify-between items-center max-w-6xl mx-auto transition-opacity duration-500 ${
          isZooming ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div>
          <span className="text-xs uppercase tracking-widest text-amber-500 font-bold block mb-1">
            Interactive 3D Experience
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white drop-shadow">
            Portfolio House
          </h1>
        </div>

        <div className="text-xs text-stone-400 hidden sm:block border border-stone-800 rounded-full px-4 py-1.5 bg-stone-900/60 backdrop-blur-sm">
          Press <kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 font-mono text-amber-400">Tab</kbd> to navigate
        </div>
      </header>

      {/* Main House Facade Section (zooms toward doorway during Phase 2 transition) */}
      <div
        className={`transition-zoom-container flex-1 flex flex-col justify-end ${
          isZooming ? "zooming" : ""
        }`}
      >
        <section className="relative z-10 flex-1 flex flex-col items-center justify-end px-4 pt-4 pb-0 max-w-5xl mx-auto w-full">
          {/* House Roof & Gutter Overhang */}
          <div className="w-full max-w-4xl h-8 bg-stone-900 border-b-4 border-amber-950/40 rounded-t-lg shadow-2xl relative flex items-center justify-center">
            <div className="w-full h-1 bg-stone-700/60 absolute bottom-0" />
            <div className="text-[10px] uppercase tracking-widest text-stone-500 font-medium">
              Residence No. 1
            </div>
          </div>

          {/* House Front Wall */}
          <CSSWall
            textureUrl={wallTextureUrl}
            className="w-full max-w-4xl min-h-[460px] sm:min-h-[520px] p-6 sm:p-10 flex flex-col justify-end"
          >
            {/* Porch Lamp (Glowing light source) */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none">
              <div className="w-3 h-6 bg-stone-700 rounded-t-sm" />
              <div className="relative w-8 h-10 bg-amber-200/90 rounded-b-md shadow-[0_0_50px_20px_rgba(245,158,11,0.35)] border border-amber-300 flex items-center justify-center">
                <div className="w-2.5 h-3.5 bg-amber-50 rounded-full blur-[1px] animate-pulse" />
              </div>
              {/* Ambient lamp glow spread on wall */}
              <div className="w-64 h-48 bg-amber-500/10 rounded-full blur-3xl -mt-6 pointer-events-none" />
            </div>

            {/* House Entrance Setup: Door + Buttons */}
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-14 my-auto pt-12">
              {/* 3D Hinged Door */}
              <div className="flex flex-col items-center">
                <CSSDoor textureUrl={doorTextureUrl} />
                <div
                  className={`mt-2 text-xs text-stone-400/80 italic text-center transition-opacity duration-300 ${
                    isZooming ? "opacity-0" : "opacity-100"
                  }`}
                >
                  Click handle or button to open
                </div>
              </div>

              {/* Entrance Buttons Panel */}
              <div
                className={`flex flex-col items-center md:items-start text-center md:text-left max-w-xs transition-opacity duration-300 ${
                  isZooming ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
              >
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-stone-100">
                    Welcome, Visitor
                  </h2>
                  <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                    Step inside to inspect projects in first-person 3D, or browse directly via static view.
                  </p>
                </div>

                {/* Action Buttons */}
                <EntranceButtons />
              </div>
            </div>
          </CSSWall>

          {/* Porch Stone Steps / Ground */}
          <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="w-full h-5 bg-stone-800 border-t border-stone-700 shadow-md" />
            <div className="w-[102%] h-6 bg-stone-900 border-t border-stone-800 shadow-lg" />
            <div className="w-[104%] h-8 bg-stone-950 border-t border-stone-900 shadow-2xl" />
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer
        className={`relative z-10 w-full py-4 text-center text-xs text-stone-600 bg-stone-950 border-t border-stone-900 transition-opacity duration-500 ${
          isZooming ? "opacity-0" : "opacity-100"
        }`}
      >
        Gaming 3D Portfolio • Phase 1 & 2
      </footer>
    </main>
  );
};
