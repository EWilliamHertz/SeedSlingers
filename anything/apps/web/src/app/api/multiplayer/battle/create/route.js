import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a new multiplayer battle
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { battle_type, enemy_species_ids } = body;

    // Get player
    const playerRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Create battle
    const battle = await sql`
      INSERT INTO multiplayer_battles (battle_type, status, battle_data)
      VALUES (${battle_type || "pve_coop"}, 'waiting', ${JSON.stringify({ enemy_species_ids: enemy_species_ids || [] })})
      RETURNING *
    `;

    // Add creator as participant
    await sql`
      INSERT INTO battle_participants (battle_id, player_id, team)
      VALUES (${battle[0].id}, ${player.id}, 'team_1')
    `;

    return Response.json({
      battle_id: battle[0].id,
      status: "waiting",
      message: "Battle lobby created! Share the ID with friends to join.",
    });
  } catch (err) {
    console.error("POST /api/multiplayer/battle/create error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
