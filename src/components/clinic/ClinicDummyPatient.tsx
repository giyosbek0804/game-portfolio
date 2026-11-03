"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { PatientEntity, useClinicQueueStore } from "@/store/useClinicQueueStore";
import { useGameStore } from "@/store/useGameStore";

interface ClinicDummyPatientProps {
  patient: PatientEntity;
  chairPositions: [number, number, number][];
}

export const ClinicDummyPatient: React.FC<ClinicDummyPatientProps> = ({
  patient,
  chairPositions,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const torsoRef = useRef<THREE.Group>(null);
  const leftLegRef = useRef<THREE.Group>(null);
  const leftKneeRef = useRef<THREE.Group>(null);
  const rightLegRef = useRef<THREE.Group>(null);
  const rightKneeRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);

  const kioskTimer = useRef(0);
  const setPatientState = useClinicQueueStore((state) => state.setPatientState);

  // Position & Orientation
  const chairPos =
    patient.chairIndex >= 0 && patient.chairIndex < chairPositions.length
      ? chairPositions[patient.chairIndex]
      : [-8.6, 0, -9.2];

  // Spawn position based on initial state
  const currentPos = useRef(
    new THREE.Vector3(
      patient.state === "entering_clinic"
        ? -5.4
        : patient.state === "at_kiosk"
        ? -6.7
        : patient.state === "in_consultation" ||
          patient.state === "receiving_prescription" ||
          patient.state === "leaving_clinic"
        ? -10.5
        : chairPos[0],
      0,
      patient.state === "entering_clinic"
        ? -11.5
        : patient.state === "at_kiosk"
        ? -11.0
        : patient.state === "in_consultation" ||
          patient.state === "receiving_prescription"
        ? -15.2
        : patient.state === "leaving_clinic"
        ? -14.6
        : chairPos[2]
    )
  );

  // Initial yaw:
  // Math.PI faces South (-Z towards room and doctor), 0 faces North (+Z towards wall)
  const currentYaw = useRef(
    patient.state === "entering_clinic"
      ? -Math.PI * 0.5 // Walking West from entrance
      : patient.state === "at_kiosk"
      ? -Math.PI * 0.55 // Facing kiosk terminal
      : Math.PI // Seated facing South (-Z) into the room and towards doctor
  );

  const walkCycle = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Performance safeguard: halt updates when player is outside or in distant rooms
    const playerZone = useGameStore.getState().playerZone;
    if (playerZone !== "clinic" && playerZone !== "museum") return;

    let targetYaw = currentYaw.current;

    // ─────────────────────────────────────────────────────────────
    // 1. KINEMATICS & AUTONOMOUS STATE MACHINE
    // ─────────────────────────────────────────────────────────────

    // A. ENTERING CLINIC -> WALKS TO KIOSK
    if (patient.state === "entering_clinic") {
      groupRef.current.visible = true;
      const kioskSpot = new THREE.Vector3(-6.7, 0, -11.0);
      const dist = currentPos.current.distanceTo(kioskSpot);

      if (dist > 0.12) {
        walkCycle.current += delta * 7.0;
        const angle = Math.atan2(
          kioskSpot.x - currentPos.current.x,
          kioskSpot.z - currentPos.current.z
        );
        targetYaw = angle;
        const speed = 1.6;
        currentPos.current.x += Math.sin(angle) * speed * delta;
        currentPos.current.z += Math.cos(angle) * speed * delta;
      } else {
        // Arrived at kiosk: transition to "at_kiosk"
        currentPos.current.copy(kioskSpot);
        kioskTimer.current = 0;
        setPatientState(patient.id, "at_kiosk");
      }
    }

    // B. AT KIOSK -> WAITS ~1.3s & TOUCHES SCREEN TO TAKE TICKET
    else if (patient.state === "at_kiosk") {
      groupRef.current.visible = true;
      targetYaw = -Math.PI * 0.55; // Face kiosk touchscreen
      kioskTimer.current += delta;

      if (kioskTimer.current >= 1.4) {
        // Ticket acquired! Walk to assigned waiting chair
        kioskTimer.current = 0;
        setPatientState(patient.id, "walking_to_chair");
      }
    }

    // C. WALKING TO CHAIR -> NAVIGATES AISLE TO ASSIGNED CHAIR
    else if (patient.state === "walking_to_chair") {
      groupRef.current.visible = true;

      // Waypoint 1: Step into central corridor [-7.5, 0, -11.4]
      // Waypoint 2: Walk along corridor to chair X [chairPos[0], 0, -11.4]
      // Waypoint 3: Step into chair [chairPos[0], 0, -9.2]
      let targetWaypoint: THREE.Vector3;
      if (currentPos.current.x > -7.4 && currentPos.current.z < -11.2) {
        targetWaypoint = new THREE.Vector3(-7.5, 0, -11.4);
      } else if (Math.abs(currentPos.current.x - chairPos[0]) > 0.15) {
        targetWaypoint = new THREE.Vector3(chairPos[0], 0, -11.4);
      } else {
        targetWaypoint = new THREE.Vector3(chairPos[0], 0, chairPos[2]);
      }

      const dist = currentPos.current.distanceTo(targetWaypoint);
      if (dist > 0.1) {
        walkCycle.current += delta * 7.0;
        const angle = Math.atan2(
          targetWaypoint.x - currentPos.current.x,
          targetWaypoint.z - currentPos.current.z
        );
        targetYaw = angle;
        const speed = 1.6;
        currentPos.current.x += Math.sin(angle) * speed * delta;
        currentPos.current.z += Math.cos(angle) * speed * delta;
      } else if (targetWaypoint.z > -10.0) {
        // Reached seat! Turn to face room and sit down
        currentPos.current.set(chairPos[0], 0, chairPos[2]);
        setPatientState(patient.id, "waiting_chair");
      }
    }

    // D. WAITING IN CHAIR -> SEATED FACING ROOM & QUEUE BOARD
    else if (patient.state === "waiting_chair") {
      groupRef.current.visible = true;
      currentPos.current.set(chairPos[0], 0, chairPos[2]);
      // Math.PI faces South (-Z towards room and queue display board)
      // Back is pressed comfortably against the North backrest (+Z)
      targetYaw = Math.PI;
    }

    // E. WALKING TO DOCTOR
    else if (patient.state === "walking_to_doctor") {
      groupRef.current.visible = true;

      // Waypoint 1: Step south into aisle [chairPos[0], 0, -11.4]
      // Waypoint 2: Walk west along aisle to doctor door [-10.5, 0, -13.1]
      // Waypoint 3: Walk to consultation stool [-10.5, 0, -15.2]
      let targetWaypoint: THREE.Vector3;
      if (currentPos.current.z > -11.0) {
        targetWaypoint = new THREE.Vector3(currentPos.current.x, 0, -11.4);
      } else if (currentPos.current.z > -13.1) {
        targetWaypoint = new THREE.Vector3(-10.5, 0, -13.1);
      } else {
        targetWaypoint = new THREE.Vector3(-10.5, 0, -15.2);
      }

      const dist = currentPos.current.distanceTo(targetWaypoint);
      if (dist > 0.12) {
        walkCycle.current += delta * 7.2;
        const angle = Math.atan2(
          targetWaypoint.x - currentPos.current.x,
          targetWaypoint.z - currentPos.current.z
        );
        targetYaw = angle;
        const speed = 1.6;
        currentPos.current.x += Math.sin(angle) * speed * delta;
        currentPos.current.z += Math.cos(angle) * speed * delta;
      } else if (currentPos.current.z <= -15.0) {
        // Reached stool: sit down facing doctor towards -Z
        targetYaw = Math.PI;
      }
    }

    // F. IN CONSULTATION / RECEIVING PRESCRIPTION
    else if (
      patient.state === "in_consultation" ||
      patient.state === "receiving_prescription"
    ) {
      groupRef.current.visible = true;
      currentPos.current.set(-10.5, 0, -15.2);
      // Math.PI faces doctor desk at -15.8 (-Z)
      targetYaw = Math.PI;
    }

    // G. LEAVING CLINIC -> MULTI-WAYPOINT TO MUSEUM ARCHWAY
    else if (patient.state === "leaving_clinic") {
      // Waypoint 1: Walk out of doctor's office [-10.5, 0, -12.8]
      // Waypoint 2: Walk across waiting hall towards archway [-6.0, 0, -11.5]
      // Waypoint 3: Walk straight through archway into museum [-3.2, 0, -11.5]
      let targetWaypoint: THREE.Vector3;
      if (currentPos.current.z < -13.0) {
        targetWaypoint = new THREE.Vector3(-10.5, 0, -12.8);
      } else if (currentPos.current.x < -6.2) {
        targetWaypoint = new THREE.Vector3(-6.0, 0, -11.5);
      } else {
        targetWaypoint = new THREE.Vector3(-3.2, 0, -11.5);
      }

      const dist = currentPos.current.distanceTo(targetWaypoint);
      if (dist > 0.12) {
        walkCycle.current += delta * 7.5;
        const angle = Math.atan2(
          targetWaypoint.x - currentPos.current.x,
          targetWaypoint.z - currentPos.current.z
        );
        targetYaw = angle;
        const speed = 1.7;
        currentPos.current.x += Math.sin(angle) * speed * delta;
        currentPos.current.z += Math.cos(angle) * speed * delta;
      }

      // Once patient safely walks into museum (x >= -4.5), cleanly hide figure
      if (currentPos.current.x >= -4.5) {
        groupRef.current.visible = false;
      } else {
        groupRef.current.visible = true;
      }
    }

    // Smoothly rotate yaw toward target
    let angleDiff = targetYaw - currentYaw.current;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    currentYaw.current += angleDiff * Math.min(delta * 6.5, 1.0);

    groupRef.current.position.copy(currentPos.current);
    groupRef.current.rotation.y = currentYaw.current;

    // ─────────────────────────────────────────────────────────────
    // 2. PROCEDURAL 2-PART LEG RIG (SITTING VS WALKING)
    // ─────────────────────────────────────────────────────────────
    const isSeated =
      patient.state === "waiting_chair" ||
      patient.state === "in_consultation" ||
      patient.state === "receiving_prescription";

    if (isSeated) {
      // SEATED POSE:
      // Torso rests at chair height (0.48m)
      if (torsoRef.current) {
        torsoRef.current.position.y = 0.48;
        torsoRef.current.rotation.x = 0.04;
      }

      // Hips at 0.46m: Thighs extend forward horizontally (rotation.x = -PI/2)
      // Knees bend down 90 degrees (rotation.x = PI/2)
      // Shins hang straight down to floor, feet resting flat at y = 0.02m!
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

      // Arms resting on knees or receiving prescription
      if (leftArmRef.current && rightArmRef.current) {
        leftArmRef.current.rotation.x = -0.65;
        leftArmRef.current.rotation.z = -0.15;

        if (patient.state === "receiving_prescription") {
          // Reaching out right hand to receive prescription paper from doctor
          rightArmRef.current.rotation.x = -Math.PI * 0.45;
          rightArmRef.current.rotation.z = 0.1;
        } else {
          // Resting on knee holding queue ticket
          rightArmRef.current.rotation.x = -0.65;
          rightArmRef.current.rotation.z = 0.15;
        }
      }

      // Head: gentle glance towards queue monitor or doctor
      if (headRef.current) {
        if (patient.state === "waiting_chair") {
          // Attentively looks slightly up at the LED queue board
          const glance = Math.sin(state.clock.elapsedTime * 0.8) > 0.35 ? 0.22 : 0.06;
          headRef.current.rotation.x = THREE.MathUtils.lerp(
            headRef.current.rotation.x,
            glance,
            delta * 4
          );
        } else {
          headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2.0) * 0.04 + 0.08;
        }
      }
    } else {
      // STANDING & WALKING POSE:
      if (torsoRef.current) {
        const bob = Math.abs(Math.sin(walkCycle.current)) * 0.035;
        torsoRef.current.position.y = 0.68 + bob;
        torsoRef.current.rotation.x = 0;
      }

      const isWalking =
        patient.state === "entering_clinic" ||
        patient.state === "walking_to_chair" ||
        patient.state === "walking_to_doctor" ||
        patient.state === "leaving_clinic";

      if (leftLegRef.current && rightLegRef.current) {
        leftLegRef.current.position.y = 0.64;
        rightLegRef.current.position.y = 0.64;

        if (isWalking) {
          const swing = Math.sin(walkCycle.current) * 0.42;
          leftLegRef.current.rotation.x = swing;
          rightLegRef.current.rotation.x = -swing;

          // Natural knee flexion during backward swing
          if (leftKneeRef.current && rightKneeRef.current) {
            leftKneeRef.current.rotation.x = Math.max(0, -swing * 0.5);
            rightKneeRef.current.rotation.x = Math.max(0, swing * 0.5);
          }
        } else {
          // Standing still (e.g., at kiosk)
          leftLegRef.current.rotation.x = 0;
          rightLegRef.current.rotation.x = 0;
          if (leftKneeRef.current && rightKneeRef.current) {
            leftKneeRef.current.rotation.x = 0;
            rightKneeRef.current.rotation.x = 0;
          }
        }
      }

      // Arm gestures for standing & walking
      if (leftArmRef.current && rightArmRef.current) {
        if (patient.state === "at_kiosk") {
          // Reaching right hand to touch the kiosk touch screen
          rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
            rightArmRef.current.rotation.x,
            -Math.PI * 0.42,
            delta * 6
          );
          rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
            rightArmRef.current.rotation.z,
            0.18,
            delta * 6
          );
          leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
            leftArmRef.current.rotation.x,
            -0.1,
            delta * 4
          );
          leftArmRef.current.rotation.z = -0.08;
        } else if (patient.hasPrescription) {
          // Holding prescription slip while leaving
          rightArmRef.current.rotation.x = -0.6;
          rightArmRef.current.rotation.z = 0.2;
          leftArmRef.current.rotation.x = -Math.sin(walkCycle.current) * 0.3;
          leftArmRef.current.rotation.z = -0.08;
        } else if (patient.state === "walking_to_chair") {
          // Holding newly printed queue ticket while walking to chair
          rightArmRef.current.rotation.x = -0.55;
          rightArmRef.current.rotation.z = 0.18;
          leftArmRef.current.rotation.x = -Math.sin(walkCycle.current) * 0.35;
          leftArmRef.current.rotation.z = -0.08;
        } else {
          // Natural walking arm swing
          const swing = isWalking ? Math.sin(walkCycle.current) * 0.35 : 0;
          leftArmRef.current.rotation.x = -swing;
          rightArmRef.current.rotation.x = swing;
          leftArmRef.current.rotation.z = -0.06;
          rightArmRef.current.rotation.z = 0.06;
        }
      }

      if (headRef.current) {
        if (patient.state === "at_kiosk") {
          headRef.current.rotation.x = 0.18; // Looking down at touch screen
        } else {
          headRef.current.rotation.x = 0;
        }
      }
    }
  });

  // Does the patient hold a printed paper ticket?
  const hasTicket =
    patient.state === "walking_to_chair" ||
    patient.state === "waiting_chair" ||
    patient.state === "walking_to_doctor" ||
    (patient.state === "at_kiosk" && kioskTimer.current > 0.7);

  return (
    <group ref={groupRef} position={[chairPos[0], 0, chairPos[2]]}>
      {/* Contact Shadow Disc on Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.3, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.3} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2-PART LEGS WITH HIP & KNEE JOINTS
          ───────────────────────────────────────────────────────────── */}
      <group position={[0, 0, 0]}>
        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.1, 0.64, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.13, 0]}>
            <cylinderGeometry args={[0.042, 0.038, 0.26, 12]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>

          {/* Knee Joint Pivot */}
          <group ref={leftKneeRef} position={[0, -0.26, 0]}>
            {/* Knee cap */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Shin */}
            <mesh position={[0, -0.19, 0]}>
              <cylinderGeometry args={[0.038, 0.032, 0.38, 12]} />
              <meshStandardMaterial
                color="#334155"
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.38, 0.04]}>
              <boxGeometry args={[0.08, 0.045, 0.14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
          </group>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.1, 0.64, 0]}>
          {/* Thigh */}
          <mesh position={[0, -0.13, 0]}>
            <cylinderGeometry args={[0.042, 0.038, 0.26, 12]} />
            <meshStandardMaterial
              color="#334155"
              roughness={0.6}
              metalness={0.1}
            />
          </mesh>

          {/* Knee Joint Pivot */}
          <group ref={rightKneeRef} position={[0, -0.26, 0]}>
            {/* Knee cap */}
            <mesh position={[0, 0, 0]}>
              <sphereGeometry args={[0.038, 10, 10]} />
              <meshStandardMaterial color="#334155" roughness={0.6} metalness={0.1} />
            </mesh>
            {/* Shin */}
            <mesh position={[0, -0.19, 0]}>
              <cylinderGeometry args={[0.038, 0.032, 0.38, 12]} />
              <meshStandardMaterial
                color="#334155"
                roughness={0.6}
                metalness={0.1}
              />
            </mesh>
            {/* Foot */}
            <mesh position={[0, -0.38, 0.04]}>
              <boxGeometry args={[0.08, 0.045, 0.14]} />
              <meshStandardMaterial color="#0f172a" roughness={0.4} />
            </mesh>
          </group>
        </group>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          UPPER BODY (PELVIS, TORSO, HEAD, ARMS)
          ───────────────────────────────────────────────────────────── */}
      <group ref={torsoRef} position={[0, 0.68, 0]}>
        {/* Pelvis */}
        <mesh position={[0, 0.03, 0]}>
          <cylinderGeometry args={[0.13, 0.11, 0.1, 16]} />
          <meshStandardMaterial color="#334155" roughness={0.6} />
        </mesh>

        {/* Torso Capsule */}
        <mesh position={[0, 0.26, 0]}>
          <cylinderGeometry args={[0.15, 0.13, 0.42, 16]} />
          <meshStandardMaterial
            color="#f8fafc"
            roughness={0.35}
            metalness={0.05}
          />
        </mesh>

        {/* Patient Accent / Scarf */}
        <group position={[0, 0.32, 0.13]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.09, 0.09, 0.01]} />
            <meshStandardMaterial
              color={patient.accentColor}
              emissive={patient.accentColor}
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>

        {/* Neck */}
        <mesh position={[0, 0.52, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 12]} />
          <meshStandardMaterial color="#e2e8f0" roughness={0.4} />
        </mesh>

        {/* Head */}
        <group ref={headRef} position={[0, 0.66, 0]}>
          <mesh>
            <sphereGeometry args={[0.165, 20, 20]} />
            <meshStandardMaterial
              color="#ffffff"
              roughness={0.3}
              metalness={0.05}
            />
          </mesh>
          <mesh position={[0, 0.02, 0.14]}>
            <boxGeometry args={[0.14, 0.028, 0.03]} />
            <meshStandardMaterial
              color={patient.accentColor}
              emissive={patient.accentColor}
              emissiveIntensity={0.8}
            />
          </mesh>
        </group>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.2, 0.42, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.036, 0.03, 0.42, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.44, 0]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
        </group>

        {/* Right Arm (Reaches at Kiosk / Holds Ticket / Receives Prescription) */}
        <group ref={rightArmRef} position={[0.2, 0.42, 0]}>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[0.045, 10, 10]} />
            <meshStandardMaterial color="#f1f5f9" />
          </mesh>
          <mesh position={[0, -0.22, 0]}>
            <cylinderGeometry args={[0.036, 0.03, 0.42, 12]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.44, 0]}>
            <sphereGeometry args={[0.038, 10, 10]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          {/* Paper Item in Hand */}
          {patient.hasPrescription ? (
            // White Doctor's Prescription Slip
            <group position={[0.02, -0.46, 0.06]} rotation={[0.4, 0.2, -0.1]}>
              <mesh>
                <boxGeometry args={[0.13, 0.17, 0.003]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.04, 0.002]}>
                <planeGeometry args={[0.04, 0.04]} />
                <meshBasicMaterial color="#0284c7" />
              </mesh>
            </group>
          ) : hasTicket ? (
            // Paper Queue Ticket
            <group position={[0.02, -0.46, 0.05]} rotation={[0.5, 0.1, -0.2]}>
              <mesh>
                <boxGeometry args={[0.08, 0.11, 0.002]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.3} />
              </mesh>
            </group>
          ) : null}
        </group>
      </group>
    </group>
  );
};
