"use client";

import { useRef, useEffect } from "react";
import MiniMap from "./MiniMap";

const ELEMENT_COLORS = {
  Solar: "#fbbf24",
  Fungal: "#4ade80",
  Aquatic: "#22d3ee",
  Mineral: "#a78bfa",
  Data: "#38bdf8",
};

function MiniBar({ value, max, color = "#000" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="h-2 border border-neutral-300 bg-neutral-100 rounded-sm overflow-hidden">
      <div
        className="h-full transition-all duration-300 rounded-sm"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}

export default function GameHUD({
  playerData,
  gameState,
  partySprouts = [],
  systemLog = [],
  currentScreen = { x: 0, y: 0 },
  nearbyPlayers = [],
  onOpenSprouts,
  onOpenInventory,
  onOpenMultiplayer,
}) {
  const logRef = useRef(null);

  // Auto-scroll to bottom when log updates
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [systemLog]);

  const hpPercent = (playerData.hp / playerData.max_hp) * 100;
  const xpToNextLevel = playerData.level * 100;
  const xpInLevel = playerData.xp % xpToNextLevel;
  const xpPercent = (xpInLevel / xpToNextLevel) * 100;
  const hpColor =
    hpPercent > 50 ? "#16a34a" : hpPercent > 25 ? "#d97706" : "#dc2626";

  return (
    <div className="h-full flex flex-col">
      {/* Mini-Map - Sticky at top */}
      <section className="sticky top-0 z-10 bg-white border-b-2 border-black p-4">
        <MiniMap
          currentScreen={currentScreen}
          playerWorldPos={{
            x: playerData.position_x,
            y: playerData.position_y,
          }}
          nearbyPlayers={nearbyPlayers}
        />
      </section>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto divide-y-2 divide-black">
        {/* Player stats */}
        <section className="p-4 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-playfair text-xl font-bold tracking-tight truncate">
              {playerData.username}
            </h3>
            <span className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500 shrink-0 ml-2">
              LVL {playerData.level}
            </span>
          </div>

          {/* HP */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500">
                HP
              </span>
              <span className="font-jetbrains text-[10px]">
                {playerData.hp}/{playerData.max_hp}
              </span>
            </div>
            <MiniBar
              value={playerData.hp}
              max={playerData.max_hp}
              color={hpColor}
            />
          </div>

          {/* MP */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500">
                MP
              </span>
              <span className="font-jetbrains text-[10px]">
                {playerData.mp || 0}/{playerData.max_mp || 50}
              </span>
            </div>
            <MiniBar
              value={playerData.mp || 0}
              max={playerData.max_mp || 50}
              color="#6366f1"
            />
          </div>

          {/* XP */}
          <div>
            <div className="flex justify-between mb-1">
              <span className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500">
                XP → LV{playerData.level + 1}
              </span>
              <span className="font-jetbrains text-[10px]">
                {xpInLevel}/{xpToNextLevel}
              </span>
            </div>
            <MiniBar value={xpInLevel} max={xpToNextLevel} color="#000" />
          </div>

          {/* Combat stats */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              { label: "ATK", val: playerData.attack },
              { label: "DEF", val: playerData.defense },
              {
                label: "POS",
                val: `${playerData.position_x},${playerData.position_y}`,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center border border-neutral-200 py-1"
              >
                <p className="font-jetbrains text-[8px] tracking-widest uppercase text-neutral-400">
                  {s.label}
                </p>
                <p className="font-jetbrains text-sm font-bold">{s.val}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Active Party */}
        <section className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500">
              Active Party
            </h3>
            <button
              onClick={onOpenSprouts}
              className="font-jetbrains text-[9px] tracking-widest uppercase border border-black px-2 py-0.5 hover:bg-black hover:text-white transition-none"
            >
              MANAGE
            </button>
          </div>

          {partySprouts.length === 0 ? (
            <button
              onClick={onOpenSprouts}
              className="w-full border-2 border-dashed border-neutral-300 py-3 text-center hover:border-black transition-colors"
            >
              <p className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-400">
                No party members
              </p>
              <p className="font-jetbrains text-[9px] text-neutral-300 mt-0.5">
                Capture Sprouts to add them
              </p>
            </button>
          ) : (
            <div className="space-y-2">
              {partySprouts.map((s) => {
                const elColor = ELEMENT_COLORS[s.element] || "#fff";
                const hpPct = (s.current_hp / s.max_hp) * 100;
                const xpToNextLevel = s.level * 80;
                const currentXP = s.xp || 0;
                return (
                  <div
                    key={s.id}
                    className="border border-neutral-200 p-2 flex items-center gap-2"
                  >
                    <span className="font-jetbrains text-[10px] font-bold text-neutral-400 w-4 shrink-0">
                      {s.party_slot}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-jetbrains text-xs font-bold truncate">
                          {s.nickname || s.name}
                        </p>
                        <span className="font-jetbrains text-[9px] text-neutral-400 shrink-0 ml-1">
                          Lv{s.level}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className="font-jetbrains text-[8px]"
                          style={{ color: elColor }}
                        >
                          {s.element}
                        </span>
                        <div className="flex-1 h-1.5 bg-neutral-100 rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm"
                            style={{
                              width: `${hpPct}%`,
                              backgroundColor: hpPct > 50 ? elColor : "#dc2626",
                            }}
                          />
                        </div>
                        <span className="font-jetbrains text-[9px] text-neutral-400 shrink-0">
                          {s.current_hp}HP
                        </span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="font-jetbrains text-[8px] text-neutral-500">
                          XP
                        </span>
                        <div className="flex-1 h-1 bg-neutral-100 rounded-sm overflow-hidden">
                          <div
                            className="h-full rounded-sm bg-black"
                            style={{
                              width: `${(currentXP / xpToNextLevel) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="font-jetbrains text-[8px] text-neutral-500 shrink-0">
                          {currentXP}/{xpToNextLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
              {partySprouts.length < 3 && (
                <button
                  onClick={onOpenSprouts}
                  className="w-full border border-dashed border-neutral-200 py-1.5 font-jetbrains text-[9px] tracking-widest uppercase text-neutral-300 hover:border-neutral-400 hover:text-neutral-500 transition-colors"
                >
                  + Add Slot {partySprouts.length + 1}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Pack Button - Resources moved to inventory */}
        <section className="p-4">
          <button
            onClick={onOpenInventory}
            disabled={gameState === "combat"}
            className={`w-full font-jetbrains text-sm tracking-widest uppercase py-4 transition-none flex items-center justify-center gap-2 ${
              gameState === "combat"
                ? "bg-neutral-300 text-neutral-500 cursor-not-allowed"
                : "bg-black text-white hover:bg-neutral-800"
            }`}
          >
            🎒 OPEN PACK
          </button>
          <p className="font-jetbrains text-[9px] text-neutral-400 text-center mt-2">
            {gameState === "combat"
              ? "Cannot access pack during combat"
              : "Resources, items, and healing"}
          </p>
        </section>

        {/* Multiplayer Button */}
        <section className="p-4">
          <button
            onClick={onOpenMultiplayer}
            className="w-full bg-white text-black font-jetbrains text-sm tracking-widest uppercase py-4 hover:bg-neutral-200 transition-none flex items-center justify-center gap-2"
          >
            ⚔️ MULTIPLAYER
          </button>
          <p className="font-jetbrains text-[9px] text-neutral-400 text-center mt-2">
            Battles, parties, and co-op
          </p>
        </section>

        {/* System Log */}
        <section className="p-4 bg-neutral-50">
          <h3 className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500 mb-3">
            System Log
          </h3>
          <div
            ref={logRef}
            className="font-jetbrains text-[10px] space-y-1.5 text-neutral-600 max-h-60 overflow-y-auto"
          >
            {systemLog.length === 0 ? (
              <>
                <p>› Exploring the Reclaimed Wilds</p>
                <p>› Move: Click to move or WASD</p>
                <p>› Wild Sprouts may appear...</p>
                <p>› Party members fight alongside you</p>
                <p>› Use Pack for healing and items</p>
              </>
            ) : (
              systemLog.map((entry, i) => (
                <p key={i} className="leading-relaxed">
                  <span className="text-neutral-400 mr-1.5">
                    {entry.timestamp}
                  </span>
                  <span>{entry.message}</span>
                </p>
              ))
            )}
          </div>
        </section>

        {/* Profile link */}
        <div className="p-3 flex gap-2 border-t-2 border-black bg-white">
          <a
            href="/credits"
            className="flex-1 text-center font-jetbrains text-[10px] tracking-widest uppercase border border-black py-2 hover:bg-black hover:text-white transition-none"
          >
            CREDITS
          </a>
          <a
            href="/account/profile"
            className="flex-1 text-center font-jetbrains text-[10px] tracking-widest uppercase border border-black py-2 hover:bg-black hover:text-white transition-none"
          >
            PROFILE
          </a>
          <a
            href="/account/logout"
            className="flex-1 text-center font-jetbrains text-[10px] tracking-widest uppercase border border-neutral-300 py-2 text-neutral-400 hover:border-black hover:text-black transition-none"
          >
            SIGN OUT
          </a>
        </div>
      </div>
    </div>
  );
}
