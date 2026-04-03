"use client";

const SECTIONS = [
  {
    title: "Executive Summary",
    icon: "📋",
    content: `SeedSlingers is a browser-based solarpunk RPG built on a React/Next.js frontend with a PostgreSQL backend. The current build delivers a fully playable single-player loop: authenticated player accounts, exploration via a tile-based overworld, random wild Sprout encounters, Final Fantasy X–style CTB combat with a party system, Sprout capture and collection, inventory management, and a deep XP/leveling system.

The foundation is MMORPG-ready. The database schema, auth system, and API architecture are all designed with multiplayer scale in mind — adding real-time features requires connecting infrastructure (WebSockets/Redis) without major rewrites.`,
  },
  {
    title: "What's Currently Working",
    icon: "✅",
    items: [
      "Email-based authentication (register, login, logout) with secure argon2 hashing",
      "Cinematic landing page with animated particle field and feature showcase",
      "Player onboarding flow with unique callsign selection",
      "Full player profile with tabbed Stats, Sprouts, Inventory, and Party views",
      "Persistent player data: HP, MP, XP, Level, Attack, Defense, position, resources",
      "XP Leveling system: XP thresholds per level, stat growth on level-up, animated Level Up Modal",
      "5 elemental Sprout species with 10 distinct types (Solar, Fungal, Aquatic, Mineral, Data)",
      "Rarity tiers: Common, Uncommon, Rare, Legendary",
      "Canvas-rendered animated Sprout sprites (element-colored, bobbing animations)",
      "CTB combat engine: speed-based turn order, multi-enemy battles",
      "Party System: up to 3 Sprouts summoned into battle as allied combatants",
      "Party Sprouts automatically act on their CTB turns (AI attack routine)",
      "Sprout Collection modal with element filtering, party slot assignment",
      "Inventory Panel with categorized items and USE functionality",
      "Battle rewards: XP, Scrap Metal, Bio-Resin, item drops",
      "Sprout capture mechanic tied to HP threshold and Data-Seed count",
      "Tile-based overworld map with biomes, random encounters, WASD movement",
      "Responsive layout supporting mobile and desktop",
    ],
  },
  {
    title: "Database Architecture",
    icon: "🗄️",
    content: "The current schema is well-structured for expansion:",
    items: [
      "players — core stats, resources, position, auth_user_id link to auth system",
      "player_sprouts — captured Sprouts with level, XP, party_slot (1-3), stats",
      "sprout_species — 10+ species with element, rarity, base stats, description",
      "inventory — player items with quantity and metadata JSONB for extensibility",
      "encounters — full battle history (outcome, XP gained, loot)",
      "item_templates — master item catalog for crafting and drops",
      "Auth tables (auth_users, auth_sessions, auth_accounts) — managed by platform",
    ],
  },
  {
    title: "What's Needed for Full MMORPG",
    icon: "🔧",
    content: "Ranked by impact and implementation complexity:",
    subsections: [
      {
        name: "Phase 1 — Real-Time Multiplayer (HIGH PRIORITY)",
        items: [
          "WebSocket server (e.g. Ably, Pusher, or self-hosted Socket.io) for real-time position sync",
          "World state server: track all online player positions on a shared grid",
          "Presence system: show other players as sprites on the overworld map",
          "Chat system: global, zone-local, and party channels",
          "PvP encounter system: challenge nearby players to battles",
        ],
      },
      {
        name: "Phase 2 — World Depth (HIGH PRIORITY)",
        items: [
          "Procedural world map generation: multiple biomes, dungeons, towns",
          "Safe zones vs. wild zones with encounter rate tuning",
          "NPC system with quest givers and merchants",
          "Quest system: main story arc, side quests, daily bounties",
          "Crafting stations: combine materials into items/upgrades",
          "Loot tables: element-weighted drops, rarity-based item drops",
        ],
      },
      {
        name: "Phase 3 — Social & Economy",
        items: [
          "Guild/Faction system: create or join a guild, shared resources",
          "Player trading marketplace: list Sprouts and items for Bio-Resin",
          "Sprout breeding: combine two compatible Sprouts to produce offspring",
          "Leaderboards: most Sprouts caught, highest level, most victories",
          "Player-to-player messaging and friend system",
          "Global event system: seasonal world events with exclusive drops",
        ],
      },
      {
        name: "Phase 4 — Combat Depth",
        items: [
          "Elemental advantage/disadvantage matrix (Solar > Mineral > Aquatic > Data > Fungal > Solar)",
          "Sprout ability system: each species gets 4 unique moves with MP costs",
          "Status effects: Burned, Rooted, Stunned, Blinded",
          "Player ability tree: unlockable skills as Seed-Slinger levels up",
          "Dungeon raids: 3-5 player cooperative boss encounters",
          "PvP ranked ladder with seasonal rewards",
        ],
      },
      {
        name: "Phase 5 — Monetization & Retention",
        items: [
          "Season Pass: cosmetic rewards, XP boosts, exclusive Sprout skins",
          "Daily login rewards and streak bonuses",
          "Achievement system with badges shown on profile",
          "Cosmetic system: player avatars, staff skins, Sprout nicknames/outfits",
          "Optional subscription: expanded Sprout box, cloud saves, priority matching",
        ],
      },
    ],
  },
  {
    title: "Technical Recommendations",
    icon: "⚙️",
    items: [
      "Move game state to Zustand store to avoid prop-drilling at scale",
      "Add Redis caching layer for player position data (high-frequency reads)",
      "Implement WebSocket via Ably or Pusher for zero-config real-time events",
      "Add rate limiting to all game API endpoints to prevent cheating",
      "Implement server-authoritative combat: validate all damage/XP on the backend",
      "Add Zod schema validation to all API route inputs",
      "Move element lookup tables to a shared constants file imported by front and backend",
      "Add proper error boundaries around game components for resilience",
      "Lazy-load heavy modal components (SproutCollection, InventoryPanel)",
      "Consider Three.js migration for 3D isometric overworld at scale",
    ],
  },
  {
    title: "Sprout Species Expansion Roadmap",
    icon: "🌿",
    content: "Current: 10 species across 5 elements. Target for launch: 150+",
    items: [
      "Each element needs 30+ species across all rarity tiers",
      "Add move sets: 4 abilities per species (2 elemental, 1 status, 1 passive)",
      "Add evolution chains: Basic → Stage 2 → Legendary forms triggered by level/items",
      "Legendary variants: region-locked ultra-rare species (1 per 10,000 encounters)",
      "Seasonal species: available only during real-world seasonal events",
      "Hybrid elements: crossbred species with two elemental types",
    ],
  },
  {
    title: "Architecture Decisions Made",
    icon: "🏗️",
    content: "Key decisions that enable MMORPG expansion:",
    items: [
      "auth_user_id on players table: decouples game data from auth, allows platform migration",
      "party_slot as integer (1-3): simple, sortable, supports future 6-slot expansion",
      "JSONB loot_gained on encounters: flexible loot structure without schema migration",
      "JSONB metadata on inventory: future-proofs item attributes (enchantments, durability)",
      "Sprout XP stored on player_sprouts: Sprouts level independently from player",
      "species_id FK to sprout_species: species stats are immutable; player Sprouts can diverge",
      "encounter history table: enables battle replays, anti-cheat auditing, analytics",
    ],
  },
  {
    title: "Estimated Timeline to MMORPG",
    icon: "📅",
    items: [
      "Phase 0 (NOW): Single-player RPG loop ✅ Complete",
      "Phase 1 (2-4 weeks): Real-time presence + basic multiplayer overworld",
      "Phase 2 (4-8 weeks): NPC system, quests, crafting, full world map",
      "Phase 3 (4-6 weeks): Guilds, trading, economy, social features",
      "Phase 4 (6-8 weeks): Full combat depth, raids, PvP ladder",
      "Phase 5 (2-4 weeks): Monetization layer, season pass, cosmetics",
      "Total estimate: 4-6 months of development to full MMORPG launch",
    ],
  },
];

