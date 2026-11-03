"use client";

import React, { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { RoomGeometry } from "./RoomGeometry";
import { RoomLights } from "./RoomLights";
import { FirstPersonCamera } from "./FirstPersonCamera";
import { InteractionManager } from "./InteractionManager";
import { MobileControls, MobileMoveVector } from "./MobileControls";
import { RoomHUD } from "@/components/hud/RoomHUD";

export const RoomScene: React.FC = () => {
  const [hasInteracted, setHasInteracted] = useState(false);
  const [mobileMoveVector, setMobileMoveVector] = useState<MobileMoveVector>({
    x: 0,
    y: 0,
  });
  const [mobileLookDelta, setMobileLookDelta] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });

  const markInteracted = useCallback(() => {
    setHasInteracted(true);
  }, []);

  const handleMobileLook = useCallback((deltaX: number, deltaY: number) => {
    setMobileLookDelta({ x: deltaX, y: deltaY });
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 select-none">
      {/* HTML HUD Overlay above Canvas */}
      <RoomHUD
        hasInteracted={hasInteracted}
        onDismissHint={markInteracted}
      />

      {/* Mobile Touch Controls (Virtual Joystick + Drag to Look) */}
      <MobileControls
        onMove={setMobileMoveVector}
        onLook={handleMobileLook}
        onInteraction={markInteracted}
      />

      {/* R3F 3D Canvas: strictly dpr=[1, 1.5], no shadows, no post-processing */}
      <Canvas
        dpr={[1, 1.5]}
        shadows={false}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full block"
      >
        {/* Interaction raycaster manager (targets switches & door up to 3.8m) */}
        <InteractionManager />

        {/* First Person FPS Camera with Bounds Clamping */}
        <FirstPersonCamera
          mobileMoveVector={mobileMoveVector}
          mobileLookDelta={mobileLookDelta}
          onInteraction={markInteracted}
        />

        {/* Room Architectural Geometry + Paintings + Ceiling Door Switch */}
        <RoomGeometry />

        {/* Dynamic Lights (Ceiling Lamp + Porch Lantern + Ambient Dimming) */}
        <RoomLights />
      </Canvas>
    </div>
  );
};

export default RoomScene;
