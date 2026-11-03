"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { museumProjects } from "@/config/projectsData";
import { MobileMoveVector } from "./MobileControls";

interface FirstPersonCameraProps {
  mobileMoveVector: MobileMoveVector;
  mobileLookDelta: { x: number; y: number };
  onInteraction: () => void;
}

const PLAYER_HEIGHT = 1.6;
const MOVE_SPEED = 4.0;
const MOUSE_SENSITIVITY = 0.0022;
const TOUCH_SENSITIVITY = 0.0035;
const MAX_PITCH = (80 * Math.PI) / 180;

export const FirstPersonCamera: React.FC<FirstPersonCameraProps> = ({
  mobileMoveVector,
  mobileLookDelta,
  onInteraction,
}) => {
  const { camera, gl } = useThree();

  const doorOpen = useGameStore((state) => state.doorOpen);
  const walkTarget = useGameStore((state) => state.walkTarget);
  const setWalkTarget = useGameStore((state) => state.setWalkTarget);
  const setPlayerZone = useGameStore((state) => state.setPlayerZone);
  const activeProject = useGameStore((state) => state.activeProject);

  const yaw = useRef(0);
  const pitch = useRef(0);
  const isPointerLocked = useRef(false);

  const keys = useRef<{
    forward: boolean;
    backward: boolean;
    left: boolean;
    right: boolean;
  }>({
    forward: false,
    backward: false,
    left: false,
    right: false,
  });

  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const moveDirection = useRef(new THREE.Vector3());
  const forwardVector = useRef(new THREE.Vector3());
  const rightVector = useRef(new THREE.Vector3());

  // Wide, comfortable Human FOV to prevent feeling cramped or too close
  useEffect(() => {
    const updateCameraFOV = () => {
      if (camera instanceof THREE.PerspectiveCamera) {
        const isPortrait = window.innerHeight > window.innerWidth;
        // Wide 82deg FOV for landscape/desktop; 86deg if in portrait so objects never feel claustrophobic
        camera.fov = isPortrait ? 86 : 82;
        camera.near = 0.1;
        camera.far = 100;
        camera.updateProjectionMatrix();
      }
    };

    updateCameraFOV();
    window.addEventListener("resize", updateCameraFOV);
    window.addEventListener("orientationchange", updateCameraFOV);

    return () => {
      window.removeEventListener("resize", updateCameraFOV);
      window.removeEventListener("orientationchange", updateCameraFOV);
    };
  }, [camera]);

  // Initial Spawn outside on the stone porch with a spacious view
  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 5.0);
    camera.rotation.order = "YXZ";
  }, [camera]);

  // Pointer Lock handling (Desktop)
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
      if (isPointerLocked.current) {
        onInteraction();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current || activeProject) return;

      onInteraction();
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      pitch.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch.current));
    };

    const handleCanvasClick = () => {
      if (!isPointerLocked.current && !activeProject) {
        canvas.requestPointerLock?.();
      }
    };

    document.addEventListener("pointerlockchange", handlePointerLockChange);
    document.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleCanvasClick);

    return () => {
      document.removeEventListener("pointerlockchange", handlePointerLockChange);
      document.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [gl, onInteraction, activeProject]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeProject) return;

      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = true;
          onInteraction();
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = true;
          onInteraction();
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = true;
          onInteraction();
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = true;
          onInteraction();
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case "KeyW":
        case "ArrowUp":
          keys.current.forward = false;
          break;
        case "KeyS":
        case "ArrowDown":
          keys.current.backward = false;
          break;
        case "KeyA":
        case "ArrowLeft":
          keys.current.left = false;
          break;
        case "KeyD":
        case "ArrowRight":
          keys.current.right = false;
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [onInteraction, activeProject]);

  // Touch look deltas
  useEffect(() => {
    if (activeProject) return;
    if (mobileLookDelta.x !== 0 || mobileLookDelta.y !== 0) {
      onInteraction();
      yaw.current -= mobileLookDelta.x * TOUCH_SENSITIVITY;
      pitch.current -= mobileLookDelta.y * TOUCH_SENSITIVITY;
      pitch.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch.current));
    }
  }, [mobileLookDelta, onInteraction, activeProject]);

  // Game loop update
  useFrame((_, delta) => {
    // 1. Camera Rotation
    euler.current.set(pitch.current, yaw.current, 0, "YXZ");
    camera.quaternion.setFromEuler(euler.current);

    if (activeProject) return; // Freeze movement while inspecting project modal

    // 2. Automated Walk Target (smooth walk across thresholds)
    if (walkTarget) {
      const targetVec = new THREE.Vector3(...walkTarget);
      const dist = camera.position.distanceTo(targetVec);

      if (dist < 0.15) {
        camera.position.copy(targetVec);
        setWalkTarget(null);
      } else {
        camera.position.lerp(targetVec, delta * 3.2);
        if (walkTarget[2] < camera.position.z) {
          yaw.current = THREE.MathUtils.lerp(yaw.current, 0, delta * 3);
        } else {
          yaw.current = THREE.MathUtils.lerp(yaw.current, Math.PI, delta * 3);
        }
      }
    } else {
      // 3. User Movement
      forwardVector.current.set(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);
      rightVector.current.set(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw.current);

      moveDirection.current.set(0, 0, 0);

      if (keys.current.forward) moveDirection.current.add(forwardVector.current);
      if (keys.current.backward) moveDirection.current.sub(forwardVector.current);
      if (keys.current.right) moveDirection.current.add(rightVector.current);
      if (keys.current.left) moveDirection.current.sub(rightVector.current);

      if (mobileMoveVector.y !== 0) {
        moveDirection.current.addScaledVector(forwardVector.current, mobileMoveVector.y);
      }
      if (mobileMoveVector.x !== 0) {
        moveDirection.current.addScaledVector(rightVector.current, mobileMoveVector.x);
      }

      if (moveDirection.current.lengthSq() > 0) {
        if (moveDirection.current.length() > 1) {
          moveDirection.current.normalize();
        }
        camera.position.addScaledVector(moveDirection.current, MOVE_SPEED * delta);
      }
    }

    // 4. Multi-Zone Bounds Clamping with comfortable spacing
    const z = camera.position.z;
    const x = camera.position.x;

    if (z > 0) {
      // OUTSIDE PORCH (comfortable boundaries)
      camera.position.x = Math.max(-3.8, Math.min(3.8, camera.position.x));
      camera.position.z = Math.min(6.0, camera.position.z);

      const isInFrontDoorway = Math.abs(x) < 0.62 && doorOpen;
      if (!isInFrontDoorway) {
        camera.position.z = Math.max(0.48, camera.position.z); // Comfortable stop before front wall
      }
    } else if (z <= 0 && z >= -7.0) {
      // ROOM 1: LIVING ROOM
      camera.position.x = Math.max(-4.3, Math.min(4.3, camera.position.x));

      // Front door wall at z = 0
      const isInFrontDoorway = Math.abs(x) < 0.62 && doorOpen;
      if (!isInFrontDoorway) {
        camera.position.z = Math.min(-0.48, camera.position.z);
      }

      // Grand archway dividing wall at z = -7.0 (open archway, width 2.6m: Math.abs(x) < 1.3)
      const isInArchway = Math.abs(x) < 1.3;
      if (!isInArchway) {
        camera.position.z = Math.max(-6.52, camera.position.z);
      }
    } else {
      // MUSEUM GALLERY ROOM
      camera.position.x = Math.max(-5.3, Math.min(5.3, camera.position.x));
      camera.position.z = Math.max(-16.2, camera.position.z);

      // Archway at z = -7.0
      const isInArchway = Math.abs(x) < 1.3;
      if (!isInArchway) {
        camera.position.z = Math.min(-7.48, camera.position.z);
      }

      // Museum Pedestal Collisions (Radius 0.95m keeps player perfectly framed without getting too close)
      museumProjects.forEach((p) => {
        const [px, , pz] = p.position;
        const dx = camera.position.x - px;
        const dz = camera.position.z - pz;
        const dist = Math.hypot(dx, dz);
        const minDist = 0.95; // Spacious stop so artifacts are viewed in full context
        if (dist < minDist && dist > 0.001) {
          const push = (minDist - dist) / dist;
          camera.position.x += dx * push;
          camera.position.z += dz * push;
        }
      });
    }

    // Dummy Figure / Visitor Collisions (smooth pushback so player doesn't clip into figures)
    const visitorPositions = useGameStore.getState().visitorPositions;
    Object.values(visitorPositions).forEach(([vx, , vz]) => {
      const dx = camera.position.x - vx;
      const dz = camera.position.z - vz;
      const dist = Math.hypot(dx, dz);
      const minDist = 0.58;
      if (dist < minDist && dist > 0.001) {
        const push = (minDist - dist) / dist;
        camera.position.x += dx * push;
        camera.position.z += dz * push;
      }
    });

    camera.position.y = PLAYER_HEIGHT;

    // 5. Update Zone in Zustand
    if (camera.position.z > 0.1) {
      setPlayerZone("outside");
    } else if (camera.position.z <= 0.1 && camera.position.z >= -7.0) {
      setPlayerZone("living-room");
    } else {
      setPlayerZone("museum");
    }
  });

  return null;
};
