import { create } from "zustand";

export interface LightState {
  id: string;
  name: string;
  on: boolean;
}

export interface PlayerState {
  position: [number, number, number];
  yaw: number;
  pitch: number;
}

export type PlayerZone = "outside" | "inside";

export interface TargetedInteractable {
  id: string;
  name: string;
  type: "switch" | "door";
  actionText: string;
}

interface GameStore {
  // Door State
  doorOpen: boolean;
  setDoorOpen: (open: boolean) => void;
  toggleDoor: () => void;

  // Automated walk-through transition target
  walkTarget: [number, number, number] | null;
  setWalkTarget: (target: [number, number, number] | null) => void;

  // Current zone tracking (outside on porch vs inside room)
  playerZone: PlayerZone;
  setPlayerZone: (zone: PlayerZone) => void;

  // Currently aimed interactive target (within reach of crosshair)
  targetedInteractable: TargetedInteractable | null;
  setTargetedInteractable: (target: TargetedInteractable | null) => void;

  // Lights State (Ceiling beside door + 3 Gallery Paintings with switches)
  lights: LightState[];
  toggleLight: (id: string) => void;
  setLight: (id: string, on: boolean) => void;

  // Player State
  player: PlayerState;
  setPlayer: (player: Partial<PlayerState>) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  doorOpen: false,
  setDoorOpen: (doorOpen) => set({ doorOpen }),
  toggleDoor: () => set((state) => ({ doorOpen: !state.doorOpen })),

  walkTarget: null,
  setWalkTarget: (walkTarget) => set({ walkTarget }),

  playerZone: "outside",
  setPlayerZone: (playerZone) => set({ playerZone }),

  targetedInteractable: null,
  setTargetedInteractable: (targetedInteractable) => set({ targetedInteractable }),

  lights: [
    { id: "ceiling", name: "Ceiling Light", on: true },
    { id: "painting-1", name: "Cyberpunk Art", on: true },
    { id: "painting-2", name: "Terrain Art", on: true },
    { id: "painting-3", name: "Graphics Art", on: true },
  ],
  toggleLight: (id) =>
    set((state) => ({
      lights: state.lights.map((l) => (l.id === id ? { ...l, on: !l.on } : l)),
    })),
  setLight: (id, on) =>
    set((state) => ({
      lights: state.lights.map((l) => (l.id === id ? { ...l, on: !l.on } : l)),
    })),

  player: {
    position: [0, 1.6, 4.5], // Spawns outside on porch
    yaw: 0,
    pitch: 0,
  },
  setPlayer: (partial) =>
    set((state) => ({
      player: { ...state.player, ...partial },
    })),
}));
