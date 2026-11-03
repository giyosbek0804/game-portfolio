"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useClinicQueueStore } from "@/store/useClinicQueueStore";

interface QueueDisplayBoardProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const QueueDisplayBoard: React.FC<QueueDisplayBoardProps> = ({
  position = [-10.5, 2.7, -13.46],
  rotation = [0, 0, 0],
}) => {
  const currentTicket = useClinicQueueStore((state) => state.currentTicket);
  const doctorStatus = useClinicQueueStore((state) => state.doctorStatus);
  const statusText = useClinicQueueStore((state) => state.statusText);
  const isUserTurn = useClinicQueueStore((state) => state.isUserTurn);
  const patients = useClinicQueueStore((state) => state.patients);

  // Generate dynamic canvas texture for the clinic TV monitor
  const screenTexture = useMemo(() => {
    if (typeof window === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 340;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Background: Dark medical slate
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top Header Banner
    const isGold = isUserTurn || currentTicket.startsWith("VIP");
    ctx.fillStyle = isGold ? "#78350f" : "#0f766e";
    ctx.fillRect(0, 0, canvas.width, 58);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("🏥 NAVBAT CLINIC · DR. KARIMOV (CARDIOLOGY)", 28, 29);

    // Right header badge
    ctx.fillStyle = isGold ? "#fbbf24" : "#2dd4bf";
    ctx.font = "bold 20px monospace, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("ROOM #1", canvas.width - 28, 29);

    // Center Ticket Box
    ctx.fillStyle = "#0f172a";
    ctx.strokeStyle = isGold ? "#f59e0b" : "#14b8a6";
    ctx.lineWidth = 4;
    ctx.strokeRect(28, 76, canvas.width - 56, 175);
    ctx.fillRect(28, 76, canvas.width - 56, 175);

    // Label: "NOW SERVING"
    ctx.fillStyle = "#94a3b8";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("NOW SERVING", canvas.width / 2, 115);

    // Huge Ticket Number: e.g. "A-02" or "VIP-01"
    ctx.fillStyle = isGold ? "#fbbf24" : doctorStatus === "calling" ? "#34d399" : "#38bdf8";
    ctx.font = "bold 92px sans-serif";
    ctx.fillText(currentTicket, canvas.width / 2, 192);

    // Bottom Status Bar
    ctx.fillStyle = "#020617";
    ctx.fillRect(0, 268, canvas.width, 72);

    // Status Pill
    const statusBg =
      isGold
        ? "#eab308"
        : doctorStatus === "calling"
        ? "#10b981"
        : doctorStatus === "break"
        ? "#f43f5e"
        : "#0284c7";

    ctx.fillStyle = statusBg;
    ctx.beginPath();
    ctx.roundRect(28, 282, 380, 44, 12);
    ctx.fill();

    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(statusText, 218, 304);

    // Live waiting tickets preview from active queue
    const waitingTickets = patients
      .filter(
        (p) =>
          p.state === "waiting_chair" ||
          p.state === "walking_to_chair" ||
          p.state === "at_kiosk"
      )
      .map((p) => p.ticket)
      .slice(0, 4)
      .join(", ");

    ctx.fillStyle = "#cbd5e1";
    ctx.font = "bold 18px monospace, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(
      waitingTickets ? `Waiting: ${waitingTickets}` : "Queue: Ready",
      canvas.width - 32,
      304
    );

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, [currentTicket, doctorStatus, statusText, isUserTurn, patients]);

  return (
    <group position={position} rotation={rotation}>
      {/* Wall Bracket Arms */}
      <mesh position={[-0.7, 0, -0.06]}>
        <boxGeometry args={[0.08, 0.4, 0.12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>
      <mesh position={[0.7, 0, -0.06]}>
        <boxGeometry args={[0.08, 0.4, 0.12]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} />
      </mesh>

      {/* Monitor Outer Chassis */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.24, 0.76, 0.08]} />
        <meshStandardMaterial
          color="#0f172a"
          roughness={0.3}
          metalness={0.8}
        />
      </mesh>

      {/* Screen Face Plane */}
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[2.16, 0.68]} />
        {screenTexture ? (
          <meshBasicMaterial map={screenTexture} />
        ) : (
          <meshBasicMaterial color="#020617" />
        )}
      </mesh>

      {/* Audio / Calling Indicator Pulsing LED Bar */}
      <mesh position={[0, 0.35, 0.042]}>
        <planeGeometry args={[2.16, 0.015]} />
        <meshBasicMaterial
          color={
            isUserTurn
              ? "#fbbf24"
              : doctorStatus === "calling"
              ? "#34d399"
              : "#0d9488"
          }
        />
      </mesh>
    </group>
  );
};
