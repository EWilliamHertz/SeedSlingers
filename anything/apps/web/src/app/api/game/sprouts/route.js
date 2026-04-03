import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// GET - list all player sprouts with species info
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0) return Response.json({ sprouts: [] });

    const playerId = playerRows[0].id;
    const sprouts = await sql`
      SELECT ps.*, ss.name, ss.element, ss.rarity, ss.description, ss.base_hp, ss.base_attack, ss.base_speed
      FROM player_sprouts ps
      JOIN sprout_species ss ON ps.species_id = ss.id
      WHERE ps.player_id = ${playerId}
      ORDER BY ps.party_slot NULLS LAST, ps.captured_at DESC
    `;

    return Response.json({ sprouts });
  } catch (err) {
    console.error("GET /api/game/sprouts error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// POST - capture a sprout or set party slot
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const playerId = playerRows[0].id;

    if (action === "capture") {
      const {
        species_id,
        nickname,
        current_hp,
        max_hp,
        attack,
        speed,
        defense,
        element,
      } = body;

      const newSprout = await sql`
        INSERT INTO player_sprouts (player_id, species_id, nickname, current_hp, max_hp, attack, speed, defense, element, xp, level)
        VALUES (${playerId}, ${species_id}, ${nickname || null}, ${current_hp}, ${max_hp}, ${attack}, ${speed}, ${defense || 5}, ${element || null}, 0, 1)
        RETURNING *
      `;
      return Response.json({ sprout: newSprout[0] });
    }

    if (action === "set_party") {
      const { sprout_id, party_slot } = body; // party_slot = 1|2|3|null

      // Clear the slot first if assigning
      if (party_slot !== null) {
        await sql`UPDATE player_sprouts SET party_slot = NULL WHERE player_id = ${playerId} AND party_slot = ${party_slot}`;
      }
      // Clear sprout's existing slot
      await sql`UPDATE player_sprouts SET party_slot = NULL WHERE id = ${sprout_id} AND player_id = ${playerId}`;
      // Set new slot
      if (party_slot !== null) {
        await sql`UPDATE player_sprouts SET party_slot = ${party_slot} WHERE id = ${sprout_id} AND player_id = ${playerId}`;
      }

      return Response.json({ success: true });
    }

    if (action === "gain_xp") {
      const { sprout_id, xp_gained } = body;
      const sproutRows =
        await sql`SELECT * FROM player_sprouts WHERE id = ${sprout_id} AND player_id = ${playerId}`;
      if (sproutRows.length === 0)
        return Response.json({ error: "Sprout not found" }, { status: 404 });

      let sprout = sproutRows[0];
      let newXP = sprout.xp + xp_gained;
      let newLevel = sprout.level;
      let newMaxHP = sprout.max_hp;
      let newAttack = sprout.attack;

      while (newXP >= newLevel * 80) {
        newXP -= newLevel * 80;
        newLevel++;
        newMaxHP += 8;
        newAttack += 3;
      }

      const updated = await sql`
        UPDATE player_sprouts SET xp = ${newXP}, level = ${newLevel}, max_hp = ${newMaxHP}, attack = ${newAttack}
        WHERE id = ${sprout_id} AND player_id = ${playerId}
        RETURNING *
      `;
      return Response.json({ sprout: updated[0] });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/game/sprouts error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
