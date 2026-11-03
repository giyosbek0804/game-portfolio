"use client";

import React, { useState, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useGameStore } from "@/store/useGameStore";
import { useClinicQueueStore } from "@/store/useClinicQueueStore";
import { RoomGeometry } from "./RoomGeometry";
import { RoomLights } from "./RoomLights";
import { FirstPersonCamera } from "./FirstPersonCamera";
import { InteractionManager } from "./InteractionManager";
import { MuseumVisitors } from "./MuseumVisitors";
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

  const handleMobileAction = useCallback(() => {
    const target = useGameStore.getState().targetedInteractable;
    if (!target) return;

    if (target.type === "switch") {
      useGameStore.getState().toggleLight(target.id);
    } else if (target.type === "door") {
      useGameStore.getState().toggleDoor();
    } else if (target.type === "pedestal" && target.data) {
      useGameStore.getState().setActiveProject(target.data as any);
    } else if (target.type === "visitor") {
      useGameStore.getState().interactWithVisitor(target.id);
    } else if (target.type === "kiosk") {
      useClinicQueueStore.getState().takeUserTicket();
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-stone-950 select-none touch-none">
      {/* HTML HUD Overlay above Canvas */}
      <RoomHUD
        hasInteracted={hasInteracted}
        onDismissHint={markInteracted}
      />

      {/* Mobile Touch Controls (Virtual Joystick + Drag to Look + Dedicated Action Button) */}
      <MobileControls
        onMove={setMobileMoveVector}
        onLook={handleMobileLook}
        onInteraction={markInteracted}
        onAction={handleMobileAction}
      />

      {/* R3F 3D Canvas: Wide 82 FOV for natural spacious peripheral vision, no shadows, no post-processing */}
      <Canvas
        dpr={[1, 1.5]}
        camera={{
          fov: 82,
          near: 0.1,
          far: 100,
          position: [0, 1.6, 5.0],
        }}
        shadows={false}
        gl={{
          antialias: true,
          powerPreference: "high-performance",
        }}
        className="w-full h-full block"
      >
        {/* Interaction raycaster manager (targets switches, door & pedestals up to 3.8m) */}
        <InteractionManager />

        {/* First Person FPS Camera with Bounds Clamping & Wide Spacing */}
        <FirstPersonCamera
          mobileMoveVector={mobileMoveVector}
          mobileLookDelta={mobileLookDelta}
          onInteraction={markInteracted}
        />

        {/* Room Architectural Geometry + Museum Room + Paintings */}
        <RoomGeometry />

        {/* Autonomous & Interactive Dummy Visitors */}
        <MuseumVisitors />

        {/* Dynamic Lights (Ceiling Lamp + Porch Lantern + Ambient Dimming) */}
        <RoomLights />
      </Canvas>
    </div>
  );
};

export default RoomScene;
