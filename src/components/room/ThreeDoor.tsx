"use client";

import React, { useRef, useMemo, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { createDoorTexture } from "@/utils/textureGenerators";

interface ThreeDoorProps {
  position?: [number, number, number];
}

export const ThreeDoor: React.FC<ThreeDoorProps> = ({
  position = [0, 0, 0],
}) => {
  const doorOpen = useGameStore((state) => state.doorOpen);
  const toggleDoor = useGameStore((state) => state.toggleDoor);
  const targetedInteractable = useGameStore((state) => state.targetedInteractable);

  const pivotRef = useRef<THREE.Group>(null);
  const [handleHovered, setHandleHovered] = useState(false);

  const isTargeted = targetedInteractable?.type === "door";

  // Generate procedural mahogany door texture once
  const doorTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createDoorTexture();
  }, []);

  const doorMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: doorTexture ?? undefined,
      color: doorTexture ? "#ffffff" : "#451a03",
      roughness: 0.6,
      metalness: 0.15,
    });
  }, [doorTexture]);

  // Target angle: 0 (closed), -1.8 rad (open inward into room)
  const targetRotation = doorOpen ? -1.8 : 0;

  useFrame((_, delta) => {
    if (pivotRef.current) {
      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        pivotRef.current.rotation.y,
        targetRotation,
        delta * 3.5
      );
    }
  });

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHandleHovered(true);
    document.body.style.cursor = "pointer";
  };

  const handlePointerOut = () => {
    setHandleHovered(false);
    document.body.style.cursor = "default";
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    toggleDoor();
  };

  const doorWidth = 1.35;
  const doorHeight = 2.45;
  const doorThickness = 0.055;

  return (
    <group position={position} name="doorway-assembly">
      {/* Door Frame Surround (Jambs + Header) */}
      {/* Left Frame */}
      <mesh position={[-doorWidth / 2 - 0.045, doorHeight / 2, 0]}>
        <boxGeometry args={[0.09, doorHeight + 0.1, 0.16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.7} />
      </mesh>
      {/* Right Frame */}
      <mesh position={[doorWidth / 2 + 0.045, doorHeight / 2, 0]}>
        <boxGeometry args={[0.09, doorHeight + 0.1, 0.16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.7} />
      </mesh>
      {/* Top Header Lintel */}
      <mesh position={[0, doorHeight + 0.045, 0]}>
        <boxGeometry args={[doorWidth + 0.18, 0.09, 0.16]} />
        <meshStandardMaterial color="#1c1917" roughness={0.7} />
      </mesh>
      {/* Stone Threshold step */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[doorWidth + 0.18, 0.04, 0.24]} />
        <meshStandardMaterial color="#292524" roughness={0.9} />
      </mesh>

      {/* Door Hinge Pivot Group (hinged at left edge: x = -doorWidth / 2) */}
      <group
        ref={pivotRef}
        position={[-doorWidth / 2, 0, 0]}
        name="door-hinge-pivot"
      >
        {/* Door Leaf (offset by +doorWidth/2 so pivot is at hinge edge) */}
        <group position={[doorWidth / 2, doorHeight / 2, 0]}>
          <mesh
            material={doorMaterial}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
          </mesh>

          {/* Brass Door Handle Assembly */}
          <group
            position={[doorWidth / 2 - 0.12, 0, 0]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            userData={{
              isInteractable: true,
              type: "door",
              id: "front-door",
              name: "Front Door",
            }}
          >
            {/* Generous Invisible Hitbox for distance targeting */}
            <mesh position={[0, 0, 0]} visible={false}>
              <boxGeometry args={[0.3, 0.4, 0.25]} />
            </mesh>

            {/* Front Handle Escutcheon Plate */}
            <mesh position={[0, 0, doorThickness / 2 + 0.006]}>
              <boxGeometry args={[0.06, 0.22, 0.012]} />
              <meshStandardMaterial
                color={handleHovered || isTargeted ? "#fef08a" : "#d97706"}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
            {/* Front Lever Handle */}
            <mesh position={[-0.04, 0.04, doorThickness / 2 + 0.035]}>
              <boxGeometry args={[0.1, 0.024, 0.02]} />
              <meshStandardMaterial
                color={handleHovered || isTargeted ? "#fef08a" : "#d97706"}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>

            {/* Back Handle (interior side) */}
            <mesh position={[0, 0, -doorThickness / 2 - 0.006]}>
              <boxGeometry args={[0.06, 0.22, 0.012]} />
              <meshStandardMaterial
                color={handleHovered || isTargeted ? "#fef08a" : "#d97706"}
                metalness={0.85}
                roughness={0.2}
              />
            </mesh>
            <mesh position={[-0.04, 0.04, -doorThickness / 2 - 0.035]}>
              <boxGeometry args={[0.1, 0.024, 0.02]} />
              <meshStandardMaterial
                color={handleHovered || isTargeted ? "#fef08a" : "#d97706"}
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
