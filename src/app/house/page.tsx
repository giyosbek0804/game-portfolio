"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { WebGLFallback } from "@/components/room/WebGLFallback";

/**
 * Loading spinner / splash while the 3D canvas and shaders initialize
 */
function RoomLoader() {
  return (
    <div className="min-h-screen w-full bg-stone-950 flex flex-col items-center justify-center gap-4 text-stone-200">
      <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
      <span className="text-xs uppercase tracking-widest text-stone-400 font-medium">
        Entering Room...
      </span>
    </div>
  );
}

// Lazy-load the 3D RoomScene component with ssr: false
const DynamicRoomScene = dynamic(
  () => import("@/components/room/RoomScene"),
  {
    ssr: false,
    loading: () => <RoomLoader />,
  }
);

export default function HousePage() {
  const { isChecking, isSupported } = useWebGLSupport();

  if (isChecking) {
    return <RoomLoader />;
  }

  if (!isSupported) {
    return <WebGLFallback />;
  }

  return <DynamicRoomScene />;
}
