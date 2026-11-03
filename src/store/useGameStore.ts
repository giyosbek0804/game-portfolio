import { create } from "zustand";
import { ProjectItem } from "@/config/projectsData";

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

export type PlayerZone = "outside" | "living-room" | "museum" | "clinic" | "menutopia";

export type InteractableType = "switch" | "door" | "pedestal" | "visitor" | "kiosk" | "restaurant-kiosk" | "pickup-counter";

export interface VisitorInfo {
  id: string;
  name: string;
  role: string;
  color: string;
  messages: string[];
}

export interface VisitorDialogue {
  visitorId: string;
  name: string;
  role: string;
  color: string;
  message: string;
  isFollowing: boolean;
}

export interface TargetedInteractable {
  id: string;
  name: string;
  type: InteractableType;
  actionText: string;
  data?: ProjectItem | VisitorInfo;
}

interface GameStore {
  // Door State
  doorOpen: boolean;
  setDoorOpen: (open: boolean) => void;
  toggleDoor: () => void;

  // Automated walk-through transition target
  walkTarget: [number, number, number] | null;
  setWalkTarget: (target: [number, number, number] | null) => void;

  // Current zone tracking (outside porch vs living room vs museum)
  playerZone: PlayerZone;
  setPlayerZone: (zone: PlayerZone) => void;

  // Currently aimed interactive target (within reach of crosshair)
  targetedInteractable: TargetedInteractable | null;
  setTargetedInteractable: (target: TargetedInteractable | null) => void;

  // Active Project Modal (opens glassy project details pop-up)
  activeProject: ProjectItem | null;
  setActiveProject: (project: ProjectItem | null) => void;

  // Lights State (Ceiling beside door + Gallery Paintings with switches)
  lights: LightState[];
  toggleLight: (id: string) => void;
  setLight: (id: string, on: boolean) => void;

  // Visitor System (Dummy Figures)
  visitorDialogue: VisitorDialogue | null;
  setVisitorDialogue: (dialogue: VisitorDialogue | null) => void;
  dismissVisitorDialogue: () => void;
  visitorModes: Record<string, "wander" | "follow">;
  setVisitorMode: (id: string, mode: "wander" | "follow") => void;
  toggleVisitorFollow: (id: string) => void;
  visitorPositions: Record<string, [number, number, number]>;
  setVisitorPosition: (id: string, pos: [number, number, number]) => void;
  interactWithVisitor: (visitorId: string) => void;

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

  activeProject: null,
  setActiveProject: (activeProject) => set({ activeProject }),

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

  // Visitor System Implementation
  visitorDialogue: null,
  setVisitorDialogue: (visitorDialogue) => set({ visitorDialogue }),
  dismissVisitorDialogue: () => set({ visitorDialogue: null }),
  visitorModes: {
    alex: "wander",
    sam: "wander",
  },
  setVisitorMode: (id, mode) =>
    set((state) => ({
      visitorModes: { ...state.visitorModes, [id]: mode },
      visitorDialogue:
        state.visitorDialogue?.visitorId === id
          ? { ...state.visitorDialogue, isFollowing: mode === "follow" }
          : state.visitorDialogue,
    })),
  toggleVisitorFollow: (id) =>
    set((state) => {
      const current = state.visitorModes[id] || "wander";
      const nextMode = current === "wander" ? "follow" : "wander";
      const isFollowing = nextMode === "follow";
      return {
        visitorModes: { ...state.visitorModes, [id]: nextMode },
        visitorDialogue:
          state.visitorDialogue?.visitorId === id
            ? {
                ...state.visitorDialogue,
                isFollowing,
                message: isFollowing
                  ? "Awesome! I'll follow you around the house and museum!"
                  : "Alright, I'll resume touring the exhibits on my own. See you around!",
              }
            : state.visitorDialogue,
      };
    }),
  visitorPositions: {},
  setVisitorPosition: (id, pos) =>
    set((state) => ({
      visitorPositions: { ...state.visitorPositions, [id]: pos },
    })),
  interactWithVisitor: (visitorId: string) => {
    const state = useGameStore.getState();
    const isFollowing = state.visitorModes[visitorId] === "follow";

    if (visitorId === "alex") {
      const dialogs = [
        "Hey! Welcome to the Exhibition Gallery. Check out the glass vitrines on the floor—tap them to open project stories!",
        "Did you notice how smooth everything runs? The whole 3D world is optimized for 60fps even on mobile devices!",
        "The Quantum Physics artifact at the center is one of my favorites. Tap it to see the GPU simulation specs!",
        "Feel free to command me to follow you if you want a museum companion!",
      ];
      const randomMsg = dialogs[Math.floor(Math.random() * dialogs.length)];
      set({
        visitorDialogue: {
          visitorId: "alex",
          name: "Alex",
          role: "Museum Curator",
          color: "#38bdf8",
          message: randomMsg,
          isFollowing,
        },
      });
    } else if (visitorId === "sam") {
      const dialogs = [
        "Hello! I was just admiring the paintings on the wall. They are procedurally generated with mathematical canvas textures!",
        "Did you test the light switches beside each painting? You can click them to turn off each frame's lamp individually!",
        "The open archway leads right into the museum gallery. Take a walk through when you're ready!",
        "I'm happy to tour around with you—just tap 'Follow Me'!",
      ];
      const randomMsg = dialogs[Math.floor(Math.random() * dialogs.length)];
      set({
        visitorDialogue: {
          visitorId: "sam",
          name: "Sam",
          role: "Art Connoisseur",
          color: "#fbbf24",
          message: randomMsg,
          isFollowing,
        },
      });
    } else if (visitorId === "doorman") {
      const dialogs = [
        "Welcome! It is my pleasure to open the door for you. Step right inside!",
        "The house and the grand museum gallery behind it are open for exploration. Make yourself at home!",
        "If you ever need to return outside to the porch, just walk back through the doorway.",
      ];
      const randomMsg = dialogs[Math.floor(Math.random() * dialogs.length)];
      set({
        visitorDialogue: {
          visitorId: "doorman",
          name: "Arthur",
          role: "Porch Doorman",
          color: "#10b981", // Emerald accent
          message: randomMsg,
          isFollowing: false,
        },
      });
    }
  },

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
