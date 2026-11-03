"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useClinicQueueStore } from "@/store/useClinicQueueStore";
import { useGameStore } from "@/store/useGameStore";

export const ClinicDoctorFigure: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);

  const doctorStatus = useClinicQueueStore((state) => state.doctorStatus);
  const consultationRemaining = useClinicQueueStore(
    (state) => state.consultationRemaining
  );
  const isUserTurn = useClinicQueueStore((state) => state.isUserTurn);

  // Doctor sits behind desk at [-10.5, 0, -16.4] facing +Z towards patient chair
  const doctorPos = [-10.5, 0, -16.4] as const;

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const playerZone = useGameStore.getState().playerZone;
    if (playerZone !== "clinic") return;

    const time = state.clock.elapsedTime;
    const isHandingPaper = consultationRemaining <= 3.0 && consultationRemaining > 0 && !isUserTurn;

    // Head: Doctor glances between laptop and patient
    if (headRef.current) {
      if (isUserTurn) {
        // Welcomes the VIP user
        headRef.current.rotation.x = 0.08 + Math.sin(time * 2.0) * 0.03;
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.12;
      } else if (isHandingPaper) {
        // Looks directly at patient to hand prescription
        headRef.current.rotation.x = 0.12;
        headRef.current.rotation.y = 0;
      } else {
        // Typing on laptop / talking to patient
        const readingNotes = Math.sin(time * 0.6) > 0;
        const targetPitch = readingNotes ? 0.22 : 0.05;
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          targetPitch,
          delta * 3
        );
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          Math.sin(time * 1.2) * 0.08,
          delta * 3
        );
      }
    }

    // Right Arm: Hands prescription or types on laptop
    if (rightArmRef.current) {
      if (isHandingPaper) {
        // Extending arm forward across the desk to deliver prescription paper!
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          -Math.PI * 0.48,
          delta * 5
        );
        rightArmRef.current.rotation.y = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.y,
          0.1,
          delta * 5
        );
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          0.12,
          delta * 5
        );
      } else {
        // Hands typing on keyboard
        const typing = Math.sin(time * 12.0) * 0.04;
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          -0.65 + typing,
          delta * 4
        );
        rightArmRef.current.rotation.z = 0.15;
      }
    }

    // Left Arm: Resting on desk / typing
    if (leftArmRef.current) {
      const typing = Math.cos(time * 11.0) * 0.03;
      leftArmRef.current.rotation.x = -0.65 + typing;
      leftArmRef.current.rotation.z = -0.15;
    }
  });

  return (
    <group ref={groupRef} position={doctorPos} rotation={[0, 0, 0]}>
      {/* Contact Shadow on Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.35, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Doctor Swivel Office Chair */}
      <group position={[0, 0, 0]}>
        {/* Star Base & Wheels */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.04, 16]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.25, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
          <meshStandardMaterial color="#334155" metalness={0.9} />
        </mesh>
        {/* Chair Cushion */}
        <mesh position={[0, 0.45, 0]}>
          <boxGeometry args={[0.48, 0.08, 0.46]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
        {/* Chair Backrest */}
        <mesh position={[0, 0.8, -0.2]}>
          <boxGeometry args={[0.44, 0.62, 0.06]} />
          <meshStandardMaterial color="#1e293b" roughness={0.5} />
        </mesh>
      </group>

      {/* Legs (Seated at 90 deg) */}
      <group position={[0, 0.46, 0]}>
        {/* Left Leg */}
        <group position={[-0.11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.045, 0.038, 0.5, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
        {/* Right Leg */}
        <group position={[0.11, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh position={[0, -0.25, 0]}>
            <cylinderGeometry args={[0.045, 0.038, 0.5, 12]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
        </group>
      </group>

      {/* Upper Body (White Medical Coat) */}
      <group position={[0, 0.5, 0]}>
        {/* Pelvis */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Torso: Clean White Medical Lab Coat */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.16, 0.135, 0.44, 16]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.3}
            metalness={0.05}
          />
        </mesh>

        {/* Stethoscope Accent hung around neck */}
        <mesh position={[0, 0.38, 0.14]} rotation={[0.4, 0, 0]}>
          <torusGeometry args={[0.1, 0.012, 8, 24, Math.PI]} />
          <meshStandardMaterial color="#0284c7" metalness={0.6} />
        </mesh>

        {/* Doctor ID Badge */}
        <group position={[0.08, 0.32, 0.145]}>
          <mesh>
            <boxGeometry args={[0.07, 0.09, 0.008]} />
            <meshStandardMaterial
              color="#0d9488"
              emissive="#0d9488"
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 0.66, 0]}>
          <mesh>
            <sphereGeometry args={[0.17, 20, 20]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.3}
              metalness={0.05}
            />
          </mesh>
          {/* Medical Visor Slit */}
          <mesh position={[0, 0.02, 0.145]}>
            <boxGeometry args={[0.15, 0.03, 0.04]} />
            <meshStandardMaterial
              color="#0ea5e9"
              emissive="#0ea5e9"
              emissiveIntensity={0.8}
            />
          </mesh>
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

        {/* Right Arm (Hands prescription paper across desk) */}
        <group ref={rightArmRef} position={[0.2, 0.42, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          {/* Paper Prescription Sheet in Hand */}
          <group position={[0.04, -0.48, 0.08]} rotation={[0.4, 0.1, -0.1]}>
            <mesh>
              <boxGeometry args={[0.14, 0.18, 0.003]} />
              <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.04, 0.002]}>
              <planeGeometry args={[0.05, 0.03]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

