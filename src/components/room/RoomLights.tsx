"use client";

import React from "react";
import { useGameStore } from "@/store/useGameStore";

export const RoomLights: React.FC = () => {
  const lights = useGameStore((state) => state.lights);

  const ceilingOn = lights.find((l) => l.id === "ceiling")?.on ?? true;
  const anyPaintingOn = lights.some(
    (l) => l.id.startsWith("painting-") && l.on
  );
  const anyLightOn = ceilingOn || anyPaintingOn;

  // Dynamic ambient light:
  // - Ceiling on: bright comfortable room (0.36)
  // - Only gallery paintings on: moody dramatic gallery focus (0.14)
  // - All lights off: deep dark moonlight (0.04)
  const ambientIntensity = ceilingOn ? 0.36 : anyPaintingOn ? 0.14 : 0.04;
  const ambientColor = anyLightOn ? "#fef3c7" : "#1e293b";

  return (
    <group name="house-lighting">
      {/* Global Ambient Room Tone */}
      <ambientLight color={ambientColor} intensity={ambientIntensity} />

      {/* ========================================================= */}
      {/* 1. EXTERIOR PORCH LIGHT (Always glowing warm welcome)     */}
      {/* ========================================================= */}
      <group position={[0, 2.9, 0.45]} name="porch-lantern">
        <pointLight
          color="#f59e0b"
          intensity={16}
          distance={12}
          decay={2}
        />
        {/* Lantern Arm */}
        <mesh position={[0, 0.12, -0.2]}>
          <boxGeometry args={[0.04, 0.04, 0.4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Lantern Cap */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.02, 0.18, 0.1, 4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
        {/* Lantern Glowing Core */}
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[0.16, 0.22, 0.16]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>
        {/* Lantern Finial */}
        <mesh position={[0, -0.14, 0]}>
          <coneGeometry args={[0.05, 0.1, 4]} />
          <meshStandardMaterial color="#0f172a" roughness={0.6} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 2. REALISTIC INTERIOR CEILING PENDANT LAMP               */}
      {/* ========================================================= */}
      <group position={[0, 3.5, -3.5]} name="ceiling-lamp-fixture">
        {/* Ceiling Mount Canopy Plate */}
        <mesh position={[0, -0.02, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
          <meshStandardMaterial color="#1c1917" roughness={0.6} />
        </mesh>

        {/* Hanging Suspension Cord Drop */}
        <mesh position={[0, -0.42, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.8, 8]} />
          <meshStandardMaterial color="#0c0a09" roughness={0.9} />
        </mesh>

        {/* Brass Socket Cap */}
        <mesh position={[0, -0.84, 0]}>
          <cylinderGeometry args={[0.045, 0.045, 0.08, 16]} />
          <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Flared Architectural Lamp Shade Dome */}
        <mesh position={[0, -0.98, 0]}>
          <cylinderGeometry args={[0.12, 0.38, 0.26, 24, 1, true]} />
          <meshStandardMaterial
            color="#292524"
            roughness={0.6}
            metalness={0.2}
            side={2}
          />
        </mesh>

        {/* Glowing Incandescent Light Bulb inside the shade */}
        <mesh position={[0, -0.95, 0]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          {ceilingOn ? (
            <meshBasicMaterial color="#fffbeb" />
          ) : (
            <meshStandardMaterial color="#78716c" roughness={0.3} />
          )}
        </mesh>

        {/* Actual Point Light Source */}
        {ceilingOn && (
          <pointLight
            position={[0, -1.02, 0]}
            color="#fff3d6"
            intensity={26}
            distance={16}
            decay={2}
          />
        )}
      </group>
    </group>
  );
};
