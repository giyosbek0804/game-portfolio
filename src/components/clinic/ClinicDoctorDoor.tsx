"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useClinicQueueStore } from "@/store/useClinicQueueStore";

interface ClinicDoctorDoorProps {
  position?: [number, number, number];
}

export const ClinicDoctorDoor: React.FC<ClinicDoctorDoorProps> = ({
  position = [-10.5, 0, -13.5],
}) => {
  const doctorDoorOpen = useClinicQueueStore((state) => state.doctorDoorOpen);
  const setDoctorDoorOpen = useClinicQueueStore((state) => state.setDoctorDoorOpen);

  const pivotRef = useRef<THREE.Group>(null);
  const doorWidth = 1.15;
  const doorHeight = 2.35;
  const doorThickness = 0.05;

  // Door swings open into doctor's office: 0 (closed) to -1.55 rad (open)
  const targetRotation = doctorDoorOpen ? -1.55 : 0;

  useFrame((_, delta) => {
    if (pivotRef.current) {
      pivotRef.current.rotation.y = THREE.MathUtils.lerp(
        pivotRef.current.rotation.y,
        targetRotation,
        delta * 3.2
      );
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setDoctorDoorOpen(!doctorDoorOpen);
  };

  return (
    <group position={position} name="doctor-office-doorway">
      {/* Outer Door Frame Surround */}
      {/* Left Frame Jamb */}
      <mesh position={[-doorWidth / 2 - 0.04, doorHeight / 2, 0]}>
        <boxGeometry args={[0.08, doorHeight + 0.08, 0.15]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Right Frame Jamb */}
      <mesh position={[doorWidth / 2 + 0.04, doorHeight / 2, 0]}>
        <boxGeometry args={[0.08, doorHeight + 0.08, 0.15]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Top Header Lintel */}
      <mesh position={[0, doorHeight + 0.04, 0]}>
        <boxGeometry args={[doorWidth + 0.16, 0.08, 0.15]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>

      {/* Aluminum Door Threshold */}
      <mesh position={[0, 0.015, 0]}>
        <boxGeometry args={[doorWidth + 0.16, 0.03, 0.18]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Hinge Pivot (Hinged at left jamb: x = -doorWidth / 2) */}
      <group ref={pivotRef} position={[-doorWidth / 2, 0, 0]}>
        {/* Door Leaf (offset by +doorWidth/2) */}
        <group position={[doorWidth / 2, doorHeight / 2, 0]}>
          {/* Main Door Slab (Clean Medical White) */}
          <mesh onClick={handleClick}>
            <boxGeometry args={[doorWidth, doorHeight, doorThickness]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.4}
              metalness={0.05}
            />
          </mesh>

          {/* Frosted Vision Panel Window */}
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[0.28, 0.65, doorThickness + 0.005]} />
            <meshStandardMaterial
              color="#99f6e4"
              roughness={0.1}
              metalness={0.2}
              transparent
              opacity={0.65}
            />
          </mesh>

          {/* Brass Doctor Door Sign Plate: DR. A. KARIMOV */}
          <group position={[0, -0.15, doorThickness / 2 + 0.006]}>
            <mesh>
              <boxGeometry args={[0.34, 0.12, 0.008]} />
              <meshStandardMaterial
                color="#0f172a"
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>
            <mesh position={[0, 0.02, 0.005]}>
              <planeGeometry args={[0.3, 0.03]} />
              <meshBasicMaterial color="#38bdf8" />
            </mesh>
            <mesh position={[0, -0.02, 0.005]}>
              <planeGeometry args={[0.24, 0.02]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          </group>

          {/* Lever Handle & Strike Plate */}
          <group position={[doorWidth / 2 - 0.1, -0.08, 0]}>
            {/* Front Lever */}
            <mesh position={[0, 0, doorThickness / 2 + 0.035]}>
              <boxGeometry args={[0.13, 0.025, 0.015]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Stem */}
            <mesh position={[-0.05, 0, doorThickness / 2 + 0.018]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.012, 0.012, 0.035, 12]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.1} />
            </mesh>
            {/* Escutcheon plate */}
            <mesh position={[-0.05, 0, doorThickness / 2 + 0.003]}>
              <boxGeometry args={[0.045, 0.14, 0.005]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
