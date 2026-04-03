"use client";
import { useState, useEffect, useRef } from "react";

const ELEMENT_COLORS = {
  Solar: { color: "#fbbf24", bg: "#451a03" },
  Fungal: { color: "#4ade80", bg: "#052e16" },
  Aquatic: { color: "#22d3ee", bg: "#083344" },
  Mineral: { color: "#a78bfa", bg: "#2e1065" },
  Data: { color: "#38bdf8", bg: "#082f49" },
};
const RARITY_COLORS = {
  Common: "#9ca3af",
  Uncommon: "#4ade80",
  Rare: "#60a5fa",
  Legendary: "#f59e0b",
};

function MiniSprite({ element, size = 60 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const colors = {
      Solar: {
        body: "#fbbf24",
        accent: "#f59e0b",
        glow: "#fde68a",
        eye: "#92400e",
      },
      Fungal: {
        body: "#4ade80",
        accent: "#16a34a",
        glow: "#86efac",
        eye: "#14532d",
      },
      Aquatic: {
        body: "#22d3ee",
        accent: "#0891b2",
        glow: "#67e8f9",
        eye: "#164e63",
      },
      Mineral: {
        body: "#a78bfa",
        accent: "#7c3aed",
        glow: "#c4b5fd",
        eye: "#4c1d95",
      },
      Data: {
        body: "#38bdf8",
        accent: "#0284c7",
        glow: "#7dd3fc",
        eye: "#0c4a6e",
      },
    };
    const c = colors[element] || colors.Data;
    const draw = (t) => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2,
        cy = size / 2;
      const bob = Math.sin(t * 3) * 2;
      const pulse = Math.sin(t * 4) * 0.1 + 0.9;
      const grad = ctx.createRadialGradient(
        cx,
        cy + bob,
        2,
        cx,
        cy + bob,
        size * 0.45,
      );
      grad.addColorStop(0, c.glow + "50");
      grad.addColorStop(1, c.glow + "00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, size * 0.45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.body;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, size * 0.28 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.accent;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, size * 0.18 * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c.eye;
      ctx.beginPath();
      ctx.arc(
        cx - size * 0.09,
        cy - size * 0.04 + bob,
        size * 0.05,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        cx + size * 0.09,
        cy - size * 0.04 + bob,
        size * 0.05,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(
        cx - size * 0.08,
        cy - size * 0.06 + bob,
        size * 0.02,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        cx + size * 0.1,
        cy - size * 0.06 + bob,
        size * 0.02,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, size * 0.28 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    };
    const loop = () => {
      tRef.current += 0.016;
      draw(tRef.current);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [element, size]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function SproutCollection({ onClose, onPartyChange }) {
  const [sprouts, setSprouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState("All");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSprouts();
  }, []);

  const fetchSprouts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/sprouts");
      if (res.ok) {
        const data = await res.json();
        setSprouts(data.sprouts || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const setPartySlot = async (sproutId, slot) => {
    setSaving(true);
    try {
      const res = await fetch("/api/game/sprouts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "set_party",
          sprout_id: sproutId,
          party_slot: slot,
        }),
      });
      if (res.ok) {
        await fetchSprouts();
        setMessage(
          slot
            ? `Sprout added to party slot ${slot}!`
            : "Sprout removed from party.",
        );
        setTimeout(() => setMessage(null), 2500);
        if (onPartyChange) onPartyChange();
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const elements = ["All", "Solar", "Fungal", "Aquatic", "Mineral", "Data"];
  const filtered =
    filter === "All" ? sprouts : sprouts.filter((s) => s.element === filter);
  const partySprouts = sprouts.filter((s) => s.party_slot);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      <div className="bg-black border-2 border-white w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-playfair text-3xl font-bold tracking-tighter text-white">
              Sprout Roster
            </h2>
            <p className="font-jetbrains text-xs text-neutral-400">
              {sprouts.length} captured · {partySprouts.length}/3 in party
            </p>
            <p className="font-jetbrains text-[9px] text-neutral-600 mt-0.5">
              Unlimited storage • Only 3 can fight in your active party
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-4 py-2 text-neutral-400 hover:border-white hover:text-white transition-colors"
          >
            CLOSE ✕
          </button>
        </div>

        {/* Party slots strip */}
        <div className="border-b border-neutral-800 px-6 py-3 flex gap-3 shrink-0 overflow-x-auto">
          <span className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500 flex items-center mr-2">
            PARTY:
          </span>
          {[1, 2, 3].map((slot) => {
            const sprout = partySprouts.find((s) => s.party_slot === slot);
            const el = sprout ? ELEMENT_COLORS[sprout.element] : null;
            return (
              <div
                key={slot}
                className={`flex items-center gap-2 border px-3 py-1.5 shrink-0 ${sprout ? "border-white" : "border-neutral-800"}`}
              >
                <span className="font-jetbrains text-[10px] text-neutral-500">
                  {slot}.
                </span>
                {sprout ? (
                  <span
                    className="font-jetbrains text-xs text-white"
                    style={{ color: el?.color }}
                  >
                    {sprout.nickname || sprout.name}
                  </span>
                ) : (
                  <span className="font-jetbrains text-[10px] text-neutral-700">
                    EMPTY
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="border-b border-neutral-900 px-6 flex gap-0 shrink-0 overflow-x-auto">
          {elements.map((el) => (
            <button
              key={el}
              onClick={() => setFilter(el)}
              className={`font-jetbrains text-[10px] tracking-widest uppercase px-4 py-2.5 whitespace-nowrap border-r border-neutral-900 transition-colors ${filter === el ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
            >
              {el}
            </button>
          ))}
        </div>

        {/* Toast */}
        {message && (
          <div className="border-b border-green-900 bg-green-950 px-6 py-2 font-jetbrains text-xs text-green-400 shrink-0">
            {message}
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
            {loading ? (
              <div className="col-span-4 flex items-center justify-center h-40">
                <p className="font-jetbrains text-xs text-neutral-500">
                  LOADING...
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="col-span-4 flex items-center justify-center h-40">
                <p className="font-jetbrains text-xs text-neutral-500">
                  No Sprouts here yet.
                </p>
              </div>
            ) : (
              filtered.map((sprout) => {
                const el =
                  ELEMENT_COLORS[sprout.element] || ELEMENT_COLORS.Data;
                const isSelected = selected?.id === sprout.id;
                const isInParty = !!sprout.party_slot;
                const xpToNextLevel = sprout.level * 80;
                const currentXP = sprout.xp || 0;
                return (
                  <button
                    key={sprout.id}
                    onClick={() => setSelected(isSelected ? null : sprout)}
                    className={`border-2 p-3 flex flex-col items-center gap-1 text-left transition-all ${isSelected ? "border-white bg-neutral-900" : "border-neutral-800 hover:border-neutral-600 bg-black"}`}
                  >
                    <div className="relative">
                      <MiniSprite element={sprout.element} size={60} />
                      {isInParty && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center font-jetbrains text-[8px] text-black font-bold">
                          {sprout.party_slot}
                        </span>
                      )}
                    </div>
                    <p className="font-jetbrains text-xs text-white text-center leading-tight">
                      {sprout.nickname || sprout.name}
                    </p>
                    <div className="flex gap-1 flex-wrap justify-center">
                      <span
                        className="font-jetbrains text-[8px] px-1 border"
                        style={{ color: el.color, borderColor: el.color }}
                      >
                        {sprout.element}
                      </span>
                      <span
                        className="font-jetbrains text-[8px] px-1 border"
                        style={{
                          color: RARITY_COLORS[sprout.rarity],
                          borderColor: RARITY_COLORS[sprout.rarity],
                        }}
                      >
                        {sprout.rarity}
                      </span>
                    </div>
                    <p className="font-jetbrains text-[9px] text-neutral-500">
                      LV{sprout.level} · {sprout.current_hp}/{sprout.max_hp}HP
                    </p>
                    <p className="font-jetbrains text-[8px] text-neutral-600">
                      {currentXP}/{xpToNextLevel} XP
                    </p>
                  </button>
                );
              })
            )}
          </div>

          {/* Detail panel */}
          {selected && (
            <div className="w-64 border-l-2 border-white bg-black flex flex-col overflow-y-auto shrink-0">
              <div className="border-b border-neutral-800 p-4 text-center">
                <MiniSprite element={selected.element} size={80} />
                <h3 className="font-playfair text-xl font-bold text-white mt-2">
                  {selected.nickname || selected.name}
                </h3>
                {selected.nickname && (
                  <p className="font-jetbrains text-[10px] text-neutral-500">
                    {selected.name}
                  </p>
                )}
                <div className="flex gap-2 justify-center mt-2">
                  <span
                    className="font-jetbrains text-[10px] px-2 py-0.5 border"
                    style={{
                      color: ELEMENT_COLORS[selected.element]?.color,
                      borderColor: ELEMENT_COLORS[selected.element]?.color,
                    }}
                  >
                    {selected.element}
                  </span>
                  <span
                    className="font-jetbrains text-[10px] px-2 py-0.5 border"
                    style={{
                      color: RARITY_COLORS[selected.rarity],
                      borderColor: RARITY_COLORS[selected.rarity],
                    }}
                  >
                    {selected.rarity}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2 border-b border-neutral-800">
                <p className="font-jetbrains text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
                  Stats
                </p>
                {[
                  { label: "Level", val: selected.level },
                  {
                    label: "HP",
                    val: `${selected.current_hp}/${selected.max_hp}`,
                  },
                  { label: "Attack", val: selected.attack },
                  { label: "Speed", val: selected.speed },
                  { label: "Defense", val: selected.defense },
                ].map((s) => (
                  <div key={s.label} className="flex justify-between">
                    <span className="font-jetbrains text-[10px] text-neutral-500 uppercase">
                      {s.label}
                    </span>
                    <span className="font-jetbrains text-xs text-white font-bold">
                      {s.val}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4">
                <p className="font-jetbrains text-[10px] text-neutral-500 uppercase tracking-widest mb-2">
                  Party Slot
                </p>
                <div className="space-y-1">
                  {[1, 2, 3].map((slot) => {
                    const active = selected.party_slot === slot;
                    const occupied = sprouts.find(
                      (s) => s.party_slot === slot && s.id !== selected.id,
                    );
                    return (
                      <button
                        key={slot}
                        disabled={saving}
                        onClick={() =>
                          setPartySlot(selected.id, active ? null : slot)
                        }
                        className={`w-full text-left px-3 py-2 font-jetbrains text-xs border transition-colors disabled:opacity-40 ${active ? "bg-white text-black border-white" : "border-neutral-700 text-neutral-400 hover:border-white hover:text-white"}`}
                      >
                        {active
                          ? `▸ SLOT ${slot} (REMOVE)`
                          : `+ SLOT ${slot}${occupied ? ` (swap ${occupied.name.split(" ")[0]})` : " (empty)"}`}
                      </button>
                    );
                  })}
                  {selected.party_slot && (
                    <button
                      disabled={saving}
                      onClick={() => setPartySlot(selected.id, null)}
                      className="w-full text-left px-3 py-2 font-jetbrains text-xs border border-neutral-800 text-neutral-600 hover:border-neutral-600 hover:text-neutral-400 transition-colors disabled:opacity-40"
                    >
                      REMOVE FROM PARTY
                    </button>
                  )}
                </div>
                {selected.description && (
                  <p className="font-jetbrains text-[10px] text-neutral-600 mt-4 leading-relaxed">
                    {selected.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
