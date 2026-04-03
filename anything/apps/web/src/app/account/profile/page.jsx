"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

const ELEMENT_COLORS = {
  Solar: "#fbbf24",
  Fungal: "#4ade80",
  Aquatic: "#22d3ee",
  Mineral: "#a78bfa",
  Data: "#38bdf8",
};
const RARITY_COLORS = {
  Common: "#9ca3af",
  Uncommon: "#4ade80",
  Rare: "#60a5fa",
  Legendary: "#f59e0b",
};

export default function ProfilePage() {
  const { data: user, loading } = useUser();
  const [player, setPlayer] = useState(null);
  const [sprouts, setSprouts] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [tab, setTab] = useState("stats");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && !user) window.location.href = "/account/signin";
  }, [user, loading]);

  useEffect(() => {
    if (user) {
      fetchAll();
    }
  }, [user]);

  const fetchAll = async () => {
    try {
      const [pRes, sRes, iRes] = await Promise.all([
        fetch("/api/game/player"),
        fetch("/api/game/sprouts"),
        fetch("/api/game/inventory"),
      ]);
      if (pRes.ok) {
        const d = await pRes.json();
        setPlayer(d.player);
      }
      if (sRes.ok) {
        const d = await sRes.json();
        setSprouts(d.sprouts || []);
      }
      if (iRes.ok) {
        const d = await iRes.json();
        setInventory(d.inventory || []);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load profile data");
    }
  };

  if (loading || !player) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'); .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>
        <p className="font-jetbrains text-white text-xs tracking-widest">
          LOADING PROFILE...
        </p>
      </div>
    );
  }

  const xpToNext = player.level * 100;
  const xpPct = Math.min(100, ((player.xp % xpToNext) / xpToNext) * 100);
  const hpPct = (player.hp / player.max_hp) * 100;
  const partySprouts = sprouts.filter((s) => s.party_slot);

  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      {/* Header */}
      <header className="border-b-2 border-white p-4 flex items-center justify-between">
        <h1 className="font-playfair text-3xl font-bold tracking-tighter">
          PROFILE
        </h1>
        <div className="flex gap-3">
          <a
            href="/game"
            className="font-jetbrains text-xs tracking-widest uppercase border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
          >
            ▶ GAME
          </a>
          <a
            href="/account/logout"
            className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-4 py-2 text-neutral-400 hover:border-white hover:text-white transition-colors"
          >
            SIGN OUT
          </a>
        </div>
      </header>

      <div className="max-w-4xl mx-auto p-6">
        {/* Player Card */}
        <div className="border-2 border-white p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 border-2 border-white flex items-center justify-center text-4xl bg-neutral-900 shrink-0">
              🌿
            </div>
            <div className="flex-1">
              <h2 className="font-playfair text-4xl font-bold tracking-tighter">
                {player.username}
              </h2>
              <p className="font-jetbrains text-xs text-neutral-400 mt-1 tracking-widest">
                LVL {player.level} SEED-SLINGER
              </p>

              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: "HP", val: `${player.hp}/${player.max_hp}` },
                  { label: "Attack", val: player.attack },
                  { label: "Defense", val: player.defense },
                  { label: "Sprouts", val: sprouts.length },
                ].map((s) => (
                  <div
                    key={s.label}
                    className="border border-neutral-800 p-2 text-center"
                  >
                    <p className="font-jetbrains text-[10px] tracking-widest text-neutral-500 uppercase">
                      {s.label}
                    </p>
                    <p className="font-playfair text-xl font-bold">{s.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* XP Bar */}
          <div className="mt-4">
            <div className="flex justify-between mb-1">
              <span className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-400">
                XP to Level {player.level + 1}
              </span>
              <span className="font-jetbrains text-[10px] text-neutral-400">
                {player.xp % xpToNext}/{xpToNext}
              </span>
            </div>
            <div className="h-3 border border-neutral-700 bg-neutral-900">
              <div
                className="h-full bg-white transition-all"
                style={{ width: `${xpPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-white mb-6 flex">
          {["stats", "sprouts", "inventory", "party"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`font-jetbrains text-xs tracking-widest uppercase px-5 py-3 border-r border-neutral-800 transition-colors ${tab === t ? "bg-white text-black" : "text-neutral-400 hover:text-white"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {tab === "stats" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-neutral-800 p-4 space-y-3">
              <h3 className="font-playfair text-xl font-bold">Combat Stats</h3>
              {[
                {
                  label: "HP",
                  val: `${player.hp} / ${player.max_hp}`,
                  bar: hpPct,
                },
                { label: "Attack", val: player.attack },
                { label: "Defense", val: player.defense },
                { label: "MP", val: `${player.mp || 0} / ${player.max_mp}` },
              ].map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between mb-0.5">
                    <span className="font-jetbrains text-xs tracking-widest text-neutral-400 uppercase">
                      {s.label}
                    </span>
                    <span className="font-jetbrains text-sm font-bold">
                      {s.val}
                    </span>
                  </div>
                  {s.bar !== undefined && (
                    <div className="h-1.5 bg-neutral-800">
                      <div
                        className="h-full bg-white"
                        style={{ width: `${s.bar}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="border border-neutral-800 p-4 space-y-3">
              <h3 className="font-playfair text-xl font-bold">Resources</h3>
              {[
                { label: "Data-Seeds", val: player.data_seeds, icon: "🌱" },
                { label: "Scrap Metal", val: player.scrap_metal, icon: "⚙️" },
                { label: "Bio-Resin", val: player.bio_resin, icon: "🧪" },
              ].map((r) => (
                <div
                  key={r.label}
                  className="flex items-center justify-between border border-neutral-800 px-4 py-3"
                >
                  <div className="flex items-center gap-2">
                    <span>{r.icon}</span>
                    <span className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400">
                      {r.label}
                    </span>
                  </div>
                  <span className="font-playfair text-xl font-bold">
                    {r.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sprouts Tab */}
        {tab === "sprouts" && (
          <div>
            <p className="font-jetbrains text-xs text-neutral-500 mb-4">
              {sprouts.length} Sprouts captured
            </p>
            {sprouts.length === 0 ? (
              <div className="border border-neutral-800 p-12 text-center">
                <p className="font-jetbrains text-sm text-neutral-500">
                  No Sprouts yet. Go explore!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sprouts.map((s) => (
                  <div key={s.id} className="border border-neutral-800 p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-playfair text-lg font-bold">
                          {s.nickname || s.name}
                        </p>
                        {s.nickname && (
                          <p className="font-jetbrains text-[10px] text-neutral-500">
                            {s.name}
                          </p>
                        )}
                        <div className="flex gap-2 mt-1">
                          <span
                            className="font-jetbrains text-[10px] px-2 py-0.5 border"
                            style={{
                              borderColor: ELEMENT_COLORS[s.element],
                              color: ELEMENT_COLORS[s.element],
                            }}
                          >
                            {s.element}
                          </span>
                          <span
                            className="font-jetbrains text-[10px] px-2 py-0.5 border"
                            style={{
                              borderColor: RARITY_COLORS[s.rarity],
                              color: RARITY_COLORS[s.rarity],
                            }}
                          >
                            {s.rarity}
                          </span>
                          {s.party_slot && (
                            <span className="font-jetbrains text-[10px] px-2 py-0.5 border border-white text-white">
                              PARTY {s.party_slot}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-jetbrains text-[10px] text-neutral-400">
                          LVL {s.level}
                        </p>
                        <p className="font-jetbrains text-sm font-bold">
                          {s.current_hp}/{s.max_hp} HP
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 h-1.5 bg-neutral-800">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${(s.current_hp / s.max_hp) * 100}%`,
                          backgroundColor: ELEMENT_COLORS[s.element],
                        }}
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-neutral-500 font-jetbrains text-[10px]">
                      <span>ATK {s.attack}</span>
                      <span>SPD {s.speed}</span>
                      <span>DEF {s.defense}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Inventory Tab */}
        {tab === "inventory" && (
          <div>
            <p className="font-jetbrains text-xs text-neutral-500 mb-4">
              {inventory.length} item types in pack
            </p>
            {inventory.length === 0 ? (
              <div className="border border-neutral-800 p-12 text-center">
                <p className="font-jetbrains text-sm text-neutral-500">
                  Your pack is empty.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="border border-neutral-800 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-jetbrains text-sm font-bold">
                        {item.item_name}
                      </p>
                      <p className="font-jetbrains text-[10px] text-neutral-500 uppercase tracking-widest">
                        {item.item_type}
                      </p>
                    </div>
                    <p className="font-playfair text-2xl font-bold">
                      ×{item.quantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Party Tab */}
        {tab === "party" && (
          <div>
            <p className="font-jetbrains text-xs text-neutral-500 mb-4">
              Manage up to 3 Sprouts. Go to the game to set your party.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((slot) => {
                const sprout = sprouts.find((s) => s.party_slot === slot);
                return (
                  <div
                    key={slot}
                    className={`border-2 p-4 min-h-[160px] flex flex-col ${sprout ? "border-white" : "border-neutral-800"}`}
                  >
                    <p className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500 mb-3">
                      Slot {slot}
                    </p>
                    {sprout ? (
                      <>
                        <p className="font-playfair text-xl font-bold">
                          {sprout.nickname || sprout.name}
                        </p>
                        <span
                          className="font-jetbrains text-[10px] mt-1"
                          style={{ color: ELEMENT_COLORS[sprout.element] }}
                        >
                          {sprout.element}
                        </span>
                        <div className="mt-auto pt-3 border-t border-neutral-800">
                          <p className="font-jetbrains text-xs">
                            LVL {sprout.level} · {sprout.current_hp}/
                            {sprout.max_hp} HP
                          </p>
                          <p className="font-jetbrains text-[10px] text-neutral-500">
                            ATK {sprout.attack} · SPD {sprout.speed}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="font-jetbrains text-xs text-neutral-700">
                          — EMPTY —
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="font-jetbrains text-xs text-neutral-600 mt-4">
              Open your Sprout Collection in-game (⚔ PARTY button) to assign
              Sprouts to slots.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