export default function ReportPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .font-playfair{font-family:'Playfair Display',serif;}
        .font-jetbrains{font-family:'JetBrains Mono',monospace;}
      `}</style>

      <header className="border-b-2 border-white px-6 py-5 flex items-center justify-between sticky top-0 bg-black z-10">
        <div>
          <a
            href="/"
            className="font-playfair text-2xl font-bold tracking-tighter hover:opacity-70 transition-opacity"
          >
            SEEDSLINGERS
          </a>
          <span className="font-jetbrains text-xs text-neutral-500 ml-3">
            / Dev Report
          </span>
        </div>
        <a
          href="/game"
          className="font-jetbrains text-xs tracking-widest uppercase border border-white px-4 py-2 hover:bg-white hover:text-black transition-colors"
        >
          PLAY →
        </a>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <p className="font-jetbrains text-xs tracking-[0.4em] uppercase text-neutral-500 mb-3">
            Internal Documentation
          </p>
          <h1 className="font-playfair text-6xl font-black tracking-tighter mb-4">
            MMORPG
            <br />
            Implementation
            <br />
            Report
          </h1>
          <p className="font-jetbrains text-sm text-neutral-400">
            SeedSlingers · April 2026 · v0.8 Pre-Alpha
          </p>
        </div>

        <div className="space-y-12">
          {SECTIONS.map((section) => (
            <div key={section.title} className="border border-neutral-800">
              <div className="border-b border-neutral-800 px-6 py-4 flex items-center gap-3">
                <span className="text-xl">{section.icon}</span>
                <h2 className="font-playfair text-2xl font-bold tracking-tight">
                  {section.title}
                </h2>
              </div>
              <div className="p-6">
                {section.content && (
                  <p className="font-jetbrains text-xs text-neutral-300 leading-relaxed mb-4">
                    {section.content}
                  </p>
                )}
                {section.items && (
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="flex gap-3">
                        <span className="font-jetbrains text-neutral-600 shrink-0 mt-0.5">
                          ▸
                        </span>
                        <p className="font-jetbrains text-xs text-neutral-300 leading-relaxed">
                          {item}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
                {section.subsections && (
                  <div className="space-y-6">
                    {section.subsections.map((sub) => (
                      <div key={sub.name}>
                        <h3 className="font-jetbrains text-sm font-bold text-white mb-3 border-l-2 border-white pl-3">
                          {sub.name}
                        </h3>
                        <ul className="space-y-2 pl-2">
                          {sub.items.map((item, i) => (
                            <li key={i} className="flex gap-3">
                              <span className="font-jetbrains text-neutral-600 shrink-0 mt-0.5">
                                ▸
                              </span>
                              <p className="font-jetbrains text-xs text-neutral-400 leading-relaxed">
                                {item}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 border-2 border-white p-8 text-center">
          <p className="font-jetbrains text-xs text-neutral-400 mb-2">
            Report generated by the SeedSlingers team
          </p>
          <p className="font-playfair text-3xl font-bold">Ready to Build?</p>
          <div className="flex gap-4 justify-center mt-6">
            <a
              href="/game"
              className="font-jetbrains text-xs tracking-widest uppercase bg-white text-black px-8 py-3 hover:bg-neutral-200 transition-colors"
            >
              ENTER GAME
            </a>
            <a
              href="/"
              className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-8 py-3 text-neutral-400 hover:border-white hover:text-white transition-colors"
            >
              HOME
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
