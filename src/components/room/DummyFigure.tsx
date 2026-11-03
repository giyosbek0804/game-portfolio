"use client";

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";

export interface Waypoint {
  pos: [number, number, number];
  lookAt?: [number, number, number];
  dwellTime?: number; // seconds to pause and admire the exhibit
}

interface DummyFigureProps {
  id: string;
  name: string;
  role: string;
  accentColor: string;
  initialPosition: [number, number, number];
  initialRotation?: number;
  waypoints: Waypoint[];
  hasTablet?: boolean;
}

export const DummyFigure: React.FC<DummyFigureProps> = ({
  id,
  name,
  role,
  accentColor,
  initialPosition,
  initialRotation = 0,
  waypoints,
  hasTablet = false,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  // Store bindings
  const visitorMode = useGameStore((state) => state.visitorModes[id] || "wander");
  const visitorDialogue = useGameStore((state) => state.visitorDialogue);
  const setVisitorPosition = useGameStore((state) => state.setVisitorPosition);

  // AI navigation state
  const currentWaypointIndex = useRef(0);
  const stateTimer = useRef(0);
  const currentActivity = useRef<"walking" | "pausing">("walking");
  const walkCycle = useRef(0);
  const waveTimer = useRef(0);
  const currentPos = useRef(new THREE.Vector3(...initialPosition));
  const lastReportedPos = useRef(new THREE.Vector3(...initialPosition));
  const currentYaw = useRef(initialRotation);

  // Trigger wave animation when this visitor is spoken to
  useEffect(() => {
    if (visitorDialogue?.visitorId === id) {
      waveTimer.current = 2.5; // Wave for 2.5 seconds
    }
  }, [visitorDialogue, id]);

  // Immediately register initial position on mount for multi-agent collision
  useEffect(() => {
    setVisitorPosition(id, [
      initialPosition[0],
      0.9,
      initialPosition[2],
    ]);
  }, [id, initialPosition, setVisitorPosition]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const playerPos = state.camera.position;
    const isWaving = waveTimer.current > 0;
    if (isWaving) {
      waveTimer.current -= delta;
    }

    let isMoving = false;
    let targetYaw = currentYaw.current;

    if (visitorMode === "follow") {
      // COMPANION MODE: Distinct formation slots (Alex on Left Flank, Sam on Right Flank)
      const slotOffsetX = id === "alex" ? -1.15 : id === "sam" ? 1.15 : 0;
      const slotOffsetZ = 1.7; // Comfortable distance behind player
      const targetFollowX = playerPos.x + slotOffsetX;
      const targetFollowZ = playerPos.z + slotOffsetZ;

      const distToSlot = Math.hypot(
        targetFollowX - currentPos.current.x,
        targetFollowZ - currentPos.current.z
      );

      // Always turn to face player
      const angleToPlayer = Math.atan2(
        playerPos.x - currentPos.current.x,
        playerPos.z - currentPos.current.z
      );
      targetYaw = angleToPlayer;

      if (distToSlot > 0.45) {
        // Walk smoothly towards assigned flank slot
        isMoving = true;
        const walkSpeed = 1.6; // m/s
        const angleToSlot = Math.atan2(
          targetFollowX - currentPos.current.x,
          targetFollowZ - currentPos.current.z
        );
        const moveDist = Math.min(walkSpeed * delta, distToSlot);
        currentPos.current.x += Math.sin(angleToSlot) * moveDist;
        currentPos.current.z += Math.cos(angleToSlot) * moveDist;
      }
    } else {
      // WANDER MODE: Patrol waypoints and inspect exhibits
      if (waypoints.length > 0) {
        const wp = waypoints[currentWaypointIndex.current];
        const [wpx, , wpz] = wp.pos;
        const distToWp = Math.hypot(
          wpx - currentPos.current.x,
          wpz - currentPos.current.z
        );

        if (currentActivity.current === "walking") {
          if (distToWp < 0.2) {
            // Reached waypoint: switch to pausing/inspecting
            currentActivity.current = "pausing";
            stateTimer.current = wp.dwellTime ?? 6.0;
          } else {
            // Move towards waypoint
            isMoving = true;
            const walkSpeed = 1.15; // m/s
            const moveDist = Math.min(walkSpeed * delta, distToWp);
            const angleToWp = Math.atan2(
              wpx - currentPos.current.x,
              wpz - currentPos.current.z
            );
            targetYaw = angleToWp;

            currentPos.current.x += Math.sin(angleToWp) * moveDist;
            currentPos.current.z += Math.cos(angleToWp) * moveDist;
          }
        } else {
          // Pausing / inspecting exhibit
          stateTimer.current -= delta;

          if (wp.lookAt) {
            targetYaw = Math.atan2(
              wp.lookAt[0] - currentPos.current.x,
              wp.lookAt[2] - currentPos.current.z
            );
          }

          if (stateTimer.current <= 0) {
            // Advance to next waypoint
            currentWaypointIndex.current =
              (currentWaypointIndex.current + 1) % waypoints.length;
            currentActivity.current = "walking";
          }
        }
      }
    }

    // MULTI-AGENT REPULSION: Prevent ANY figure from overlapping with other visitors
    const allVisitorPositions = useGameStore.getState().visitorPositions;
    for (const [otherId, otherPos] of Object.entries(allVisitorPositions)) {
      if (otherId === id) continue;
      const dx = currentPos.current.x - otherPos[0];
      const dz = currentPos.current.z - otherPos[2];
      const dist = Math.hypot(dx, dz);
      const minSeparation = 1.05; // 1.05m minimum physical separation between dummies
      if (dist < minSeparation && dist > 0.001) {
        const overlap = minSeparation - dist;
        const pushFactor = overlap * Math.min(delta * 5.0, 0.45);
        currentPos.current.x += (dx / dist) * pushFactor;
        currentPos.current.z += (dz / dist) * pushFactor;
      }
    }

    // Smoothly rotate body towards target orientation
    let angleDiff = targetYaw - currentYaw.current;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    currentYaw.current += angleDiff * Math.min(delta * 5.0, 1.0);

    // Apply position & rotation to figure root
    groupRef.current.position.set(
      currentPos.current.x,
      0,
      currentPos.current.z
    );
    groupRef.current.rotation.y = currentYaw.current;

    // Report position to Zustand store for player collision (throttled when moved)
    if (
      currentPos.current.distanceToSquared(lastReportedPos.current) > 0.008 ||
      isMoving
    ) {
      lastReportedPos.current.copy(currentPos.current);
      setVisitorPosition(id, [
        currentPos.current.x,
        0.9,
        currentPos.current.z,
      ]);
    }

    // PROCEDURAL SKELETON ANIMATION
    if (isMoving) {
      walkCycle.current += delta * 7.5;
    } else {
      // Gentle breathing when stationary
      walkCycle.current = THREE.MathUtils.lerp(
        walkCycle.current,
        Math.round(walkCycle.current / (Math.PI * 2)) * Math.PI * 2,
        delta * 3
      );
    }

    const cycle = walkCycle.current;

    // 1. Torso vertical bounce & slight breathing sway
    if (torsoRef.current) {
      const bobY = isMoving
        ? Math.abs(Math.sin(cycle)) * 0.025
        : Math.sin(state.clock.elapsedTime * 1.5) * 0.006;
      torsoRef.current.position.y = 0.66 + bobY;
      torsoRef.current.rotation.y = isMoving ? Math.sin(cycle) * 0.06 : 0;
    }

    // 2. Leg swinging
    if (leftLegRef.current && rightLegRef.current) {
      const legAngle = isMoving ? Math.sin(cycle) * 0.42 : 0;
      leftLegRef.current.rotation.x = legAngle;
      rightLegRef.current.rotation.x = -legAngle;
    }

    // 3. Head curiosity & inspection tilt
    if (headRef.current) {
      if (isWaving) {
        // Look directly up towards player when waving
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0.05,
          delta * 6
        );
        headRef.current.rotation.y = THREE.MathUtils.lerp(
          headRef.current.rotation.y,
          0,
          delta * 6
        );
      } else if (!isMoving && currentActivity.current === "pausing") {
        // Thoughtfully tilting head to inspect art
        headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 1.8) * 0.08 + 0.12;
        headRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.9) * 0.06;
      } else {
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0,
          delta * 4
        );
        headRef.current.rotation.z = THREE.MathUtils.lerp(
          headRef.current.rotation.z,
          0,
          delta * 4
        );
      }
    }

    // 4. Arms animation (walking swing vs friendly wave)
    if (leftArmRef.current && rightArmRef.current) {
      if (isWaving) {
        // Right arm waves high and enthusiastically
        rightArmRef.current.rotation.x = -Math.PI * 0.72; // Raised up
        rightArmRef.current.rotation.z = -Math.PI * 0.15 + Math.sin(waveTimer.current * 14) * 0.35; // Waving side to side
        leftArmRef.current.rotation.x = 0;
        leftArmRef.current.rotation.z = 0;
      } else if (hasTablet) {
        // Holding digital guide tablet in hands
        rightArmRef.current.rotation.x = -0.55;
        rightArmRef.current.rotation.y = -0.25;
        rightArmRef.current.rotation.z = -0.15;
        leftArmRef.current.rotation.x = -0.55;
        leftArmRef.current.rotation.y = 0.25;
        leftArmRef.current.rotation.z = 0.15;
      } else if (isMoving) {
        // Natural arm counter-swing
        rightArmRef.current.rotation.x = Math.sin(cycle) * 0.32;
        rightArmRef.current.rotation.z = 0.08;
        leftArmRef.current.rotation.x = -Math.sin(cycle) * 0.32;
        leftArmRef.current.rotation.z = -0.08;
      } else {
        // Idle relaxed arms
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          0.05,
          delta * 4
        );
        rightArmRef.current.rotation.z = 0.08;
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          0.05,
          delta * 4
        );
        leftArmRef.current.rotation.z = -0.08;
      }
    }
  });

  return (
    <group ref={groupRef} position={initialPosition}>
      {/* Soft Contact Shadow Disc on Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Invisible Interactive Cylinder (allows effortless targeting from reticle) */}
      <mesh
        position={[0, 0.9, 0]}
        userData={{
          isInteractable: true,
          type: "visitor",
          id,
          name,
          role,
        }}
      >
        <cylinderGeometry args={[0.42, 0.42, 1.8, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Legs Root (Hips at y = 0.65) */}
      <group position={[0, 0.62, 0]}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.1, 0, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.045, 0.038, 0.62, 12]} />
            <meshStandardMaterial
              color="#e2e8f0"
              roughness={0.5}
              metalness={0.08}
            />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.61, 0.04]}>
            <boxGeometry args={[0.09, 0.05, 0.16]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.1, 0, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.045, 0.038, 0.62, 12]} />
            <meshStandardMaterial
              color="#e2e8f0"
              roughness={0.5}
              metalness={0.08}
            />
          </mesh>
          {/* Foot */}
          <mesh position={[0, -0.61, 0.04]}>
            <boxGeometry args={[0.09, 0.05, 0.16]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>
        </group>
      </group>

      {/* Upper Body (Pelvis, Torso, Arms, Head) - rooted at y = 0.66 */}
      <group ref={torsoRef} position={[0, 0.66, 0]}>
        {/* Seamless Pelvis / Hip Connector */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.1, 16]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* Torso Capsule / Cylinder */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.15, 0.13, 0.42, 16]} />
          <meshStandardMaterial
            color="#f8fafc" // Clean white porcelain aesthetic
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* Minimalist Visitor Badge / Lanyard */}
        <group position={[0, 0.32, 0.13]}>
          {/* Lanyard Strap */}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.12, 0.015, 0.01]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          {/* Glowing ID Card with Visitor Accent Color */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.08, 0.11, 0.01]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={0.6}
            />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          <meshStandardMaterial
            color="#e2e8f0"
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>

        {/* Head (Round Stylized Mannequin Sphere) */}
        <group ref={headRef} position={[0, 0.66, 0]}>
          <mesh>
            <sphereGeometry args={[0.17, 24, 24]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.3}
              metalness={0.05}
            />
          </mesh>

          {/* Minimalist Glowing Visor / Gaze Slit */}
          <mesh position={[0, 0.02, 0.145]}>
            <boxGeometry args={[0.15, 0.03, 0.04]} />
            <meshStandardMaterial
              color={accentColor}
              emissive={accentColor}
              emissiveIntensity={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.2, 0.42, 0]}>
          {/* Shoulder joint */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          {/* Arm limb */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.4}
              metalness={0.05}
            />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.2, 0.42, 0]}>
          {/* Shoulder joint */}
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          {/* Arm limb */}
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.4}
              metalness={0.05}
            />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          {/* Optional: Digital Tablet / Museum Guide Slate */}
          {hasTablet && (
            <group position={[0.04, -0.42, 0.12]} rotation={[0.4, 0.3, -0.2]}>
              <mesh>
                <boxGeometry args={[0.16, 0.22, 0.015]} />
                <meshStandardMaterial
                  color="#0f172a"
                  roughness={0.2}
                  metalness={0.8}
                />
              </mesh>
              {/* Screen */}
              <mesh position={[0, 0, 0.009]}>
                <planeGeometry args={[0.14, 0.2]} />
                <meshBasicMaterial color={accentColor} />
              </mesh>
            </group>
          )}
        </group>
      </group>
    </group>
  );
};
