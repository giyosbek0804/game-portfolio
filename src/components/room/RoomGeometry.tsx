"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import {
  createWoodPlankTexture,
  createExteriorSidingTexture,
  createStonePorchTexture,
  createInteriorWallTexture,
  createPaintingTexture1,
  createPaintingTexture2,
  createPaintingTexture3,
} from "@/utils/textureGenerators";
import { museumProjects } from "@/config/projectsData";
import { ThreeDoor } from "./ThreeDoor";
import { PaintingFrame } from "./PaintingFrame";
import { SingleWallSwitch } from "./SingleWallSwitch";
import { MuseumPedestal } from "./MuseumPedestal";
import { ClinicRoomGeometry } from "@/components/clinic/ClinicRoomGeometry";

export const RoomGeometry: React.FC = () => {
  // Procedural textures
  const woodFloorTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createWoodPlankTexture();
  }, []);

  const stonePorchTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createStonePorchTexture();
  }, []);

  const exteriorSidingTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createExteriorSidingTexture();
  }, []);

  const interiorWallTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createInteriorWallTexture();
  }, []);

  const paintingTexture1 = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createPaintingTexture1();
  }, []);

  const paintingTexture2 = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createPaintingTexture2();
  }, []);

  const paintingTexture3 = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createPaintingTexture3();
  }, []);

  // Materials
  const floorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: woodFloorTexture ?? undefined,
        color: woodFloorTexture ? "#ffffff" : "#2a1e16",
        roughness: 0.65,
        metalness: 0.1,
      }),
    [woodFloorTexture]
  );

  const museumFloorMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#181a1f", // Dark polished museum stone
        roughness: 0.35,
        metalness: 0.25,
      }),
    []
  );

  const porchMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: stonePorchTexture ?? undefined,
        color: stonePorchTexture ? "#ffffff" : "#1e242b",
        roughness: 0.85,
        metalness: 0.05,
      }),
    [stonePorchTexture]
  );

  const exteriorSidingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: exteriorSidingTexture ?? undefined,
        color: exteriorSidingTexture ? "#ffffff" : "#2c3440",
        roughness: 0.7,
        metalness: 0.1,
      }),
    [exteriorSidingTexture]
  );

  const interiorWallMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        map: interiorWallTexture ?? undefined,
        color: interiorWallTexture ? "#ffffff" : "#242831",
        roughness: 0.85,
        metalness: 0.05,
      }),
    [interiorWallTexture]
  );

  const ceilingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#181a1f",
        roughness: 0.9,
        metalness: 0.05,
      }),
    []
  );

  const archMoldingMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#d97706", // Brass architectural arch trim
        roughness: 0.3,
        metalness: 0.85,
      }),
    []
  );

  // Dimensions
  const roomW = 10;
  const roomH = 3.5;
  const roomD = 7; // Living room: z from 0 to -7
  const porchD = 7;

  // Museum Room Dimensions
  const museumW = 12;
  const museumH = 3.8;
  const museumD = 10; // Museum: z from -7 to -17

  // Front Entrance Doorway cutout
  const doorW = 1.35;
  const doorH = 2.45;

  // Grand Archway cutout between Room 1 & Museum (NO door)
  const archW = 2.6;
  const archH = 2.9;

  // Facade wall geometry (z = 0) with door cutout
  const facadeGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-roomW / 2, 0);
    shape.lineTo(roomW / 2, 0);
    shape.lineTo(roomW / 2, roomH);
    shape.lineTo(-roomW / 2, roomH);
    shape.closePath();

    const doorHole = new THREE.Path();
    doorHole.moveTo(-doorW / 2, 0);
    doorHole.lineTo(doorW / 2, 0);
    doorHole.lineTo(doorW / 2, doorH);
    doorHole.lineTo(-doorW / 2, doorH);
    doorHole.closePath();
    shape.holes.push(doorHole);

    return new THREE.ShapeGeometry(shape);
  }, [roomW, roomH, doorW, doorH]);

  // Dividing Archway Wall geometry (z = -7) with grand open archway cutout
  const archWallGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-museumW / 2, 0);
    shape.lineTo(museumW / 2, 0);
    shape.lineTo(museumW / 2, museumH);
    shape.lineTo(-museumW / 2, museumH);
    shape.closePath();

    const archHole = new THREE.Path();
    archHole.moveTo(-archW / 2, 0);
    archHole.lineTo(archW / 2, 0);
    archHole.lineTo(archW / 2, archH);
    archHole.lineTo(-archW / 2, archH);
    archHole.closePath();
    shape.holes.push(archHole);

    return new THREE.ShapeGeometry(shape);
  }, [museumW, museumH, archW, archH]);

  return (
    <group name="complete-house-architecture">
      {/* ========================================================= */}
      {/* 1. ROOM 1: LIVING ROOM (z from 0 to -7)                   */}
      {/* ========================================================= */}

      {/* Living Room Floor */}
      <mesh
        position={[0, 0, -roomD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={floorMat}
      >
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* Living Room Ceiling */}
      <mesh
        position={[0, roomH, -roomD / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        material={ceilingMat}
      >
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* Living Room East Wall */}
      <mesh
        position={[roomW / 2, roomH / 2, -roomD / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* Living Room West Wall */}
      <mesh
        position={[-roomW / 2, roomH / 2, -roomD / 2]}
        rotation={[0, Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* Painting on West Wall (Terrain Shader) */}
      <PaintingFrame
        lightId="painting-2"
        title="Terrain Shader"
        canvasTexture={paintingTexture2}
        position={[-roomW / 2 + 0.02, 1.85, -3.5]}
        rotation={[0, Math.PI / 2, 0]}
        switchOffset={[1.35, -0.3, 0]}
      />

      {/* Painting on East Wall (Graphics Engine) */}
      <PaintingFrame
        lightId="painting-3"
        title="Graphics Engine"
        canvasTexture={paintingTexture3}
        position={[roomW / 2 - 0.02, 1.85, -3.5]}
        rotation={[0, -Math.PI / 2, 0]}
        switchOffset={[1.35, -0.3, 0]}
      />

      {/* Front Entrance Facade Wall (z = 0) */}
      <mesh
        geometry={facadeGeo}
        material={exteriorSidingMat}
        position={[0, 0, 0.04]}
      />
      <mesh
        geometry={facadeGeo}
        material={interiorWallMat}
        position={[0, 0, -0.04]}
        rotation={[0, Math.PI, 0]}
      />
      <ThreeDoor position={[0, 0, 0]} />

      {/* Ceiling Light Switch beside entrance door */}
      <group position={[0.95, 1.45, -0.048]} rotation={[0, Math.PI, 0]}>
        <SingleWallSwitch lightId="ceiling" label="Ceiling Light" />
        <mesh position={[0, 0.23, 0.005]}>
          <boxGeometry args={[0.2, 0.04, 0.006]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 2. GRAND ARCHWAY (Dividing Wall at z = -7, NO DOOR)      */}
      {/* ========================================================= */}

      {/* Archway Wall facing Living Room (facing +Z) */}
      <mesh
        geometry={archWallGeo}
        material={interiorWallMat}
        position={[0, 0, -roomD + 0.02]}
      />

      {/* Archway Wall facing Museum (facing -Z) */}
      <mesh
        geometry={archWallGeo}
        material={interiorWallMat}
        position={[0, 0, -roomD - 0.02]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Brass Architectural Arch Frame & Header Plaque */}
      <group position={[0, 0, -roomD]}>
        {/* Left Arch Pillar Trim */}
        <mesh position={[-archW / 2 - 0.05, archH / 2, 0]} material={archMoldingMat}>
          <boxGeometry args={[0.1, archH, 0.16]} />
        </mesh>
        {/* Right Arch Pillar Trim */}
        <mesh position={[archW / 2 + 0.05, archH / 2, 0]} material={archMoldingMat}>
          <boxGeometry args={[0.1, archH, 0.16]} />
        </mesh>
        {/* Header Lintel Trim */}
        <mesh position={[0, archH + 0.05, 0]} material={archMoldingMat}>
          <boxGeometry args={[archW + 0.2, 0.1, 0.16]} />
        </mesh>

        {/* Museum Exhibition Plaque above Archway */}
        <mesh position={[0, archH + 0.26, 0.04]}>
          <boxGeometry args={[2.0, 0.18, 0.02]} />
          <meshStandardMaterial color="#1a1e24" roughness={0.5} />
        </mesh>
        <mesh position={[0, archH + 0.26, 0.055]}>
          <boxGeometry args={[1.9, 0.14, 0.008]} />
          <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. ROOM 2: MUSEUM EXHIBITION GALLERY (z from -7 to -17)  */}
      {/* ========================================================= */}

      {/* Museum Polished Dark Stone Floor */}
      <mesh
        position={[0, 0, -roomD - museumD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={museumFloorMat}
      >
        <planeGeometry args={[museumW, museumD]} />
      </mesh>

      {/* Museum Ceiling with Recessed Architectural Height (3.8m) */}
      <mesh
        position={[0, museumH, -roomD - museumD / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        material={ceilingMat}
      >
        <planeGeometry args={[museumW, museumD]} />
      </mesh>

      {/* Museum North Wall (Far Back Wall at z = -17) */}
      <mesh
        position={[0, museumH / 2, -roomD - museumD]}
        material={interiorWallMat}
      >
        <planeGeometry args={[museumW, museumH]} />
      </mesh>

      {/* Museum East Wall (x = +6) */}
      <mesh
        position={[museumW / 2, museumH / 2, -roomD - museumD / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[museumD, museumH]} />
      </mesh>

      {/* Museum West Wall (x = -6) with Opening into Navbat Clinic Wing (z = -10.3 to -12.7) */}
      {/* Segment 1: South of archway (z from -7.0 to -10.3) */}
      <mesh
        position={[-museumW / 2, museumH / 2, -8.65]}
        rotation={[0, Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[3.3, museumH]} />
      </mesh>

      {/* Segment 2: North of archway (z from -12.7 to -17.0) */}
      <mesh
        position={[-museumW / 2, museumH / 2, -14.85]}
        rotation={[0, Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[4.3, museumH]} />
      </mesh>

      {/* Segment 3: Above archway (from y = 2.8 to 3.8) */}
      <mesh
        position={[-museumW / 2, 3.3, -11.5]}
        rotation={[0, Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[2.4, 1.0]} />
      </mesh>

      {/* Clinic Wing Architectural Archway Trim & Sign in Museum */}
      <group position={[-museumW / 2 + 0.02, 0, -11.5]}>
        {/* Left Pillar Trim */}
        <mesh position={[0, 1.4, 1.2]} material={archMoldingMat}>
          <boxGeometry args={[0.08, 2.8, 0.12]} />
        </mesh>
        {/* Right Pillar Trim */}
        <mesh position={[0, 1.4, -1.2]} material={archMoldingMat}>
          <boxGeometry args={[0.08, 2.8, 0.12]} />
        </mesh>
        {/* Header Trim */}
        <mesh position={[0, 2.85, 0]} material={archMoldingMat}>
          <boxGeometry args={[0.08, 0.12, 2.52]} />
        </mesh>
        {/* Illuminated Clinic Sign Plaque */}
        <mesh position={[0.01, 3.02, 0]}>
          <boxGeometry args={[0.03, 0.22, 2.2]} />
          <meshStandardMaterial
            color="#0f766e"
            emissive="#0d9488"
            emissiveIntensity={0.5}
          />
        </mesh>
      </group>

      {/* Grand Centerpiece Painting on Museum Far Back Wall */}
      <PaintingFrame
        lightId="painting-1"
        title="Cyberpunk Metagame"
        canvasTexture={paintingTexture1}
        position={[0, 2.0, -roomD - museumD + 0.03]}
        rotation={[0, 0, 0]}
        switchOffset={[1.4, -0.35, 0]}
      />

      {/* ========================================================= */}
      {/* 4. MUSEUM DISPLAY PEDESTALS / GLASS CONTAINERS            */}
      {/* ========================================================= */}
      {museumProjects.map((p) => (
        <MuseumPedestal key={p.id} project={p} />
      ))}

      {/* ========================================================= */}
      {/* 5. EXTERIOR PORCH & FRONT YARD (z > 0)                    */}
      {/* ========================================================= */}

      {/* Porch Stone Floor */}
      <mesh
        position={[0, -0.01, porchD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={porchMat}
      >
        <planeGeometry args={[roomW, porchD]} />
      </mesh>

      {/* Porch Front Steps */}
      <mesh position={[0, -0.15, porchD]}>
        <boxGeometry args={[roomW + 0.4, 0.28, 0.6]} />
        <meshStandardMaterial color="#181e26" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.35, porchD + 0.4]}>
        <boxGeometry args={[roomW + 0.8, 0.2, 0.6]} />
        <meshStandardMaterial color="#11161d" roughness={0.95} />
      </mesh>

      {/* Porch Roof Overhang */}
      <group position={[0, roomH + 0.15, 2.2]}>
        <mesh rotation={[0.08, 0, 0]}>
          <boxGeometry args={[roomW + 0.6, 0.2, 4.6]} />
          <meshStandardMaterial color="#1a1e24" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.06, 2.25]}>
          <boxGeometry args={[roomW + 0.7, 0.12, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      {/* Front Porch Columns */}
      <mesh position={[-3.8, roomH / 2, 4.2]}>
        <boxGeometry args={[0.22, roomH, 0.22]} />
        <meshStandardMaterial color="#282c35" roughness={0.7} />
      </mesh>
      <mesh position={[3.8, roomH / 2, 4.2]}>
        <boxGeometry args={[0.22, roomH, 0.22]} />
        <meshStandardMaterial color="#282c35" roughness={0.7} />
      </mesh>

      {/* Starry Night Sky Backdrop */}
      <group name="night-sky">
        <mesh position={[0, 8, porchD + 12]}>
          <planeGeometry args={[48, 28]} />
          <meshBasicMaterial color="#020617" />
        </mesh>
        {Array.from({ length: 45 }).map((_, i) => {
          const sx = ((i * 3.7) % 36) - 18;
          const sy = 4 + ((i * 2.3) % 14);
          const sz = porchD + 11.8;
          return (
            <mesh key={i} position={[sx, sy, sz]}>
              <sphereGeometry args={[0.04, 6, 6]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
          );
        })}
      </group>

      {/* ─────────────────────────────────────────────────────────────
          6. NAVBAT CLINIC WAITING HALL & DOCTOR'S OFFICE
          ───────────────────────────────────────────────────────────── */}
      <ClinicRoomGeometry />
    </group>
  );
};
