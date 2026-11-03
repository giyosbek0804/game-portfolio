"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useMenutopiaStore } from "@/store/useMenutopiaStore";

interface KitchenDisplaySystemProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
}

export const KitchenDisplaySystem: React.FC<KitchenDisplaySystemProps> = ({
  position = [10.2, 2.7, -13.48],
  rotation = [0, Math.PI, 0], // Facing the kitchen interior (+Z from -13.48)
}) => {
  const orders = useMenutopiaStore((state) => state.orders);

  // Dynamic Canvas Texture for the Kitchen Display Monitor
  const screenTexture = useMemo(() => {
    if (typeof window === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 420;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark slate kitchen monitor background
    ctx.fillStyle = "#090d16";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Header Bar
    ctx.fillStyle = "#b91c1c"; // Menutopia Red
    ctx.fillRect(0, 0, canvas.width, 64);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 26px monospace, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("🍔 MENUTOPIA KITCHEN DISPLAY SYSTEM (KDS)", 24, 32);

    ctx.fillStyle = "#fef08a";
    ctx.font = "bold 20px monospace, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("STATION #1: MAIN GRILL & PASS", canvas.width - 24, 32);

    // Render 3 Active Order Columns
    const displayOrders = orders.slice(0, 3);
    const colWidth = (canvas.width - 48) / 3;

    displayOrders.forEach((ord, index) => {
      const colX = 24 + index * colWidth;
      const colY = 82;
      const cardW = colWidth - 14;
      const cardH = 310;

      // Card Background
      ctx.fillStyle = ord.isPlayerOrder ? "#1c1917" : "#0f172a";
      ctx.strokeStyle = ord.isPlayerOrder
        ? "#f59e0b"
        : ord.status === "ready"
        ? "#10b981"
        : ord.status === "plating"
        ? "#38bdf8"
        : "#475569";
      ctx.lineWidth = ord.isPlayerOrder ? 4 : 2;

      ctx.beginPath();
      ctx.roundRect(colX, colY, cardW, cardH, 10);
      ctx.fill();
      ctx.stroke();

      // Card Header
      ctx.fillStyle = ord.isPlayerOrder ? "#78350f" : "#1e293b";
      ctx.beginPath();
      ctx.roundRect(colX, colY, cardW, 48, [10, 10, 0, 0]);
      ctx.fill();

      // Order #
      ctx.fillStyle = ord.isPlayerOrder ? "#fbbf24" : "#ffffff";
      ctx.font = "bold 22px sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(ord.orderNumber, colX + 14, colY + 24);

      // Table Tag
      ctx.fillStyle = "#94a3b8";
      ctx.font = "bold 16px monospace";
      ctx.textAlign = "right";
      ctx.fillText(
        ord.tableNumber === 0 ? "KIOSK VIP" : `TABLE ${ord.tableNumber}`,
        colX + cardW - 14,
        colY + 24
      );

      // Order Items
      ctx.fillStyle = "#f8fafc";
      ctx.font = "bold 17px sans-serif";
      ctx.textAlign = "left";

      // Simple word wrapping
      const words = ord.item.split(" ");
      let line1 = "";
      let line2 = "";
      words.forEach((w) => {
        if ((line1 + " " + w).length < 20) {
          line1 = (line1 + " " + w).trim();
        } else {
          line2 = (line2 + " " + w).trim();
        }
      });
      ctx.fillText(line1, colX + 14, colY + 95);
      if (line2) ctx.fillText(line2, colX + 14, colY + 124);

      // Status Badge at bottom
      const badgeY = colY + cardH - 58;
      const statusColor =
        ord.status === "ready"
          ? "#10b981"
          : ord.status === "plating"
          ? "#0284c7"
          : ord.status === "cooking"
          ? "#f59e0b"
          : "#64748b";

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.roundRect(colX + 14, badgeY, cardW - 28, 38, 8);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "bold 18px monospace";
      ctx.textAlign = "center";
      const statusLabel =
        ord.status === "ready"
          ? "READY FOR PICKUP"
          : ord.status === "plating"
          ? "PLATING TRAY"
          : ord.status === "cooking"
          ? `GRILLING (${Math.ceil(ord.timeRemaining)}s)`
          : ord.status.toUpperCase();
      ctx.fillText(statusLabel, colX + cardW / 2, badgeY + 19);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, [orders]);

  return (
    <group position={position} rotation={rotation}>
      {/* Ceiling Hanging Mounting Steel Poles */}
      <mesh position={[-0.8, 0.45, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>
      <mesh position={[0.8, 0.45, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color="#334155" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Monitor Chassis Frame */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.3, 0.95, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Front Screen Display Plane */}
      <mesh position={[0, 0, 0.042]}>
        <planeGeometry args={[2.22, 0.88]} />
        {screenTexture ? (
          <meshBasicMaterial map={screenTexture} />
        ) : (
          <meshBasicMaterial color="#020617" />
        )}
      </mesh>

      {/* Glowing Status Indicator Strip on Top */}
      <mesh position={[0, 0.45, 0.042]}>
        <planeGeometry args={[2.22, 0.015]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
};

