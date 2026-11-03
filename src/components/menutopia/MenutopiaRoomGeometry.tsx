"use client";

import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useMenutopiaStore } from "@/store/useMenutopiaStore";
import { KitchenDisplaySystem } from "./KitchenDisplaySystem";
import { MenutopiaChef } from "./MenutopiaChef";
import { MenutopiaCustomer } from "./MenutopiaCustomer";
import { MenutopiaWaiter } from "./MenutopiaWaiter";
import { FoodTrayProp } from "./FoodTrayProp";
import { useGameStore } from "@/store/useGameStore";

export const MenutopiaRoomGeometry: React.FC = () => {
  const customers = useMenutopiaStore((state) => state.customers);
  const tickSimulation = useMenutopiaStore((state) => state.tickSimulation);
  const placePlayerOrder = useMenutopiaStore((state) => state.placePlayerOrder);
  const playerOrder = useMenutopiaStore((state) => state.playerOrder);
  const targetedInteractable = useGameStore((state) => state.targetedInteractable);

  // Drive simulation tick per frame (throttled inside store by playerZone)
  useFrame((_, delta) => {
    const playerZone = useGameStore.getState().playerZone;
    if (playerZone !== "menutopia" && playerZone !== "museum") return;
    tickSimulation(delta);
  });

  // Table coordinates (Center of each dining table)
  const tablePositions: [number, number, number][] = useMemo(
    () => [
      [8.0, 0, -9.8],
      [10.2, 0, -9.8],
      [12.4, 0, -9.8],
    ],
    []
  );

  // Dynamic canvas texture for 4 Wall Menu Lightbox Posters
  const menuBoardTexture = useMemo(() => {
    if (typeof window === "undefined") return null;

    const canvas = document.createElement("canvas");
    canvas.width = 1536;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Dark sleek fast-food slate
    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const items = [
      {
        emoji: "🍔",
        title: "SMASH BURGERS",
        sub: "Double Angus Beef, Cheddar",
        price: "$9.99",
        tag: "BESTSELLER",
        tagColor: "#f59e0b",
      },
      {
        emoji: "🍗",
        title: "CRISPY TENDERS",
        sub: "Buttermilk Fried, Herb Dip",
        price: "$8.49",
        tag: "CRISPY",
        tagColor: "#ef4444",
      },
      {
        emoji: "🍕",
        title: "FLATBREAD PIZZA",
        sub: "Pepperoni, Mozzarella, Basil",
        price: "$11.99",
        tag: "HOT & FRESH",
        tagColor: "#10b981",
      },
      {
        emoji: "🥤",
        title: "SHAKES & SODA",
        sub: "Vanilla, Chocolate, Soda",
        price: "$4.29",
        tag: "ICE COLD",
        tagColor: "#0284c7",
      },
    ];

    const cardW = (canvas.width - 64) / 4;
    items.forEach((item, i) => {
      const cx = 16 + i * (cardW + 10);
      const cy = 16;
      const ch = canvas.height - 32;

      // Card Background
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = "#334155";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(cx, cy, cardW, ch, 16);
      ctx.fill();
      ctx.stroke();

      // Top Tag Badge
      ctx.fillStyle = item.tagColor;
      ctx.beginPath();
      ctx.roundRect(cx + 16, cy + 18, 140, 30, 8);
      ctx.fill();

      ctx.fillStyle = "#000000";
      ctx.font = "bold 16px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.tag, cx + 86, cy + 39);

      // Emoji Picture
      ctx.font = "76px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(item.emoji, cx + cardW / 2, cy + 160);

      // Title
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 26px sans-serif";
      ctx.fillText(item.title, cx + cardW / 2, cy + 240);

      // Subtitle
      ctx.fillStyle = "#94a3b8";
      ctx.font = "16px sans-serif";
      ctx.fillText(item.sub, cx + cardW / 2, cy + 280);

      // Price Tag Bar
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.roundRect(cx + 24, cy + ch - 72, cardW - 48, 50, 12);
      ctx.fill();

      ctx.fillStyle = "#fbbf24";
      ctx.font = "bold 28px monospace";
      ctx.fillText(item.price, cx + cardW / 2, cy + ch - 38);
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  const isKioskTargeted = targetedInteractable?.id === "menutopia-kiosk";

  return (
    <group name="menutopia-restaurant-wing">
      {/* ─────────────────────────────────────────────────────────────
          1. FLOORS (DINING HALL & COMMERCIAL KITCHEN)
          ───────────────────────────────────────────────────────────── */}
      {/* Dining Hall Floor (Diner Checkered Polished Vinyl) */}
      <mesh position={[10.25, 0.005, -11.0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial color="#f1f5f9" roughness={0.35} metalness={0.15} />
      </mesh>

      {/* Commercial Kitchen Floor (Non-Slip Heavy-Duty Quarry Tile) */}
      <mesh position={[10.25, 0.005, -15.35]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 3.7]} />
        <meshStandardMaterial color="#881337" roughness={0.7} metalness={0.1} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          2. CEILING & BOUNDARY WALLS
          ───────────────────────────────────────────────────────────── */}
      {/* Dining Hall Ceiling */}
      <mesh position={[10.25, 3.4, -11.0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 5.0]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>

      {/* Kitchen Ceiling */}
      <mesh position={[10.25, 3.4, -15.35]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 3.7]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* North Wall of Dining Hall (at z = -8.5) */}
      <mesh position={[10.25, 1.7, -8.5]}>
        <boxGeometry args={[8.5, 3.4, 0.12]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* East Outer Wall (at x = +14.5) */}
      <mesh position={[14.5, 1.7, -12.85]}>
        <boxGeometry args={[0.12, 3.4, 8.7]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>

      {/* South Wall of Kitchen (at z = -17.2) */}
      <mesh position={[10.25, 1.7, -17.2]}>
        <boxGeometry args={[8.5, 3.4, 0.12]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* West Wall of Menutopia (bordering Museum at x = +6.0, completely solid) */}
      {/* Kitchen West Wall segment (z from -12.7 to -17.2, length 4.5m) */}
      <mesh position={[6.0, 1.7, -14.95]}>
        <boxGeometry args={[0.12, 3.4, 4.5]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* Dining Hall West Wall segment (z from -7.0 to -10.3, length 3.3m) */}
      <mesh position={[6.0, 1.7, -8.65]}>
        <boxGeometry args={[0.12, 3.4, 3.3]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Entrance Archway Lintel (y from 2.8 to 3.4) */}
      <mesh position={[6.0, 3.1, -11.5]}>
        <boxGeometry args={[0.12, 0.6, 2.4]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* ─────────────────────────────────────────────────────────────
          3. DIVIDING WALL BETWEEN DINING HALL & KITCHEN (at z = -13.5)
          Corridor opening at x = 10.0 (width 1.2m)
          Plating pass-through window at x = 11.2 to 13.5
          ───────────────────────────────────────────────────────────── */}
      {/* Left Wall Segment (x from 6.0 to 9.4) */}
      <mesh position={[7.7, 1.7, -13.5]}>
        <boxGeometry args={[3.4, 3.4, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Lintel Above Walk-in Doorway (x from 9.4 to 10.6, y from 2.4 to 3.4) */}
      <mesh position={[10.0, 2.9, -13.5]}>
        <boxGeometry args={[1.2, 1.0, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Wall Segment below Plating Pass Window (y from 0 to 1.05, x from 10.6 to 14.5) */}
      <mesh position={[12.55, 0.525, -13.5]}>
        <boxGeometry args={[3.9, 1.05, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Wall Segment above Plating Pass Window (y from 2.2 to 3.4, x from 10.6 to 14.5) */}
      <mesh position={[12.55, 2.8, -13.5]}>
        <boxGeometry args={[3.9, 1.2, 0.12]} />
        <meshStandardMaterial color="#1e293b" roughness={0.6} />
      </mesh>

      {/* Stainless Steel Pass Counter Top Slab (y = 1.08) */}
      <mesh position={[12.55, 1.08, -13.5]}>
        <boxGeometry args={[3.9, 0.06, 0.5]} />
        <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Overhead Kitchen Display System (KDS) hanging at pass */}
      <KitchenDisplaySystem position={[12.2, 2.65, -13.48]} rotation={[0, Math.PI, 0]} />

      {/* ─────────────────────────────────────────────────────────────
          4. ILLUMINATED WALL MENU LIGHTBOXES (NORTH DINING WALL)
          ───────────────────────────────────────────────────────────── */}
      <group position={[10.25, 2.1, -8.43]}>
        {/* Outer Frame */}
        <mesh>
          <boxGeometry args={[7.2, 1.8, 0.04]} />
          <meshStandardMaterial color="#020617" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* Backlit Menu Display Face */}
        <mesh position={[0, 0, 0.022]}>
          <planeGeometry args={[7.08, 1.68]} />
          {menuBoardTexture ? (
            <meshBasicMaterial map={menuBoardTexture} />
          ) : (
            <meshBasicMaterial color="#0f172a" />
          )}
        </mesh>
      </group>

      {/* ─────────────────────────────────────────────────────────────
          5. DINING ROOM FURNITURE: 3 TABLES & SEATS
          ───────────────────────────────────────────────────────────── */}
      {tablePositions.map(([tx, , tz], i) => (
        <group key={`table_${i}`} position={[tx, 0, tz]}>
          {/* Table Center Pedestal */}
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.72, 16]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Table Base Disc */}
          <mesh position={[0, 0.015, 0]}>
            <cylinderGeometry args={[0.28, 0.28, 0.03, 20]} />
            <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Table Top Slab (Warm Natural Oak) */}
          <mesh position={[0, 0.74, 0]}>
            <boxGeometry args={[1.1, 0.04, 0.8]} />
            <meshStandardMaterial color="#78350f" roughness={0.4} />
          </mesh>

          {/* Table Number Plate */}
          <mesh position={[0, 0.765, -0.32]}>
            <boxGeometry args={[0.08, 0.01, 0.08]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* North Dining Chair (Customer sits here facing South) */}
          <group position={[0, 0, 0.58]} rotation={[0, 0, 0]}>
            {/* Legs */}
            <mesh position={[-0.18, 0.22, -0.16]}>
              <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0.18, 0.22, -0.16]}>
              <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[-0.18, 0.22, 0.16]}>
              <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            <mesh position={[0.18, 0.22, 0.16]}>
              <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
              <meshStandardMaterial color="#334155" metalness={0.8} />
            </mesh>
            {/* Cushion */}
            <mesh position={[0, 0.44, 0]}>
              <boxGeometry args={[0.44, 0.045, 0.42]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.5} />
            </mesh>
            {/* Backrest (Facing South towards table) */}
            <mesh position={[0, 0.68, 0.18]}>
              <boxGeometry args={[0.42, 0.42, 0.035]} />
              <meshStandardMaterial color="#b91c1c" roughness={0.5} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Seated Table Customers */}
      {customers.map((cust) => (
        <MenutopiaCustomer
          key={cust.id}
          customer={cust}
          tablePosition={tablePositions[cust.tableIndex]}
        />
      ))}

      {/* ─────────────────────────────────────────────────────────────
          6. FRONT ORDER COUNTER & INTERACTIVE SELF-ORDER KIOSK
          ───────────────────────────────────────────────────────────── */}
      {/* Front Service Counter Desk at [8.0, 0, -12.4] */}
      <group position={[8.0, 0, -12.4]}>
        {/* Counter Base */}
        <mesh position={[0, 0.48, 0]}>
          <boxGeometry args={[2.8, 0.96, 0.65]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
        {/* Granite Countertop */}
        <mesh position={[0, 0.98, 0]}>
          <boxGeometry args={[2.9, 0.05, 0.75]} />
          <meshStandardMaterial color="#1e293b" roughness={0.2} metalness={0.5} />
        </mesh>
        {/* POS Cash Register Terminal */}
        <group position={[0.5, 1.01, 0]}>
          <mesh position={[0, 0.08, 0]} rotation={[-0.3, 0, 0]}>
            <boxGeometry args={[0.26, 0.22, 0.08]} />
            <meshStandardMaterial color="#020617" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.1, 0.04]} rotation={[-0.3, 0, 0]}>
            <planeGeometry args={[0.24, 0.18]} />
            <meshBasicMaterial color="#0284c7" />
          </mesh>
        </group>

        {/* Ready Food Tray for Player to Pick Up */}
        {playerOrder && playerOrder.status === "ready" && (
          <group position={[-0.7, 1.01, 0]}>
            <FoodTrayProp position={[0, 0, 0]} />
            {/* Interactive Hitbox for picking up order */}
            <mesh
              position={[0, 0.15, 0]}
              onClick={(e) => {
                e.stopPropagation();
                useMenutopiaStore.getState().pickupPlayerOrder();
              }}
              userData={{
                isInteractable: true,
                type: "pickup-counter",
                id: "order-pickup",
                name: "Your Food Tray",
                actionText: "Pick Up Food Tray",
              }}
            >
              <boxGeometry args={[0.5, 0.35, 0.4]} />
              <meshBasicMaterial transparent opacity={0} depthWrite={false} />
            </mesh>
          </group>
        )}
      </group>

      {/* Player's Collected Food Tray on Table 1 */}
      {playerOrder && playerOrder.status === "served" && (
        <FoodTrayProp position={[8.0, 0.76, -9.8]} rotation={[0, 0, 0]} />
      )}

      {/* Interactive Self-Order Touchscreen Kiosk */}
      <group position={[6.7, 0, -10.8]} rotation={[0, Math.PI * 0.35, 0]}>
        {/* Invisible Raycast Hitbox */}
        <mesh
          position={[0, 1.2, 0]}
          onClick={(e) => {
            e.stopPropagation();
            placePlayerOrder();
          }}
          userData={{
            isInteractable: true,
            type: "restaurant-kiosk",
            id: "menutopia-kiosk",
            name: "Self-Order Kiosk",
            actionText: playerOrder ? "VIP Order Placed (Cooking)" : "Order Chef's Special (VIP)",
          }}
        >
          <boxGeometry args={[0.7, 1.6, 0.6]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {/* Kiosk Pedestal Pillar */}
        <mesh position={[0, 0.55, 0]}>
          <boxGeometry args={[0.36, 1.1, 0.26]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
        </mesh>
        {/* Base Plate */}
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.46, 0.08, 0.36]} />
          <meshStandardMaterial color="#020617" roughness={0.5} metalness={0.8} />
        </mesh>

        {/* Touchscreen Head Angled Toward Visitor */}
        <group position={[0, 1.15, 0.02]} rotation={[-0.36, 0, 0]}>
          <mesh>
            <boxGeometry args={[0.54, 0.46, 0.08]} />
            <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Bezel glow if targeted */}
          <mesh position={[0, 0, 0.042]}>
            <boxGeometry args={[0.48, 0.4, 0.005]} />
            <meshStandardMaterial
              color={isKioskTargeted ? "#f59e0b" : "#b91c1c"}
              emissive={isKioskTargeted ? "#f59e0b" : "#b91c1c"}
              emissiveIntensity={isKioskTargeted ? 0.7 : 0.2}
            />
          </mesh>
          <mesh position={[0, 0, 0.045]}>
            <planeGeometry args={[0.44, 0.36]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          {/* Screen Content: Order Button */}
          <mesh position={[0, -0.06, 0.046]}>
            <planeGeometry args={[0.36, 0.1]} />
            <meshBasicMaterial color={isKioskTargeted ? "#fbbf24" : "#ef4444"} />
          </mesh>
        </group>
      </group>

      {/* Autonomous Waiter Mannequin */}
      <MenutopiaWaiter />

      {/* ─────────────────────────────────────────────────────────────
          7. COMMERCIAL KITCHEN EQUIPMENT (INSIDE WALK-IN KITCHEN)
          ───────────────────────────────────────────────────────────── */}
      {/* Sizzling Commercial Flat-Top Grill at [8.2, 0, -15.8] */}
      <group position={[8.2, 0, -15.8]}>
        {/* Stainless Steel Grill Body Stand */}
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[1.5, 0.88, 0.85]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Dark Cast-Iron Griddle Plate */}
        <mesh position={[0, 0.89, 0]}>
          <boxGeometry args={[1.4, 0.02, 0.75]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>
        {/* 4 Sizzling Burger Patties on Grill */}
        {[-0.35, -0.1, 0.15, 0.4].map((px, i) => (
          <mesh key={`patty_${i}`} position={[px, 0.905, (i % 2 === 0 ? -0.12 : 0.12)]}>
            <cylinderGeometry args={[0.065, 0.065, 0.015, 16]} />
            <meshStandardMaterial color="#451a03" roughness={0.9} />
          </mesh>
        ))}

        {/* Commercial Stainless Steel Exhaust Ventilation Hood above grill */}
        <group position={[0, 2.5, 0]}>
          <mesh position={[0, 0.25, 0]}>
            <boxGeometry args={[1.8, 0.5, 1.1]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.95} roughness={0.15} />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
            <planeGeometry args={[1.7, 1.0]} />
            <meshStandardMaterial color="#334155" metalness={0.8} />
          </mesh>
        </group>
      </group>

      {/* Commercial Dual Deep Fryer Station at [10.0, 0, -15.8] */}
      <group position={[10.0, 0, -15.8]}>
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[0.8, 0.88, 0.85]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Twin Oil Vats */}
        <mesh position={[-0.18, 0.89, 0]}>
          <boxGeometry args={[0.28, 0.02, 0.55]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
        <mesh position={[0.18, 0.89, 0]}>
          <boxGeometry args={[0.28, 0.02, 0.55]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.3} />
        </mesh>
      </group>

      {/* Prep & Plating Table at [12.2, 0, -15.2] */}
      <group position={[12.2, 0, -15.2]}>
        <mesh position={[0, 0.44, 0]}>
          <boxGeometry args={[1.8, 0.88, 0.8]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Large Wooden Cutting Board */}
        <mesh position={[-0.4, 0.89, 0]}>
          <boxGeometry args={[0.6, 0.03, 0.45]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
        {/* Ingredient Prep Bowls (Tomatoes & Lettuce) */}
        <mesh position={[0.3, 0.92, -0.15]}>
          <cylinderGeometry args={[0.1, 0.07, 0.06, 16]} />
          <meshStandardMaterial color="#ef4444" roughness={0.5} />
        </mesh>
        <mesh position={[0.3, 0.92, 0.15]}>
          <cylinderGeometry args={[0.1, 0.07, 0.06, 16]} />
          <meshStandardMaterial color="#22c55e" roughness={0.5} />
        </mesh>
      </group>

      {/* Commercial Chefs in Kitchen */}
      {/* Chef 1: Grill Master at [8.2, 0, -16.5] facing +Z toward grill */}
      <MenutopiaChef type="grill" position={[8.2, 0, -16.5]} rotation={[0, 0, 0]} />

      {/* Chef 2: Line Cook at [12.2, 0, -15.9] facing +Z toward prep counter */}
      <MenutopiaChef type="plating" position={[12.2, 0, -15.9]} rotation={[0, 0, 0]} />
    </group>
  );
};

