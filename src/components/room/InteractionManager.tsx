"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";

const MAX_INTERACT_DISTANCE = 3.8; // Comfortable interaction reach (~3.8 units)

export const InteractionManager: React.FC = () => {
  const { camera, scene, gl } = useThree();

  const toggleLight = useGameStore((state) => state.toggleLight);
  const toggleDoor = useGameStore((state) => state.toggleDoor);
  const setTargetedInteractable = useGameStore(
    (state) => state.setTargetedInteractable
  );

  const raycaster = useRef(new THREE.Raycaster());
  const centerVec = useRef(new THREE.Vector2(0, 0));
  const currentTargetRef = useRef<{
    type: "switch" | "door";
    id: string;
    name: string;
    actionText: string;
  } | null>(null);

  // Per-frame raycasting straight from camera center reticle
  useFrame(() => {
    raycaster.current.setFromCamera(centerVec.current, camera);
    raycaster.current.far = MAX_INTERACT_DISTANCE;

    // Raycast all meshes in the scene
    const hits = raycaster.current.intersectObjects(scene.children, true);

    let foundTarget: {
      type: "switch" | "door";
      id: string;
      name: string;
      actionText: string;
    } | null = null;

    for (const hit of hits) {
      if (hit.distance > MAX_INTERACT_DISTANCE) continue;

      let obj: THREE.Object3D | null = hit.object;
      while (obj && obj !== scene) {
        if (obj.userData?.isInteractable) {
          const type = obj.userData.type as "switch" | "door";
          const id = obj.userData.id as string;
          const name = obj.userData.name as string;
          const actionText =
            type === "switch" ? `Toggle ${name}` : "Open / Close Door";

          foundTarget = { type, id, name, actionText };
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
      if (!target) return;

      if (target.type === "switch") {
        toggleLight(target.id);
      } else if (target.type === "door") {
        toggleDoor();
      }
    };

    const handlePointerDown = (e: MouseEvent) => {
      // If we are aiming at a switch/door within range, activate it
      if (currentTargetRef.current) {
        triggerInteraction();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyE") {
        if (currentTargetRef.current) {
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
  }, [gl, toggleLight, toggleDoor]);

  return null;
};
