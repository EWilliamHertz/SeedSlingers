"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import assetLoader from "@/utils/AssetLoader";
import { ASSET_MANIFEST, SPRITE_CONFIG } from "@/data/assetManifest";

const TILE_SIZE = 48;
const VIEWPORT_WIDTH = 16; // Visible screen width
const VIEWPORT_HEIGHT = 12; // Visible screen height
const WORLD_SCREENS_X = 2; // 2 screens wide
const WORLD_SCREENS_Y = 2; // 2 screens tall

const BIOMES = [
  {
    name: "Emerald Grove",
    xRange: [0, 3],
    base: "#166534",
    mid: "#15803d",
    light: "#16a34a",
    accent: "#4ade80",
    particle: "#86efac",
  },
  {
    name: "Crystal Canyon",
    xRange: [4, 7],
    base: "#4c1d95",
    mid: "#6d28d9",
    light: "#7c3aed",
    accent: "#a78bfa",
    particle: "#c4b5fd",
  },
  {
    name: "Coral Ruins",
    xRange: [8, 11],
    base: "#164e63",
    mid: "#0e7490",
    light: "#0891b2",
    accent: "#22d3ee",
    particle: "#67e8f9",
  },
  {
    name: "Amber Wastes",
    xRange: [12, 15],
    base: "#78350f",
    mid: "#b45309",
    light: "#d97706",
    accent: "#fbbf24",
    particle: "#fde68a",
  },
  {
    name: "Obsidian Depths",
    xRange: [16, 19],
    base: "#1c1917",
    mid: "#292524",
    light: "#44403c",
    accent: "#78716c",
    particle: "#a8a29e",
  },
  {
    name: "Crimson Expanse",
    xRange: [20, 23],
    base: "#7f1d1d",
    mid: "#991b1b",
    light: "#dc2626",
    accent: "#f87171",
    particle: "#fca5a5",
  },
  {
    name: "Azure Fields",
    xRange: [24, 27],
    base: "#1e3a8a",
    mid: "#1d4ed8",
    light: "#3b82f6",
    accent: "#60a5fa",
    particle: "#93c5fd",
  },
  {
    name: "Verdant Canopy",
    xRange: [28, 31],
    base: "#14532d",
    mid: "#166534",
    light: "#22c55e",
    accent: "#4ade80",
    particle: "#86efac",
  },
];

function getBiome(x) {
  return BIOMES.find((b) => x >= b.xRange[0] && x <= b.xRange[1]) || BIOMES[0];
}

function seededRand(seed) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

// Simple pathfinding (straight line for now, can be upgraded to A*)
function findPath(fromX, fromY, toX, toY) {
  const path = [];
  let x = fromX;
  let y = fromY;

  while (x !== toX || y !== toY) {
    if (x < toX) x++;
    else if (x > toX) x--;

    if (y < toY) y++;
    else if (y > toY) y--;

    path.push({ x, y });

    // Safety check to prevent infinite loops
    if (path.length > 100) break;
  }

  return path;
}

