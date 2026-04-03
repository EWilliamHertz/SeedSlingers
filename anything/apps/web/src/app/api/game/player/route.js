import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// XP needed for each level
function xpForLevel(level) {
  return level * 100;
}

// Stat gains per level up
function statsForLevelUp() {
  return { max_hp: 10, attack: 5, defense: 3, max_mp: 10 };
}

export async function GET() {
  try {
    const session = await auth();
    console.log(
      "GET /api/game/player - session:",
      session?.user?.id,
      session?.user?.email,
    );

    if (!session?.user?.id) {
      console.log("GET /api/game/player - no session, returning 401");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rows =
      await sql`SELECT * FROM players WHERE auth_user_id = ${String(session.user.id)} LIMIT 1`;
    console.log(
      "GET /api/game/player - found",
      rows.length,
      "players for auth_user_id",
      session.user.id,
    );

    if (rows.length === 0) return Response.json({ player: null });
    return Response.json({ player: rows[0] });
  } catch (err) {
    console.error("GET /api/game/player error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { username } = await request.json();
    if (!username)
      return Response.json({ error: "Username required" }, { status: 400 });

    // Check if player already exists for this auth user
    const existing =
      await sql`SELECT * FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (existing.length > 0) return Response.json({ player: existing[0] });

    // Check username availability
    const nameConflict =
      await sql`SELECT id FROM players WHERE username = ${username} LIMIT 1`;
    if (nameConflict.length > 0)
      return Response.json({ error: "Username taken" }, { status: 409 });

    // Create new player
    const newPlayer = await sql`
      INSERT INTO players (auth_user_id, username, email, hp, max_hp, xp, level, position_x, position_y, scrap_metal, bio_resin, data_seeds, attack, defense, mp, max_mp)
      VALUES (${session.user.id}, ${username}, ${session.user.email || username + "@seedslingers.world"}, 100, 100, 0, 1, 5, 5, 0, 0, 5, 10, 5, 50, 50)
      RETURNING *
    `;
    return Response.json({ player: newPlayer[0] });
  } catch (err) {
    console.error("POST /api/game/player error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const {
      xp_gained,
      hp_change,
      position_x,
      position_y,
      scrap_metal_delta,
      bio_resin_delta,
      data_seeds_delta,
    } = body;

    const rows =
      await sql`SELECT * FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (rows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });

    let player = rows[0];
    let newXP = player.xp + (xp_gained || 0);
    let newLevel = player.level;
    let newMaxHP = player.max_hp;
    let newAttack = player.attack;
    let newDefense = player.defense;
    let newMaxMP = player.max_mp;
    let leveledUp = false;
    const levelUpData = [];

    // Check for level ups
    while (newXP >= xpForLevel(newLevel)) {
      newXP -= xpForLevel(newLevel);
      newLevel++;
      const gains = statsForLevelUp();
      newMaxHP += gains.max_hp;
      newAttack += gains.attack;
      newDefense += gains.defense;
      newMaxMP += gains.max_mp;
      leveledUp = true;
      levelUpData.push({ level: newLevel, gains });
    }

    const newHP = Math.min(
      player.max_hp,
      Math.max(0, player.hp + (hp_change || 0)),
    );
    const newScrap = Math.max(0, player.scrap_metal + (scrap_metal_delta || 0));
    const newResin = Math.max(0, player.bio_resin + (bio_resin_delta || 0));
    const newSeeds = Math.max(0, player.data_seeds + (data_seeds_delta || 0));

    const updated = await sql`
      UPDATE players SET
        xp = ${newXP},
        level = ${newLevel},
        hp = ${newHP},
        max_hp = ${newMaxHP},
        attack = ${newAttack},
        defense = ${newDefense},
        max_mp = ${newMaxMP},
        scrap_metal = ${newScrap},
        bio_resin = ${newResin},
        data_seeds = ${newSeeds},
        position_x = ${position_x !== undefined ? position_x : player.position_x},
        position_y = ${position_y !== undefined ? position_y : player.position_y},
        last_active = NOW()
      WHERE auth_user_id = ${session.user.id}
      RETURNING *
    `;

    return Response.json({ player: updated[0], leveledUp, levelUpData });
  } catch (err) {
    console.error("PUT /api/game/player error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
