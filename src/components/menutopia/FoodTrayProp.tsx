"use client";

import React from "react";

interface FoodTrayPropProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export const FoodTrayProp: React.FC<FoodTrayPropProps> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}) => {
  return (
    <group position={position} rotation={rotation} scale={scale}>
      {/* 1. Red Fast-Food Serving Platter Tray */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.38, 0.015, 0.26]} />
        <meshStandardMaterial color="#dc2626" roughness={0.3} />
      </mesh>
      {/* Tray Raised Rim */}
      <mesh position={[0, 0.02, -0.125]}>
        <boxGeometry args={[0.38, 0.015, 0.01]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0.125]}>
        <boxGeometry args={[0.38, 0.015, 0.01]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} />
      </mesh>
      <mesh position={[-0.185, 0.02, 0]}>
        <boxGeometry args={[0.01, 0.015, 0.26]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} />
      </mesh>
      <mesh position={[0.185, 0.02, 0]}>
        <boxGeometry args={[0.01, 0.015, 0.26]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.3} />
      </mesh>

      {/* Tray Paper Liner (Clean white sheet) */}
      <mesh position={[0, 0.018, 0]}>
        <planeGeometry args={[0.35, 0.23]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>

      {/* 2. Juicy Double Cheeseburger */}
      <group position={[-0.08, 0.018, 0.02]}>
        {/* Bottom Bun */}
        <mesh position={[0, 0.012, 0]}>
          <cylinderGeometry args={[0.052, 0.05, 0.02, 16]} />
          <meshStandardMaterial color="#d97706" roughness={0.6} />
        </mesh>
        {/* Beef Patty 1 */}
        <mesh position={[0, 0.025, 0]}>
          <cylinderGeometry args={[0.054, 0.054, 0.012, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        {/* Melted Cheddar Cheese Slice */}
        <mesh position={[0, 0.033, 0]} rotation={[0, 0.35, 0]}>
          <boxGeometry args={[0.085, 0.004, 0.085]} />
          <meshStandardMaterial color="#f59e0b" roughness={0.4} />
        </mesh>
        {/* Beef Patty 2 */}
        <mesh position={[0, 0.041, 0]}>
          <cylinderGeometry args={[0.054, 0.054, 0.012, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
        {/* Crispy Lettuce */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0.8, 0]}>
          <boxGeometry args={[0.09, 0.005, 0.09]} />
          <meshStandardMaterial color="#22c55e" roughness={0.5} />
        </mesh>
        {/* Top Sesame Bun Dome */}
        <mesh position={[0, 0.062, 0]}>
          <sphereGeometry args={[0.052, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial color="#d97706" roughness={0.5} />
        </mesh>
      </group>

      {/* 3. Red French Fries Carton with Golden Fries */}
      <group position={[0.07, 0.018, -0.04]} rotation={[0, -0.2, 0]}>
        {/* Red Fries Box */}
        <mesh position={[0, 0.038, 0]}>
          <boxGeometry args={[0.055, 0.07, 0.038]} />
          <meshStandardMaterial color="#ef4444" roughness={0.3} />
        </mesh>
        {/* Golden Fries Sticks */}
        <group position={[0, 0.072, 0]}>
          {[-0.016, -0.005, 0.008, 0.018].map((fx, i) => (
            <mesh
              key={`fry_${i}`}
              position={[fx, 0.015 + (i % 2) * 0.008, (i % 2 === 0 ? 0.005 : -0.005)]}
              rotation={[(i - 1.5) * 0.1, 0, (i - 1.5) * 0.12]}
            >
              <boxGeometry args={[0.007, 0.045, 0.007]} />
              <meshStandardMaterial color="#fbbf24" roughness={0.4} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 4. Large Soda Cup with Lid and Straw */}
      <group position={[0.08, 0.018, 0.06]}>
        {/* Cup Body (Cyan Fast-Food Cup) */}
        <mesh position={[0, 0.055, 0]}>
          <cylinderGeometry args={[0.032, 0.024, 0.11, 16]} />
          <meshStandardMaterial color="#0284c7" roughness={0.3} />
        </mesh>
        {/* White Plastic Lid */}
        <mesh position={[0, 0.112, 0]}>
          <cylinderGeometry args={[0.034, 0.034, 0.006, 16]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Red & White Drinking Straw */}
        <mesh position={[0, 0.135, 0]} rotation={[0.15, 0, 0.1]}>
          <cylinderGeometry args={[0.003, 0.003, 0.06, 8]} />
          <meshStandardMaterial color="#ef4444" />
        </mesh>
      </group>
    </group>
  );
};

