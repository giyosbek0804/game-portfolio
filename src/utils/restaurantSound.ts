// Web Audio API Synthesized Sound System for Menutopia Restaurant
// Plays only when player is inside the "menutopia" zone
import { useGameStore } from "@/store/useGameStore";

let audioCtx: AudioContext | null = null;

const getAudioContext = () => {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
};

/**
 * Modern fast-food POS order ding:
 * Two bright pleasant tones (C5 -> E5: 523.25Hz -> 659.25Hz)
 */
export const playOrderChime = () => {
  if (typeof window === "undefined") return;

  const playerZone = useGameStore.getState().playerZone;
  if (playerZone !== "menutopia") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;

  // Tone 1: C5 (523.25 Hz)
  const osc1 = ctx.createOscillator();
  const gain1 = ctx.createGain();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(523.25, now);

  gain1.gain.setValueAtTime(0, now);
  gain1.gain.linearRampToValueAtTime(0.18, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc1.start(now);
  osc1.stop(now + 0.36);

  // Tone 2: E5 (659.25 Hz)
  const osc2 = ctx.createOscillator();
  const gain2 = ctx.createGain();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(659.25, now + 0.14);

  gain2.gain.setValueAtTime(0, now + 0.14);
  gain2.gain.linearRampToValueAtTime(0.16, now + 0.16);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  osc2.start(now + 0.14);
  osc2.stop(now + 0.56);
};

/**
 * Kitchen food ready bell / notification:
 * High crisp chime (G5: 783.99 Hz)
 */
export const playKitchenBell = () => {
  if (typeof window === "undefined") return;

  const playerZone = useGameStore.getState().playerZone;
  if (playerZone !== "menutopia") return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = "triangle";
  osc.frequency.setValueAtTime(783.99, now);

  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.15, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + 0.46);
};

