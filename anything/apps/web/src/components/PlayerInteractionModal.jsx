"use client";
import { useState } from "react";

export default function PlayerInteractionModal({
  targetPlayer,
  onClose,
  onTrade,
  onDuel,
  onFriend,
}) {
  const [showWagerInput, setShowWagerInput] = useState(false);
  const [wagerAmount, setWagerAmount] = useState(10);
  const [wagerCurrency, setWagerCurrency] = useState("scrap_metal");

  const handleDuelClick = () => {
    if (!showWagerInput) {
      setShowWagerInput(true);
    } else {
      onDuel(targetPlayer.username, wagerCurrency, wagerAmount);
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)" }}
      onClick={onClose}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      <div
        className="bg-black border-4 border-white w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-4 border-white px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="font-playfair text-2xl font-bold tracking-tighter text-white">
              {targetPlayer.username}
            </h2>
            <p className="font-jetbrains text-xs text-neutral-500">
              Level {targetPlayer.level || "?"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-4 py-2 text-neutral-400 hover:border-white hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Action buttons */}
        <div className="p-6 space-y-3">
          {/* Trade */}
          <button
            onClick={() => {
              onTrade(targetPlayer.username);
              onClose();
            }}
            className="w-full bg-emerald-900 border-2 border-emerald-500 text-emerald-300 font-jetbrains text-sm tracking-widest uppercase px-6 py-4 hover:bg-emerald-800 transition-colors flex items-center justify-between"
          >
            <span className="text-2xl">🤝</span>
            <span>Trade Items</span>
            <span className="opacity-0 text-2xl">🤝</span>
          </button>

          {/* Duel */}
          <div className="bg-red-950 border-2 border-red-600 p-4">
            {!showWagerInput ? (
              <button
                onClick={handleDuelClick}
                className="w-full bg-red-900 border-2 border-red-500 text-red-300 font-jetbrains text-sm tracking-widest uppercase px-6 py-4 hover:bg-red-800 transition-colors flex items-center justify-between"
              >
                <span className="text-2xl">⚔️</span>
                <span>Challenge to Duel</span>
                <span className="opacity-0 text-2xl">⚔️</span>
              </button>
            ) : (
              <div className="space-y-3">
                <p className="font-jetbrains text-xs text-red-400 text-center mb-3">
                  Set your wager (optional)
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setWagerCurrency("scrap_metal")}
                    className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 border ${wagerCurrency === "scrap_metal" ? "border-red-400 bg-red-900 text-red-400" : "border-neutral-700 text-neutral-500"}`}
                  >
                    Scrap
                  </button>
                  <button
                    onClick={() => setWagerCurrency("bio_resin")}
                    className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 border ${wagerCurrency === "bio_resin" ? "border-red-400 bg-red-900 text-red-400" : "border-neutral-700 text-neutral-500"}`}
                  >
                    Resin
                  </button>
                  <button
                    onClick={() => setWagerCurrency("data_seeds")}
                    className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 border ${wagerCurrency === "data_seeds" ? "border-red-400 bg-red-900 text-red-400" : "border-neutral-700 text-neutral-500"}`}
                  >
                    Seeds
                  </button>
                </div>
                <input
                  type="number"
                  value={wagerAmount}
                  onChange={(e) =>
                    setWagerAmount(Math.max(0, parseInt(e.target.value) || 0))
                  }
                  min="0"
                  className="w-full bg-black border border-red-800 px-4 py-3 font-jetbrains text-sm text-red-300 focus:border-red-500 outline-none"
                  placeholder="Wager amount..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowWagerInput(false)}
                    className="flex-1 bg-neutral-900 border border-neutral-700 text-neutral-400 font-jetbrains text-xs tracking-widest uppercase px-4 py-2 hover:bg-neutral-800 transition-colors"
                  >
                    BACK
                  </button>
                  <button
                    onClick={handleDuelClick}
                    className="flex-1 bg-red-600 border border-red-400 text-white font-jetbrains text-xs tracking-widest uppercase px-4 py-2 hover:bg-red-500 transition-colors"
                  >
                    CHALLENGE
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Add Friend */}
          <button
            onClick={() => {
              onFriend(targetPlayer.username);
              onClose();
            }}
            className="w-full bg-blue-900 border-2 border-blue-500 text-blue-300 font-jetbrains text-sm tracking-widest uppercase px-6 py-4 hover:bg-blue-800 transition-colors flex items-center justify-between"
          >
            <span className="text-2xl">👥</span>
            <span>Add Friend</span>
            <span className="opacity-0 text-2xl">👥</span>
          </button>
        </div>

        {/* Footer note */}
        <div className="border-t border-neutral-900 px-6 py-3">
          <p className="font-jetbrains text-[10px] text-neutral-700 text-center">
            Runescape-style Duel Arena • Set wagers before battling!
          </p>
        </div>
      </div>
    </div>
  );
}
