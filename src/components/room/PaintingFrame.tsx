"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { SingleWallSwitch } from "./SingleWallSwitch";

interface PaintingFrameProps {
  lightId: string;
  title: string;
  canvasTexture: THREE.CanvasTexture | null;
  position: [number, number, number];
  rotation?: [number, number, number];
  switchOffset?: [number, number, number];
}

export const PaintingFrame: React.FC<PaintingFrameProps> = ({
  lightId,
  title,
  canvasTexture,
  position,
  rotation = [0, 0, 0],
  switchOffset = [1.3, -0.2, 0],
}) => {
  const lights = useGameStore((state) => state.lights);
  const isLightOn = lights.find((l) => l.id === lightId)?.on ?? true;

  const frameWidth = 1.9;
  const frameHeight = 1.35;
  const frameDepth = 0.06;

  const canvasWidth = 1.7;
  const canvasHeight = 1.15;

  const canvasMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      map: canvasTexture ?? undefined,
      color: canvasTexture ? "#ffffff" : "#334155",
      roughness: 0.85,
      metalness: 0.05,
    });
  }, [canvasTexture]);

  const frameMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#181412",
      roughness: 0.5,
      metalness: 0.2,
    });
  }, []);

  const brassLampMat = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: "#d97706",
      roughness: 0.3,
      metalness: 0.85,
    });
  }, []);

  return (
    <group position={position} rotation={rotation} name={`painting-${lightId}`}>
      {/* Outer Picture Frame */}
      <mesh material={frameMat} position={[0, 0, frameDepth / 2]}>
        <boxGeometry args={[frameWidth, frameHeight, frameDepth]} />
      </mesh>

      {/* Inner Bevel Mat border */}
      <mesh position={[0, 0, frameDepth + 0.002]}>
        <planeGeometry args={[canvasWidth + 0.06, canvasHeight + 0.06]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Canvas Artwork Surface */}
      <mesh material={canvasMat} position={[0, 0, frameDepth + 0.004]}>
        <planeGeometry args={[canvasWidth, canvasHeight]} />
      </mesh>

      {/* Brass Title Nameplate under frame */}
      <mesh position={[0, -frameHeight / 2 + 0.04, frameDepth + 0.006]}>
        <boxGeometry args={[0.5, 0.05, 0.008]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ========================================================= */}
      {/* GALLERY PICTURE LAMP (Clean brass horizontal arm & tube) */}
      {/* ========================================================= */}
      <group position={[0, frameHeight / 2 + 0.08, 0]}>
        {/* Wall mounting plate */}
        <mesh position={[0, 0, 0.015]} material={brassLampMat}>
          <boxGeometry args={[0.16, 0.08, 0.016]} />
        </mesh>

        {/* Horizontal twin arms extending out from wall toward viewer */}
        <mesh
          position={[-0.15, 0, 0.12]}
          rotation={[Math.PI / 2, 0, 0]}
          material={brassLampMat}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
        </mesh>
        <mesh
          position={[0.15, 0, 0.12]}
          rotation={[Math.PI / 2, 0, 0]}
          material={brassLampMat}
        >
          <cylinderGeometry args={[0.008, 0.008, 0.22, 8]} />
        </mesh>

        {/* Horizontal cylindrical picture light tube */}
        <mesh
          position={[0, 0, 0.23]}
          rotation={[0, 0, Math.PI / 2]}
          material={brassLampMat}
        >
          <cylinderGeometry args={[0.024, 0.024, 0.65, 16]} />
        </mesh>

        {/* Focused picture light source */}
        {isLightOn && (
          <group position={[0, -0.04, 0.22]}>
            <pointLight
              color="#fff5eb"
              intensity={7}
              distance={2.8}
              decay={2}
            />
            {/* Glowing horizontal underside diffuser strip */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.012, 0.012, 0.52, 8]} />
              <meshBasicMaterial color="#fffbeb" />
            </mesh>
          </group>
        )}
      </group>

      {/* ========================================================= */}
      {/* WALL SWITCH PLACED BESIDE THE PAINTING                   */}
      {/* ========================================================= */}
      <SingleWallSwitch
        lightId={lightId}
        label={`${title} Switch`}
        position={switchOffset}
      />
    </group>
  );
};
