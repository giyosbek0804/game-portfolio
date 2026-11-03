"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore, TargetedInteractable } from "@/store/useGameStore";
import { ProjectItem } from "@/config/projectsData";

const MAX_INTERACT_DISTANCE = 3.8; // Comfortable interaction reach (~3.8 units)

export const InteractionManager: React.FC = () => {
  const { camera, scene, gl } = useThree();

  const toggleLight = useGameStore((state) => state.toggleLight);
  const toggleDoor = useGameStore((state) => state.toggleDoor);
  const setActiveProject = useGameStore((state) => state.setActiveProject);
  const activeProject = useGameStore((state) => state.activeProject);
  const setTargetedInteractable = useGameStore(
    (state) => state.setTargetedInteractable
  );

  const raycaster = useRef(new THREE.Raycaster());
  const centerVec = useRef(new THREE.Vector2(0, 0));
  const currentTargetRef = useRef<TargetedInteractable | null>(null);

  // Per-frame raycasting straight from camera center reticle
  useFrame(() => {
    // If project modal is open, don't raycast
    if (activeProject) {
      if (currentTargetRef.current) {
        currentTargetRef.current = null;
        setTargetedInteractable(null);
      }
      return;
    }

    raycaster.current.setFromCamera(centerVec.current, camera);
    raycaster.current.far = MAX_INTERACT_DISTANCE;

    const hits = raycaster.current.intersectObjects(scene.children, true);

    let foundTarget: TargetedInteractable | null = null;

    for (const hit of hits) {
      if (hit.distance > MAX_INTERACT_DISTANCE) continue;

      let obj: THREE.Object3D | null = hit.object;
      while (obj && obj !== scene) {
        if (obj.userData?.isInteractable) {
          const type = obj.userData.type as "switch" | "door" | "pedestal" | "visitor";
          const id = obj.userData.id as string;
          const name = obj.userData.name as string;
          const data = obj.userData.data as ProjectItem | undefined;

          let actionText = "Interact";
          if (type === "switch") actionText = `Toggle ${name}`;
          else if (type === "door") actionText = "Open / Close Door";
          else if (type === "pedestal") actionText = `Inspect: ${name}`;
          else if (type === "visitor") actionText = `Talk to ${name}`;

          foundTarget = { type, id, name, actionText, data };
          break;
        }
        obj = obj.parent;
      }
      if (foundTarget) break;
    }

    // Only update Zustand if target changed
    if (
      foundTarget?.id !== currentTargetRef.current?.id ||
      foundTarget?.type !== currentTargetRef.current?.type
    ) {
      currentTargetRef.current = foundTarget;
      setTargetedInteractable(foundTarget);
    }
  });

  // Handle interaction trigger (Click, Tap, or 'E' key)
  useEffect(() => {
    const triggerInteraction = () => {
      const target = currentTargetRef.current;
      if (!target || activeProject) return;

      if (target.type === "switch") {
        toggleLight(target.id);
      } else if (target.type === "door") {
        toggleDoor();
      } else if (target.type === "pedestal" && target.data) {
        setActiveProject(target.data as ProjectItem);
      } else if (target.type === "visitor") {
        useGameStore.getState().interactWithVisitor(target.id);
      }
    };

    const handlePointerDown = () => {
      if (currentTargetRef.current && !activeProject) {
        triggerInteraction();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE") {
        if (currentTargetRef.current && !activeProject) {
          e.preventDefault();
          triggerInteraction();
        }
      }
    };

    const canvas = gl.domElement;
    canvas.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gl, toggleLight, toggleDoor, setActiveProject, activeProject]);

  return null;
};
