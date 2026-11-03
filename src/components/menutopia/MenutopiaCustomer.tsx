"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { TableCustomer } from "@/store/useMenutopiaStore";
import { FoodTrayProp } from "./FoodTrayProp";
import { useGameStore } from "@/store/useGameStore";

interface MenutopiaCustomerProps {
  customer: TableCustomer;
  tablePosition: [number, number, number];
}

export const MenutopiaCustomer: React.FC<MenutopiaCustomerProps> = ({
  customer,
  tablePosition,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);

  // Customer sits North of table (at z = tablePosition[2] + 0.6) facing South (-Z towards table)
  const chairPos = [tablePosition[0], 0, tablePosition[2] + 0.58] as const;
  const currentPos = useRef(new THREE.Vector3(...chairPos));
  const currentYaw = useRef(Math.PI); // Facing South (-Z towards table)
  const walkCycle = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    const playerZone = useGameStore.getState().playerZone;
    if (playerZone !== "menutopia") return;

    const isLeaving = customer.state === "leaving";

    if (isLeaving) {
      // Standing and walking towards museum exit archway [5.8, 0, -11.5]
      const exitPos = new THREE.Vector3(5.8, 0, -11.5);
      const dist = currentPos.current.distanceTo(exitPos);

      if (dist > 0.15) {
        walkCycle.current += delta * 7.0;
        const angle = Math.atan2(
          exitPos.x - currentPos.current.x,
          exitPos.z - currentPos.current.z
        );
        currentYaw.current = angle;
        const speed = 1.6;
        currentPos.current.x += Math.sin(angle) * speed * delta;
        currentPos.current.z += Math.cos(angle) * speed * delta;
      }

      if (currentPos.current.x <= 6.2) {
        groupRef.current.visible = false;
      } else {
        groupRef.current.visible = true;
      }

      // Walking pose
      if (torsoRef.current) torsoRef.current.position.y = 0.68;
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.position.y = 0.64;
        rightLegRef.current.position.y = 0.64;
        const swing = Math.sin(walkCycle.current) * 0.42;
        leftLegRef.current.rotation.x = swing;
        rightLegRef.current.rotation.x = -swing;
        if (leftKneeRef.current && rightKneeRef.current) {
          leftKneeRef.current.rotation.x = Math.max(0, -swing * 0.5);
          rightKneeRef.current.rotation.x = Math.max(0, swing * 0.5);
        }
      }
    } else {
      // Seated pose at table facing South (-Z)
      groupRef.current.visible = true;
      currentPos.current.set(...chairPos);
      currentYaw.current = Math.PI;

      if (torsoRef.current) {
        torsoRef.current.position.y = 0.48;
        torsoRef.current.rotation.x = 0.05;
      }

      // Seated 2-part legs with 90 deg hip/knee bend
      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.position.y = 0.46;
        rightLegRef.current.position.y = 0.46;
        leftLegRef.current.rotation.x = -Math.PI / 2;
        rightLegRef.current.rotation.x = -Math.PI / 2;
      }

      if (leftKneeRef.current && rightKneeRef.current) {
        leftKneeRef.current.rotation.x = Math.PI / 2;
        rightKneeRef.current.rotation.x = Math.PI / 2;
      }

      // Eating animation: Lifting cup or burger to visor
      const time = state.clock.elapsedTime;
      const isEating = customer.state === "eating";

      if (rightArmRef.current) {
        if (isEating) {
          const eatCycle = Math.sin(time * 1.8);
          if (eatCycle > 0.2) {
            // Lifting food to mouth/visor
            rightArmRef.current.rotation.x = -Math.PI * 0.45;
            rightArmRef.current.rotation.z = 0.25;
          } else {
            // Resting hand near table
            rightArmRef.current.rotation.x = -0.7;
            rightArmRef.current.rotation.z = 0.12;
          }
        } else {
          // Resting on table awaiting order
          rightArmRef.current.rotation.x = -0.7;
          rightArmRef.current.rotation.z = 0.15;
        }
      }

      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = -0.7;
        leftArmRef.current.rotation.z = -0.15;
      }

      if (headRef.current) {
        if (isEating) {
          headRef.current.rotation.x = 0.15 + Math.sin(time * 3.5) * 0.04;
        } else {
          // Looking around diner / at menu
          headRef.current.rotation.x = 0.05;
          headRef.current.rotation.y = Math.sin(time * 0.7) * 0.15;
        }
      }
    }

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.y = currentYaw.current;
  });

  return (
    <>
      {/* Customer Mannequin */}
      <group ref={groupRef} position={[...chairPos]} rotation={[0, Math.PI, 0]}>
        {/* Contact Shadow */}
        <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.3, 16]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.3} />
        </mesh>

        {/* 2-Part Legs with Hip & Knee Joints */}
        <group position={[0, 0, 0]}>
          {/* Left Leg */}
          <group ref={leftLegRef} position={[-0.1, 0.46, 0]}>
            <mesh position={[0, -0.13, 0]}>
              <cylinderGeometry args={[0.042, 0.038, 0.26, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            <group ref={leftKneeRef} position={[0, -0.26, 0]}>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.038, 10, 10]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, -0.19, 0]}>
                <cylinderGeometry args={[0.038, 0.032, 0.38, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.38, 0.04]}>
                <boxGeometry args={[0.08, 0.045, 0.14]} />
                <meshStandardMaterial color="#020617" roughness={0.4} />
              </mesh>
            </group>
          </group>

          {/* Right Leg */}
          <group ref={rightLegRef} position={[0.1, 0.46, 0]}>
            <mesh position={[0, -0.13, 0]}>
              <cylinderGeometry args={[0.042, 0.038, 0.26, 12]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} />
            </mesh>
            <group ref={rightKneeRef} position={[0, -0.26, 0]}>
              <mesh position={[0, 0, 0]}>
                <sphereGeometry args={[0.038, 10, 10]} />
                <meshStandardMaterial color="#1e293b" />
              </mesh>
              <mesh position={[0, -0.19, 0]}>
                <cylinderGeometry args={[0.038, 0.032, 0.38, 12]} />
                <meshStandardMaterial color="#1e293b" roughness={0.6} />
              </mesh>
              <mesh position={[0, -0.38, 0.04]}>
                <boxGeometry args={[0.08, 0.045, 0.14]} />
                <meshStandardMaterial color="#020617" roughness={0.4} />
              </mesh>
            </group>
          </group>
        </group>

        {/* Upper Body */}
        <group ref={torsoRef} position={[0, 0.48, 0]}>
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.13, 0.11, 0.1, 16]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0.26, 0]}>
            <cylinderGeometry args={[0.15, 0.13, 0.42, 16]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>

          {/* Accent Shirt/Hoodie */}
          <group position={[0, 0.32, 0.13]}>
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.1, 0.1, 0.01]} />
              <meshStandardMaterial
                color={customer.accentColor}
                emissive={customer.accentColor}
                emissiveIntensity={0.6}
              />
            </mesh>
          </group>

          {/* Neck & Head */}
          <mesh position={[0, 0.52, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          <group ref={headRef} position={[0, 0.66, 0]}>
            <mesh>
              <sphereGeometry args={[0.165, 20, 20]} />
              <meshStandardMaterial color="#ffffff" roughness={0.3} metalness={0.05} />
            </mesh>
            <mesh position={[0, 0.02, 0.14]}>
              <boxGeometry args={[0.14, 0.028, 0.03]} />
              <meshStandardMaterial
                color={customer.accentColor}
                emissive={customer.accentColor}
                emissiveIntensity={0.8}
              />
            </mesh>
          </group>

          {/* Arms */}
          <group ref={leftArmRef} position={[-0.2, 0.42, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.036, 0.03, 0.42, 12]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0, -0.44, 0]}>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
          </group>

          <group ref={rightArmRef} position={[0.2, 0.42, 0]}>
            <mesh position={[0, -0.22, 0]}>
              <cylinderGeometry args={[0.036, 0.03, 0.42, 12]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[0, -0.44, 0]}>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color="#e2e8f0" />
            </mesh>
          </group>
        </group>
      </group>

      {/* Food Tray on Table when Served */}
      {customer.hasFood && (
        <FoodTrayProp
          position={[tablePosition[0], 0.74, tablePosition[2]]}
          rotation={[0, 0, 0]}
        />
      )}
    </>
  );
};

