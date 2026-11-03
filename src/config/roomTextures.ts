export interface SurfaceConfig {
  texturePath?: string;
  fallbackColor: string;
  roughness?: number;
  metalness?: number;
}

export interface RoomTexturesConfig {
  roomDimensions: {
    width: number;  // X axis (e.g., 10 units: -5 to +5)
    height: number; // Y axis (e.g., 3.6 units: 0 to 3.6)
    depth: number;  // Z axis (e.g., 12 units: -6 to +6)
  };
  surfaces: {
    floor: SurfaceConfig;
    ceiling: SurfaceConfig;
    wallNorth: SurfaceConfig; // Facing South (front wall)
    wallSouth: SurfaceConfig; // Facing North (entrance wall)
    wallEast: SurfaceConfig;  // Facing West
    wallWest: SurfaceConfig;  // Facing East
  };
}

/**
 * Single configuration file mapping every room surface to an optional texture
 * path with a flat color fallback, roughness, and dimensions.
 * Swap textures here without touching Three.js geometry components.
 */
export const roomConfig: RoomTexturesConfig = {
  roomDimensions: {
    width: 10,
    height: 3.5,
    depth: 12,
  },
  surfaces: {
    floor: {
      texturePath: undefined, // E.g., '/textures/floor.webp'
      fallbackColor: "#26221f", // Warm dark oak floor
      roughness: 0.8,
      metalness: 0.1,
    },
    ceiling: {
      texturePath: undefined, // E.g., '/textures/ceiling.webp'
      fallbackColor: "#171717", // Dark architectural ceiling
      roughness: 0.9,
      metalness: 0.05,
    },
    wallNorth: {
      texturePath: undefined, // E.g., '/textures/wall.webp'
      fallbackColor: "#242831", // Accent dark slate wall with switches
      roughness: 0.85,
      metalness: 0.05,
    },
    wallSouth: {
      texturePath: undefined,
      fallbackColor: "#1e2229", // Entrance wall
      roughness: 0.9,
      metalness: 0.05,
    },
    wallEast: {
      texturePath: undefined,
      fallbackColor: "#1a1d24",
      roughness: 0.9,
      metalness: 0.05,
    },
    wallWest: {
      texturePath: undefined,
      fallbackColor: "#1a1d24",
      roughness: 0.9,
      metalness: 0.05,
    },
  },
};

