"use client";

import React from "react";
import Link from "next/link";
import { useGameStore } from "@/store/useGameStore";
import { useClinicQueueStore } from "@/store/useClinicQueueStore";
import { useMenutopiaStore } from "@/store/useMenutopiaStore";
import { InteractionHint } from "./InteractionHint";
import { ProjectModal } from "./ProjectModal";
import { RotatePrompt } from "./RotatePrompt";

interface RoomHUDProps {
  hasInteracted: boolean;
  onDismissHint: () => void;
}

export const RoomHUD: React.FC<RoomHUDProps> = ({
  hasInteracted,
  onDismissHint,
}) => {
  const playerZone = useGameStore((state) => state.playerZone);
  const doorOpen = useGameStore((state) => state.doorOpen);
  const setDoorOpen = useGameStore((state) => state.setDoorOpen);
  const setWalkTarget = useGameStore((state) => state.setWalkTarget);
  const lights = useGameStore((state) => state.lights);
  const targetedInteractable = useGameStore(
    (state) => state.targetedInteractable
  );
  const visitorDialogue = useGameStore((state) => state.visitorDialogue);
  const dismissVisitorDialogue = useGameStore(
    (state) => state.dismissVisitorDialogue
  );
  const toggleVisitorFollow = useGameStore(
    (state) => state.toggleVisitorFollow
  );

  const userTicket = useClinicQueueStore((state) => state.userTicket);
  const userTicketStatus = useClinicQueueStore((state) => state.userTicketStatus);
  const isUserTurn = useClinicQueueStore((state) => state.isUserTurn);
  const currentTicket = useClinicQueueStore((state) => state.currentTicket);
  const playerOrder = useMenutopiaStore((state) => state.playerOrder);

  const isOutside = playerZone === "outside";

  const handleEnterHouse = () => {
    setDoorOpen(true);
    setWalkTarget([0, 1.6, -2.2]);
  };

  const handleExitToPorch = () => {
    setDoorOpen(true);
    setWalkTarget([0, 1.6, 4.2]);
  };

  const handleTargetAction = () => {
    if (!targetedInteractable) return;
    if (targetedInteractable.type === "switch") {
      useGameStore.getState().toggleLight(targetedInteractable.id);
    } else if (targetedInteractable.type === "door") {
      useGameStore.getState().toggleDoor();
    } else if (
      targetedInteractable.type === "pedestal" &&
      targetedInteractable.data
    ) {
      useGameStore.getState().setActiveProject(targetedInteractable.data as any);
    } else if (targetedInteractable.type === "visitor") {
      useGameStore.getState().interactWithVisitor(targetedInteractable.id);
    } else if (targetedInteractable.type === "kiosk") {
      useClinicQueueStore.getState().takeUserTicket();
    } else if (targetedInteractable.type === "restaurant-kiosk") {
      useMenutopiaStore.getState().placePlayerOrder();
    } else if (targetedInteractable.type === "pickup-counter") {
      useMenutopiaStore.getState().pickupPlayerOrder();
    }
  };

  const locationLabel =
    playerZone === "outside"
      ? "Outside Porch"
      : playerZone === "living-room"
      ? "Living Room"
      : playerZone === "clinic"
      ? "Navbat Clinic"
      : playerZone === "menutopia"
      ? "Menutopia Restaurant & Kitchen"
      : "Museum Gallery";

  return (
    <>
      {/* Mobile Orientation Request Prompt (Portrait -> Landscape) */}
      <RotatePrompt />

      {/* Interactive Glassmorphism Project Modal */}
      <ProjectModal />

      {/* VIP Golden Ticket Badge Pinned at Screen Edge */}
      {userTicket && (
        <aside
          aria-label="VIP Queue Ticket"
          className="fixed top-16 right-3 sm:right-6 z-40 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300"
        >
          <div
            className={`px-3.5 py-2.5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 transition-all ${
              isUserTurn
                ? "bg-amber-950/95 border-amber-400 ring-2 ring-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.6)] animate-pulse"
                : "bg-stone-900/90 border-amber-500/60"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-lg shadow-md border border-amber-200/50">
              🎫
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold tracking-wider text-amber-300">
                  {userTicket}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-amber-400/20 text-amber-200 border border-amber-400/40">
                  VIP Priority
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-200 mt-0.5">
                {isUserTurn ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>🔔</span> YOUR TURN! Enter Doctor's Office
                  </span>
                ) : userTicketStatus === "entered" ? (
                  <span className="text-sky-300">In Doctor's Consultation</span>
                ) : (
                  <span className="text-stone-300">
                    Waiting in queue... (Serving: {currentTicket})
                  </span>
                )}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Menutopia Restaurant Order Badge Pinned at Screen Edge */}
      {playerOrder && (
        <aside
          aria-label="Menutopia Food Order"
          className={`fixed right-3 sm:right-6 z-40 pointer-events-auto animate-in fade-in slide-in-from-right-4 duration-300 ${
            userTicket ? "top-32" : "top-16"
          }`}
        >
          <div
            className={`px-3.5 py-2.5 rounded-2xl backdrop-blur-xl border shadow-2xl flex items-center gap-3 transition-all ${
              playerOrder.status === "ready"
                ? "bg-emerald-950/95 border-emerald-400 ring-2 ring-emerald-400/60 shadow-[0_0_30px_rgba(16,185,129,0.5)] animate-pulse"
                : "bg-stone-900/90 border-red-500/60"
            }`}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-amber-600 flex items-center justify-center text-lg shadow-md border border-amber-200/50">
              🍔
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-mono font-bold tracking-wider text-amber-300">
                  {playerOrder.orderNumber}
                </span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-red-500/20 text-red-200 border border-red-400/40">
                  {playerOrder.status.toUpperCase()}
                </span>
              </div>
              <p className="text-[11px] font-medium text-stone-200 mt-0.5">
                {playerOrder.status === "ready" ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span>🔔</span> ORDER READY! Pick up at Counter
                  </span>
                ) : playerOrder.status === "served" ? (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <span>🍽️</span> ORDER COLLECTED! Enjoy your meal!
                  </span>
                ) : (
                  <span className="text-amber-200">
                    Kitchen: {playerOrder.item}
                  </span>
                )}
              </p>
            </div>
          </div>
        </aside>
      )}

      {/* Visitor Dialogue & Companion Command Overlay */}
      {visitorDialogue && (
        <aside
          aria-label="Visitor Dialogue"
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <div className="bg-stone-900/95 backdrop-blur-xl border border-stone-700/80 rounded-2xl p-4 shadow-2xl text-stone-200 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-stone-950 text-xs shadow-md"
                  style={{ backgroundColor: visitorDialogue.color }}
                >
                  {visitorDialogue.name[0]}
                </div>
                <div>
                  <h4 className="text-xs font-bold tracking-wide text-white">
                    {visitorDialogue.name}
                  </h4>
                  <p className="text-[10px] text-stone-400 font-medium">
                    {visitorDialogue.role}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={dismissVisitorDialogue}
                className="w-6 h-6 rounded-full bg-stone-800/80 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center text-xs transition-colors"
                aria-label="Close dialogue"
              >
                ✕
              </button>
            </div>

            <p className="text-xs leading-relaxed text-stone-300 font-sans italic">
              &ldquo;{visitorDialogue.message}&rdquo;
            </p>

            <div className="flex items-center gap-2 pt-1 border-t border-stone-800/80">
              <button
                type="button"
                onClick={() => toggleVisitorFollow(visitorDialogue.visitorId)}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow ${
                  visitorDialogue.isFollowing
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 hover:bg-amber-500/30"
                    : "bg-sky-500/20 text-sky-300 border border-sky-400/50 hover:bg-sky-500/30"
                }`}
              >
                <span>{visitorDialogue.isFollowing ? "🛑" : "🚶"}</span>
                <span>
                  {visitorDialogue.isFollowing
                    ? "Stop Following"
                    : "Command: Follow Me"}
                </span>
              </button>
              <button
                type="button"
                onClick={dismissVisitorDialogue}
                className="py-1.5 px-3 rounded-xl text-xs font-medium bg-stone-800 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </aside>
      )}

      <div className="fixed inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-6 select-none">
        {/* Top Bar: Navigation & Zone Indicator */}
        <header className="flex justify-between items-center w-full">
          <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
            {/* Contextual Enter / Exit Button */}
            {isOutside ? (
              <button
                type="button"
                onClick={handleEnterHouse}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs sm:text-sm font-bold tracking-wide shadow-lg border border-amber-300/60 hover:scale-105 active:scale-95 transition-all"
                aria-label="Enter through front door into room"
              >
                <span>🚪</span>
                <span>{doorOpen ? "Step Inside" : "Enter"}</span>
                <span className="text-[10px] sm:text-xs">▶</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleExitToPorch}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all"
                aria-label="Exit room to outside porch"
              >
                <span>←</span>
                <span>Exit Porch</span>
              </button>
            )}

            {/* Static View Link */}
            <Link
              href="/portfolio"
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-stone-900/85 hover:bg-stone-800 text-stone-200 border border-stone-700/60 text-xs sm:text-sm font-semibold backdrop-blur-md shadow-lg hover:scale-105 active:scale-95 transition-all"
              aria-label="Switch to static scrolling portfolio"
            >
              <span>Static</span>
              <span className="text-stone-400">📄</span>
            </Link>
          </div>

          {/* Status Badge: Current Location */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-900/80 backdrop-blur-md border border-stone-800 text-[11px] sm:text-xs text-stone-300 pointer-events-auto">
              <span
                className={`w-2 h-2 rounded-full ${
                  playerZone === "outside"
                    ? "bg-amber-400 animate-pulse"
                    : playerZone === "living-room"
                    ? "bg-emerald-400"
                    : playerZone === "clinic"
                    ? "bg-teal-400 shadow-[0_0_8px_#14b8a6] animate-pulse"
                    : "bg-purple-400 shadow-[0_0_8px_#a855f7]"
                }`}
              />
              <span className="font-medium">{locationLabel}</span>
            </div>
          </div>
        </header>

        {/* Center Targeting Reticle & Interactive Tap Prompt */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div
            className={`rounded-full transition-all duration-200 ${
              targetedInteractable
                ? "w-4 h-4 border-2 border-amber-400 bg-amber-400/25 scale-125"
                : "w-1.5 h-1.5 bg-white/60 ring-1 ring-black/40"
            }`}
          />
          {targetedInteractable && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleTargetAction();
              }}
              className="mt-3 px-3.5 py-1.5 rounded-full bg-stone-900/95 border border-amber-400/70 text-amber-300 text-[11px] font-mono tracking-wide backdrop-blur-xl shadow-2xl flex items-center gap-2 pointer-events-auto active:scale-95 transition-transform"
            >
              <span className="px-1.5 py-0.5 bg-amber-500/25 rounded text-[10px] text-amber-200 font-bold border border-amber-400/50">
                Tap / E
              </span>
              <span>{targetedInteractable.actionText}</span>
            </button>
          )}
        </div>

        {/* Bottom Center: Interaction Hint */}
        <div className="flex justify-center pb-20 sm:pb-4 w-full">
          <InteractionHint
            hasInteracted={hasInteracted}
            onDismiss={onDismissHint}
          />
        </div>
      </div>
    </>
  );
};
