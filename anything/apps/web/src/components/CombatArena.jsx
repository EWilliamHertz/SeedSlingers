"use client";

import { useState, useEffect, useRef } from "react";

const ELEMENT_COLORS = {
  Solar: { bg: "#fef3c7", border: "#d97706", text: "#92400e" },
  Fungal: { bg: "#f0fdf4", border: "#16a34a", text: "#14532d" },
  Aquatic: { bg: "#ecfeff", border: "#0891b2", text: "#164e63" },
  Mineral: { bg: "#f5f3ff", border: "#7c3aed", text: "#4c1d95" },
  Data: { bg: "#f0f9ff", border: "#0284c7", text: "#0c4a6e" },
};

// Species-specific abilities
const SPROUT_ABILITIES = {
  Solar: [
    {
      id: "solar_flare",
      name: "Solar Flare",
      dmg_multiplier: 1.5,
      cost: 10,
      description:
        "Unleash a burst of solar energy dealing 1.5x damage to a single enemy.",
    },
    {
      id: "photosynthesis",
      name: "Photosynthesis",
      heal: 15,
      cost: 8,
      description: "Harness sunlight to restore 15 HP to yourself.",
    },
  ],
  Fungal: [
    {
      id: "spore_burst",
      name: "Spore Burst",
      dmg_multiplier: 1.3,
      aoe: true,
      cost: 12,
      description:
        "Release toxic spores that damage all enemies for 1.3x damage.",
    },
    {
      id: "poison",
      name: "Poison",
      dot: 5,
      duration: 3,
      cost: 8,
      description: "Inflict poison dealing 5 damage per turn for 3 turns.",
    },
  ],
  Aquatic: [
    {
      id: "tidal_wave",
      name: "Tidal Wave",
      dmg_multiplier: 1.4,
      cost: 10,
      description: "Summon a wave dealing 1.4x damage to an enemy.",
    },
    {
      id: "aqua_heal",
      name: "Aqua Heal",
      heal: 20,
      cost: 10,
      description: "Channel water energy to restore 20 HP.",
    },
  ],
  Mineral: [
    {
      id: "stone_shield",
      name: "Stone Shield",
      defense_boost: 10,
      duration: 2,
      cost: 8,
      description:
        "Create a stone barrier increasing defense by 10 for 2 turns.",
    },
    {
      id: "crystal_strike",
      name: "Crystal Strike",
      dmg_multiplier: 1.6,
      cost: 12,
      description: "Strike with crystalline force for 1.6x damage.",
    },
  ],
  Data: [
    {
      id: "data_burst",
      name: "Data Burst",
      dmg_multiplier: 1.4,
      cost: 10,
      description: "Fire a data beam for 1.4x damage.",
    },
    {
      id: "firewall",
      name: "Firewall",
      defense_boost: 8,
      duration: 2,
      cost: 9,
      description: "Deploy a firewall boosting defense by 8 for 2 turns.",
    },
  ],
};

// Loot tables per element - now includes item drops!
const ENEMY_LOOT_TABLES = {
  Solar: {
    scrap_metal: 4,
    bio_resin: 2,
    items: [
      {
        name: "Solar Essence",
        type: "Crafting Material",
        chance: 0.6,
        quantity: 1,
      },
      { name: "Health Potion", type: "Healing Item", chance: 0.3, quantity: 1 },
    ],
  },
  Fungal: {
    scrap_metal: 2,
    bio_resin: 5,
    items: [
      {
        name: "Fungal Spore",
        type: "Crafting Material",
        chance: 0.7,
        quantity: 1,
      },
      {
        name: "Mycelium Elixir",
        type: "Healing Item",
        chance: 0.2,
        quantity: 1,
      },
    ],
  },
  Aquatic: {
    scrap_metal: 3,
    bio_resin: 3,
    items: [
      {
        name: "Aqua Crystal",
        type: "Crafting Material",
        chance: 0.5,
        quantity: 1,
      },
      { name: "Health Potion", type: "Healing Item", chance: 0.4, quantity: 1 },
    ],
  },
  Mineral: {
    scrap_metal: 6,
    bio_resin: 1,
    items: [
      {
        name: "Mineral Shard",
        type: "Crafting Material",
        chance: 0.65,
        quantity: 1,
      },
      {
        name: "Health Potion",
        type: "Healing Item",
        chance: 0.25,
        quantity: 1,
      },
    ],
  },
  Data: {
    scrap_metal: 5,
    bio_resin: 4,
    items: [
      {
        name: "Data Core",
        type: "Crafting Material",
        chance: 0.55,
        quantity: 1,
      },
      {
        name: "Health Potion",
        type: "Healing Item",
        chance: 0.35,
        quantity: 1,
      },
    ],
  },
};

