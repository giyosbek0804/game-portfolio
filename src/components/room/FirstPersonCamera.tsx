"use client";

import React, { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
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
const MAX_PITCH = (80 * Math.PI) / 180; // ±80 degrees

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

  // Internal orientation angles (radians)
  const yaw = useRef(0);
  const pitch = useRef(0);
  const isPointerLocked = useRef(false);

  // Keyboard input state
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

  // Reusable math objects
  const euler = useRef(new THREE.Euler(0, 0, 0, "YXZ"));
  const moveDirection = useRef(new THREE.Vector3());
  const forwardVector = useRef(new THREE.Vector3());
  const rightVector = useRef(new THREE.Vector3());

  // Spawn outside on the stone porch facing the front door
  useEffect(() => {
    camera.position.set(0, PLAYER_HEIGHT, 4.5);
    camera.rotation.order = "YXZ";
  }, [camera]);

  // Pointer Lock (Desktop)
  useEffect(() => {
    const canvas = gl.domElement;

    const handlePointerLockChange = () => {
      isPointerLocked.current = document.pointerLockElement === canvas;
      if (isPointerLocked.current) {
        onInteraction();
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked.current) return;

      onInteraction();
      yaw.current -= e.movementX * MOUSE_SENSITIVITY;
      pitch.current -= e.movementY * MOUSE_SENSITIVITY;
      pitch.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch.current));
    };

    const handleCanvasClick = () => {
      if (!isPointerLocked.current) {
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
  }, [gl, onInteraction]);

  // Keyboard controls (WASD / Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
  }, [onInteraction]);

  // Handle Touch look deltas from MobileControls
  useEffect(() => {
    if (mobileLookDelta.x !== 0 || mobileLookDelta.y !== 0) {
      onInteraction();
      yaw.current -= mobileLookDelta.x * TOUCH_SENSITIVITY;
      pitch.current -= mobileLookDelta.y * TOUCH_SENSITIVITY;
      pitch.current = Math.max(-MAX_PITCH, Math.min(MAX_PITCH, pitch.current));
    }
  }, [mobileLookDelta, onInteraction]);

  // Main game loop update
  useFrame((_, delta) => {
    // 1. Camera Rotation
    euler.current.set(pitch.current, yaw.current, 0, "YXZ");
    camera.quaternion.setFromEuler(euler.current);

    // 2. Automated Walk Target (e.g. glide across doorway threshold when clicking Enter/Exit)
    if (walkTarget) {
      const targetVec = new THREE.Vector3(...walkTarget);
      const dist = camera.position.distanceTo(targetVec);

      if (dist < 0.15) {
        camera.position.copy(targetVec);
        setWalkTarget(null);
      } else {
        camera.position.lerp(targetVec, delta * 3.2);
        // Turn camera gently toward travel direction
        if (walkTarget[2] < 0) {
          // Entering inside
          yaw.current = THREE.MathUtils.lerp(yaw.current, 0, delta * 3);
        } else {
          // Exiting outside
          yaw.current = THREE.MathUtils.lerp(yaw.current, Math.PI, delta * 3);
        }
      }
    } else {
      // 3. User Movement (Keyboard + Mobile Joystick)
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

    // 4. Physical Doorway & Wall Bounds Clamping
    const prevZ = camera.position.z;
    const x = camera.position.x;
    const isInside = prevZ < 0;
    const isInDoorwayX = Math.abs(x) < 0.62;

    if (isInside) {
      // Inside Room: x in [-4.4, 4.4], z in [-6.4, 0]
      camera.position.x = Math.max(-4.4, Math.min(4.4, camera.position.x));
      camera.position.z = Math.max(-6.4, camera.position.z);

      // Dividing wall at z = 0
      if (!isInDoorwayX || !doorOpen) {
        camera.position.z = Math.min(-0.35, camera.position.z);
      }
    } else {
      // Outside Porch: x in [-3.8, 3.8], z in [0, 6.2]
      camera.position.x = Math.max(-3.8, Math.min(3.8, camera.position.x));
      camera.position.z = Math.min(6.2, camera.position.z);

      // Dividing wall at z = 0
      if (!isInDoorwayX || !doorOpen) {
        camera.position.z = Math.max(0.35, camera.position.z);
      }
    }

    camera.position.y = PLAYER_HEIGHT;

    // 5. Update Current Player Zone in Zustand
    const currentZone = camera.position.z > 0.1 ? "outside" : "inside";
    setPlayerZone(currentZone);
  });

  return null;
};
