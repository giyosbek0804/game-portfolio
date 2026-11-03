"use client";

import React, { useEffect } from "react";
import { useGameStore } from "@/store/useGameStore";

export const ProjectModal: React.FC = () => {
  const activeProject = useGameStore((state) => state.activeProject);
  const setActiveProject = useGameStore((state) => state.setActiveProject);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activeProject) {
        setActiveProject(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeProject, setActiveProject]);

  if (!activeProject) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-project-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md animate-fade-in pointer-events-auto select-auto"
      onClick={() => setActiveProject(null)}
    >
      {/* Glassmorphic Project Card */}
      <div
        className="relative w-full max-w-2xl bg-stone-900/85 backdrop-blur-2xl border border-stone-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl text-stone-100 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient Top Glow Bar */}
        <div
          className="absolute top-0 left-0 right-0 h-1.5 opacity-80"
          style={{ backgroundColor: activeProject.artifactColor }}
        />

        {/* Header: Category & Close Button */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <span
              className="inline-block text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-md mb-2 font-semibold border"
              style={{
                color: activeProject.artifactColor,
                borderColor: `${activeProject.artifactColor}40`,
                backgroundColor: `${activeProject.artifactColor}15`,
              }}
            >
              {activeProject.category}
            </span>
            <h2
              id="modal-project-title"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white"
            >
              {activeProject.title}
            </h2>
            <p className="text-sm text-stone-300 mt-1 italic">
              {activeProject.tagline}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setActiveProject(null)}
            className="text-stone-400 hover:text-white p-2 rounded-lg bg-stone-800/80 hover:bg-stone-700/80 border border-stone-700 transition-colors"
            aria-label="Close project modal (Esc)"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>

        {/* Project Description */}
        <div className="space-y-3 text-sm text-stone-300 leading-relaxed border-t border-b border-stone-800 py-4">
          <p>{activeProject.description}</p>

          {/* Key Features List */}
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-400 mb-2">
              Key Architecture & Features:
            </h3>
            <ul className="space-y-1.5">
              {activeProject.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm">
                  <span
                    className="text-sm leading-none mt-0.5"
                    style={{ color: activeProject.artifactColor }}
                  >
                    ✦
                  </span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Tech Stack Tags */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-400">
            Technologies Used:
          </h4>
          <div className="flex flex-wrap gap-2">
            {activeProject.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-md text-xs font-mono bg-stone-800 text-stone-300 border border-stone-700"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Actions: Live Demo & GitHub */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeProject.liveUrl && (
              <a
                href={activeProject.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm tracking-wide bg-amber-600 hover:bg-amber-500 text-stone-950 transition-colors shadow-lg"
              >
                <span>Live Project Demo</span>
                <span>↗</span>
              </a>
            )}

            {activeProject.githubUrl && (
              <a
                href={activeProject.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-stone-300 bg-stone-800 hover:bg-stone-700 border border-stone-700 transition-colors"
              >
                <span>Code Repository</span>
                <span>↗</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveProject(null)}
            className="text-xs text-stone-400 hover:text-stone-200 transition-colors py-2 px-3"
          >
            Press <kbd className="px-1.5 py-0.5 bg-stone-800 rounded border border-stone-700 font-mono text-amber-400">Esc</kbd> to return
          </button>
        </div>
      </div>
    </div>
  );
};

