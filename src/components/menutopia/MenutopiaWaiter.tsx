"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMenutopiaStore } from "@/store/useMenutopiaStore";
import { FoodTrayProp } from "./FoodTrayProp";
import { useGameStore } from "@/store/useGameStore";

export const MenutopiaWaiter: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);

  const waiterState = useMenutopiaStore((state) => state.waiterState);
  const waiterTargetTable = useMenutopiaStore((state) => state.waiterTargetTable);
  const waiterHasTray = useMenutopiaStore((state) => state.waiterHasTray);

  // Key navigation waypoints
  const tableXCoords = [8.0, 10.2, 12.4];
  const targetX = tableXCoords[Math.max(0, Math.min(2, waiterTargetTable - 1))];
  const tableSpot = new THREE.Vector3(targetX, 0, -10.5); // South of table facing North (+Z)

  const kitchenDoor = new THREE.Vector3(10.0, 0, -13.4);
  const kitchenPass = new THREE.Vector3(11.5, 0, -14.6);
  const frontCounter = new THREE.Vector3(8.0, 0, -12.4);

  const currentPos = useRef(new THREE.Vector3(8.0, 0, -12.4));
  const currentYaw = useRef(0);
  const walkCycle = useRef(0);

  // Sequential multi-stage path tracking to eliminate any oscillation/shaking
  const navStage = useRef(0);
  const prevActionState = useRef(waiterState);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Performance check: halt updates when player is outside or in distant rooms
    const playerZone = useGameStore.getState().playerZone;
    if (playerZone !== "menutopia") return;

    // Reset waypoint stage when state changes
    if (prevActionState.current !== waiterState) {
      prevActionState.current = waiterState;
      navStage.current = 0;
    }

    let targetDest: THREE.Vector3 | null = null;
    let targetYaw = currentYaw.current;
    let isWalking = false;

    // ─────────────────────────────────────────────────────────────
    // 1. ROCK-SOLID WAYPOINT NAVIGATION ROUTINE
    // ─────────────────────────────────────────────────────────────
    if (waiterState === "walking_to_table") {
      targetDest = tableSpot;
      const dist = currentPos.current.distanceTo(targetDest);
      if (dist > 0.12) {
        isWalking = true;
      } else {
        // Arrived at table: snap position & face customer (+Z)
        currentPos.current.copy(tableSpot);
        targetYaw = 0;
        useMenutopiaStore.setState({ waiterState: "taking_order", waiterTimer: 0 });
      }
    } else if (waiterState === "taking_order") {
      targetYaw = 0;
    } else if (waiterState === "walking_to_kitchen") {
      // Stage 0: Walk to kitchen doorway
      // Stage 1: Walk to plating pass
      if (navStage.current === 0) {
        targetDest = kitchenDoor;
        const dist = currentPos.current.distanceTo(kitchenDoor);
        if (dist > 0.18) {
          isWalking = true;
        } else {
          navStage.current = 1;
        }
      } else {
        targetDest = kitchenPass;
        const dist = currentPos.current.distanceTo(kitchenPass);
        if (dist > 0.12) {
          isWalking = true;
        } else {
          currentPos.current.copy(kitchenPass);
          targetYaw = Math.PI; // Face plating counter (-Z)
          useMenutopiaStore.setState({ waiterState: "waiting_at_pass", waiterTimer: 0 });
        }
      }
    } else if (waiterState === "waiting_at_pass") {
      targetYaw = Math.PI;
    } else if (waiterState === "delivering_food") {
      // Stage 0: Walk out of kitchen to doorway
      // Stage 1: Walk to customer table
      if (navStage.current === 0) {
        targetDest = kitchenDoor;
        const dist = currentPos.current.distanceTo(kitchenDoor);
        if (dist > 0.18) {
          isWalking = true;
        } else {
          navStage.current = 1;
        }
      } else {
        targetDest = tableSpot;
        const dist = currentPos.current.distanceTo(tableSpot);
        if (dist > 0.12) {
          isWalking = true;
        } else {
          currentPos.current.copy(tableSpot);
          targetYaw = 0; // Face customer (+Z)
          useMenutopiaStore.setState({ waiterState: "placing_tray", waiterTimer: 0 });
        }
      }
    } else if (waiterState === "placing_tray") {
      targetYaw = 0;
    } else if (waiterState === "idle_counter") {
      targetDest = frontCounter;
      const dist = currentPos.current.distanceTo(frontCounter);
      if (dist > 0.12) {
        isWalking = true;
      } else {
        currentPos.current.copy(frontCounter);
        targetYaw = 0; // Face dining room
      }
    }

    // Kinematics displacement with strict overshoot prevention (no jitter!)
    if (isWalking && targetDest) {
      const dist = currentPos.current.distanceTo(targetDest);
      if (dist > 0.02) {
        walkCycle.current += delta * 7.2;
        const angle = Math.atan2(
          targetDest.x - currentPos.current.x,
          targetDest.z - currentPos.current.z
        );
        targetYaw = angle;
        const speed = 1.6;
        const step = Math.min(dist, speed * delta); // Clamp step to remaining distance!
        currentPos.current.x += Math.sin(angle) * step;
        currentPos.current.z += Math.cos(angle) * step;
      }
    }

    // Smooth shortest-arc yaw rotation
    let angleDiff = targetYaw - currentYaw.current;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    currentYaw.current += angleDiff * Math.min(delta * 6.5, 1.0);

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.y = currentYaw.current;

    // ─────────────────────────────────────────────────────────────
    // 2. PROCEDURAL LIMBS & GESTURES
    // ─────────────────────────────────────────────────────────────
    const time = state.clock.elapsedTime;

    // Legs animation
    if (leftLegRef.current && rightLegRef.current) {
      if (isWalking) {
        const swing = Math.sin(walkCycle.current) * 0.44;
        leftLegRef.current.rotation.x = swing;
        rightLegRef.current.rotation.x = -swing;
        if (leftKneeRef.current && rightKneeRef.current) {
          leftKneeRef.current.rotation.x = Math.max(0, -swing * 0.5);
          rightKneeRef.current.rotation.x = Math.max(0, swing * 0.5);
        }
      } else {
        leftLegRef.current.rotation.x = 0;
        rightLegRef.current.rotation.x = 0;
        if (leftKneeRef.current && rightKneeRef.current) {
          leftKneeRef.current.rotation.x = 0;
          rightKneeRef.current.rotation.x = 0;
        }
      }
    }

    // Torso bobbing
    if (torsoRef.current) {
      const bob = isWalking ? Math.abs(Math.sin(walkCycle.current)) * 0.03 : 0;
      torsoRef.current.position.y = 0.68 + bob;
    }

    // Arm Poses
    if (rightArmRef.current && leftArmRef.current) {
      if (waiterHasTray || waiterState === "delivering_food") {
        // Holding serving tray with BOTH hands in front of waist
        leftArmRef.current.rotation.x = -Math.PI * 0.42;
        leftArmRef.current.rotation.z = -0.15;
        rightArmRef.current.rotation.x = -Math.PI * 0.42;
        rightArmRef.current.rotation.z = 0.15;
      } else if (waiterState === "placing_tray") {
        // Bending down slightly to set tray onto table
        leftArmRef.current.rotation.x = -Math.PI * 0.35;
        rightArmRef.current.rotation.x = -Math.PI * 0.35;
      } else if (waiterState === "taking_order") {
        // Left hand holds POS order tablet, right hand taps screen
        leftArmRef.current.rotation.x = -Math.PI * 0.38;
        leftArmRef.current.rotation.z = -0.15;

        // Tapping animation with right finger
        const tap = Math.sin(time * 8.0) * 0.08;
        rightArmRef.current.rotation.x = -Math.PI * 0.4 + tap;
        rightArmRef.current.rotation.z = 0.18;
      } else {
        // Normal walking/idle: left hand holds tablet against side
        leftArmRef.current.rotation.x = -0.4;
        leftArmRef.current.rotation.z = -0.12;

        const swing = isWalking ? Math.sin(walkCycle.current) * 0.35 : 0;
        rightArmRef.current.rotation.x = -swing;
        rightArmRef.current.rotation.z = 0.08;
      }
    }

    // Head orientation
    if (headRef.current) {
      if (waiterState === "taking_order") {
        headRef.current.rotation.x = 0.15; // Glancing down at tablet
      } else {
        headRef.current.rotation.x = 0;
      }
    }
  });

  return (
    <group ref={groupRef} position={[8.0, 0, -12.4]}>
      {/* Contact Shadow Disc on Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Legs (Dark slacks) */}
      <group position={[0, 0.62, 0]}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.1, 0, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.042, 0.035, 0.6, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          <group ref={leftKneeRef} position={[0, -0.26, 0]}>
            <mesh position={[0, -0.34, 0.04]}>
              <boxGeometry args={[0.08, 0.045, 0.15]} />
              <meshStandardMaterial color="#020617" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.1, 0, 0]}>
          <mesh position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.042, 0.035, 0.6, 12]} />
            <meshStandardMaterial color="#0f172a" roughness={0.6} />
          </mesh>
          <group ref={rightKneeRef} position={[0, -0.26, 0]}>
            <mesh position={[0, -0.34, 0.04]}>
              <boxGeometry args={[0.08, 0.045, 0.15]} />
              <meshStandardMaterial color="#020617" roughness={0.4} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Upper Body (Menutopia Uniform: Red Polo Shirt & Apron) */}
      <group ref={torsoRef} position={[0, 0.68, 0]}>
        {/* Pelvis */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.14, 0.12, 0.1, 16]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Torso: Menutopia Red Server Polo */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.16, 0.138, 0.44, 16]} />
          <meshStandardMaterial color="#b91c1c" roughness={0.4} />
        </mesh>

        {/* Server Half-Apron (Black) */}
        <mesh position={[0, 0.08, 0.135]}>
          <boxGeometry args={[0.24, 0.22, 0.01]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* Golden Staff Badge */}
        <mesh position={[0.08, 0.35, 0.145]}>
          <boxGeometry args={[0.06, 0.03, 0.005]} />
          <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          <meshStandardMaterial color="#e2e8f0" />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 0.66, 0]}>
          <mesh>
            <sphereGeometry args={[0.165, 20, 20]} />
            <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
          </mesh>
          {/* Server Visor Stripe (Gold) */}
          <mesh position={[0, 0.02, 0.14]}>
            <boxGeometry args={[0.14, 0.028, 0.03]} />
            <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
          </mesh>

          {/* Menutopia Server Cap */}
          <group position={[0, 0.12, 0]}>
            <mesh position={[0, 0.02, 0]}>
              <cylinderGeometry args={[0.16, 0.17, 0.05, 16]} />
              <meshStandardMaterial color="#b91c1c" />
            </mesh>
            {/* Front Bill */}
            <mesh position={[0, 0.01, 0.12]} rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.16, 0.015, 0.08]} />
              <meshStandardMaterial color="#7f1d1d" />
            </mesh>
          </group>
        </group>

        {/* Left Arm (Holds Digital POS Order Tablet) */}
        <group ref={leftArmRef} position={[-0.2, 0.42, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          {/* Digital POS Tablet */}
          <group position={[0.04, -0.46, 0.1]} rotation={[0.3, 0.4, -0.2]}>
            <mesh>
              <boxGeometry args={[0.16, 0.22, 0.012]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
            </mesh>
            {/* Glowing Touchscreen */}
            <mesh position={[0, 0, 0.007]}>
              <planeGeometry args={[0.14, 0.2]} />
              <meshBasicMaterial color="#0284c7" />
            </mesh>
          </group>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.2, 0.42, 0]}>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial color="#b91c1c" />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>

        {/* Food Serving Tray Held When Delivering Food */}
        {waiterHasTray && (
          <FoodTrayProp position={[0, 0.08, 0.36]} rotation={[0, 0, 0]} />
        )}
      </group>
    </group>
  );
};
