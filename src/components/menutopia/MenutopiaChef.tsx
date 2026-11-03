"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";

interface MenutopiaChefProps {
  type: "grill" | "plating";
  position: [number, number, number];
  rotation?: [number, number, number];
}

export const MenutopiaChef: React.FC<MenutopiaChefProps> = ({
  type,
  position,
  rotation = [0, 0, 0],
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    // LOD Performance check
    const playerZone = useGameStore.getState().playerZone;
    if (playerZone !== "menutopia") return;

    const time = state.clock.elapsedTime;

    if (type === "grill") {
      // GRILL CHEF: Flipping patties with spatula
      // Arm scoops and flips every ~3 seconds
      const flipCycle = (time % 3.2) / 3.2;

      if (rightArmRef.current) {
        if (flipCycle > 0.65 && flipCycle < 0.85) {
          // Flip motion: upward flick of wrist and spatula
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
            rightArmRef.current.rotation.x,
            -Math.PI * 0.48,
            delta * 12
          );
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
            rightArmRef.current.rotation.z,
            0.25,
            delta * 12
          );
        } else {
          // Resting over hot grill / gently pressing patty
          const press = Math.sin(time * 3.5) * 0.05;
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
            rightArmRef.current.rotation.x,
            -0.85 + press,
            delta * 5
          );
          rightArmRef.current.rotation.z = 0.12;
        }
      }

      if (leftArmRef.current) {
        // Left hand steadying grill edge or holding towel
        leftArmRef.current.rotation.x = -0.55;
        leftArmRef.current.rotation.z = -0.15;
      }

      if (headRef.current) {
        // Looking down attentively at the sizzling patties
        headRef.current.rotation.x = 0.22 + Math.sin(time * 1.5) * 0.04;
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.1;
      }
    } else {
      // PLATING CHEF: Assembling buns, fries, and sliding trays
      const prepCycle = Math.sin(time * 2.5);

      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = -0.75 + prepCycle * 0.12;
        rightArmRef.current.rotation.z = 0.18;
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.7 - prepCycle * 0.1;
        leftArmRef.current.rotation.z = -0.18;
      }

      if (headRef.current) {
        headRef.current.rotation.x = 0.25;
        headRef.current.rotation.y = Math.sin(time * 1.2) * 0.12;
      }
    }
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      {/* Contact Shadow Disc on Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Legs (Standing in Kitchen Non-slip Pants) */}
      <group position={[0, 0.62, 0]}>
        {/* Left Leg */}
        <group position={[-0.1, 0, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.042, 0.035, 0.6, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.6, 0.04]}>
            <boxGeometry args={[0.08, 0.045, 0.15]} />
            <meshStandardMaterial color="#020617" roughness={0.4} />
          </mesh>
        </group>
        {/* Right Leg */}
        <group position={[0.1, 0, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.042, 0.035, 0.6, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.6, 0.04]}>
            <boxGeometry args={[0.08, 0.045, 0.15]} />
            <meshStandardMaterial color="#020617" roughness={0.4} />
          </mesh>
        </group>
      </group>

      {/* Upper Body (White Double-Breasted Chef Jacket & Apron) */}
      <group position={[0, 0.68, 0]}>
        {/* Pelvis */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Torso: Crisp White Chef Coat */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.16, 0.138, 0.44, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.35} />
        </mesh>

        {/* Chef Apron Bib (Dark Charcoal) */}
        <mesh position={[0, 0.22, 0.14]}>
          <boxGeometry args={[0.22, 0.38, 0.01]} />
          <meshStandardMaterial color="#1e293b" roughness={0.7} />
        </mesh>

        {/* Red Neckerchief (Scarf) */}
        <mesh position={[0, 0.46, 0.1]}>
          <boxGeometry args={[0.12, 0.06, 0.08]} />
          <meshStandardMaterial color="#dc2626" />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 0.66, 0]}>
          {/* Mannequin Head Sphere */}
          <mesh>
            <sphereGeometry args={[0.165, 20, 20]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
          </mesh>
          {/* Chef Visor Stripe */}
          <mesh position={[0, 0.02, 0.14]}>
            <boxGeometry args={[0.14, 0.028, 0.03]} />
            <meshStandardMaterial
              color="#dc2626"
              emissive="#dc2626"
              emissiveIntensity={0.6}
            />
          </mesh>

          {/* Tall White Toque Chef Hat */}
          <group position={[0, 0.18, 0]}>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.15, 0.16, 0.06, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.14, 0]}>
              <cylinderGeometry args={[0.17, 0.14, 0.18, 16]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
            {/* Crown pleats */}
            <mesh position={[0, 0.23, 0]}>
              <sphereGeometry args={[0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
              <meshStandardMaterial color="#f8fafc" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.2, 0.42, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.2, 0.42, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          {/* Commercial Stainless Steel Spatula in Hand (for Grill Chef) */}
          {type === "grill" && (
            <group position={[0, -0.48, 0.12]} rotation={[0.4, 0, 0]}>
              {/* Spatula Handle */}
              <mesh position={[0, 0, -0.1]}>
                <cylinderGeometry args={[0.012, 0.012, 0.16, 8]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              {/* Metal Neck */}
              <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.02, 0.08, 0.004]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
              {/* Slotted Turner Blade */}
              <mesh position={[0, -0.01, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
                <boxGeometry args={[0.075, 0.12, 0.004]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
};

