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
import { ThreeDoor } from "./ThreeDoor";
import { PaintingFrame } from "./PaintingFrame";
import { SingleWallSwitch } from "./SingleWallSwitch";

export const RoomGeometry: React.FC = () => {
  // Generate procedural textures once
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

  // Painting canvas textures
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

  const roofMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a1e24",
        roughness: 0.7,
      }),
    []
  );

  const pillarMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#282c35",
        roughness: 0.7,
      }),
    []
  );

  // House dimensions
  const roomW = 10;
  const roomH = 3.5;
  const roomD = 7; // Interior extends from z = 0 to z = -7
  const porchD = 7; // Exterior extends from z = 0 to z = +7
  const doorW = 1.35;
  const doorH = 2.45;
  const sideWallW = (roomW - doorW) / 2;

  // Single continuous facade geometry with doorway hole (eliminates light boundary glitch)
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

  return (
    <group name="house-architecture">
      {/* ========================================================= */}
      {/* 1. INTERIOR ROOM (z <= 0)                                 */}
      {/* ========================================================= */}

      {/* Interior Floor (Oak Wood Planks) */}
      <mesh
        position={[0, 0, -roomD / 2]}
        rotation={[-Math.PI / 2, 0, 0]}
        material={floorMat}
      >
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* Interior Ceiling */}
      <mesh
        position={[0, roomH, -roomD / 2]}
        rotation={[Math.PI / 2, 0, 0]}
        material={ceilingMat}
      >
        <planeGeometry args={[roomW, roomD]} />
      </mesh>

      {/* North Wall (Back wall, z = -roomD) */}
      <mesh position={[0, roomH / 2, -roomD]} material={interiorWallMat}>
        <planeGeometry args={[roomW, roomH]} />
      </mesh>

      {/* East Wall (x = +roomW/2, facing West) */}
      <mesh
        position={[roomW / 2, roomH / 2, -roomD / 2]}
        rotation={[0, -Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* West Wall (x = -roomW/2, facing East) */}
      <mesh
        position={[-roomW / 2, roomH / 2, -roomD / 2]}
        rotation={[0, Math.PI / 2, 0]}
        material={interiorWallMat}
      >
        <planeGeometry args={[roomD, roomH]} />
      </mesh>

      {/* Interior Baseboards */}
      <mesh position={[0, 0.08, -roomD + 0.02]}>
        <boxGeometry args={[roomW, 0.16, 0.04]} />
        <meshStandardMaterial color="#141414" roughness={0.7} />
      </mesh>
      <mesh position={[-roomW / 2 + 0.02, 0.08, -roomD / 2]}>
        <boxGeometry args={[0.04, 0.16, roomD]} />
        <meshStandardMaterial color="#141414" roughness={0.7} />
      </mesh>
      <mesh position={[roomW / 2 - 0.02, 0.08, -roomD / 2]}>
        <boxGeometry args={[0.04, 0.16, roomD]} />
        <meshStandardMaterial color="#141414" roughness={0.7} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. GALLERY PAINTINGS WITH INTEGRATED LIGHTS & SWITCHES    */}
      {/* ========================================================= */}

      {/* Painting 1: Mounted on North Wall (Back Wall) */}
      <PaintingFrame
        lightId="painting-1"
        title="Cyberpunk"
        canvasTexture={paintingTexture1}
        position={[0, 1.85, -roomD + 0.02]}
        rotation={[0, 0, 0]}
        switchOffset={[1.35, -0.3, 0]}
      />

      {/* Painting 2: Mounted on West Wall */}
      <PaintingFrame
        lightId="painting-2"
        title="Terrain Shader"
        canvasTexture={paintingTexture2}
        position={[-roomW / 2 + 0.02, 1.85, -3.5]}
        rotation={[0, Math.PI / 2, 0]}
        switchOffset={[1.35, -0.3, 0]}
      />

      {/* Painting 3: Mounted on East Wall */}
      <PaintingFrame
        lightId="painting-3"
        title="Graphics Engine"
        canvasTexture={paintingTexture3}
        position={[roomW / 2 - 0.02, 1.85, -3.5]}
        rotation={[0, -Math.PI / 2, 0]}
        switchOffset={[1.35, -0.3, 0]}
      />

      {/* ========================================================= */}
      {/* 3. CONTINUOUS DIVIDING FACADE WALL (ONE MESH, NO SEAMS)   */}
      {/* ========================================================= */}

      {/* Exterior Facade: Single seamless mesh with doorway cutout */}
      <mesh
        geometry={facadeGeo}
        material={exteriorSidingMat}
        position={[0, 0, 0.04]}
      />

      {/* Interior Dividing Wall: Single seamless mesh with doorway cutout */}
      <mesh
        geometry={facadeGeo}
        material={interiorWallMat}
        position={[0, 0, -0.04]}
        rotation={[0, Math.PI, 0]}
      />

      {/* Wall thickness cores */}
      <mesh position={[-doorW / 2 - sideWallW / 2, roomH / 2, 0]}>
        <boxGeometry args={[sideWallW, roomH, 0.08]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <mesh position={[doorW / 2 + sideWallW / 2, roomH / 2, 0]}>
        <boxGeometry args={[sideWallW, roomH, 0.08]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>
      <mesh position={[0, doorH + (roomH - doorH) / 2, 0]}>
        <boxGeometry args={[doorW, roomH - doorH, 0.08]} />
        <meshStandardMaterial color="#1c1917" />
      </mesh>

      {/* 3D Hinged Mahogany Door Assembly */}
      <ThreeDoor position={[0, 0, 0]} />

      {/* ========================================================= */}
      {/* 4. CEILING LIGHT SWITCH PLACED RIGHT BESIDE THE ENTRANCE  */}
      {/* ========================================================= */}
      {/* Mounted on the interior dividing wall right next to door jamb at x = 0.95, y = 1.45, z = -0.048 */}
      <group position={[0.95, 1.45, -0.048]} rotation={[0, Math.PI, 0]}>
        <SingleWallSwitch lightId="ceiling" label="Ceiling Light" />
        {/* Subtle brass label plate above switch */}
        <mesh position={[0, 0.23, 0.005]}>
          <boxGeometry args={[0.2, 0.04, 0.006]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
        </mesh>
      </group>

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

      {/* Porch Stone Front Steps */}
      <mesh position={[0, -0.15, porchD]}>
        <boxGeometry args={[roomW + 0.4, 0.28, 0.6]} />
        <meshStandardMaterial color="#181e26" roughness={0.9} />
      </mesh>
      <mesh position={[0, -0.35, porchD + 0.4]}>
        <boxGeometry args={[roomW + 0.8, 0.2, 0.6]} />
        <meshStandardMaterial color="#11161d" roughness={0.95} />
      </mesh>

      {/* Porch Roof Overhang / Awning */}
      <group position={[0, roomH + 0.15, 2.2]}>
        <mesh rotation={[0.08, 0, 0]} material={roofMat}>
          <boxGeometry args={[roomW + 0.6, 0.2, 4.6]} />
        </mesh>
        <mesh position={[0, -0.06, 2.25]}>
          <boxGeometry args={[roomW + 0.7, 0.12, 0.1]} />
          <meshStandardMaterial color="#0f172a" roughness={0.5} />
        </mesh>
      </group>

      {/* Front Architectural Porch Columns */}
      <mesh position={[-3.8, roomH / 2, 4.2]} material={pillarMat}>
        <boxGeometry args={[0.22, roomH, 0.22]} />
      </mesh>
      <mesh position={[3.8, roomH / 2, 4.2]} material={pillarMat}>
        <boxGeometry args={[0.22, roomH, 0.22]} />
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
    </group>
  );
};
