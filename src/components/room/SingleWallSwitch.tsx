"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";

interface SingleWallSwitchProps {
  lightId: string;
  label?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const SingleWallSwitch: React.FC<SingleWallSwitchProps> = ({
  lightId,
  label = "Light",
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) => {
  const lights = useGameStore((state) => state.lights);
  const toggleLight = useGameStore((state) => state.toggleLight);
  const targetedInteractable = useGameStore((state) => state.targetedInteractable);

  const light = lights.find((l) => l.id === lightId);
  const isOn = light?.on ?? false;

  const isTargeted = targetedInteractable?.id === lightId;
  const rockerRef = useRef<THREE.Mesh>(null);

  // Target rocker angle: +0.28 rad (ON, flipped up), -0.28 rad (OFF, flipped down)
  const targetAngle = isOn ? 0.28 : -0.28;

  useFrame((_, delta) => {
    if (rockerRef.current) {
      rockerRef.current.rotation.x = THREE.MathUtils.lerp(
        rockerRef.current.rotation.x,
        targetAngle,
        delta * 16
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    toggleLight(lightId);
  };

  return (
    <group
      position={position}
      rotation={rotation}
      name={`switch-${lightId}`}
      userData={{
        isInteractable: true,
        type: "switch",
        id: lightId,
        name: label,
      }}
    >
      {/* Generous Click/Raycast Invisible Hitbox for easy targeting from distance */}
      <mesh
        position={[0, 0, 0.05]}
        onClick={handleClick}
        visible={false}
      >
        <boxGeometry args={[0.38, 0.52, 0.12]} />
      </mesh>

      {/* Outer Glow Halo when targeted by crosshair */}
      {isTargeted && (
        <mesh position={[0, 0, 0.004]}>
          <boxGeometry args={[0.28, 0.42, 0.008]} />
          <meshBasicMaterial color="#f59e0b" />
        </mesh>
      )}

      {/* Wall Mounting Plate */}
      <mesh position={[0, 0, 0.008]} onClick={handleClick}>
        <boxGeometry args={[0.22, 0.36, 0.016]} />
        <meshStandardMaterial
          color={isTargeted ? "#475569" : "#1e293b"}
          roughness={0.5}
          metalness={0.2}
        />
      </mesh>

      {/* Plate Inner Bezel */}
      <mesh position={[0, 0, 0.018]}>
        <boxGeometry args={[0.14, 0.24, 0.008]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Interactive Rocker Lever */}
      <mesh
        ref={rockerRef}
        position={[0, 0, 0.026]}
        onClick={handleClick}
      >
        <boxGeometry args={[0.08, 0.16, 0.03]} />
        <meshStandardMaterial
          color={isOn ? "#f59e0b" : "#64748b"}
          roughness={0.3}
          metalness={0.3}
        />
      </mesh>

      {/* LED Status Light (Top) */}
      <mesh position={[0, 0.13, 0.02]}>
        <sphereGeometry args={[0.014, 10, 10]} />
        <meshBasicMaterial color={isOn ? "#22c55e" : "#ef4444"} />
      </mesh>
    </group>
  );
};
