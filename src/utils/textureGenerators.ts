import * as THREE from "three";

/**
 * Creates a procedural dark oak wood plank texture with grain, gaps, and tone variations.
 */
export function createWoodPlankTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base warm dark wood tone
  ctx.fillStyle = "#2a1e16";
  ctx.fillRect(0, 0, 1024, 1024);

  const plankHeight = 128;
  const numPlanks = 1024 / plankHeight;

  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;

    // Slight color variation per plank
    const tint = (Math.random() - 0.5) * 18;
    const r = Math.min(255, Math.max(0, 48 + tint));
    const g = Math.min(255, Math.max(0, 34 + tint * 0.8));
    const b = Math.min(255, Math.max(0, 24 + tint * 0.6));
    ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    ctx.fillRect(0, y, 1024, plankHeight);

    // Subtle wood grain lines
    ctx.strokeStyle = "rgba(0, 0, 0, 0.18)";
    ctx.lineWidth = 1;
    for (let gIdx = 0; gIdx < 28; gIdx++) {
      const gy = y + Math.random() * plankHeight;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      for (let x = 0; x < 1024; x += 64) {
        ctx.lineTo(x, gy + (Math.random() - 0.5) * 4);
      }
      ctx.stroke();
    }

    // Plank seam / groove
    ctx.fillStyle = "#120b08";
    ctx.fillRect(0, y + plankHeight - 3, 1024, 3);
  }

  // Staggered vertical plank end seams
  ctx.fillStyle = "#120b08";
  for (let i = 0; i < numPlanks; i++) {
    const y = i * plankHeight;
    const xSeam1 = ((i * 380) % 800) + 100;
    const xSeam2 = (xSeam1 + 512) % 1024;
    ctx.fillRect(xSeam1, y, 3, plankHeight);
    ctx.fillRect(xSeam2, y, 3, plankHeight);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 4);
  return texture;
}

/**
 * Creates exterior horizontal architectural siding texture with smooth bevels and no moire.
 */
export function createExteriorSidingTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  const slatHeight = 64; // 16 clean slats
  const numSlats = 1024 / slatHeight;

  for (let i = 0; i < numSlats; i++) {
    const y = i * slatHeight;
    // Siding gradient: soft bevel transition
    const grad = ctx.createLinearGradient(0, y, 0, y + slatHeight);
    grad.addColorStop(0, "#323842");
    grad.addColorStop(0.15, "#2a303a");
    grad.addColorStop(0.9, "#21262f");
    grad.addColorStop(1, "#15191f");
    ctx.fillStyle = grad;
    ctx.fillRect(0, y, 1024, slatHeight);

    // Subtle seam groove at bottom of each slat
    ctx.fillStyle = "#0f1217";
    ctx.fillRect(0, y + slatHeight - 2, 1024, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1.5, 1.5);
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  return texture;
}

/**
 * Creates rich mahogany door texture with vertical wood grain and panel details.
 */
export function createDoorTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Base rich mahogany tone
  const bgGrad = ctx.createLinearGradient(0, 0, 512, 0);
  bgGrad.addColorStop(0, "#4a2414");
  bgGrad.addColorStop(0.5, "#5a2d1a");
  bgGrad.addColorStop(1, "#442112");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 1024);

  // Vertical wood grain lines
  ctx.strokeStyle = "rgba(0, 0, 0, 0.22)";
  ctx.lineWidth = 1.5;
  for (let x = 0; x < 512; x += 4) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    for (let y = 0; y < 1024; y += 64) {
      ctx.lineTo(x + (Math.random() - 0.5) * 3, y);
    }
    ctx.stroke();
  }

  // Classical door panels
  const drawPanel = (px: number, py: number, pw: number, ph: number) => {
    // Outer shadow
    ctx.fillStyle = "rgba(0, 0, 0, 0.4)";
    ctx.fillRect(px, py, pw, ph);

    // Inner bevel
    const innerGrad = ctx.createLinearGradient(px, py, px + pw, py + ph);
    innerGrad.addColorStop(0, "#3d1b0f");
    innerGrad.addColorStop(1, "#542a18");
    ctx.fillStyle = innerGrad;
    ctx.fillRect(px + 8, py + 8, pw - 16, ph - 16);

    // Subtle panel highlight
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 2;
    ctx.strokeRect(px + 10, py + 10, pw - 20, ph - 20);
  };

  // Top panels
  drawPanel(36, 60, 200, 380);
  drawPanel(276, 60, 200, 380);

  // Bottom panels
  drawPanel(36, 520, 200, 420);
  drawPanel(276, 520, 200, 420);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates exterior porch stone pavement tiles texture.
 */
