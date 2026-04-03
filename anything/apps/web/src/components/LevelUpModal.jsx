"use client";
import { useEffect, useRef, useState } from "react";

export default function LevelUpModal({ levelUpData, onClose }) {
  const [step, setStep] = useState(0);
  const [showing, setShowing] = useState(false);
  const [statChoice, setStatChoice] = useState(null); // For Diablo 2 style choices
  const [abilityChoice, setAbilityChoice] = useState(null);
  const canvasRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setShowing(true), 50);
  }, []);

  // Particle burst on the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    const particles = Array.from({ length: 80 }, () => ({
      x: cx,
      y: cy,
      vx: (Math.random() - 0.5) * 8,
      vy: (Math.random() - 0.5) * 8,
      alpha: 1,
      r: Math.random() * 3 + 1,
      color: ["#ffffff", "#fbbf24", "#4ade80", "#22d3ee"][
        Math.floor(Math.random() * 4)
      ],
    }));

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15;
        p.alpha -= 0.018;
        if (p.alpha <= 0) return;
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      if (particles.some((p) => p.alpha > 0)) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const current = levelUpData[step];
  const isLast = step === levelUpData.length - 1;

  const handleNext = async () => {
    // Save choices if any
    if (statChoice || abilityChoice) {
      try {
        await fetch("/api/game/player", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            level_up_choices: {
              stat_bonus: statChoice,
              ability_unlock: abilityChoice,
            },
          }),
        });
      } catch (err) {
        console.error("Failed to save level-up choices:", err);
      }
    }

    if (isLast) onClose();
    else {
      setStep((s) => s + 1);
      setStatChoice(null);
      setAbilityChoice(null);
    }
  };

  const statOptions = [
    {
      key: "hp",
      label: "Vitality",
      desc: "+15 Max HP",
      icon: "❤️",
      color: "#ef4444",
    },
    {
      key: "attack",
      label: "Strength",
      desc: "+3 Attack",
      icon: "⚔️",
      color: "#f59e0b",
    },
    {
      key: "defense",
      label: "Fortitude",
      desc: "+3 Defense",
      icon: "🛡️",
      color: "#3b82f6",
    },
    {
      key: "mp",
      label: "Energy",
      desc: "+10 Max MP",
      icon: "✨",
      color: "#a78bfa",
    },
  ];

  const abilityOptions = [
    {
      key: "lifesteal",
      label: "Life Steal",
      desc: "Attacks restore 10% HP",
      icon: "🩸",
    },
    {
      key: "double_strike",
      label: "Double Strike",
      desc: "20% chance to attack twice",
      icon: "⚡",
    },
    {
      key: "barrier",
      label: "Barrier",
      desc: "Block 50% damage once per combat",
      icon: "🛡️",
    },
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${showing ? "opacity-100" : "opacity-0"}`}
      style={{ background: "rgba(0,0,0,0.92)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;} @keyframes lvlpulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}} .lvl-pulse{animation:lvlpulse 1.2s ease-in-out infinite;}`}</style>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      <div
        className={`relative z-10 border-2 border-white bg-black max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto transition-all duration-500 ${showing ? "scale-100" : "scale-90"}`}
      >
        {/* Gold header */}
        <div className="bg-white px-6 py-5 text-center">
          <p className="font-jetbrains text-[10px] tracking-[0.5em] uppercase text-black/60">
            Achievement Unlocked
          </p>
          <h2 className="font-playfair text-4xl font-black text-black tracking-tighter lvl-pulse">
            LEVEL UP!
          </h2>
        </div>

        <div className="p-8 text-center">
          <div className="mb-6">
            <p className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400 mb-1">
              New Level
            </p>
            <p className="font-playfair text-8xl font-black text-white">
              {current.level}
            </p>
          </div>

          <div className="border border-neutral-800 p-4 mb-6 text-left space-y-2">
            <p className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500 mb-3">
              Stat Gains
            </p>
            {[
              {
                label: "Max HP",
                val: `+${current.gains.max_hp}`,
                color: "#4ade80",
              },
              {
                label: "Attack",
                val: `+${current.gains.attack}`,
                color: "#fbbf24",
              },
              {
                label: "Defense",
                val: `+${current.gains.defense}`,
                color: "#60a5fa",
              },
              {
                label: "Max MP",
                val: `+${current.gains.max_mp}`,
                color: "#a78bfa",
              },
            ].map((g) => (
              <div key={g.label} className="flex justify-between items-center">
                <span className="font-jetbrains text-xs text-neutral-400 uppercase tracking-wider">
                  {g.label}
                </span>
                <span
                  className="font-jetbrains text-sm font-bold"
                  style={{ color: g.color }}
                >
                  {g.val}
                </span>
              </div>
            ))}
          </div>

          {/* Stat Choice (Diablo 2 style) */}
          <div className="border border-yellow-900 bg-yellow-950 p-4 mb-4">
            <p className="font-jetbrains text-xs tracking-widest uppercase text-yellow-500 mb-3 text-left">
              ⚡ Choose Bonus Stat
            </p>
            <div className="grid grid-cols-2 gap-2">
              {statOptions.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => setStatChoice(opt.key)}
                  className={`border-2 p-3 text-left transition-all ${statChoice === opt.key ? "border-yellow-400 bg-yellow-900" : "border-neutral-700 hover:border-yellow-600"}`}
                >
                  <div className="text-2xl mb-1">{opt.icon}</div>
                  <p className="font-jetbrains text-xs font-bold text-white">
                    {opt.label}
                  </p>
                  <p className="font-jetbrains text-[10px] text-neutral-400">
                    {opt.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Ability Choice (every 3 levels) */}
          {current.level % 3 === 0 && (
            <div className="border border-purple-900 bg-purple-950 p-4 mb-4">
              <p className="font-jetbrains text-xs tracking-widest uppercase text-purple-500 mb-3 text-left">
                🔮 Unlock New Ability
              </p>
              <div className="space-y-2">
                {abilityOptions.map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => setAbilityChoice(opt.key)}
                    className={`w-full border-2 p-3 text-left transition-all flex items-center gap-3 ${abilityChoice === opt.key ? "border-purple-400 bg-purple-900" : "border-neutral-700 hover:border-purple-600"}`}
                  >
                    <div className="text-2xl">{opt.icon}</div>
                    <div className="flex-1">
                      <p className="font-jetbrains text-xs font-bold text-white">
                        {opt.label}
                      </p>
                      <p className="font-jetbrains text-[10px] text-neutral-400">
                        {opt.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleNext}
            disabled={
              !statChoice || (current.level % 3 === 0 && !abilityChoice)
            }
            className="w-full bg-white text-black font-jetbrains text-sm tracking-widest uppercase py-4 hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLast ? "CONTINUE →" : `NEXT (${step + 1}/${levelUpData.length})`}
          </button>
          {(!statChoice || (current.level % 3 === 0 && !abilityChoice)) && (
            <p className="font-jetbrains text-[9px] text-neutral-600 mt-2">
              Make your choices to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
