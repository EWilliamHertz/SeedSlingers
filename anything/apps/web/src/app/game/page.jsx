"use client";
import { useState, useEffect, useCallback } from "react";
import GameCanvas from "@/components/GameCanvas";
import CombatArena from "@/components/CombatArena";
import GameHUD from "@/components/GameHUD";
import SproutCollection from "@/components/SproutCollection";
import InventoryPanel from "@/components/InventoryPanel";
import LevelUpModal from "@/components/LevelUpModal";
import ChatPanel from "@/components/ChatPanel";
import MultiplayerPanel from "@/components/MultiplayerPanel";
import PlayerInteractionModal from "@/components/PlayerInteractionModal";
import TradeModal from "@/components/TradeModal";
import NotificationsPanel from "@/components/NotificationsPanel";
import RequestsPanel from "@/components/RequestsPanel";
import useUser from "@/utils/useUser";

export default function GamePage() {
  const { data: authUser, loading: authLoading } = useUser();
  const [gameState, setGameState] = useState("loading");
  const [playerData, setPlayerData] = useState(null);
  const [currentEncounter, setCurrentEncounter] = useState(null);
  const [partySprouts, setPartySprouts] = useState([]);
  const [showSprouts, setShowSprouts] = useState(false);
  const [showInventory, setShowInventory] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMultiplayer, setShowMultiplayer] = useState(false);
  const [levelUpQueue, setLevelUpQueue] = useState([]);
  const [readyToCheckAuth, setReadyToCheckAuth] = useState(false);
  const [systemLog, setSystemLog] = useState([]);
  const [currentScreen, setCurrentScreen] = useState({ x: 0, y: 0 });
  const [nearbyPlayers, setNearbyPlayers] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [activeTrade, setActiveTrade] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [message, setMessage] = useState(null);
  const [showRequests, setShowRequests] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  // Wait before checking auth to let session establish
  useEffect(() => {
    const timer = setTimeout(() => setReadyToCheckAuth(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  // Auth redirect - only after waiting period
  useEffect(() => {
    if (readyToCheckAuth && !authLoading && !authUser) {
      console.log(
        "No auth user found after waiting period, redirecting to signin",
      );
      window.location.href = "/account/signin?callbackUrl=/game";
    }
  }, [authUser, authLoading, readyToCheckAuth]);

  const addSystemLog = useCallback((message) => {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    setSystemLog((prev) => [...prev.slice(-19), { message, timestamp }]); // Keep last 20 entries
  }, []);

  // Init player once auth is ready
  useEffect(() => {
    if (authUser) {
      console.log("Auth user found:", authUser.email);
      initializePlayer();
    }
  }, [authUser]);

  // Load inventory
  useEffect(() => {
    if (authUser) {
      loadInventory();
    }
  }, [authUser]);

  const loadInventory = async () => {
    try {
      const res = await fetch("/api/game/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
    }
  };

  const initializePlayer = async () => {
    try {
      console.log("Fetching player data...");
      const response = await fetch("/api/game/player");
      if (!response.ok) {
        console.error("Player fetch failed with status:", response.status);
        throw new Error("Failed to fetch player");
      }
      const data = await response.json();
      console.log("Player data response:", data);

      if (!data.player) {
        console.log("No player record found, redirecting to onboarding");
        // No player record yet — go to onboarding
        window.location.href = "/onboarding";
        return;
      }
      console.log("Player loaded:", data.player.username);
      setPlayerData(data.player);

      // Set initial screen based on player position
      const initialScreenX = Math.floor(data.player.position_x / 16);
      const initialScreenY = Math.floor(data.player.position_y / 12);
      setCurrentScreen({ x: initialScreenX, y: initialScreenY });

      await loadPartySprouts();
      setGameState("overworld");
      addSystemLog(`Welcome back, ${data.player.username}!`);
      addSystemLog("Exploring the Reclaimed Wilds...");
    } catch (error) {
      console.error("Error initializing player:", error);
      setGameState("error");
    }
  };

  const loadPartySprouts = async () => {
    try {
      const res = await fetch("/api/game/sprouts");
      if (res.ok) {
        const data = await res.json();
        const party = (data.sprouts || [])
          .filter((s) => s.party_slot)
          .sort((a, b) => a.party_slot - b.party_slot);
        setPartySprouts(party);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEncounter = useCallback(
    (sprouts) => {
      setCurrentEncounter(sprouts);
      setGameState("combat");
      const sproutNames = Array.isArray(sprouts)
        ? sprouts.map((s) => s.name).join(", ")
        : sprouts.name;
      addSystemLog(`⚔️ Combat: Wild ${sproutNames} appeared!`);
    },
    [addSystemLog],
  );

  const handleCombatEnd = useCallback(
    async (outcome, rewards) => {
      setGameState("overworld");
      setCurrentEncounter(null);

      if (outcome === "fled") {
        addSystemLog("Fled from battle safely");
        return;
      }

      if (rewards) {
        try {
          const res = await fetch("/api/game/player", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              xp_gained: rewards.xp || 0,
              hp_change: rewards.healing || 0,
              scrap_metal_delta: rewards.scrap_metal || 0,
              bio_resin_delta: rewards.bio_resin || 0,
              data_seeds_delta: rewards.data_seeds_delta || 0,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            setPlayerData(data.player);

            // Log victory and rewards
            if (outcome === "victory") {
              addSystemLog("Victory! Enemy Sprouts defeated");
            }
            if (rewards.xp) {
              addSystemLog(`+${rewards.xp} XP gained`);
            }
            if (rewards.scrap_metal) {
              addSystemLog(`+${rewards.scrap_metal} Scrap Metal`);
            }
            if (rewards.bio_resin) {
              addSystemLog(`+${rewards.bio_resin} Bio-Resin`);
            }

            if (data.leveledUp && data.levelUpData?.length > 0) {
              setLevelUpQueue(data.levelUpData);
              data.levelUpData.forEach((lvl) => {
                addSystemLog(`🎉 ${lvl.name} leveled up to Lv${lvl.newLevel}!`);
              });
            }
          }
        } catch (err) {
          console.error("Failed to save rewards:", err);
        }

        // Distribute XP to party sprouts
        if (outcome === "victory" && partySprouts.length > 0 && rewards.xp) {
          const sproutXP = Math.floor(rewards.xp * 0.8); // Sprouts get 80% of player XP
          const sproutLevelUps = [];

          for (const sprout of partySprouts) {
            try {
              const xpRes = await fetch("/api/game/sprouts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "gain_xp",
                  sprout_id: sprout.id,
                  xp_gained: sproutXP,
                }),
              });

              if (xpRes.ok) {
                const xpData = await xpRes.json();
                const updatedSprout = xpData.sprout;

                // Check if sprout leveled up
                if (updatedSprout.level > sprout.level) {
                  sproutLevelUps.push({
                    name: sprout.nickname || sprout.name,
                    oldLevel: sprout.level,
                    newLevel: updatedSprout.level,
                    stats: {
                      max_hp: updatedSprout.max_hp - sprout.max_hp,
                      attack: updatedSprout.attack - sprout.attack,
                    },
                  });
                  addSystemLog(
                    `🎉 ${sprout.nickname || sprout.name} leveled up to Lv${updatedSprout.level}!`,
                  );
                }
              }
            } catch (err) {
              console.error("Failed to grant sprout XP:", err);
            }
          }

          // Add sprout level ups to the level up queue
          if (sproutLevelUps.length > 0) {
            setLevelUpQueue((prev) => [...prev, ...sproutLevelUps]);
          }

          // Reload party sprouts to get updated stats
          await loadPartySprouts();
        }

        // Save dropped items to inventory
        if (rewards.droppedItems && rewards.droppedItems.length > 0) {
          for (const item of rewards.droppedItems) {
            try {
              await fetch("/api/game/inventory", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  action: "add",
                  item_name: item.item_name,
                  item_type: item.item_type,
                  quantity: item.quantity || 1,
                }),
              });
              addSystemLog(`Obtained ${item.item_name} x${item.quantity || 1}`);
            } catch (err) {
              console.error("Failed to save item drop:", err);
            }
          }
        }

        // Revive party sprouts if needed
        if (rewards.revivedAllies && rewards.revivedAllies.length > 0) {
          const sproutsToRevive = rewards.revivedAllies.filter(
            (a) => !a.isPlayer && a.current_hp > 0,
          );
          for (const sprout of sproutsToRevive) {
            try {
              await fetch("/api/game/sprouts", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  sprout_id: sprout.id,
                  current_hp: sprout.current_hp,
                }),
              });
            } catch (err) {
              console.error("Failed to revive sprout:", err);
            }
          }
          await loadPartySprouts();
          if (sproutsToRevive.length > 0) {
            addSystemLog(`Party members revived at 1 HP`);
          }
        }
      }

      // Save captured sprout if any
      if (outcome === "capture" && rewards?.capturedSprout) {
        try {
          await fetch("/api/game/sprouts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "capture",
              species_id: rewards.capturedSprout.id,
              current_hp: rewards.capturedSprout.current_hp,
              max_hp: rewards.capturedSprout.base_hp,
              attack: rewards.capturedSprout.base_attack,
              speed: rewards.capturedSprout.base_speed,
              defense: 5,
              element: rewards.capturedSprout.element,
            }),
          });
          await loadPartySprouts();
          addSystemLog(`✨ Captured ${rewards.capturedSprout.name}!`);
        } catch (err) {
          console.error(err);
        }
      }
    },
    [addSystemLog, partySprouts],
  );

  const handleUseItem = useCallback(async (item, effect) => {
    if (effect?.heal) {
      // Optimistically update UI
      setPlayerData((prev) =>
        prev
          ? { ...prev, hp: Math.min(prev.max_hp, prev.hp + effect.heal) }
          : prev,
      );

      // Refresh player data from server to ensure sync
      try {
        const response = await fetch("/api/game/player");
        if (response.ok) {
          const data = await response.json();
          if (data.player) {
            setPlayerData(data.player);
          }
        }
      } catch (err) {
        console.error("Failed to refresh player data after healing:", err);
      }
    }
  }, []);

  const handlePartyChange = useCallback(() => {
    loadPartySprouts();
  }, []);

  const dismissLevelUp = useCallback(() => {
    setLevelUpQueue([]);
  }, []);

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
  };

  const handleTrade = async (username) => {
    try {
      const res = await fetch("/api/multiplayer/trade/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipient_username: username }),
      });

      if (res.ok) {
        const data = await res.json();
        addSystemLog(data.message);
        // Note: Trade modal would open when recipient accepts
      } else {
        const err = await res.json();
        addSystemLog(err.error || "Failed to initiate trade");
      }
    } catch (err) {
      console.error("Trade initiate error:", err);
      addSystemLog("Network error sending trade request");
    }
  };

  const handleDuel = async (username, wagerCurrency, wagerAmount) => {
    try {
      const res = await fetch("/api/multiplayer/duel/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          opponent_username: username,
          wager_currency: wagerCurrency,
          wager_amount: wagerAmount,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        addSystemLog(data.message);
      } else {
        const err = await res.json();
        addSystemLog(err.error || "Failed to challenge");
      }
    } catch (err) {
      console.error("Duel challenge error:", err);
      addSystemLog("Network error sending duel challenge");
    }
  };

  const handleFriend = async (username) => {
    try {
      const res = await fetch("/api/multiplayer/friend/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friend_username: username }),
      });

      if (res.ok) {
        const data = await res.json();
        addSystemLog(data.message);
      } else {
        const err = await res.json();
        addSystemLog(err.error || "Failed to send friend request");
      }
    } catch (err) {
      console.error("Friend request error:", err);
      addSystemLog("Network error sending friend request");
    }
  };

  // Poll for notifications
  useEffect(() => {
    if (!authUser) return;

    const fetchNotificationCount = async () => {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = await res.json();
          setNotificationCount(data.count || 0);
        }
      } catch (err) {
        console.error("Fetch notification count error:", err);
      }
    };

    fetchNotificationCount();
    const interval = setInterval(fetchNotificationCount, 5000);
    return () => clearInterval(interval);
  }, [authUser]);

  // Font style shared across states
  const fontStyle = `@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`;

  if (authLoading || gameState === "loading") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-playfair text-6xl font-bold tracking-tighter text-white mb-4">
            SEEDSLINGERS
          </h1>
          <p className="font-jetbrains text-sm tracking-widest uppercase text-neutral-400">
            INITIALIZING WORLD...
          </p>
          <div className="mt-6 flex gap-1 justify-center">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                style={{
                  animation: `bounce 1s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
        <style>{`${fontStyle} @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}`}</style>
      </div>
    );
  }

  if (gameState === "error") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="font-playfair text-5xl font-bold tracking-tighter text-white mb-4">
            Connection Lost
          </h1>
          <p className="font-jetbrains text-sm text-neutral-400 mb-8">
            The mycelium network has been disrupted.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-black font-jetbrains uppercase tracking-widest text-sm hover:bg-neutral-200"
          >
            Reconnect
          </button>
        </div>
        <style>{fontStyle}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <style>{fontStyle}</style>

      {/* Level Up Modal */}
      {levelUpQueue.length > 0 && (
        <LevelUpModal levelUpData={levelUpQueue} onClose={dismissLevelUp} />
      )}

      {/* Sprout Collection Modal */}
      {showSprouts && (
        <SproutCollection
          onClose={() => setShowSprouts(false)}
          onPartyChange={handlePartyChange}
        />
      )}

      {/* Inventory Modal */}
      {showInventory && (
        <InventoryPanel
          onClose={() => setShowInventory(false)}
          onUseItem={handleUseItem}
          playerData={playerData}
        />
      )}

      {/* Multiplayer Panel */}
      {showMultiplayer && (
        <MultiplayerPanel
          onClose={() => setShowMultiplayer(false)}
          playerData={playerData}
        />
      )}

      {/* Chat Panel */}
      <ChatPanel isOpen={showChat} onClose={() => setShowChat(false)} />

      {/* Player Interaction Modal */}
      {selectedPlayer && (
        <PlayerInteractionModal
          targetPlayer={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onTrade={handleTrade}
          onDuel={handleDuel}
          onFriend={handleFriend}
        />
      )}

      {/* Trade Modal */}
      {activeTrade && (
        <TradeModal
          trade={activeTrade}
          onClose={() => setActiveTrade(null)}
          playerInventory={inventory}
        />
      )}

      {/* Requests/Social Panel */}
      {showRequests && (
        <RequestsPanel
          onClose={() => setShowRequests(false)}
          onAcceptTrade={(trade) => setActiveTrade(trade)}
        />
      )}

      {/* Notifications Panel */}
      {showNotifications && (
        <NotificationsPanel
          onClose={() => setShowNotifications(false)}
          onAcceptTrade={(trade) => {
            setActiveTrade(trade);
            setShowNotifications(false);
          }}
          onAcceptDuel={(duel) => {
            addSystemLog(`Duel accepted! Battle starting...`);
            // TODO: Start duel battle
            setShowNotifications(false);
          }}
        />
      )}

      <header className="border-b-4 border-black p-3 flex items-center justify-between bg-white z-10">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="font-playfair text-2xl md:text-3xl font-bold tracking-tighter hover:opacity-70 transition-opacity"
          >
            SEEDSLINGERS
          </a>
          {playerData && (
            <span className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500 hidden md:block">
              LVL {playerData.level} · {playerData.username}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Notification Badge */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative font-jetbrains text-[10px] tracking-widest uppercase border-2 border-yellow-500 bg-yellow-50 px-3 py-1.5 hover:bg-yellow-500 hover:text-white transition-none"
          >
            ❗
            {notificationCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="font-jetbrains text-[10px] tracking-widest uppercase border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-none"
          >
            💬 CHAT
          </button>
          <button
            onClick={() => setShowSprouts(true)}
            className="font-jetbrains text-[10px] tracking-widest uppercase border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-none"
          >
            🌿 PARTY
          </button>
          <button
            onClick={() => setShowInventory(true)}
            className="font-jetbrains text-[10px] tracking-widest uppercase border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-none"
          >
            🎒 PACK
          </button>
          <a
            href="/account/profile"
            className="font-jetbrains text-[10px] tracking-widest uppercase border-2 border-black px-3 py-1.5 hover:bg-black hover:text-white transition-none hidden md:block"
          >
            👤 PROFILE
          </a>
        </div>
      </header>

      {/* FIXED GAME SCREEN AT TOP */}
      <div className="flex-none h-screen bg-neutral-50 border-b-4 lg:border-b-0 border-black flex items-center justify-center p-4 overflow-hidden">
        {gameState === "overworld" && playerData && (
          <GameCanvas
            playerData={playerData}
            onEncounter={handleEncounter}
            onPlayerMove={(pos) =>
              setPlayerData((prev) =>
                prev
                  ? { ...prev, position_x: pos.x, position_y: pos.y }
                  : prev,
              )
            }
            onScreenChange={(screen) => setCurrentScreen(screen)}
            onNearbyPlayersUpdate={(players) => setNearbyPlayers(players)}
            onPlayerClick={handlePlayerClick}
          />
        )}
        {gameState === "combat" && currentEncounter && (
          <CombatArena
            playerData={playerData}
            sproutSpecies={currentEncounter}
            partySprouts={partySprouts}
            onCombatEnd={handleCombatEnd}
          />
        )}
      </div>

      {/* SCROLLABLE INFO PANEL */}
      <aside className="flex-1 w-full bg-white border-t-4 border-black overflow-y-auto">
        {playerData && (
          <GameHUD
            playerData={playerData}
            gameState={gameState}
            partySprouts={partySprouts}
            systemLog={systemLog}
            currentScreen={currentScreen}
            nearbyPlayers={nearbyPlayers}
            onOpenSprouts={() => setShowSprouts(true)}
            onOpenInventory={() => setShowInventory(true)}
            onOpenMultiplayer={() => setShowMultiplayer(true)}
          />
        )}
      </aside>
    </div>
  );
}
