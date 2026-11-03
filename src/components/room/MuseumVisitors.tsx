"use client";

import React, { useMemo } from "react";
import { DummyFigure, Waypoint } from "./DummyFigure";
import { DoormanFigure } from "./DoormanFigure";

export const MuseumVisitors: React.FC = () => {
  // Waypoints for Alex (Curator in Museum Gallery)
  const alexWaypoints = useMemo<Waypoint[]>(
    () => [
      {
        // Inspecting Cyberpunk City pedestal
        pos: [-2.2, 0, -10.2],
        lookAt: [-2.2, 1.2, -11.5],
        dwellTime: 7.0,
      },
      {
        // Center aisle promenade
        pos: [0, 0, -11.5],
        lookAt: [0, 1.2, -14.5],
        dwellTime: 4.0,
      },
      {
        // Inspecting Ancient Relic pedestal
        pos: [2.2, 0, -10.2],
        lookAt: [2.2, 1.2, -11.5],
        dwellTime: 7.0,
      },
      {
        // Inspecting Quantum Physics visualizer
        pos: [1.6, 0, -13.6],
        lookAt: [0, 1.2, -14.5],
        dwellTime: 6.5,
      },
      {
        // Opposite angle of Quantum Physics
        pos: [-1.6, 0, -13.6],
        lookAt: [0, 1.2, -14.5],
        dwellTime: 6.5,
      },
    ],
    []
  );

  // Waypoints for Sam (Art Enthusiast in Living Room)
  const samWaypoints = useMemo<Waypoint[]>(
    () => [
      {
        // Admiring Painting 1 (Cyberpunk Art) on Left Wall
        pos: [-3.1, 0, -2.5],
        lookAt: [-4.5, 1.9, -2.5],
        dwellTime: 8.0,
      },
      {
        // Glancing through the grand archway toward Museum
        pos: [-0.8, 0, -4.8],
        lookAt: [0, 1.6, -9.0],
        dwellTime: 5.0,
      },
      {
        // Admiring Painting 3 (Graphics Art) on Right Wall
        pos: [3.1, 0, -4.5],
        lookAt: [4.5, 1.9, -4.5],
        dwellTime: 8.0,
      },
      {
        // Admiring Painting 2 (Terrain Art) on Right Wall
        pos: [3.1, 0, -2.2],
        lookAt: [4.5, 1.9, -2.2],
        dwellTime: 8.0,
      },
      {
        // Strolling near entrance area
        pos: [0.6, 0, -1.6],
        lookAt: [0, 1.6, 2.0],
        dwellTime: 5.0,
      },
    ],
    []
  );

  return (
    <group>
      {/* Visitor 1: Alex (Gallery Curator with smart guide tablet) */}
      <DummyFigure
        id="alex"
        name="Alex"
        role="Museum Curator"
        accentColor="#38bdf8"
        initialPosition={[-2.2, 0, -10.2]}
        initialRotation={0}
        waypoints={alexWaypoints}
        hasTablet={true}
      />

      {/* Visitor 2: Sam (Living Room Art Enthusiast) */}
      <DummyFigure
        id="sam"
        name="Sam"
        role="Art Connoisseur"
        accentColor="#fbbf24"
        initialPosition={[-3.1, 0, -2.5]}
        initialRotation={Math.PI / 2}
        waypoints={samWaypoints}
        hasTablet={false}
      />

      {/* Porch Doorman: Arthur (Opens front door when player approaches) */}
      <DoormanFigure />
    </group>
  );
};

