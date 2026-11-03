"use client";

import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { ProjectItem } from "@/config/projectsData";

interface MuseumPedestalProps {
  project: ProjectItem;
}

export const MuseumPedestal: React.FC<MuseumPedestalProps> = ({ project }) => {
  const setActiveProject = useGameStore((state) => state.setActiveProject);
  const targetedInteractable = useGameStore((state) => state.targetedInteractable);

  const isTargeted = targetedInteractable?.id === project.id;
  const relicRef = useRef<THREE.Mesh>(null);

  // Animate the floating relic: slow rotation + gentle hovering bob
  useFrame(({ clock }) => {
    if (relicRef.current) {
      const t = clock.getElapsedTime();
      relicRef.current.rotation.y = t * 0.7;
      relicRef.current.rotation.x = Math.sin(t * 0.5) * 0.2;
      relicRef.current.position.y = 1.32 + Math.sin(t * 1.8) * 0.035;
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setActiveProject(project);
  };

  return (
    <group
      position={project.position}
      name={`pedestal-${project.id}`}
      userData={{
        isInteractable: true,
        type: "pedestal",
        id: project.id,
        name: project.title,
        data: project,
      }}
    >
      {/* Generous clickable/raycast invisible hitbox for distance targeting */}
      <mesh
        position={[0, 1.0, 0]}
        onClick={handleClick}
        visible={false}
      >
        <boxGeometry args={[1.2, 2.0, 1.2]} />
      </mesh>

      {/* Floor Spotlight Halo around pedestal base */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.7, 24]} />
        <meshBasicMaterial
          color={isTargeted ? "#f59e0b" : project.artifactColor}
          transparent
          opacity={isTargeted ? 0.35 : 0.15}
        />
      </mesh>

      {/* ========================================================= */}
      {/* 1. SOLID MARBLE PEDESTAL PLINTH                           */}
      {/* ========================================================= */}

      {/* Main Stone Base */}
      <mesh position={[0, 0.45, 0]} onClick={handleClick}>
        <boxGeometry args={[0.74, 0.9, 0.74]} />
        <meshStandardMaterial
          color={isTargeted ? "#292e38" : "#1a1e24"}
          roughness={0.4}
          metalness={0.3}
        />
      </mesh>

      {/* Bottom Brass Trim Bevel */}
      <mesh position={[0, 0.03, 0]}>
        <boxGeometry args={[0.82, 0.06, 0.82]} />
        <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Top Brass Platform Trim */}
      <mesh position={[0, 0.91, 0]}>
        <boxGeometry args={[0.78, 0.03, 0.78]} />
        <meshStandardMaterial color="#d97706" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* Front Project Brass Plaque */}
      <mesh position={[0, 0.6, 0.375]}>
        <boxGeometry args={[0.45, 0.16, 0.015]} />
        <meshStandardMaterial color="#d97706" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* ========================================================= */}
      {/* 2. GLASS DISPLAY VITRINE (Glass container all around)      */}
      {/* ========================================================= */}
      <mesh position={[0, 1.34, 0]}>
        <boxGeometry args={[0.68, 0.82, 0.68]} />
        <meshStandardMaterial
          color="#e2e8f0"
          transparent
          opacity={0.22}
          roughness={0.05}
          metalness={0.1}
        />
      </mesh>

      {/* Glass Corner Brass Struts */}
      {[
        [-0.34, -0.34],
        [0.34, -0.34],
        [-0.34, 0.34],
        [0.34, 0.34],
      ].map(([cx, cz], i) => (
        <mesh key={i} position={[cx, 1.34, cz]}>
          <boxGeometry args={[0.02, 0.82, 0.02]} />
          <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
        </mesh>
      ))}

      {/* Top Cap of Glass Case */}
      <mesh position={[0, 1.76, 0]}>
        <boxGeometry args={[0.72, 0.025, 0.72]} />
        <meshStandardMaterial color="#1a1e24" roughness={0.5} />
      </mesh>

      {/* ========================================================= */}
      {/* 3. FLOATING ANCIENT / TECH ARTIFACT INSIDE               */}
      {/* ========================================================= */}
      <mesh
        ref={relicRef}
        position={[0, 1.32, 0]}
        onClick={handleClick}
      >
        {project.artifactShape === "crystal" && (
          <octahedronGeometry args={[0.18, 0]} />
        )}
        {project.artifactShape === "relic" && (
          <icosahedronGeometry args={[0.17, 0]} />
        )}
        {project.artifactShape === "torus" && (
          <torusKnotGeometry args={[0.12, 0.04, 32, 8]} />
        )}
        <meshStandardMaterial
          color={project.artifactColor}
          emissive={project.artifactColor}
          emissiveIntensity={0.65}
          roughness={0.2}
          metalness={0.8}
          wireframe={project.artifactShape === "relic"}
        />
      </mesh>

      {/* Internal Artifact Glow Light */}
      <pointLight
        position={[0, 1.35, 0]}
        color={project.artifactColor}
        intensity={8}
        distance={2.8}
        decay={2}
      />
    </group>
  );
};