export default function GameCanvas({
  playerData,
  onEncounter,
  onPlayerMove,
  onScreenChange,
  onNearbyPlayersUpdate,
  onPlayerClick,
}) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const timeRef = useRef(0);
  const lastTimeRef = useRef(null);
  const moveIntervalRef = useRef(null);

  // Calculate initial screen based on player position
  const initialScreenX = Math.floor(
    (playerData.position_x || 5) / VIEWPORT_WIDTH,
  );
  const initialScreenY = Math.floor(
    (playerData.position_y || 5) / VIEWPORT_HEIGHT,
  );
  const initialLocalX = (playerData.position_x || 5) % VIEWPORT_WIDTH;
  const initialLocalY = (playerData.position_y || 5) % VIEWPORT_HEIGHT;

  const [currentScreen, setCurrentScreen] = useState({
    x: initialScreenX,
    y: initialScreenY,
  });
  const [playerPos, setPlayerPos] = useState({
    x: initialLocalX,
    y: initialLocalY,
  });
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [movementPath, setMovementPath] = useState([]);
  const [targetTile, setTargetTile] = useState(null);
  const playerPosRef = useRef({ x: initialLocalX, y: initialLocalY });
  const currentScreenRef = useRef({ x: initialScreenX, y: initialScreenY });

  const [biomeName, setBiomeName] = useState(
    getBiome(
      currentScreenRef.current.x * VIEWPORT_WIDTH + playerPosRef.current.x,
    ).name,
  );

  // Vegetation tiles — generated per screen
  const vegTiles = useRef(new Map());

  const getVegForScreen = useCallback((screenX, screenY) => {
    const key = `${screenX},${screenY}`;
    if (!vegTiles.current.has(key)) {
      const tiles = [];
      const seed = screenX * 1000 + screenY;
      for (let i = 0; i < 28; i++) {
        tiles.push({
          gx: Math.floor(seededRand(seed + i * 3) * VIEWPORT_WIDTH),
          gy: Math.floor(seededRand(seed + i * 3 + 1) * VIEWPORT_HEIGHT),
          size: 6 + Math.floor(seededRand(seed + i * 3 + 2) * 10),
        });
      }
      vegTiles.current.set(key, tiles);
    }
    return vegTiles.current.get(key);
  }, []);

  // Send heartbeat and get nearby players
  useEffect(() => {
    const sendHeartbeat = async () => {
      const worldX =
        currentScreenRef.current.x * VIEWPORT_WIDTH + playerPosRef.current.x;
      const worldY =
        currentScreenRef.current.y * VIEWPORT_HEIGHT + playerPosRef.current.y;

      try {
        const res = await fetch("/api/multiplayer/heartbeat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            position_x: worldX,
            position_y: worldY,
            current_activity: "exploring",
          }),
        });

        if (res.ok) {
          const data = await res.json();
          const players = data.nearbyPlayers || [];
          setNearbyPlayers(players);
          if (onNearbyPlayersUpdate) {
            onNearbyPlayersUpdate(players);
          }
        }
      } catch (err) {
        console.error("Heartbeat error:", err);
      }
    };

    sendHeartbeat(); // Initial heartbeat
    const interval = setInterval(sendHeartbeat, 3000); // Every 3 seconds

    return () => clearInterval(interval);
  }, []); // Only on mount

  // Notify parent when screen changes
  useEffect(() => {
    if (onScreenChange) {
      onScreenChange(currentScreen);
    }
  }, [currentScreen, onScreenChange]);

  // Auto-move along path
  useEffect(() => {
    if (movementPath.length === 0) {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
      }
      setTargetTile(null);
      return;
    }

    moveIntervalRef.current = setInterval(() => {
      setMovementPath((prev) => {
        if (prev.length === 0) return prev;

        const nextStep = prev[0];
        moveToTile(nextStep.x, nextStep.y);

        return prev.slice(1);
      });
    }, 200); // Move every 200ms

    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, [movementPath.length > 0]);

  const moveToTile = useCallback(
    (localX, localY) => {
      const pos = playerPosRef.current;
      const screen = currentScreenRef.current;
      let nx = localX;
      let ny = localY;
      let newScreenX = screen.x;
      let newScreenY = screen.y;

      // Handle screen transitions
      if (nx < 0) {
        if (screen.x > 0) {
          newScreenX = screen.x - 1;
          nx = VIEWPORT_WIDTH - 1;
        } else {
          nx = 0;
        }
      } else if (nx >= VIEWPORT_WIDTH) {
        if (screen.x < WORLD_SCREENS_X - 1) {
          newScreenX = screen.x + 1;
          nx = 0;
        } else {
          nx = VIEWPORT_WIDTH - 1;
        }
      }

      if (ny < 0) {
        if (screen.y > 0) {
          newScreenY = screen.y - 1;
          ny = VIEWPORT_HEIGHT - 1;
        } else {
          ny = 0;
        }
      } else if (ny >= VIEWPORT_HEIGHT) {
        if (screen.y < WORLD_SCREENS_Y - 1) {
          newScreenY = screen.y + 1;
          ny = 0;
        } else {
          ny = VIEWPORT_HEIGHT - 1;
        }
      }

      if (
        nx !== pos.x ||
        ny !== pos.y ||
        newScreenX !== screen.x ||
        newScreenY !== screen.y
      ) {
        playerPosRef.current = { x: nx, y: ny };
        currentScreenRef.current = { x: newScreenX, y: newScreenY };
        setPlayerPos({ x: nx, y: ny });
        setCurrentScreen({ x: newScreenX, y: newScreenY });

        const worldX = newScreenX * VIEWPORT_WIDTH + nx;
        const worldY = newScreenY * VIEWPORT_HEIGHT + ny;
        setBiomeName(getBiome(worldX).name);
        onPlayerMove({ x: worldX, y: worldY });

        // Encounter chance
        if (Math.random() < 0.15) {
          const count = Math.floor(Math.random() * 2) + 1;
          fetch(`/api/game/encounter?count=${count}`)
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then((data) => {
              if (data.sprouts) {
                onEncounter(data.sprouts);
                // Stop movement on encounter
                setMovementPath([]);
                setTargetTile(null);
              }
            })
            .catch((err) => console.error("Encounter error:", err));
        }
      }
    },
    [onEncounter, onPlayerMove],
  );

  const handleCanvasClick = useCallback(
    (e) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      const tileX = Math.floor(clickX / TILE_SIZE);
      const tileY = Math.floor(clickY / TILE_SIZE);

      // Check if clicked on a nearby player first
      const worldOffsetX = currentScreenRef.current.x * VIEWPORT_WIDTH;
      const worldOffsetY = currentScreenRef.current.y * VIEWPORT_HEIGHT;

      for (const player of nearbyPlayers) {
        const localX = player.x - worldOffsetX;
        const localY = player.y - worldOffsetY;

        // Check if click is within player tile
        if (
          localX >= 0 &&
          localX < VIEWPORT_WIDTH &&
          localY >= 0 &&
          localY < VIEWPORT_HEIGHT &&
          tileX === localX &&
          tileY === localY
        ) {
          // Clicked on a player!
          if (onPlayerClick) {
            onPlayerClick(player);
          }
          return; // Don't process as movement
        }
      }

      // Normal movement logic
      if (
        tileX >= 0 &&
        tileX < VIEWPORT_WIDTH &&
        tileY >= 0 &&
        tileY < VIEWPORT_HEIGHT
      ) {
        const pos = playerPosRef.current;
        const path = findPath(pos.x, pos.y, tileX, tileY);
        setMovementPath(path);
        setTargetTile({ x: tileX, y: tileY });
      }
    },
    [nearbyPlayers, onPlayerClick],
  );

  const draw = useCallback(
    (timestamp) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const delta = (timestamp - lastTimeRef.current) / 1000;
      lastTimeRef.current = timestamp;
      timeRef.current += delta;
      const t = timeRef.current;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = false;

      const pos = playerPosRef.current;
      const screen = currentScreenRef.current;
      const worldOffsetX = screen.x * VIEWPORT_WIDTH;
      const worldOffsetY = screen.y * VIEWPORT_HEIGHT;

      // --- Background tiles ---
      for (let y = 0; y < VIEWPORT_HEIGHT; y++) {
        for (let x = 0; x < VIEWPORT_WIDTH; x++) {
          const worldX = worldOffsetX + x;
          const tileBiome = getBiome(worldX);
          const checker = (x + y) % 2 === 0;
          ctx.fillStyle = checker ? tileBiome.mid : tileBiome.base;
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);

          // Subtle shimmer
          const shimmer = Math.sin(t * 1.5 + x * 0.4 + y * 0.4) * 0.06 + 0.06;
          ctx.fillStyle =
            tileBiome.light +
            Math.floor(shimmer * 255)
              .toString(16)
              .padStart(2, "0");
          ctx.fillRect(
            x * TILE_SIZE + 1,
            y * TILE_SIZE + 1,
            TILE_SIZE - 2,
            TILE_SIZE - 2,
          );
        }
      }

      // --- Draw movement path ---
      if (movementPath.length > 0) {
        ctx.strokeStyle = "#4ade8080";
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";

        ctx.beginPath();
        ctx.moveTo(
          pos.x * TILE_SIZE + TILE_SIZE / 2,
          pos.y * TILE_SIZE + TILE_SIZE / 2,
        );

        movementPath.forEach((step) => {
          ctx.lineTo(
            step.x * TILE_SIZE + TILE_SIZE / 2,
            step.y * TILE_SIZE + TILE_SIZE / 2,
          );
        });

        ctx.stroke();

        // Draw target indicator
        if (targetTile) {
          const pulse = Math.sin(t * 4) * 0.3 + 0.7;
          ctx.globalAlpha = pulse;
          ctx.fillStyle = "#4ade80";
          ctx.beginPath();
          ctx.arc(
            targetTile.x * TILE_SIZE + TILE_SIZE / 2,
            targetTile.y * TILE_SIZE + TILE_SIZE / 2,
            8,
            0,
            Math.PI * 2,
          );
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      // --- Vegetation ---
      const vegList = getVegForScreen(screen.x, screen.y);
      vegList.forEach((v, i) => {
        const worldX = worldOffsetX + v.gx;
        const vBiome = getBiome(worldX);
        const bob = Math.sin(t * 1.2 + i * 0.7) * 2;
        const cx = v.gx * TILE_SIZE + TILE_SIZE / 2;
        const cy = v.gy * TILE_SIZE + TILE_SIZE / 2 + bob;

        // Stem
        ctx.fillStyle = vBiome.base;
        ctx.fillRect(cx - 2, cy, 4, v.size * 0.6);

        // Canopy
        ctx.fillStyle = vBiome.accent + "cc";
        ctx.beginPath();
        ctx.arc(cx, cy - v.size * 0.3, v.size * 0.55, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = vBiome.particle + "80";
        ctx.beginPath();
        ctx.arc(
          cx - v.size * 0.15,
          cy - v.size * 0.45,
          v.size * 0.2,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      });

      // --- Floating particles ---
      for (let i = 0; i < 18; i++) {
        const seed = i * 137.5 + screen.x * 500 + screen.y * 300;
        const px =
          ((seed % (VIEWPORT_WIDTH * TILE_SIZE)) +
            Math.sin(t * 0.4 + i) * 20 +
            VIEWPORT_WIDTH * TILE_SIZE) %
          (VIEWPORT_WIDTH * TILE_SIZE);
        const py =
          ((i * 41) % (VIEWPORT_HEIGHT * TILE_SIZE)) +
          Math.sin(t * 0.6 + i * 1.3) * 14;
        const worldX = worldOffsetX + Math.floor(px / TILE_SIZE);
        const pBiome = getBiome(worldX);
        const alpha = (Math.sin(t * 1.1 + i) * 0.3 + 0.5).toFixed(2);
        const size = 2 + Math.sin(t * 2 + i) * 1.5;

        ctx.globalAlpha = parseFloat(alpha);
        ctx.fillStyle = pBiome.particle;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // --- Render other players ---
      nearbyPlayers.forEach((player) => {
        // Convert world coordinates to screen-local coordinates
        const localX = player.x - worldOffsetX;
        const localY = player.y - worldOffsetY;

        // Only render if on current screen
        if (
          localX >= 0 &&
          localX < VIEWPORT_WIDTH &&
          localY >= 0 &&
          localY < VIEWPORT_HEIGHT
        ) {
          const px = localX * TILE_SIZE;
          const py = localY * TILE_SIZE;
          const bounce = Math.sin(t * 5 + player.id.charCodeAt(0)) * 2.5;

          // Shadow
          ctx.fillStyle = "#00000030";
          ctx.beginPath();
          ctx.ellipse(
            px + TILE_SIZE / 2,
            py + TILE_SIZE - 6,
            12,
            5,
            0,
            0,
            Math.PI * 2,
          );
          ctx.fill();

          // Other player sprite (blue-ish variant)
          ctx.fillStyle = "#1e40af";
          ctx.fillRect(px + 10, py + 14 + bounce, 28, 26);
          ctx.fillStyle = "#3b82f6";
          ctx.fillRect(px + 14, py + 18 + bounce, 20, 18);
          ctx.fillStyle = "#fef3c7";
          ctx.fillRect(px + 15, py + 6 + bounce, 18, 16);
          ctx.fillStyle = "#1e40af";
          ctx.fillRect(px + 13, py + 4 + bounce, 22, 10);
          ctx.fillRect(px + 11, py + 8 + bounce, 4, 8);
          ctx.fillRect(px + 33, py + 8 + bounce, 4, 8);

          ctx.fillStyle = "#000";
          ctx.fillRect(px + 18, py + 12 + bounce, 3, 3);
          ctx.fillRect(px + 27, py + 12 + bounce, 3, 3);

          ctx.fillStyle = "#60a5fa";
          ctx.fillRect(px + 19, py + 13 + bounce, 1, 1);
          ctx.fillRect(px + 28, py + 13 + bounce, 1, 1);

          // Staff
          ctx.fillStyle = "#92400e";
          ctx.fillRect(px + 36, py + 8 + bounce, 3, 32);
          ctx.fillStyle = "#60a5fa";
          ctx.beginPath();
          ctx.arc(px + 37, py + 6 + bounce, 5, 0, Math.PI * 2);
          ctx.fill();

          // Outline
          ctx.strokeStyle = "#000";
          ctx.lineWidth = 1.5;
          ctx.strokeRect(px + 10, py + 14 + bounce, 28, 26);
          ctx.strokeRect(px + 15, py + 6 + bounce, 18, 16);

          // Username label
          ctx.font = "10px monospace";
          ctx.textAlign = "center";
          ctx.fillStyle = "#000";
          ctx.fillText(player.username, px + TILE_SIZE / 2 + 1, py - 6);
          ctx.fillStyle = "#60a5fa";
          ctx.fillText(player.username, px + TILE_SIZE / 2, py - 7);
        }
      });

      // --- Your player sprite ---
      const px = pos.x * TILE_SIZE;
      const py = pos.y * TILE_SIZE;
      const bounce = Math.sin(t * 5) * 2.5;

      // Shadow
      ctx.fillStyle = "#00000030";
      ctx.beginPath();
      ctx.ellipse(
        px + TILE_SIZE / 2,
        py + TILE_SIZE - 6,
        12,
        5,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      // Cloak / body
      ctx.fillStyle = "#0e7490";
      ctx.fillRect(px + 10, py + 14 + bounce, 28, 26);

      // Inner robe
      ctx.fillStyle = "#06b6d4";
      ctx.fillRect(px + 14, py + 18 + bounce, 20, 18);

      // Head
      ctx.fillStyle = "#fde68a";
      ctx.fillRect(px + 15, py + 6 + bounce, 18, 16);

      // Hood
      ctx.fillStyle = "#0e7490";
      ctx.fillRect(px + 13, py + 4 + bounce, 22, 10);
      ctx.fillRect(px + 11, py + 8 + bounce, 4, 8);
      ctx.fillRect(px + 33, py + 8 + bounce, 4, 8);

      // Eyes
      ctx.fillStyle = "#000";
      ctx.fillRect(px + 18, py + 12 + bounce, 3, 3);
      ctx.fillRect(px + 27, py + 12 + bounce, 3, 3);

      // Eye glow
      ctx.fillStyle = "#4ade80";
      ctx.fillRect(px + 19, py + 13 + bounce, 1, 1);
      ctx.fillRect(px + 28, py + 13 + bounce, 1, 1);

      // Staff
      ctx.fillStyle = "#92400e";
      ctx.fillRect(px + 36, py + 8 + bounce, 3, 32);
      ctx.fillStyle = "#4ade80";
      ctx.beginPath();
      ctx.arc(px + 37, py + 6 + bounce, 5, 0, Math.PI * 2);
      ctx.fill();

      const glow = Math.sin(t * 3) * 0.4 + 0.6;
      ctx.globalAlpha = glow * 0.5;
      ctx.fillStyle = "#86efac";
      ctx.beginPath();
      ctx.arc(px + 37, py + 6 + bounce, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      // Outline
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(px + 10, py + 14 + bounce, 28, 26);
      ctx.strokeRect(px + 15, py + 6 + bounce, 18, 16);

      rafRef.current = requestAnimationFrame(draw);
    },
    [getVegForScreen, nearbyPlayers, movementPath, targetTile],
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(draw);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [draw]);

  useEffect(() => {
    function handleKeyDown(e) {
      const keys = [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "w",
        "a",
        "s",
        "d",
        "W",
        "A",
        "S",
        "D",
      ];
      if (!keys.includes(e.key)) return;
      e.preventDefault();

      // Stop auto-movement when using keyboard
      setMovementPath([]);
      setTargetTile(null);

      const pos = playerPosRef.current;
      const screen = currentScreenRef.current;
      let nx = pos.x,
        ny = pos.y;
      let newScreenX = screen.x;
      let newScreenY = screen.y;

      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        if (pos.y === 0) {
          if (screen.y > 0) {
            newScreenY = screen.y - 1;
            ny = VIEWPORT_HEIGHT - 1;
          }
        } else {
          ny = pos.y - 1;
        }
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        if (pos.y === VIEWPORT_HEIGHT - 1) {
          if (screen.y < WORLD_SCREENS_Y - 1) {
            newScreenY = screen.y + 1;
            ny = 0;
          }
        } else {
          ny = pos.y + 1;
        }
      }
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        if (pos.x === 0) {
          if (screen.x > 0) {
            newScreenX = screen.x - 1;
            nx = VIEWPORT_WIDTH - 1;
          }
        } else {
          nx = pos.x - 1;
        }
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        if (pos.x === VIEWPORT_WIDTH - 1) {
          if (screen.x < WORLD_SCREENS_X - 1) {
            newScreenX = screen.x + 1;
            nx = 0;
          }
        } else {
          nx = pos.x + 1;
        }
      }

      if (
        nx !== pos.x ||
        ny !== pos.y ||
        newScreenX !== screen.x ||
        newScreenY !== screen.y
      ) {
        playerPosRef.current = { x: nx, y: ny };
        currentScreenRef.current = { x: newScreenX, y: newScreenY };
        setPlayerPos({ x: nx, y: ny });
        setCurrentScreen({ x: newScreenX, y: newScreenY });

        const worldX = newScreenX * VIEWPORT_WIDTH + nx;
        const worldY = newScreenY * VIEWPORT_HEIGHT + ny;
        setBiomeName(getBiome(worldX).name);
        onPlayerMove({ x: worldX, y: worldY });

        if (Math.random() < 0.15) {
          const count = Math.floor(Math.random() * 2) + 1;
          fetch(`/api/game/encounter?count=${count}`)
            .then((res) => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then((data) => {
              if (data.sprouts) onEncounter(data.sprouts);
            })
            .catch((err) => console.error("Encounter error:", err));
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onEncounter, onPlayerMove, getVegForScreen]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      <div className="border-4 border-black p-1 bg-black">
        <canvas
          ref={canvasRef}
          width={VIEWPORT_WIDTH * TILE_SIZE}
          height={VIEWPORT_HEIGHT * TILE_SIZE}
          style={{
            imageRendering: "pixelated",
            display: "block",
            cursor: "pointer",
          }}
          onClick={handleCanvasClick}
        />
      </div>
      <div className="flex items-center gap-6 flex-wrap">
        <p className="text-xs tracking-widest uppercase text-neutral-500 font-mono">
          Click to Move / WASD / Arrow Keys
        </p>
        <p className="text-xs tracking-widest uppercase font-mono font-bold border border-black px-3 py-1">
          {biomeName}
        </p>
        <p className="text-xs tracking-widest uppercase text-neutral-400 font-mono">
          Screen [{currentScreen.x},{currentScreen.y}]
        </p>
      </div>
    </div>
  );
}
