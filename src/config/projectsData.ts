export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  tagline: string;
  description: string;
  tags: string[];
  features: string[];
  liveUrl?: string;
  githubUrl?: string;
  artifactColor: string;
  artifactShape: "crystal" | "relic" | "torus";
  position: [number, number, number];
}

export const museumProjects: ProjectItem[] = [
  {
    id: "project-1",
    title: "Cyberpunk City Generator",
    category: "Procedural 3D & WebGL",
    tagline: "Real-time procedural city generator with neon shaders & audio sync",
    description:
      "A high-performance procedural metropolis engine built with Three.js and custom GLSL shaders. Features dynamic building height distributions, neon signage bloom, camera flythroughs, and audio-reactive traffic systems.",
    tags: ["React Three Fiber", "GLSL Shaders", "TypeScript", "Procedural Gen"],
    features: [
      "Procedural skyscraper generation with instant LOD switching",
      "Custom highway neon ribbon traffic simulation",
      "Web Audio API sync for beat-reactive building lights",
      "Sub-millisecond frame times optimized for 60fps on mobile",
    ],
    liveUrl: "https://example.com/cyberpunk",
    githubUrl: "https://github.com/example/cyberpunk-city",
    artifactColor: "#38bdf8",
    artifactShape: "crystal",
    position: [-2.2, 0, -11.5],
  },
  {
    id: "project-2",
    title: "Ancient Relic Explorer",
    category: "Game Development & Physics",
    tagline: "First-person interactive archaeology & puzzle adventure",
    description:
      "An exploratory first-person 3D adventure featuring interactive ancient relics, spatial audio reverberation, and dynamic lighting puzzles. Built with Next.js, Zustand state machine, and lightweight collision math.",
    tags: ["Next.js", "Zustand", "Spatial Audio", "Game Math"],
    features: [
      "Physical interaction raycaster with distance-based reticle targeting",
      "Interactive multi-room architectural spaces with seamless transitions",
      "Dynamic lighting attenuation with low GPU overhead",
      "Touch virtual joystick controls for mobile gamers",
    ],
    liveUrl: "https://example.com/relic-explorer",
    githubUrl: "https://github.com/example/relic-explorer",
    artifactColor: "#fbbf24",
    artifactShape: "relic",
    position: [2.2, 0, -11.5],
  },
  {
    id: "project-3",
    title: "Quantum Physics Visualizer",
    category: "Scientific Computing & Visuals",
    tagline: "Interactive 100,000+ GPU particle orbital simulation",
    description:
      "A GPU-accelerated computing visualizer that simulates orbital quantum mechanics and gravitational n-body attractions in real-time. Leverages instanced buffer geometries and custom compute-style vertex shaders.",
    tags: ["Three.js", "InstancedMesh", "Math Models", "WebGL2"],
    features: [
      "100,000 active particles simulated simultaneously at 60fps",
      "Interactive gravitational attractor points controlled via mouse/touch",
      "Custom velocity color ramp and motion blur streaks",
      "Export camera trajectory animations to WebM video",
    ],
    liveUrl: "https://example.com/quantum-visualizer",
    githubUrl: "https://github.com/example/quantum-visualizer",
    artifactColor: "#a855f7",
    artifactShape: "torus",
    position: [0, 0, -14.5],
  },
];

