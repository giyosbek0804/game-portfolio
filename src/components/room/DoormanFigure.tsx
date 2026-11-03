"use client";

import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";

export const DoormanFigure: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);

  const doorOpen = useGameStore((state) => state.doorOpen);
  const setDoorOpen = useGameStore((state) => state.setDoorOpen);
  const visitorDialogue = useGameStore((state) => state.visitorDialogue);
  const setVisitorPosition = useGameStore((state) => state.setVisitorPosition);

  // Position on the porch to the right of the front door
  const doormanPos = useRef(new THREE.Vector3(1.08, 0, 0.85));
  const currentYaw = useRef(-0.35); // Facing forward toward porch walkway
  const [greetingVisible, setGreetingVisible] = useState(false);

  // Animation states
  const animationPhase = useRef<"idle" | "reaching" | "welcoming">("idle");
  const reachProgress = useRef(0);
  const welcomeProgress = useRef(0);
  const bowProgress = useRef(0);
  const talkTimer = useRef(0);
  const hasTriggeredOpen = useRef(false);

  // Register position for player camera collision
  useEffect(() => {
    setVisitorPosition("doorman", [
      doormanPos.current.x,
      0.9,
      doormanPos.current.z,
    ]);
  }, [setVisitorPosition]);

  // Listen to dialogue interactions
  useEffect(() => {
    if (visitorDialogue?.visitorId === "doorman") {
      talkTimer.current = 3.0;
    }
  }, [visitorDialogue]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const playerPos = state.camera.position;
    const isTalking = talkTimer.current > 0;
    if (isTalking) {
      talkTimer.current -= delta;
    }

    // Distance from player to front doorway (x=0, z=0)
    const distToDoor = Math.hypot(playerPos.x, playerPos.z);
    const isPlayerOutside = playerPos.z > 0.25;
    const isPlayerApproaching =
      isPlayerOutside && distToDoor < 3.4 && playerPos.z < 3.6;
    const isPlayerInside = playerPos.z <= 0.1;

    // Default: Face forward toward the porch pathway
    const angleToPlayer = Math.atan2(
      playerPos.x - doormanPos.current.x,
      playerPos.z - doormanPos.current.z
    );

    let targetYaw = -0.38; // Default idle forward-facing angle

    // STATE MACHINE FOR DOOR OPENING & WELCOMING
    if (isPlayerApproaching) {
      if (!doorOpen && !hasTriggeredOpen.current) {
        // Phase 1: REACHING FOR THE HANDLE
        animationPhase.current = "reaching";
        reachProgress.current = Math.min(1.0, reachProgress.current + delta * 2.2);

        // Turn body toward door handle at [0.55, 1.22, 0.0]
        const angleToHandle = Math.atan2(
          0.55 - doormanPos.current.x,
          0.0 - doormanPos.current.z
        );
        targetYaw = angleToHandle;

        // When hand reaches handle (progress > 0.75), unlatch and swing door open!
        if (reachProgress.current >= 0.75) {
          hasTriggeredOpen.current = true;
          setDoorOpen(true);
          setGreetingVisible(true);
        }
      } else {
        // Phase 2: WELCOMING GESTURE - Face the incoming guest
        animationPhase.current = "welcoming";
        reachProgress.current = Math.max(0.0, reachProgress.current - delta * 2.0);
        welcomeProgress.current = Math.min(1.0, welcomeProgress.current + delta * 2.5);
        bowProgress.current = Math.min(1.0, bowProgress.current + delta * 2.0);

        // Turn to warmly face guest
        targetYaw = angleToPlayer;
      }
    } else if (isPlayerInside) {
      // Player has walked inside: reset doorman to proud stance facing porch
      animationPhase.current = "idle";
      reachProgress.current = Math.max(0.0, reachProgress.current - delta * 2.0);
      welcomeProgress.current = Math.max(0.0, welcomeProgress.current - delta * 2.0);
      bowProgress.current = Math.max(0.0, bowProgress.current - delta * 2.0);
      targetYaw = -0.35;
      hasTriggeredOpen.current = false;
      if (greetingVisible) setGreetingVisible(false);
    } else {
      // Player is far outside on porch: track guest with head/body
      animationPhase.current = "idle";
      reachProgress.current = Math.max(0.0, reachProgress.current - delta * 2.0);
      welcomeProgress.current = Math.max(0.0, welcomeProgress.current - delta * 2.0);
      bowProgress.current = Math.max(0.0, bowProgress.current - delta * 2.0);
      targetYaw = isPlayerOutside ? angleToPlayer : -0.35;
      hasTriggeredOpen.current = false;
      if (greetingVisible) setGreetingVisible(false);
    }

    // Smoothly rotate body
    let angleDiff = targetYaw - currentYaw.current;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    currentYaw.current += angleDiff * Math.min(delta * 4.5, 1.0);
    groupRef.current.rotation.y = currentYaw.current;

    // PROCEDURAL SKELETON ANIMATIONS
    const breath = Math.sin(state.clock.elapsedTime * 1.5) * 0.005;

    // 1. Torso Breathing & Polite Bowing
    if (torsoRef.current) {
      torsoRef.current.position.y = 0.66 + breath;
      // Slight dignified forward tilt when welcoming
      torsoRef.current.rotation.x = THREE.MathUtils.lerp(
        torsoRef.current.rotation.x,
        bowProgress.current * 0.12,
        delta * 5
      );
    }

    // 2. Head tracking
    if (headRef.current) {
      if (animationPhase.current === "welcoming" || isTalking) {
        // Courteous polite nod
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0.16 + Math.sin(state.clock.elapsedTime * 2.5) * 0.04,
          delta * 6
        );
      } else if (animationPhase.current === "reaching") {
        // Looking at the door handle
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0.18,
          delta * 5
        );
      } else {
        // Relaxed upright head
        headRef.current.rotation.x = THREE.MathUtils.lerp(
          headRef.current.rotation.x,
          0,
          delta * 4
        );
      }
    }

    // 3. Left Arm: REACHING FOR HANDLE (reach phase) -> SWEEPING TOWARD DOORWAY (welcome phase)
    if (leftArmRef.current) {
      if (reachProgress.current > 0.01) {
        // Reaching directly to door handle while body faces handle
        const reach = reachProgress.current;
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          -Math.PI * 0.45 * reach,
          delta * 8
        );
        leftArmRef.current.rotation.y = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.y,
          0.2 * reach,
          delta * 8
        );
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.z,
          -0.25 * reach,
          delta * 8
        );
      } else if (welcomeProgress.current > 0.01) {
        // Welcoming open-palm sweep toward the open doorway
        const welcome = welcomeProgress.current;
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          -0.35 * welcome,
          delta * 6
        );
        leftArmRef.current.rotation.y = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.y,
          0.3 * welcome,
          delta * 6
        );
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.z,
          -0.65 * welcome,
          delta * 6
        );
      } else {
        // Rest politely at side
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          0.05,
          delta * 5
        );
        leftArmRef.current.rotation.y = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.y,
          0,
          delta * 5
        );
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.z,
          -0.08,
          delta * 5
        );
      }
    }

    // 4. Right Arm: Relaxed at side
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.x,
        0.05,
        delta * 5
      );
      rightArmRef.current.rotation.y = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.y,
        0,
        delta * 5
      );
      rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
        rightArmRef.current.rotation.z,
        0.08,
        delta * 5
      );
    }
  });

  return (
    <group
      ref={groupRef}
      position={[doormanPos.current.x, 0, doormanPos.current.z]}
    >
      {/* Soft Contact Shadow on Stone Porch */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.34, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.4} />
      </mesh>

      {/* Invisible Interactive Cylinder for targeting reticle */}
      <mesh
        position={[0, 0.9, 0]}
        userData={{
          isInteractable: true,
          type: "visitor",
          id: "doorman",
          name: "Arthur",
          role: "Porch Doorman",
        }}
      >
        <cylinderGeometry args={[0.42, 0.42, 1.8, 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Floating Courteous Greeting Tip */}
      {greetingVisible && (
        <group position={[0, 1.85, 0]}>
          {/* Subtle speech card */}
          <mesh position={[0, 0, 0]}>
            <planeGeometry args={[1.2, 0.28]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, 0, 0.005]}>
            <planeGeometry args={[1.16, 0.24]} />
            <meshBasicMaterial color="#1e293b" />
          </mesh>
        </group>
      )}

      {/* Legs Root (Hips at y = 0.62) */}
      <group position={[0, 0.62, 0]}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.1, 0, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.045, 0.038, 0.62, 12]} />
            <meshStandardMaterial
              color="#334155" // Dark tailored trousers for doorman
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.61, 0.04]}>
            <boxGeometry args={[0.09, 0.05, 0.16]} />
            <meshStandardMaterial
              color="#0f172a" // Polished dress shoes
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.1, 0, 0]}>
          <mesh position={[0, -0.32, 0]}>
            <cylinderGeometry args={[0.045, 0.038, 0.62, 12]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.61, 0.04]}>
            <boxGeometry args={[0.09, 0.05, 0.16]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.3}
              metalness={0.4}
            />
          </mesh>
        </group>
      </group>

      {/* Upper Body (Pelvis, Torso, Arms, Head) - rooted at y = 0.66 with ZERO floating gap */}
      <group ref={torsoRef} position={[0, 0.66, 0]}>
        {/* Seamless Pelvis Connector */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.1, 16]} />
          <meshStandardMaterial
            color="#334155" // Matches trousers
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>

        {/* Torso Capsule / Doorman Vest */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.155, 0.13, 0.42, 16]} />
          <meshStandardMaterial
            color="#f8fafc" // White shirt
            roughness={0.4}
            metalness={0.05}
          />
        </mesh>

        {/* Dark Vest & Bowtie Detail */}
        <mesh position={[0, 0.26, 0.01]}>
          <cylinderGeometry
            args={[0.157, 0.132, 0.38, 16, 1, false, 0, Math.PI]}
          />
          <meshStandardMaterial
            color="#1e293b" // Tailored vest
            roughness={0.5}
            metalness={0.15}
          />
        </mesh>

        {/* Golden / Brass Buttons on Vest */}
        <mesh position={[0, 0.32, 0.155]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.24, 0.15]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>
        <mesh position={[0, 0.16, 0.145]}>
          <sphereGeometry args={[0.012, 8, 8]} />
          <meshStandardMaterial
            color="#fbbf24"
            metalness={0.9}
            roughness={0.2}
          />
        </mesh>

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

          {/* Doorman Emerald Visor / Slit */}
          <mesh position={[0, 0.02, 0.145]}>
            <boxGeometry args={[0.15, 0.03, 0.04]} />
            <meshStandardMaterial
              color="#10b981"
              emissive="#10b981"
              emissiveIntensity={0.8}
              roughness={0.2}
            />
          </mesh>

          {/* Minimalist Doorman Cap / Brim */}
          <mesh position={[0, 0.14, 0.02]} rotation={[-0.1, 0, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.4}
              metalness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.12, 0.12]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.18, 0.015, 0.08]} />
            <meshStandardMaterial
              color="#0f172a"
              roughness={0.3}
              metalness={0.3}
            />
          </mesh>
        </group>

        {/* Left Arm (Reaches for Door Handle) */}
        <group ref={leftArmRef} position={[-0.2, 0.42, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.4}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>

        {/* Right Arm (Sweeps in Welcoming Gesture) */}
        <group ref={rightArmRef} position={[0.2, 0.42, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.048, 12, 12]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.038, 0.032, 0.44, 12]} />
            <meshStandardMaterial
              color="#f8fafc"
              roughness={0.4}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <sphereGeometry args={[0.04, 12, 12]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