export function createStonePorchTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark slate stone base
  ctx.fillStyle = "#1e242b";
  ctx.fillRect(0, 0, 512, 512);

  const tileSize = 64;
  for (let y = 0; y < 512; y += tileSize) {
    for (let x = 0; x < 512; x += tileSize) {
      const tint = (Math.random() - 0.5) * 16;
      ctx.fillStyle = `rgb(${34 + tint}, ${40 + tint}, ${48 + tint})`;
      ctx.fillRect(x + 2, y + 2, tileSize - 4, tileSize - 4);

      // Micro stone flecks
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let s = 0; s < 12; s++) {
        ctx.fillRect(x + Math.random() * (tileSize - 6), y + Math.random() * (tileSize - 6), 2, 2);
      }
    }
  }

  // Stone mortar seams
  ctx.strokeStyle = "#11161c";
  ctx.lineWidth = 3;
  for (let y = 0; y <= 512; y += tileSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  for (let x = 0; x <= 512; x += tileSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 4);
  return texture;
}

/**
 * Creates modern matte acoustic wall texture with gentle organic noise.
 */
export function createInteriorWallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d");

  if (!ctx) return new THREE.CanvasTexture(canvas);

  ctx.fillStyle = "#252830";
  ctx.fillRect(0, 0, 512, 512);

  // Fine plaster grain
  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 12;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(3, 3);
  return texture;
}



/**
 * Creates artistic painting 1: Neon Synthwave Cyberpunk Skyline.
 */
