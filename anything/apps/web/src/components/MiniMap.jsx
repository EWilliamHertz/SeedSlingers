"use client";

import { useRef, useEffect } from "react";

const WORLD_SCREENS_X = 2;
const WORLD_SCREENS_Y = 2;
const MINIMAP_SIZE = 160;

export default function MiniMap({
  currentScreen,
  playerWorldPos,
  nearbyPlayers = [],
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const cellSize = MINIMAP_SIZE / (WORLD_SCREENS_X * 2);

    // Clear
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, MINIMAP_SIZE, MINIMAP_SIZE);

    // Draw grid (screens)
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 1;
    for (let y = 0; y <= WORLD_SCREENS_Y; y++) {
      for (let x = 0; x <= WORLD_SCREENS_X; x++) {
        const sx = x * (MINIMAP_SIZE / WORLD_SCREENS_X);
        const sy = y * (MINIMAP_SIZE / WORLD_SCREENS_Y);
        ctx.strokeRect(
          sx,
          sy,
          MINIMAP_SIZE / WORLD_SCREENS_X,
          MINIMAP_SIZE / WORLD_SCREENS_Y,
        );
      }
    }

    // Highlight current screen
    const screenPixelWidth = MINIMAP_SIZE / WORLD_SCREENS_X;
    const screenPixelHeight = MINIMAP_SIZE / WORLD_SCREENS_Y;
    ctx.fillStyle = "#16a34a30";
    ctx.fillRect(
      currentScreen.x * screenPixelWidth,
      currentScreen.y * screenPixelHeight,
      screenPixelWidth,
      screenPixelHeight,
    );
    ctx.strokeStyle = "#16a34a";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      currentScreen.x * screenPixelWidth,
      currentScreen.y * screenPixelHeight,
      screenPixelWidth,
      screenPixelHeight,
    );

    // Draw nearby players
    nearbyPlayers.forEach((player) => {
      const px = (player.x / (WORLD_SCREENS_X * 16)) * MINIMAP_SIZE;
      const py = (player.y / (WORLD_SCREENS_Y * 12)) * MINIMAP_SIZE;

      ctx.fillStyle = "#3b82f6";
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    // Draw player position
    const playerX = (playerWorldPos.x / (WORLD_SCREENS_X * 16)) * MINIMAP_SIZE;
    const playerY = (playerWorldPos.y / (WORLD_SCREENS_Y * 12)) * MINIMAP_SIZE;

    // Player dot with pulse
    ctx.fillStyle = "#4ade80";
    ctx.beginPath();
    ctx.arc(playerX, playerY, 4, 0, Math.PI * 2);
    ctx.fill();

    // Player outline
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }, [currentScreen, playerWorldPos, nearbyPlayers]);

  return (
    <div className="border-2 border-black bg-black p-2">
      <div className="mb-1">
        <p className="font-jetbrains text-[9px] tracking-widest uppercase text-neutral-500">
          Mini-Map
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={MINIMAP_SIZE}
        height={MINIMAP_SIZE}
        style={{ imageRendering: "pixelated", display: "block" }}
      />
      <div className="mt-2 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 border border-black"></div>
          <span className="font-jetbrains text-[8px] text-neutral-500">
            YOU
          </span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-blue-400 border border-black"></div>
          <span className="font-jetbrains text-[8px] text-neutral-500">
            PLAYERS
          </span>
        </div>
      </div>
    </div>
  );
}
