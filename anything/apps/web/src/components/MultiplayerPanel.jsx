"use client";
import { useState, useEffect } from "react";

export default function MultiplayerPanel({ onClose, playerData }) {
  const [view, setView] = useState("main"); // main | battles | party | friends | instructions
  const [battles, setBattles] = useState([]);
  const [party, setParty] = useState(null);
  const [partyMembers, setPartyMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [createBattleType, setCreateBattleType] = useState("pve_coop");
  const [joinBattleId, setJoinBattleId] = useState("");
  const [partyName, setPartyName] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");

  useEffect(() => {
    if (view === "battles") fetchBattles();
    if (view === "party") fetchParty();
  }, [view]);

  const fetchBattles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/battle/list");
      if (res.ok) {
        const data = await res.json();
        setBattles(data.battles || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchParty = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/party/members");
      if (res.ok) {
        const data = await res.json();
        setParty(data.party);
        setPartyMembers(data.members || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const createBattle = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/battle/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          battle_type: createBattleType,
          enemy_species_ids: [1, 2],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(
          `Battle lobby created! ID: ${data.battle_id.substring(0, 8)}... Share this with friends!`,
        );
        setTimeout(() => setMessage(null), 5000);
        fetchBattles();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to create battle");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const joinBattle = async (battleId) => {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/battle/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ battle_id: battleId }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Joined battle! ${data.participants.length} players ready.`);
        setTimeout(() => setMessage(null), 3000);
        fetchBattles();
      } else {
        const err = await res.json();
        console.error("Join battle error:", err);
        setMessage(err.error || "Failed to join battle");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Join battle exception:", err);
      setMessage("Network error. Please try again.");
      setTimeout(() => setMessage(null), 3000);
    }
    setLoading(false);
  };

  const createParty = async () => {
    if (!partyName.trim()) {
      setMessage("Please enter a party name");
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/party/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: partyName }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Party "${data.name}" created!`);
        setTimeout(() => setMessage(null), 2000);
        setPartyName("");
        fetchParty();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to create party");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const inviteToParty = async () => {
    if (!inviteUsername.trim()) return;

    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/party/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          party_id: party.id,
          target_username: inviteUsername,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(data.message);
        setTimeout(() => setMessage(null), 2000);
        setInviteUsername("");
        fetchParty();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to invite");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const leaveParty = async () => {
    if (!confirm("Are you sure you want to leave the party?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/party/members", {
        method: "DELETE",
      });
      if (res.ok) {
        setMessage("Left the party");
        setTimeout(() => setMessage(null), 2000);
        setParty(null);
        setPartyMembers([]);
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to leave party");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      <div className="bg-black border-2 border-white w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-playfair text-3xl font-bold tracking-tighter text-white">
              Multiplayer
            </h2>
            <p className="font-jetbrains text-xs text-neutral-400">
              Team up and battle together
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-4 py-2 text-neutral-400 hover:border-white hover:text-white transition-colors"
          >
            CLOSE ✕
          </button>
        </div>

        {/* View tabs */}
        <div className="border-b-2 border-white flex shrink-0 overflow-x-auto">
          <button
            onClick={() => setView("instructions")}
            className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-4 py-3 border-r-2 border-white ${view === "instructions" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
          >
            📖 Guide
          </button>
          <button
            onClick={() => setView("battles")}
            className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-4 py-3 border-r-2 border-white ${view === "battles" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
          >
            ⚔️ Battles
          </button>
          <button
            onClick={() => setView("party")}
            className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-4 py-3 ${view === "party" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
          >
            👥 Party
          </button>
        </div>

        {message && (
          <div className="border-b border-green-900 bg-green-950 px-6 py-2 font-jetbrains text-xs text-green-400 shrink-0">
            {message}
          </div>
        )}

        {/* Instructions View */}
        {view === "instructions" && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              {/* PvE Co-op */}
              <div className="border-2 border-green-700 p-4">
                <h3 className="font-playfair text-xl font-bold text-green-400 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🌱</span> PvE Co-op
                </h3>
                <p className="font-jetbrains text-xs text-neutral-300 mb-3">
                  Team up with other players to fight wild Sprouts together!
                </p>
                <div className="space-y-2">
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-green-400">1.</span> Create a battle
                    lobby or join an existing one
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-green-400">2.</span> Wait for other
                    players to join (2-4 players recommended)
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-green-400">3.</span> Battle starts
                    automatically when ready
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-green-400">4.</span> Share loot and XP
                    with all participants
                  </div>
                </div>
                <div className="mt-3 bg-green-950 border border-green-900 p-2">
                  <p className="font-jetbrains text-[10px] text-green-400">
                    💡 TIP: Coordinate with your team using Party chat for
                    better strategy!
                  </p>
                </div>
              </div>

              {/* PvP */}
              <div className="border-2 border-red-700 p-4">
                <h3 className="font-playfair text-xl font-bold text-red-400 mb-2 flex items-center gap-2">
                  <span className="text-2xl">⚔️</span> PvP Arena
                </h3>
                <p className="font-jetbrains text-xs text-neutral-300 mb-3">
                  Challenge other players in head-to-head Sprout battles!
                </p>
                <div className="space-y-2">
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-red-400">1.</span> Create a PvP lobby
                    and share the Battle ID
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-red-400">2.</span> Opponent joins
                    using the Battle ID
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-red-400">3.</span> Battle begins with
                    turn-based combat
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-red-400">4.</span> Winner takes bonus
                    XP and rare materials
                  </div>
                </div>
                <div className="mt-3 bg-red-950 border border-red-900 p-2">
                  <p className="font-jetbrains text-[10px] text-red-400">
                    ⚠️ WARNING: PvP battles cost 1 Data-Seed to enter. Choose
                    your party wisely!
                  </p>
                </div>
              </div>

              {/* Raid */}
              <div className="border-2 border-purple-700 p-4">
                <h3 className="font-playfair text-xl font-bold text-purple-400 mb-2 flex items-center gap-2">
                  <span className="text-2xl">🐉</span> Raid Bosses
                </h3>
                <p className="font-jetbrains text-xs text-neutral-300 mb-3">
                  Epic battles against legendary Sprouts with huge rewards!
                </p>
                <div className="space-y-2">
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-purple-400">1.</span> Requires 4-8
                    players to participate
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-purple-400">2.</span> Face off against
                    powerful boss Sprouts
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-purple-400">3.</span> Coordinate
                    abilities and healing
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-purple-400">4.</span> Earn legendary
                    items and massive XP
                  </div>
                </div>
                <div className="mt-3 bg-purple-950 border border-purple-900 p-2">
                  <p className="font-jetbrains text-[10px] text-purple-400">
                    ✨ LEGENDARY: Raid bosses drop unique Sprout species and
                    Staff Upgrades!
                  </p>
                </div>
              </div>

              {/* Party System */}
              <div className="border-2 border-blue-700 p-4">
                <h3 className="font-playfair text-xl font-bold text-blue-400 mb-2 flex items-center gap-2">
                  <span className="text-2xl">👥</span> Party System
                </h3>
                <p className="font-jetbrains text-xs text-neutral-300 mb-3">
                  Create or join a persistent party to organize your guild!
                </p>
                <div className="space-y-2">
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-blue-400">•</span> Parties can have up
                    to 10 members
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-blue-400">•</span> Share resources and
                    loot with party members
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-blue-400">•</span> Coordinate battles
                    and strategies
                  </div>
                  <div className="font-jetbrains text-xs text-neutral-400">
                    <span className="text-blue-400">•</span> Party chat coming
                    soon!
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Battles View */}
        {view === "battles" && (
          <div className="flex-1 overflow-y-auto p-4">
            {/* Create Battle */}
            <div className="border border-white p-4 mb-4">
              <h3 className="font-jetbrains text-sm tracking-widest uppercase text-white mb-3">
                Create Battle Lobby
              </h3>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setCreateBattleType("pve_coop")}
                  className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 border ${createBattleType === "pve_coop" ? "border-green-400 bg-green-950 text-green-400" : "border-neutral-700 text-neutral-500"}`}
                >
                  PvE Co-op
                </button>
                <button
                  onClick={() => setCreateBattleType("pvp")}
                  className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 border ${createBattleType === "pvp" ? "border-red-400 bg-red-950 text-red-400" : "border-neutral-700 text-neutral-500"}`}
                >
                  PvP
                </button>
                <button
                  onClick={() => setCreateBattleType("raid")}
                  className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 border ${createBattleType === "raid" ? "border-purple-400 bg-purple-950 text-purple-400" : "border-neutral-700 text-neutral-500"}`}
                >
                  Raid
                </button>
              </div>
              <button
                onClick={createBattle}
                disabled={loading}
                className="w-full bg-white text-black font-jetbrains text-xs tracking-widest uppercase py-3 hover:bg-neutral-200 transition-colors disabled:opacity-40"
              >
                {loading ? "CREATING..." : "CREATE LOBBY"}
              </button>
            </div>

            {/* Join by ID */}
            <div className="border border-white p-4 mb-4">
              <h3 className="font-jetbrains text-sm tracking-widest uppercase text-white mb-3">
                Join by ID
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinBattleId}
                  onChange={(e) => setJoinBattleId(e.target.value)}
                  placeholder="Paste Battle ID here..."
                  className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-2 font-jetbrains text-xs text-white focus:border-white outline-none"
                />
                <button
                  onClick={() => joinBattle(joinBattleId)}
                  disabled={loading || !joinBattleId.trim()}
                  className="bg-white text-black font-jetbrains text-xs tracking-widest uppercase px-4 py-2 hover:bg-neutral-200 transition-colors disabled:opacity-40"
                >
                  JOIN
                </button>
              </div>
            </div>

            {/* Available Battles */}
            <div className="border border-white p-4">
              <h3 className="font-jetbrains text-sm tracking-widest uppercase text-white mb-3">
                Available Battles ({battles.length})
              </h3>
              {loading ? (
                <p className="font-jetbrains text-xs text-neutral-500 text-center py-4">
                  LOADING...
                </p>
              ) : battles.length === 0 ? (
                <p className="font-jetbrains text-xs text-neutral-500 text-center py-4">
                  No battles available. Create one!
                </p>
              ) : (
                <div className="space-y-2">
                  {battles.map((b) => {
                    const typeColors = {
                      pve_coop: {
                        border: "border-green-700",
                        bg: "bg-green-950",
                        text: "text-green-400",
                      },
                      pvp: {
                        border: "border-red-700",
                        bg: "bg-red-950",
                        text: "text-red-400",
                      },
                      raid: {
                        border: "border-purple-700",
                        bg: "bg-purple-950",
                        text: "text-purple-400",
                      },
                    };
                    const colors =
                      typeColors[b.battle_type] || typeColors.pve_coop;
                    return (
                      <div
                        key={b.id}
                        className={`border ${colors.border} ${colors.bg} p-3 flex items-center justify-between`}
                      >
                        <div className="flex-1">
                          <p
                            className={`font-jetbrains text-xs ${colors.text} font-bold`}
                          >
                            {b.battle_type.toUpperCase().replace(/_/g, " ")}
                          </p>
                          <p className="font-jetbrains text-[10px] text-neutral-500">
                            {b.player_count} player(s) • ID:{" "}
                            {b.id.substring(0, 8)}...
                          </p>
                        </div>
                        <button
                          onClick={() => joinBattle(b.id)}
                          disabled={loading}
                          className={`font-jetbrains text-xs tracking-widest uppercase border ${colors.border} px-3 py-1.5 ${colors.text} hover:bg-white hover:text-black transition-colors disabled:opacity-40`}
                        >
                          JOIN
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Party View */}
        {view === "party" && (
          <div className="flex-1 overflow-y-auto p-4">
            {!party ? (
              <div className="border border-white p-4">
                <h3 className="font-jetbrains text-sm tracking-widest uppercase text-white mb-3">
                  Create a Party
                </h3>
                <input
                  type="text"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  placeholder="Party name..."
                  maxLength={50}
                  className="w-full bg-neutral-950 border border-neutral-700 px-3 py-2 mb-3 font-jetbrains text-xs text-white focus:border-white outline-none"
                />
                <button
                  onClick={createParty}
                  disabled={loading || !partyName.trim()}
                  className="w-full bg-white text-black font-jetbrains text-xs tracking-widest uppercase py-3 hover:bg-neutral-200 transition-colors disabled:opacity-40"
                >
                  {loading ? "CREATING..." : "CREATE PARTY"}
                </button>
              </div>
            ) : (
              <>
                {/* Party Info */}
                <div className="border border-white p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-playfair text-xl font-bold text-white">
                        {party.name}
                      </h3>
                      <p className="font-jetbrains text-xs text-neutral-500">
                        {partyMembers.length} member(s)
                      </p>
                    </div>
                    <button
                      onClick={leaveParty}
                      disabled={loading}
                      className="font-jetbrains text-xs tracking-widest uppercase border border-red-400 px-3 py-1.5 text-red-400 hover:bg-red-400 hover:text-black transition-colors"
                    >
                      LEAVE
                    </button>
                  </div>

                  {/* Members */}
                  <div className="space-y-2">
                    {partyMembers.map((m) => (
                      <div
                        key={m.player_id}
                        className="border border-neutral-800 p-2 flex items-center justify-between"
                      >
                        <div className="flex-1">
                          <p className="font-jetbrains text-xs text-white">
                            {m.username}
                            {m.is_leader && (
                              <span className="text-yellow-400 ml-2">
                                👑 Leader
                              </span>
                            )}
                          </p>
                          <p className="font-jetbrains text-[10px] text-neutral-500">
                            Lv{m.level} • {m.hp}/{m.max_hp} HP
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Invite */}
                <div className="border border-white p-4">
                  <h3 className="font-jetbrains text-sm tracking-widest uppercase text-white mb-3">
                    Invite Player
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inviteUsername}
                      onChange={(e) => setInviteUsername(e.target.value)}
                      placeholder="Username..."
                      className="flex-1 bg-neutral-950 border border-neutral-700 px-3 py-2 font-jetbrains text-xs text-white placeholder-neutral-500 focus:border-white outline-none"
                    />
                    <button
                      onClick={inviteToParty}
                      disabled={loading || !inviteUsername.trim()}
                      className="bg-white text-black font-jetbrains text-xs tracking-widest uppercase px-4 py-2 hover:bg-neutral-200 transition-colors disabled:opacity-40"
                    >
                      INVITE
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        <div className="border-t border-neutral-900 px-6 py-3 shrink-0">
          <p className="font-jetbrains text-[10px] text-neutral-700">
            {view === "instructions"
              ? "Read the guide above to learn how each multiplayer mode works!"
              : view === "battles"
                ? "Create or join multiplayer battles. Co-op PvE, PvP duels, or massive raids!"
                : "Create a party to organize your guild, invite friends, and coordinate battles."}
          </p>
        </div>
      </div>
    </div>
  );
}
