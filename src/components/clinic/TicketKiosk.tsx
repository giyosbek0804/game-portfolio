"use client";

import React, { useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useClinicQueueStore } from "@/store/useClinicQueueStore";
import { useGameStore } from "@/store/useGameStore";

interface TicketKioskProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const TicketKiosk: React.FC<TicketKioskProps> = ({
  position = [-8.8, 0, -10.2],
  rotation = [0, Math.PI * 0.25, 0], // Angled invitingly toward clinic entrance
}) => {
  const takeUserTicket = useClinicQueueStore((state) => state.takeUserTicket);
  const userTicket = useClinicQueueStore((state) => state.userTicket);
  const targetedInteractable = useGameStore((state) => state.targetedInteractable);

  const [paperExtrusion, setPaperExtrusion] = useState(0);
  const isTargeted = targetedInteractable?.id === "ticket-kiosk";

  useFrame((_, delta) => {
    if (userTicket && paperExtrusion < 1.0) {
      setPaperExtrusion((prev) => Math.min(1.0, prev + delta * 2.5));
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    takeUserTicket();
  };

  return (
    <group position={position} rotation={rotation}>
      {/* Contact Shadow Disc on Floor */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.42, 20]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.35} />
      </mesh>

      {/* Invisible Interactive Hit Box for Crosshair Raycaster */}
      <mesh
        position={[0, 1.2, 0]}
        onClick={handleClick}
        userData={{
          isInteractable: true,
          type: "kiosk",
          id: "ticket-kiosk",
          name: "Navbat Ticket Kiosk",
          actionText: userTicket ? "VIP Ticket Claimed (In Queue)" : "Take Golden VIP Ticket",
        }}
      >
        <boxGeometry args={[0.7, 1.6, 0.6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Kiosk Pedestal Pillar Base */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.38, 1.1, 0.28]} />
        <meshStandardMaterial
          color="#0f172a" // Sleek dark slate
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Heavy Base Footing */}
      <mesh position={[0, 0.04, 0]}>
        <boxGeometry args={[0.48, 0.08, 0.38]} />
        <meshStandardMaterial color="#020617" roughness={0.5} metalness={0.8} />
      </mesh>

      {/* Upper Terminal Head (Angled 22 deg toward visitor) */}
      <group position={[0, 1.15, 0.02]} rotation={[-0.38, 0, 0]}>
        {/* Terminal Screen Chassis */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.52, 0.44, 0.09]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Accent Bezel (Glows gold if targeted) */}
        <mesh position={[0, 0, 0.046]}>
          <boxGeometry args={[0.46, 0.38, 0.005]} />
          <meshStandardMaterial
            color={isTargeted ? "#f59e0b" : "#0d9488"}
            emissive={isTargeted ? "#f59e0b" : "#0d9488"}
            emissiveIntensity={isTargeted ? 0.6 : 0.2}
          />
        </mesh>

        {/* Digital Touchscreen Face */}
        <mesh position={[0, 0.02, 0.048]}>
          <planeGeometry args={[0.42, 0.32]} />
          <meshBasicMaterial color="#042f2e" />
        </mesh>

        {/* Virtual Kiosk Header UI Line */}
        <mesh position={[0, 0.12, 0.049]}>
          <planeGeometry args={[0.38, 0.04]} />
          <meshBasicMaterial color="#14b8a6" />
        </mesh>

        {/* Virtual Big Touch Button: "GET TICKET" */}
        <mesh position={[0, -0.04, 0.049]}>
          <planeGeometry args={[0.34, 0.09]} />
          <meshBasicMaterial color={isTargeted ? "#fbbf24" : "#059669"} />
        </mesh>

        {/* Status text block */}
        <mesh position={[0, 0.04, 0.049]}>
          <planeGeometry args={[0.26, 0.025]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Ticket Dispenser Slot at Lower Face */}
        <mesh position={[0, -0.22, 0.02]}>
          <boxGeometry args={[0.22, 0.015, 0.04]} />
          <meshBasicMaterial color="#020617" />
        </mesh>

        {/* Dispensed Golden VIP Ticket Slip */}
        {userTicket && (
          <group position={[0, -0.23 - paperExtrusion * 0.06, 0.04]}>
            <mesh rotation={[0.2, 0, 0]}>
              <boxGeometry args={[0.14, 0.12, 0.004]} />
              <meshStandardMaterial
                color="#fbbf24" // Golden Ticket
                roughness={0.3}
                metalness={0.7}
                emissive="#f59e0b"
                emissiveIntensity={0.3}
              />
            </mesh>
          </group>
        )}
      </group>

      {/* Decorative LED Indicator on top */}
      <mesh position={[0, 1.45, -0.06]}>
        <sphereGeometry args={[0.025, 12, 12]} />
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={0.8}
        />
      </mesh>
    </group>
  );
};
