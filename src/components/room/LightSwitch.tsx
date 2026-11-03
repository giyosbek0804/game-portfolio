"use client";

import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";

interface SingleSwitchProps {
  id: string;
  name: string;
  position: [number, number, number];
}

const SingleSwitch: React.FC<SingleSwitchProps> = ({ id, name, position }) => {
  const lights = useGameStore((state) => state.lights);
  const toggleLight = useGameStore((state) => state.toggleLight);

  const light = lights.find((l) => l.id === id);
  const isOn = light?.on ?? false;

  const toggleMeshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Target toggle rotation: tilted up when ON (+0.3 rad), tilted down when OFF (-0.3 rad)
  const targetRotation = isOn ? 0.3 : -0.3;

  useFrame((_, delta) => {
    if (toggleMeshRef.current) {
      toggleMeshRef.current.rotation.x = THREE.MathUtils.lerp(
        toggleMeshRef.current.rotation.x,
        targetRotation,
        delta * 18
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    toggleLight(id);
  };

  return (
    <group position={position}>
      {/* Switch Faceplate */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.26, 0.42, 0.02]} />
        <meshStandardMaterial
          color={hovered ? "#475569" : "#334155"}
          roughness={0.6}
          metalness={0.2}
        />
      </mesh>

      {/* Decorative Bezel */}
      <mesh position={[0, 0, 0.012]}>
        <boxGeometry args={[0.16, 0.28, 0.01]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} />
      </mesh>

      {/* Interactive Toggle Rocker with flip animation */}
      <mesh
        ref={toggleMeshRef}
        position={[0, 0, 0.022]}
        onClick={handleClick}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <boxGeometry args={[0.1, 0.18, 0.04]} />
        <meshStandardMaterial
          color={isOn ? "#f59e0b" : "#64748b"}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Tiny Status Indicator LED Light on switch plate */}
      <mesh position={[0, 0.16, 0.015]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshBasicMaterial color={isOn ? "#22c55e" : "#ef4444"} />
      </mesh>
    </group>
  );
};

export const LightSwitchPanel: React.FC = () => {
  // Mount both switches side by side at comfortable eye level (y = 1.45) on North Wall (z = -6.94)
  return (
    <group name="light-switches-panel" position={[-1.2, 1.45, -6.94]}>
      {/* Wall backing bracket */}
      <mesh position={[0.2, 0, -0.01]}>
        <boxGeometry args={[0.76, 0.52, 0.015]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Switch 1: Ceiling Chandelier */}
      <SingleSwitch id="light-1" name="Ceiling Light" position={[0, 0, 0]} />

      {/* Switch 2: Desk/Wall Lamp */}
      <SingleSwitch id="light-2" name="Wall Lamp" position={[0.4, 0, 0]} />
    </group>
  );
};