function SproutSprite({ element, size = 80, animate = true }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;

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

    function drawFrame(t) {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const bob = animate ? Math.sin(t * 3) * 3 : 0;
      const pulse = animate ? Math.sin(t * 4) * 0.15 + 0.85 : 1;

      const grad = ctx.createRadialGradient(
        cx,
        cy + bob,
        4,
        cx,
        cy + bob,
        size * 0.45,
      );
      grad.addColorStop(0, c.glow + "60");
      grad.addColorStop(1, c.glow + "00");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, size * 0.45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#00000025";
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy + size * 0.35,
        size * 0.22,
        size * 0.07,
        0,
        0,
        Math.PI * 2,
      );
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
        cy - size * 0.05 + bob,
        size * 0.02,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.beginPath();
      ctx.arc(
        cx + size * 0.1,
        cy - size * 0.05 + bob,
        size * 0.02,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = c.glow;
      ctx.beginPath();
      ctx.moveTo(cx, cy - size * 0.28 + bob);
      ctx.quadraticCurveTo(
        cx + size * 0.15,
        cy - size * 0.42 + bob,
        cx + size * 0.05,
        cy - size * 0.5 + bob,
      );
      ctx.quadraticCurveTo(
        cx - size * 0.05,
        cy - size * 0.42 + bob,
        cx,
        cy - size * 0.28 + bob,
      );
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy + bob, size * 0.28 * pulse, 0, Math.PI * 2);
      ctx.stroke();
    }

    function loop() {
      tRef.current += 0.016;
      drawFrame(tRef.current);
      rafRef.current = requestAnimationFrame(loop);
    }

    if (animate) {
      rafRef.current = requestAnimationFrame(loop);
    } else {
      drawFrame(0);
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [element, size, animate]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ imageRendering: "pixelated" }}
    />
  );
}

