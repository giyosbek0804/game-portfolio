"use client";

import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ClinicDoctorDoor } from "./ClinicDoctorDoor";
import { QueueDisplayBoard } from "./QueueDisplayBoard";
import { TicketKiosk } from "./TicketKiosk";
import { ClinicDoctorFigure } from "./ClinicDoctorFigure";
import { ClinicDummyPatient } from "./ClinicDummyPatient";
import { useClinicQueueStore } from "@/store/useClinicQueueStore";

export const ClinicRoomGeometry: React.FC = () => {
  const patients = useClinicQueueStore((state) => state.patients);
  const tickSimulation = useClinicQueueStore((state) => state.tickSimulation);
  const userTicketStatus = useClinicQueueStore((state) => state.userTicketStatus);
  const setUserEnteredOffice = useClinicQueueStore(
    (state) => state.setUserEnteredOffice
  );

  // Drive queue state machine and detect if player entered doctor office
  useFrame((state, delta) => {
    tickSimulation(delta);

    if (userTicketStatus === "called") {
      const p = state.camera.position;
      if (p.x < -8.8 && p.z < -13.6) {
        setUserEnteredOffice();
      }
    }
  });

  // 4 Waiting Chair Coordinates tucked neatly along the North Wall
  const chairPositions: [number, number, number][] = useMemo(
    () => [
      [-8.6, 0, -9.2],
      [-9.4, 0, -9.2],
      [-10.2, 0, -9.2],
      [-11.0, 0, -9.2],
    ],
    []
  );

  return (
    <group name="navbat-clinic-wing">
      {/* ─────────────────────────────────────────────────────────────
          1. CLINIC FLOORS
          ───────────────────────────────────────────────────────────── */}
      {/* Waiting Hall Floor (Light hygienic medical vinyl) */}
      <mesh position={[-9.7, 0.005, -11.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.6, 5.0]} />
        <meshStandardMaterial
          color="#f1f5f9"
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* Doctor Office Floor (Slightly warmer clean clinical floor) */}
      <mesh position={[-11.0, 0.005, -15.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.0, 3.7]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.45}
          metalness={0.1}
        />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. CLINIC WALLS
          ───────────────────────────────────────────────────────────── */}
      {/* Waiting Hall Ceiling */}
      <mesh position={[-9.7, 3.4, -11.0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.6, 5.0]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Doctor Office Ceiling */}
      <mesh position={[-11.0, 3.4, -15.35]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6.0, 3.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* North Wall of Waiting Hall (at z = -8.5) */}
      <mesh position={[-9.7, 1.7, -8.5]}>
        <boxGeometry args={[8.6, 3.4, 0.12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* West Wall of Waiting Hall & Doctor Office (at x = -14.0) */}
      <mesh position={[-14.0, 1.7, -12.85]}>
        <boxGeometry args={[0.12, 3.4, 8.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* South Wall of Doctor Office (at z = -17.2) */}
      <mesh position={[-11.0, 1.7, -17.2]}>
        <boxGeometry args={[6.0, 3.4, 0.12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* East Wall of Doctor Office (at x = -8.0, z from -13.5 to -17.2) */}
      <mesh position={[-8.0, 1.7, -15.35]}>
        <boxGeometry args={[0.12, 3.4, 3.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          3. DIVIDING WALL BETWEEN WAITING HALL & DOCTOR OFFICE (at z = -13.5)
          Doorway opening at x = -10.5 (width 1.2m, height 2.4m)
          ───────────────────────────────────────────────────────────── */}
      {/* Wall segment Left of Doctor's Door (x from -14.0 to -11.1) */}
      <mesh position={[-12.55, 1.7, -13.5]}>
        <boxGeometry args={[2.9, 3.4, 0.12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Wall segment Right of Doctor's Door (x from -9.9 to -8.0) */}
      <mesh position={[-8.95, 1.7, -13.5]}>
        <boxGeometry args={[1.9, 3.4, 0.12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Wall segment Above Doctor's Door (x = -10.5, y from 2.4 to 3.4) */}
      <mesh position={[-10.5, 2.9, -13.5]}>
        <boxGeometry args={[1.2, 1.0, 0.12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* Teal Accent Wainscoting Strip along Waiting Hall Wall */}
      <mesh position={[-9.7, 0.45, -8.44]}>
        <boxGeometry args={[8.5, 0.85, 0.01]} />
        <meshStandardMaterial color="#0f766e" roughness={0.3} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          4. ENTRANCE ARCHWAY FROM MUSEUM GALLERY (at x = -5.4, z = -11.5)
          ───────────────────────────────────────────────────────────── */}
      {/* Archway Lintel Frame */}
      <group position={[-5.4, 1.4, -11.5]}>
        {/* Left Jamb */}
        <mesh position={[0, 0, -1.1]}>
          <boxGeometry args={[0.2, 2.8, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Right Jamb */}
        <mesh position={[0, 0, 1.1]}>
          <boxGeometry args={[0.2, 2.8, 0.12]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Top Header */}
        <mesh position={[0, 1.4, 0]}>
          <boxGeometry args={[0.2, 0.22, 2.32]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        {/* Entrance Illuminated Sign Plate */}
        <mesh position={[-0.11, 1.4, 0]}>
          <planeGeometry args={[2.1, 0.18]} />
          <meshBasicMaterial color="#0f766e" />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. WAITING HALL FURNITURE: 4 HOSPITAL CHAIRS ALONG NORTH WALL
          ───────────────────────────────────────────────────────────── */}
      {chairPositions.map(([cx, , cz], i) => (
        <group key={`chair_${i}`} position={[cx, 0, cz]} rotation={[0, 0, 0]}>
          {/* Chair Legs Metal Frame */}
          <mesh position={[-0.18, 0.22, -0.16]}>
            <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[0.18, 0.22, -0.16]}>
            <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[-0.18, 0.22, 0.16]}>
            <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[0.18, 0.22, 0.16]}>
            <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          {/* Ergonomic Molded Teal Seat */}
          <mesh position={[0, 0.44, 0]}>
            <boxGeometry args={[0.44, 0.045, 0.42]} />
            <meshStandardMaterial color="#0d9488" roughness={0.4} />
          </mesh>
          {/* Backrest against North Wall */}
          <mesh position={[0, 0.68, 0.18]} rotation={[-0.08, 0, 0]}>
            <boxGeometry args={[0.42, 0.42, 0.035]} />
            <meshStandardMaterial color="#0d9488" roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* Water Dispenser Cooler tucked in corner */}
      <group position={[-13.2, 0, -9.2]}>
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[0.32, 0.96, 0.32]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        <mesh position={[0, 1.12, 0]}>
          <cylinderGeometry args={[0.13, 0.13, 0.32, 16]} />
          <meshStandardMaterial
            color="#38bdf8"
            transparent
            opacity={0.7}
            roughness={0.1}
          />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          6. DOCTOR'S OFFICE INTERIOR: DESK, LAPTOP, PATIENT CHAIR, PROPS
          ───────────────────────────────────────────────────────────── */}
      {/* Consultation Desk (at x = -10.5, z = -15.8) */}
      <group position={[-10.5, 0, -15.8]}>
        {/* Desktop Slab */}
        <mesh position={[0, 0.74, 0]}>
          <boxGeometry args={[1.5, 0.05, 0.8]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Metal Leg Posts */}
        <mesh position={[-0.7, 0.36, -0.35]}>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0.7, 0.36, -0.35]}>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[-0.7, 0.36, 0.35]}>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0.7, 0.36, 0.35]}>
          <boxGeometry args={[0.06, 0.72, 0.06]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>

        {/* Doctor's Laptop */}
        <group position={[0, 0.77, -0.05]}>
          {/* Laptop Base */}
          <mesh position={[0, 0.006, 0]}>
            <boxGeometry args={[0.3, 0.012, 0.22]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
          {/* Laptop Screen Lid open at 110 deg */}
          <mesh position={[0, 0.1, -0.1]} rotation={[-0.35, 0, 0]}>
            <boxGeometry args={[0.3, 0.19, 0.008]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
          {/* Glowing Navbat Doctor Portal Screen */}
          <mesh position={[0, 0.1, -0.095]} rotation={[-0.35, 0, 0]}>
            <planeGeometry args={[0.28, 0.17]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* Prescription Paper Pad & Medical Pen */}
        <mesh position={[0.42, 0.77, 0.1]}>
          <boxGeometry args={[0.16, 0.015, 0.22]} />
          <meshStandardMaterial color="#ffffff" roughness={0.2} />
        </mesh>
        <mesh position={[0.54, 0.78, 0.1]} rotation={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.15, 8]} />
          <meshStandardMaterial color="#0284c7" metalness={0.8} />
        </mesh>

        {/* Modern Desk Lamp */}
        <group position={[-0.55, 0.77, -0.2]}>
          <mesh position={[0, 0.01, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.02, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.34, 8]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} />
          </mesh>
          <mesh position={[0.06, 0.34, 0]} rotation={[0, 0, -0.6]}>
            <cylinderGeometry args={[0.04, 0.07, 0.1, 12]} />
            <meshStandardMaterial color="#0f172a" metalness={0.7} />
          </mesh>
        </group>
      </group>

      {/* Patient Consultation Stool/Chair (at x = -10.5, z = -15.2, facing desk) */}
      <group position={[-10.5, 0, -15.2]} rotation={[0, 0, 0]}>
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.44, 8]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.04, 16]} />
          <meshStandardMaterial color="#334155" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.44, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.06, 16]} />
          <meshStandardMaterial color="#0d9488" roughness={0.3} />
        </mesh>
      </group>

      {/* Framed Medical Certificates on Doctor Office Back Wall */}
      <group position={[-10.5, 2.1, -17.13]}>
        <mesh position={[-0.6, 0, 0]}>
          <boxGeometry args={[0.42, 0.54, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[-0.6, 0, 0.012]}>
          <planeGeometry args={[0.36, 0.48]} />
          <meshBasicMaterial color="#fef08a" />
        </mesh>

        <mesh position={[0.6, 0, 0]}>
          <boxGeometry args={[0.42, 0.54, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0.6, 0, 0.012]}>
          <planeGeometry args={[0.36, 0.48]} />
          <meshBasicMaterial color="#e0f2fe" />
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          7. MOUNTED COMPONENTS: TICKET KIOSK, QUEUE BOARD, DOOR
          ───────────────────────────────────────────────────────────── */}
      {/* Self-Service Touch Ticket Kiosk (User can press [E] to take VIP ticket) */}
      <TicketKiosk position={[-7.2, 0, -11.0]} rotation={[0, -Math.PI * 0.45, 0]} />

      {/* Doctor Office Door */}
      <ClinicDoctorDoor position={[-10.5, 0, -13.5]} />

      {/* Digital LED Queue Display Board mounted directly above door */}
      <QueueDisplayBoard position={[-10.5, 2.7, -13.44]} rotation={[0, 0, 0]} />

      {/* Doctor Sitting at Desk */}
      <ClinicDoctorFigure />

      {/* Seated & Moving Patient Dummies */}
      {patients.map((patient) => (
        <ClinicDummyPatient
          key={patient.id}
          patient={patient}
          chairPositions={chairPositions}
        />
      ))}
    </group>
  );
};