export function createPaintingTexture1(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Deep twilight sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 240);
  skyGrad.addColorStop(0, "#090919");
  skyGrad.addColorStop(0.5, "#2b0938");
  skyGrad.addColorStop(1, "#831843");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 240);

  // Glowing retro sun
  const sunGrad = ctx.createRadialGradient(256, 170, 10, 256, 170, 80);
  sunGrad.addColorStop(0, "#fef08a");
  sunGrad.addColorStop(0.4, "#f97316");
  sunGrad.addColorStop(1, "rgba(225, 29, 72, 0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(256, 170, 80, 0, Math.PI * 2);
  ctx.fill();

  // Distant City Skyline Silhouettes
  ctx.fillStyle = "#110726";
  const buildings = [
    { x: 30, w: 40, h: 100 },
    { x: 75, w: 50, h: 130 },
    { x: 130, w: 35, h: 90 },
    { x: 170, w: 60, h: 160 },
    { x: 235, w: 45, h: 110 },
    { x: 285, w: 65, h: 145 },
    { x: 355, w: 40, h: 95 },
    { x: 400, w: 55, h: 125 },
    { x: 460, w: 35, h: 80 },
  ];
  buildings.forEach((b) => {
    ctx.fillRect(b.x, 240 - b.h, b.w, b.h);
    // Neon window dots
    ctx.fillStyle = "#38bdf8";
    for (let wy = 240 - b.h + 10; wy < 230; wy += 14) {
      if (Math.random() > 0.4) {
        ctx.fillRect(b.x + 8, wy, 3, 5);
      }
      if (Math.random() > 0.4) {
        ctx.fillRect(b.x + b.w - 12, wy, 3, 5);
      }
    }
    ctx.fillStyle = "#110726";
  });

  // Glowing Perspective Grid Floor
  ctx.fillStyle = "#0a0314";
  ctx.fillRect(0, 240, 512, 120);

  ctx.strokeStyle = "#ec4899";
  ctx.lineWidth = 1.5;
  for (let x = -200; x <= 712; x += 40) {
    ctx.beginPath();
    ctx.moveTo(256, 240);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }
  for (let y = 240; y < 360; y += 18) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Title badge
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(20, 20, 160, 26);
  ctx.fillStyle = "#38bdf8";
  ctx.font = "bold 12px monospace";
  ctx.fillText("PROJECT // CYBER", 28, 38);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates artistic painting 2: Procedural Sunset Mountain Range.
 */
export function createPaintingTexture2(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Gradient sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 360);
  skyGrad.addColorStop(0, "#0f172a");
  skyGrad.addColorStop(0.4, "#ea580c");
  skyGrad.addColorStop(0.7, "#fbbf24");
  skyGrad.addColorStop(1, "#365314");
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 360);

  // Crescent Moon
  ctx.fillStyle = "#fef9c3";
  ctx.beginPath();
  ctx.arc(420, 60, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.arc(428, 56, 22, 0, Math.PI * 2);
  ctx.fill();

  // Mountain layer 1 (Far background)
  ctx.fillStyle = "#7c2d12";
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.lineTo(0, 200);
  ctx.lineTo(120, 120);
  ctx.lineTo(240, 220);
  ctx.lineTo(340, 140);
  ctx.lineTo(460, 240);
  ctx.lineTo(512, 190);
  ctx.lineTo(512, 360);
  ctx.closePath();
  ctx.fill();

  // Mountain layer 2 (Midground)
  ctx.fillStyle = "#451a03";
  ctx.beginPath();
  ctx.moveTo(0, 360);
  ctx.lineTo(0, 250);
  ctx.lineTo(80, 190);
  ctx.lineTo(180, 270);
  ctx.lineTo(280, 170);
  ctx.lineTo(400, 260);
  ctx.lineTo(512, 220);
  ctx.lineTo(512, 360);
  ctx.closePath();
  ctx.fill();

  // Foreground lake with reflection
  ctx.fillStyle = "#1c1917";
  ctx.fillRect(0, 290, 512, 70);

  // Water reflections
  ctx.strokeStyle = "rgba(251, 191, 36, 0.4)";
  ctx.lineWidth = 1;
  for (let y = 295; y < 355; y += 6) {
    ctx.beginPath();
    ctx.moveTo(180 - (y - 295) * 1.5, y);
    ctx.lineTo(340 + (y - 295) * 1.5, y);
    ctx.stroke();
  }

  // Title badge
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(20, 20, 170, 26);
  ctx.fillStyle = "#fbbf24";
  ctx.font = "bold 12px monospace";
  ctx.fillText("TERRAIN // SHADER", 28, 38);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

/**
 * Creates artistic painting 3: Abstract Geometric Neural / Visualizer composition.
 */
export function createPaintingTexture3(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 360;
  const ctx = canvas.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(canvas);

  // Dark slate canvas background
  ctx.fillStyle = "#0c131f";
  ctx.fillRect(0, 0, 512, 360);

  // Subtle grid
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < 512; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 360);
    ctx.stroke();
  }
  for (let y = 0; y < 360; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Overlapping geometric glowing circles & polygons
  const drawGlowCircle = (x: number, y: number, r: number, color: string) => {
    const g = ctx.createRadialGradient(x, y, 2, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  };

  drawGlowCircle(180, 160, 120, "rgba(56, 189, 248, 0.6)");
  drawGlowCircle(320, 190, 130, "rgba(168, 85, 247, 0.55)");
  drawGlowCircle(250, 140, 80, "rgba(236, 72, 153, 0.7)");

  // Golden ratio spiral & polygon lines
  ctx.strokeStyle = "#e2e8f0";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(100, 260);
  ctx.lineTo(180, 80);
  ctx.lineTo(330, 110);
  ctx.lineTo(410, 240);
  ctx.lineTo(260, 290);
  ctx.closePath();
  ctx.stroke();

  // Center node points
  const nodes = [
    [100, 260],
    [180, 80],
    [330, 110],
    [410, 240],
    [260, 290],
    [256, 180],
  ];
  nodes.forEach(([nx, ny]) => {
    ctx.fillStyle = "#38bdf8";
    ctx.beginPath();
    ctx.arc(nx, ny, 5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Title badge
  ctx.fillStyle = "rgba(0,0,0,0.6)";
  ctx.fillRect(20, 20, 180, 26);
  ctx.fillStyle = "#a855f7";
  ctx.font = "bold 12px monospace";
  ctx.fillText("ENGINE // GRAPHICS", 28, 38);

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}