export default function CombatArena({
  playerData,
  sproutSpecies,
  partySprouts = [],
  onCombatEnd,
  onPartyHPUpdate,
}) {
  const [gamePhase, setGamePhase] = useState("initiative");
  const [enemies, setEnemies] = useState([]);
  const [allies, setAllies] = useState([]);
  const [combatLog, setCombatLog] = useState([]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [slideCount, setSlideCount] = useState(0);
  const [menuState, setMenuState] = useState("main");
  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedAbility, setSelectedAbility] = useState(null);
  const [capturedSprout, setCapturedSprout] = useState(null);
  const [captureAnimation, setCaptureAnimation] = useState(null);
  const [deathAnimations, setDeathAnimations] = useState(new Set());
  const [faintedAllies, setFaintedAllies] = useState(new Set());
  const [abilityInfo, setAbilityInfo] = useState(null);
  const [abilityAnimations, setAbilityAnimations] = useState([]);
  const [statusEffects, setStatusEffects] = useState({});

  const logRef = useRef(null);
  const lastClickTime = useRef({});

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [combatLog]);

  // Notify parent when party HP changes
  useEffect(() => {
    if (onPartyHPUpdate && gamePhase === "combat") {
      const partyUpdates = allies
        .filter((a) => !a.isPlayer && a.id)
        .map((a) => ({
          id: a.id,
          current_hp: a.current_hp,
          mp: a.mp,
        }));
      onPartyHPUpdate(partyUpdates);
    }
  }, [allies, gamePhase, onPartyHPUpdate]);

  useEffect(() => {
    const raw = Array.isArray(sproutSpecies) ? sproutSpecies : [sproutSpecies];
    const withStats = raw.map((s, i) => ({
      ...s,
      uid: `enemy_${i}`,
      current_hp: s.base_hp,
      max_hp: s.base_hp,
      speed: s.base_speed + Math.floor(Math.random() * 5),
    }));
    setEnemies(withStats);

    // Build allies: player + party sprouts
    const player = {
      uid: "player",
      name: playerData.username || "YOU",
      current_hp: playerData.hp,
      max_hp: playerData.max_hp,
      attack: playerData.attack || 10,
      defense: playerData.defense || 5,
      speed: 15 + Math.floor(Math.random() * 5),
      mp: playerData.mp || 50,
      max_mp: playerData.max_mp || 50,
      isPlayer: true,
      isAlly: true,
      element: "Data",
    };

    const sproutAllies = partySprouts.slice(0, 3).map((s, i) => ({
      ...s,
      uid: `ally_${i}`,
      isAlly: true,
      element: s.element || "Data",
      mp: s.max_mp || 30,
      max_mp: s.max_mp || 30,
    }));

    const allAllyList = [player, ...sproutAllies];
    setAllies(allAllyList);

    // Build turn order
    const allyCombatants = allAllyList.map((a) => ({
      uid: a.uid,
      name: a.isPlayer
        ? a.name.toUpperCase()
        : (a.nickname || a.name).toUpperCase(),
      speed: a.speed,
      isAlly: true,
      isPlayer: a.isPlayer || false,
    }));
    const enemyCombatants = withStats.map((e) => ({
      uid: e.uid,
      name: e.name.toUpperCase(),
      speed: e.speed,
      isPlayer: false,
      isAlly: false,
    }));
    const all = [...allyCombatants, ...enemyCombatants];
    const sorted = [...all].sort((a, b) => b.speed - a.speed);
    setTurnOrder(sorted);

    let i = 0;
    const iv = setInterval(() => {
      i++;
      setSlideCount(i);
      if (i >= sorted.length) {
        clearInterval(iv);
        setTimeout(() => {
          setGamePhase("combat");
          addLog("Battle begins!");
          if (sproutAllies.length > 0)
            addLog(
              `${sproutAllies.map((a) => a.nickname || a.name).join(", ")} join the fight!`,
            );
        }, 700);
      }
    }, 550);
    return () => clearInterval(iv);
  }, [sproutSpecies, partySprouts, playerData]);

  useEffect(() => {
    if (gamePhase !== "combat") return;
    const cur = turnOrder[currentTurnIndex];
    if (!cur) return;

    const ally = allies.find((a) => a.uid === cur.uid);
    if (ally && (ally.current_hp <= 0 || faintedAllies.has(ally.uid))) {
      setTimeout(advanceTurn, 300);
      return;
    }

    // If it's any ally's turn (player OR party sprout), wait for player input - don't auto-act
    if (cur.isAlly) return;

    // Only enemies auto-act
    const timer = setTimeout(() => doEnemyTurn(cur.uid), 1100);
    return () => clearTimeout(timer);
  }, [currentTurnIndex, gamePhase, allies, faintedAllies]);

  function addLog(msg) {
    setCombatLog((p) => [...p, msg]);
  }

  function advanceTurn() {
    setCurrentTurnIndex((p) => (p + 1) % turnOrder.length);
    setMenuState("main");
    setSelectedAction(null);
    setSelectedAbility(null);
    setActionInProgress(false);
  }

  function doAllyTurn(uid) {
    setAllies((prev) => {
      const ally = prev.find((a) => a.uid === uid);
      if (!ally || ally.current_hp <= 0 || faintedAllies.has(uid)) {
        setTimeout(advanceTurn, 300);
        return prev;
      }

      setEnemies((enemyPrev) => {
        const liveEnemies = enemyPrev.filter((e) => e.current_hp > 0);
        if (liveEnemies.length === 0) {
          setTimeout(advanceTurn, 300);
          return enemyPrev;
        }

        const target = liveEnemies.reduce(
          (weakest, e) => (e.current_hp < weakest.current_hp ? e : weakest),
          liveEnemies[0],
        );

        const abilities = SPROUT_ABILITIES[ally.element] || [];
        const usableAbility = abilities.find((ab) => ally.mp >= ab.cost);

        if (usableAbility && Math.random() > 0.5) {
          const dmg = Math.floor(
            (Math.random() * 10 + (ally.attack || 8)) *
              (usableAbility.dmg_multiplier || 1),
          );
          addLog(
            `${(ally.nickname || ally.name).toUpperCase()} uses ${usableAbility.name} on ${target.name} for ${dmg} damage!`,
          );
          setAllies((ap) =>
            ap.map((a) =>
              a.uid === uid ? { ...a, mp: a.mp - usableAbility.cost } : a,
            ),
          );
          const newEnemies = enemyPrev.map((e) =>
            e.uid === target.uid
              ? { ...e, current_hp: Math.max(0, e.current_hp - dmg) }
              : e,
          );
          if (newEnemies.every((e) => e.current_hp <= 0)) {
            setTimeout(() => doVictory(newEnemies), 500);
          } else {
            setTimeout(advanceTurn, 600);
          }
          return newEnemies;
        } else {
          const dmg = Math.floor(Math.random() * 10) + (ally.attack || 8);
          addLog(
            `${(ally.nickname || ally.name).toUpperCase()} strikes ${target.name} for ${dmg} damage!`,
          );
          const newEnemies = enemyPrev.map((e) =>
            e.uid === target.uid
              ? { ...e, current_hp: Math.max(0, e.current_hp - dmg) }
              : e,
          );
          if (newEnemies.every((e) => e.current_hp <= 0)) {
            setTimeout(() => doVictory(newEnemies), 500);
          } else {
            setTimeout(advanceTurn, 600);
          }
          return newEnemies;
        }
      });
      return prev;
    });
  }

  function onMainSelect(action) {
    if (action === "flee") {
      doFlee();
      return;
    }
    if (action === "abilities") {
      setMenuState("abilities");
      return;
    }
    if (action === "items") {
      setMenuState("items");
      return;
    }
    if (action === "attack") {
      setSelectedAction("attack");
      setMenuState("selectTarget");
    }
  }

  function onAbilitySelect(ability) {
    const now = Date.now();
    const key = ability.id;
    const lastClick = lastClickTime.current[key] || 0;

    // Doubleclick detection (within 400ms)
    if (now - lastClick < 400) {
      setAbilityInfo(ability);
      lastClickTime.current[key] = 0;
      return;
    }

    lastClickTime.current[key] = now;
    setSelectedAbility(ability);
    setSelectedAction(ability.id);
    setMenuState("selectTarget");
  }

  function onTargetSelect(uid) {
    if (actionInProgress) return;
    setActionInProgress(true);
    if (selectedAction === "attack") doAttack(uid);
    else if (selectedAction === "steal") doSteal(uid);
    else if (selectedAction === "capture") doCapture(uid);
    else if (selectedAbility) doUseAbility(uid, selectedAbility);
  }

  function doAttack(uid) {
    const cur = turnOrder[currentTurnIndex];
    const attacker = allies.find((a) => a.uid === cur.uid);
    if (!attacker) return;

    const dmg = Math.floor(Math.random() * 15) + (attacker.attack || 10);
    setEnemies((prev) => {
      const newEnemies = prev.map((e) =>
        e.uid !== uid
          ? e
          : { ...e, current_hp: Math.max(0, e.current_hp - dmg) },
      );
      const target = prev.find((e) => e.uid === uid);
      if (target)
        addLog(
          `${attacker.isPlayer ? "You" : (attacker.nickname || attacker.name).toUpperCase()} strike ${target.name} for ${dmg} damage!`,
        );
      setTimeout(() => {
        setEnemies((cur) => {
          if (cur.every((e) => e.current_hp <= 0)) {
            doVictory(cur);
          } else {
            advanceTurn();
          }
          return cur;
        });
      }, 500);
      return newEnemies;
    });
  }

  function doUseAbility(uid, ability) {
    const cur = turnOrder[currentTurnIndex];
    const caster = allies.find((a) => a.uid === cur.uid);
    if (!caster || caster.mp < ability.cost) {
      addLog("Not enough MP!");
      setActionInProgress(false);
      setMenuState("main");
      return;
    }

    setAllies((prev) =>
      prev.map((a) =>
        a.uid === caster.uid ? { ...a, mp: a.mp - ability.cost } : a,
      ),
    );

    // Add visual animation
    setAbilityAnimations((prev) => [
      ...prev,
      { id: Date.now(), abilityId: ability.id, targetUid: uid },
    ]);
    setTimeout(() => {
      setAbilityAnimations((prev) => prev.slice(1));
    }, 1000);

    // Healing abilities
    if (ability.heal) {
      setAllies((prev) =>
        prev.map((a) =>
          a.uid === caster.uid
            ? {
                ...a,
                current_hp: Math.min(a.max_hp, a.current_hp + ability.heal),
              }
            : a,
        ),
      );
      addLog(
        `${caster.isPlayer ? "You" : (caster.nickname || caster.name).toUpperCase()} use ${ability.name} and restore ${ability.heal} HP!`,
      );
      setTimeout(advanceTurn, 700);
    }
    // Damage abilities
    else if (ability.dmg_multiplier) {
      const dmg = Math.floor(
        (Math.random() * 15 + (caster.attack || 10)) * ability.dmg_multiplier,
      );

      if (ability.aoe) {
        // Area of effect - hit all enemies
        setEnemies((prev) => {
          const newEnemies = prev.map((e) => ({
            ...e,
            current_hp: Math.max(0, e.current_hp - dmg),
          }));
          addLog(
            `${caster.isPlayer ? "You" : (caster.nickname || caster.name).toUpperCase()} use ${ability.name} hitting all enemies for ${dmg} damage each!`,
          );
          setTimeout(() => {
            setEnemies((cur) => {
              if (cur.every((e) => e.current_hp <= 0)) {
                doVictory(cur);
              } else {
                advanceTurn();
              }
              return cur;
            });
          }, 500);
          return newEnemies;
        });
      } else {
        // Single target damage
        setEnemies((prev) => {
          const newEnemies = prev.map((e) =>
            e.uid !== uid
              ? e
              : { ...e, current_hp: Math.max(0, e.current_hp - dmg) },
          );
          const target = prev.find((e) => e.uid === uid);
          if (target)
            addLog(
              `${caster.isPlayer ? "You" : (caster.nickname || caster.name).toUpperCase()} use ${ability.name} on ${target.name} for ${dmg} damage!`,
            );
          setTimeout(() => {
            setEnemies((cur) => {
              if (cur.every((e) => e.current_hp <= 0)) {
                doVictory(cur);
              } else {
                advanceTurn();
              }
              return cur;
            });
          }, 500);
          return newEnemies;
        });
      }
    }
    // Defense boost abilities
    else if (ability.defense_boost) {
      setStatusEffects((prev) => ({
        ...prev,
        [caster.uid]: {
          ...(prev[caster.uid] || {}),
          defense_boost: ability.defense_boost,
          defense_boost_turns: ability.duration || 2,
        },
      }));
      addLog(
        `${caster.isPlayer ? "You" : (caster.nickname || caster.name).toUpperCase()} use ${ability.name} and gain +${ability.defense_boost} defense for ${ability.duration || 2} turns!`,
      );
      setTimeout(advanceTurn, 700);
    }
    // Damage over time abilities
    else if (ability.dot) {
      setEnemies((prev) => {
        const target = prev.find((e) => e.uid === uid);
        if (target) {
          setStatusEffects((prevEffects) => ({
            ...prevEffects,
            [uid]: {
              ...(prevEffects[uid] || {}),
              poison: ability.dot,
              poison_turns: ability.duration || 3,
            },
          }));
          addLog(
            `${caster.isPlayer ? "You" : (caster.nickname || caster.name).toUpperCase()} use ${ability.name} on ${target.name}, inflicting poison!`,
          );
        }
        setTimeout(advanceTurn, 700);
        return prev;
      });
    }
  }

  function doSteal(uid) {
    setEnemies((prev) => {
      const e = prev.find((x) => x.uid === uid);
      if (!e) return prev;
      if (Math.random() > 0.45)
        addLog(
          `Stole ${Math.floor(Math.random() * 3) + 1} Scrap Metal from ${e.name}!`,
        );
      else addLog(`Steal failed — ${e.name} resists!`);
      return prev;
    });
    setTimeout(advanceTurn, 700);
  }

  function doCapture(uid) {
    if (playerData.data_seeds <= 0) {
      addLog("No Data-Seeds remaining!");
      setActionInProgress(false);
      setMenuState("main");
      return;
    }

    setCaptureAnimation({ uid, progress: 0 });

    setTimeout(() => {
      setEnemies((prev) => {
        const e = prev.find((x) => x.uid === uid);
        if (!e) return prev;
        const chance = Math.max(0.1, 1 - e.current_hp / e.max_hp);
        if (Math.random() < chance) {
          addLog(`Captured ${e.name}! It joins your roster.`);
          setCapturedSprout(e);
          setTimeout(() => setCaptureAnimation(null), 800);

          const next = prev.filter((x) => x.uid !== uid);
          if (next.length === 0 || next.every((x) => x.current_hp <= 0)) {
            setTimeout(
              () =>
                onCombatEnd("capture", {
                  xp: 30,
                  scrap_metal: 5,
                  bio_resin: 3,
                  data_seeds_delta: -1,
                  capturedSprout: e,
                }),
              900,
            );
          } else {
            setTimeout(advanceTurn, 900);
          }
          return next;
        } else {
          addLog(`Capture failed — ${e.name} breaks free!`);
          setCaptureAnimation(null);
          setTimeout(advanceTurn, 700);
          return prev;
        }
      });
    }, 1200);
  }

  function doFlee() {
    addLog("You fled from battle!");
    setTimeout(() => onCombatEnd("fled", null), 700);
  }

  function doEnemyTurn(uid) {
    setEnemies((prev) => {
      const e = prev.find((x) => x.uid === uid);
      if (!e || e.current_hp <= 0) {
        setTimeout(advanceTurn, 300);
        return prev;
      }

      const liveAllies = allies.filter(
        (a) => a.current_hp > 0 && !faintedAllies.has(a.uid),
      );
      if (liveAllies.length === 0) {
        setTimeout(doDefeat, 500);
        return prev;
      }

      const target = liveAllies[Math.floor(Math.random() * liveAllies.length)];
      const dmg = Math.max(
        1,
        Math.floor(Math.random() * 10) +
          e.base_attack -
          (target.defense || 5) / 2,
      );
      addLog(
        `${e.name} attacks ${target.isPlayer ? "you" : (target.nickname || target.name).toUpperCase()} for ${dmg} damage!`,
      );
      setAllies((allyPrev) => {
        const newAllies = allyPrev.map((a) =>
          a.uid === target.uid
            ? { ...a, current_hp: Math.max(0, a.current_hp - dmg) }
            : a,
        );

        const updatedTarget = newAllies.find((a) => a.uid === target.uid);
        if (updatedTarget && updatedTarget.current_hp <= 0) {
          setFaintedAllies((f) => new Set(f).add(target.uid));
          addLog(
            `${target.isPlayer ? "You" : (target.nickname || target.name).toUpperCase()} fainted!`,
          );

          const remainingAlive = newAllies.filter(
            (a) => a.current_hp > 0 && !faintedAllies.has(a.uid),
          );
          if (remainingAlive.length <= 1 && updatedTarget.current_hp <= 0) {
            setTimeout(doDefeat, 500);
          } else {
            setTimeout(advanceTurn, 500);
          }
        } else {
          setTimeout(advanceTurn, 500);
        }

        return newAllies;
      });
      return prev;
    });
  }

  function doVictory(currentEnemies) {
    addLog("Victory! All Sprouts pacified.");
    setGamePhase("victory");

    let totalLoot = { scrap_metal: 0, bio_resin: 0, xp: 0 };
    const droppedItems = [];

    currentEnemies.forEach((e) => {
      const loot = ENEMY_LOOT_TABLES[e.element] || ENEMY_LOOT_TABLES.Data;
      totalLoot.scrap_metal += loot.scrap_metal || 0;
      totalLoot.bio_resin += loot.bio_resin || 0;
      totalLoot.xp += 20;

      if (loot.items) {
        loot.items.forEach((itemDef) => {
          if (Math.random() < itemDef.chance) {
            droppedItems.push({
              item_name: itemDef.name,
              item_type: itemDef.type,
              quantity: itemDef.quantity || 1,
            });
            addLog(`Obtained ${itemDef.name}!`);
          }
        });
      }
    });

    const revivedAllies = allies.map((a) => {
      if (faintedAllies.has(a.uid)) {
        return { ...a, current_hp: 1 };
      }
      return a;
    });

    setTimeout(
      () =>
        onCombatEnd("victory", {
          ...totalLoot,
          revivedAllies,
          droppedItems,
        }),
      1200,
    );
  }

  function doDefeat() {
    addLog("All party members fainted...");
    setGamePhase("defeat");
    setTimeout(() => onCombatEnd("defeat", { hp_change: -20 }), 1200);
  }

  const cur = turnOrder[currentTurnIndex];
  const currentAlly = allies.find((a) => a.uid === cur?.uid);
  const isPlayerOrAllyTurn =
    currentAlly &&
    currentAlly.current_hp > 0 &&
    !faintedAllies.has(currentAlly.uid) &&
    gamePhase === "combat" &&
    !actionInProgress;
  const isPlayerTurn = isPlayerOrAllyTurn && currentAlly?.isPlayer;

  const currentAbilities = currentAlly
    ? SPROUT_ABILITIES[currentAlly.element] || []
    : [];

  if (gamePhase === "initiative") {
    return (
      <div className="w-full max-w-lg mx-auto flex flex-col items-center justify-center min-h-[520px]">
        <div className="w-full border-4 border-black bg-white">
          <div className="bg-black text-white px-6 py-4">
            <p className="font-jetbrains text-xs tracking-[0.3em] uppercase">
              Battle Start
            </p>
            <h2 className="font-playfair text-4xl font-bold tracking-tighter mt-1">
              Turn Order
            </h2>
          </div>
          <div className="p-4 space-y-2">
            {turnOrder.map((c, i) => (
              <div
                key={c.uid}
                className="border-2 border-black px-5 py-3 flex items-center justify-between"
                style={{
                  opacity: i < slideCount ? 1 : 0,
                  transform:
                    i < slideCount ? "translateX(0)" : "translateX(-32px)",
                  transition: "opacity 0.35s ease, transform 0.35s ease",
                  background: c.isPlayer
                    ? "#000"
                    : c.isAlly
                      ? "#052e16"
                      : "#fff",
                  color: c.isPlayer ? "#fff" : c.isAlly ? "#4ade80" : "#000",
                  borderColor: c.isAlly ? "#16a34a" : "#000",
                }}
              >
                <span className="font-jetbrains text-sm tracking-widest uppercase font-bold">
                  {c.isAlly ? "♦ " : ""}
                  {c.name}
                </span>
                <span className="font-jetbrains text-xs opacity-60">
                  SPD {c.speed}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-0 border-4 border-black bg-white overflow-hidden relative">
      {/* Ability animations overlay */}
      {abilityAnimations.map((anim) => (
        <div
          key={anim.id}
          className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          style={{ animation: "fadeOut 1s ease-out" }}
        >
          <div className="text-6xl font-bold opacity-80 animate-ping">✨</div>
        </div>
      ))}

      {/* Ability info modal */}
      {abilityInfo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setAbilityInfo(null)}
        >
          <div
            className="border-4 border-black bg-white p-6 max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-playfair text-2xl font-bold mb-2">
              {abilityInfo.name}
            </h3>
            <p className="font-jetbrains text-xs text-neutral-600 mb-4">
              Cost: {abilityInfo.cost} MP
            </p>
            <p className="font-jetbrains text-sm leading-relaxed mb-4">
              {abilityInfo.description}
            </p>
            <button
              onClick={() => setAbilityInfo(null)}
              className="w-full px-4 py-2 bg-black text-white font-jetbrains text-sm tracking-wider uppercase hover:bg-neutral-800"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        <div className="w-16 border-r-2 border-black bg-neutral-900 flex flex-col">
          <div className="px-2 py-3 border-b-2 border-black bg-black">
            <p className="font-jetbrains text-[9px] tracking-widest uppercase text-neutral-500 text-center">
              CTB
            </p>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {turnOrder.map((c, i) => (
              <div
                key={`${c.uid}_${i}`}
                className="mx-2 mb-2 px-2 py-2 border font-jetbrains text-[9px] tracking-wider uppercase text-center"
                style={{
                  background:
                    i === currentTurnIndex
                      ? c.isAlly
                        ? "#052e16"
                        : "#fff"
                      : "transparent",
                  color:
                    i === currentTurnIndex
                      ? c.isAlly
                        ? "#4ade80"
                        : "#000"
                      : c.isAlly
                        ? "#16a34a"
                        : "#6b7280",
                  borderColor:
                    i === currentTurnIndex
                      ? c.isAlly
                        ? "#16a34a"
                        : "#fff"
                      : c.isAlly
                        ? "#16a34a40"
                        : "#374151",
                  fontWeight: i === currentTurnIndex ? 700 : 400,
                }}
              >
                {c.isAlly && <div className="text-green-400">♦</div>}
                <div className="break-all leading-tight">
                  {c.name.substring(0, 6)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
          <div className="flex-1 p-6 flex flex-col gap-4">
            <div
              className={`grid gap-4 ${enemies.length > 1 ? "grid-cols-2" : "grid-cols-1 max-w-xs mx-auto w-full"}`}
            >
              {enemies.map((enemy) => {
                const pct = (enemy.current_hp / enemy.max_hp) * 100;
                const dead = enemy.current_hp <= 0;
                const elColor =
                  ELEMENT_COLORS[enemy.element] || ELEMENT_COLORS.Data;
                const isTarget =
                  menuState === "selectTarget" && !dead && isPlayerOrAllyTurn;
                const isBeingCaptured = captureAnimation?.uid === enemy.uid;
                const isDying = deathAnimations.has(enemy.uid);

                return (
                  <div
                    key={enemy.uid}
                    onClick={() => isTarget && onTargetSelect(enemy.uid)}
                    className="border-2 border-black p-4 flex flex-col items-center gap-2 transition-all relative"
                    style={{
                      opacity: dead ? 0.25 : isDying ? 0.5 : 1,
                      cursor: isTarget ? "pointer" : "default",
                      background: isTarget ? elColor.bg : "#fff",
                      borderColor: isTarget ? elColor.border : "#000",
                      outline: isTarget
                        ? `3px solid ${elColor.border}`
                        : "none",
                      outlineOffset: "3px",
                      transform: isDying
                        ? "scale(0.9) rotate(5deg)"
                        : isBeingCaptured
                          ? "scale(1.1)"
                          : isTarget
                            ? "scale(1.05)"
                            : "scale(1)",
                      boxShadow: isTarget
                        ? `0 0 20px ${elColor.border}80`
                        : "none",
                    }}
                  >
                    {isBeingCaptured && (
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                        <div className="animate-spin rounded-full h-24 w-24 border-4 border-green-500 border-t-transparent"></div>
                        <span className="absolute font-jetbrains text-sm text-green-400 font-bold animate-pulse">
                          CAPTURING
                        </span>
                      </div>
                    )}
                    <SproutSprite
                      element={enemy.element}
                      size={90}
                      animate={!dead && !isDying}
                    />
                    <p className="font-playfair text-lg font-bold tracking-tight text-center leading-tight">
                      {enemy.name}
                    </p>
                    <span
                      className="font-jetbrains text-[10px] tracking-widest uppercase px-2 py-0.5 border"
                      style={{
                        color: elColor.text,
                        borderColor: elColor.border,
                        background: elColor.bg,
                      }}
                    >
                      {enemy.element}
                    </span>
                    <div className="w-full h-3 border border-black bg-neutral-100">
                      <div
                        className="h-full transition-all duration-300"
                        style={{
                          width: `${pct}%`,
                          background:
                            pct > 50
                              ? "#000"
                              : pct > 25
                                ? "#d97706"
                                : "#dc2626",
                        }}
                      />
                    </div>
                    <p className="font-jetbrains text-[10px] self-end">
                      {enemy.current_hp}/{enemy.max_hp} HP
                    </p>
                    {isTarget && (
                      <p
                        className="font-jetbrains text-xs tracking-widest uppercase font-bold animate-pulse"
                        style={{ color: elColor.text }}
                      >
                        ▸ CLICK TO TARGET ◂
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {allies.length > 0 && (
              <div className="border-2 border-green-700 bg-green-950 p-3">
                <p className="font-jetbrains text-[10px] tracking-widest uppercase text-green-500 mb-2">
                  Party
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {allies.map((ally) => {
                    const hpPct = ((ally.current_hp || 0) / ally.max_hp) * 100;
                    const isFainted = faintedAllies.has(ally.uid);
                    return (
                      <div
                        key={ally.uid}
                        className="border border-green-800 p-2"
                        style={{
                          background: isFainted ? "#14532d" : "#14532d",
                          opacity: isFainted ? 0.4 : 1,
                        }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-jetbrains text-[10px] text-green-400 truncate flex-1">
                            {ally.isPlayer
                              ? "YOU"
                              : `♦ ${ally.nickname || ally.name}`}
                          </span>
                          <span className="font-jetbrains text-[9px] text-green-500 ml-1">
                            {ally.isPlayer ? "" : `Lv${ally.level}`}
                          </span>
                        </div>
                        <div className="font-jetbrains text-[10px] text-green-300 mb-1">
                          {isFainted
                            ? "FAINTED"
                            : `${ally.current_hp || 0}/${ally.max_hp}`}
                        </div>
                        {!isFainted && (
                          <>
                            <div className="h-2 border border-green-800 bg-green-950 mb-1">
                              <div
                                className="h-full transition-all duration-300 bg-green-400"
                                style={{ width: `${hpPct}%` }}
                              />
                            </div>
                            <div className="font-jetbrains text-[9px] text-blue-300">
                              MP: {ally.mp}/{ally.max_mp}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div
              ref={logRef}
              className="border-2 border-black bg-neutral-950 p-3 h-28 overflow-y-auto"
            >
              {combatLog.map((line, i) => (
                <p key={i} className="font-jetbrains text-xs text-white mb-0.5">
                  <span className="text-green-400 mr-1">›</span>
                  {line}
                </p>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-64 border-t-2 lg:border-t-0 lg:border-l-2 border-black flex flex-col">
            <div className="border-b-2 border-black bg-neutral-100 px-4 py-2">
              <p className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-500">
                {cur?.isPlayer
                  ? "Your Turn"
                  : cur?.isAlly
                    ? `${cur.name} Turn`
                    : cur
                      ? `${cur.name} Turn`
                      : "—"}
              </p>
            </div>

            {isPlayerTurn && (
              <div className="flex-1 flex flex-col">
                {menuState === "main" && (
                  <nav className="flex flex-col">
                    {[
                      { key: "attack", label: "Attack" },
                      { key: "abilities", label: "Abilities" },
                      { key: "items", label: "Items" },
                      { key: "flee", label: "Flee" },
                    ].map((item) => (
                      <button
                        key={item.key}
                        onClick={() => onMainSelect(item.key)}
                        className="text-left px-5 py-4 font-jetbrains text-sm tracking-wider uppercase border-b border-neutral-200 hover:bg-black hover:text-white transition-none"
                      >
                        ▸ {item.label}
                      </button>
                    ))}
                  </nav>
                )}
                {menuState === "abilities" && (
                  <nav className="flex flex-col flex-1">
                    <div className="flex-1 overflow-y-auto">
                      {currentAbilities.length > 0 ? (
                        currentAbilities.map((ab) => (
                          <button
                            key={ab.id}
                            onClick={() => onAbilitySelect(ab)}
                            disabled={currentAlly && currentAlly.mp < ab.cost}
                            className="text-left px-5 py-4 font-jetbrains text-sm tracking-wider uppercase border-b border-neutral-200 hover:bg-black hover:text-white transition-none disabled:opacity-30 w-full"
                          >
                            ▸ {ab.name}{" "}
                            <span className="text-neutral-400">
                              ({ab.cost} MP)
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-5 py-4 font-jetbrains text-xs text-neutral-400">
                          No abilities available.
                        </div>
                      )}
                      <button
                        onClick={() =>
                          onAbilitySelect({
                            id: "steal",
                            name: "Steal",
                            cost: 0,
                            description:
                              "Attempt to steal resources from an enemy.",
                          })
                        }
                        className="text-left px-5 py-4 font-jetbrains text-sm tracking-wider uppercase border-b border-neutral-200 hover:bg-black hover:text-white transition-none w-full"
                      >
                        ▸ Steal
                      </button>
                      <button
                        onClick={() =>
                          onAbilitySelect({
                            id: "capture",
                            name: "Capture",
                            cost: 0,
                            description:
                              "Use a Data-Seed to attempt to capture an enemy sprout.",
                          })
                        }
                        disabled={playerData.data_seeds <= 0}
                        className="text-left px-5 py-4 font-jetbrains text-sm tracking-wider uppercase border-b border-neutral-200 hover:bg-black hover:text-white transition-none disabled:opacity-30 w-full"
                      >
                        ▸ Capture{" "}
                        <span className="text-neutral-400">
                          ({playerData.data_seeds})
                        </span>
                      </button>
                    </div>
                    <div className="border-t-2 border-black bg-neutral-50 px-4 py-3">
                      <p className="font-jetbrains text-[10px] text-neutral-500 text-center leading-relaxed">
                        Double-click for information about an ability
                      </p>
                    </div>
                    <button
                      onClick={() => setMenuState("main")}
                      className="text-left px-5 py-4 font-jetbrains text-xs tracking-wider uppercase text-neutral-500 hover:bg-neutral-100 transition-none border-t border-neutral-200"
                    >
                      ← Back
                    </button>
                  </nav>
                )}
                {menuState === "items" && (
                  <div className="flex flex-col">
                    <div className="px-5 py-4 font-jetbrains text-xs text-neutral-400">
                      Use items from your Pack (outside combat).
                    </div>
                    <button
                      onClick={() => setMenuState("main")}
                      className="text-left px-5 py-4 font-jetbrains text-xs tracking-wider uppercase text-neutral-500 hover:bg-neutral-100 transition-none border-t border-neutral-200"
                    >
                      ← Back
                    </button>
                  </div>
                )}
                {menuState === "selectTarget" && (
                  <div className="flex flex-col">
                    <div className="px-5 py-4 font-jetbrains text-xs text-neutral-500 border-b border-neutral-200">
                      Click an enemy to{" "}
                      {selectedAbility?.name || selectedAction}
                    </div>
                    <button
                      onClick={() => {
                        setMenuState("main");
                        setSelectedAction(null);
                        setSelectedAbility(null);
                        setActionInProgress(false);
                      }}
                      className="text-left px-5 py-4 font-jetbrains text-xs tracking-wider uppercase text-neutral-500 hover:bg-neutral-100 transition-none"
                    >
                      ← Back
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isPlayerTurn && cur?.isAlly && gamePhase === "combat" && (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="font-jetbrains text-xs tracking-widest uppercase text-green-600 text-center">
                  ♦ Ally Acting...
                </p>
              </div>
            )}

            {!isPlayerTurn && !cur?.isAlly && gamePhase === "combat" && (
              <div className="flex-1 flex items-center justify-center p-6">
                <p className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400 text-center">
                  Enemy Acting...
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeOut {
          0% { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(1.5); }
        }
      `}</style>
    </div>
  );
}
