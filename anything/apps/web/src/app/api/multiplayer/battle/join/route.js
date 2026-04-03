import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Join an existing battle
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { battle_id } = body;

    // Validate battle_id
    if (!battle_id) {
      console.error("Missing battle_id in request body:", body);
      return Response.json({ error: "battle_id is required" }, { status: 400 });
    }

    // Get player
    const playerRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0) {
      console.error("Player not found for auth_user_id:", session.user.id);
      return Response.json(
        { error: "Player not found. Please complete onboarding first." },
        { status: 404 },
      );
    }
    const player = playerRows[0];

    // Check if battle exists and is waiting
    const battle =
      await sql`SELECT * FROM multiplayer_battles WHERE id = ${battle_id} LIMIT 1`;
    if (battle.length === 0) {
      console.error("Battle not found:", battle_id);
      return Response.json({ error: "Battle not found" }, { status: 404 });
    }

    if (battle[0].status !== "waiting") {
      return Response.json(
        { error: "Battle already started or ended" },
        { status: 400 },
      );
    }

    // Check if player already joined
    const existing =
      await sql`SELECT * FROM battle_participants WHERE battle_id = ${battle_id} AND player_id = ${player.id}`;
    if (existing.length > 0) {
      return Response.json(
        { error: "You already joined this battle" },
        { status: 400 },
      );
    }

    // Add player to battle
    await sql`
      INSERT INTO battle_participants (battle_id, player_id, team)
      VALUES (${battle_id}, ${player.id}, 'team_1')
    `;

    // Get all participants
    const participants = await sql`
      SELECT bp.*, p.username
      FROM battle_participants bp
      JOIN players p ON p.id = bp.player_id
      WHERE bp.battle_id = ${battle_id}
    `;

    return Response.json({
      success: true,
      battle_id: battle_id,
      participants: participants.map((p) => ({
        player_id: p.player_id,
        username: p.username,
        team: p.team,
      })),
    });
  } catch (err) {
    console.error("POST /api/multiplayer/battle/join error:", err);
    return Response.json(
      { error: "Server error: " + err.message },
      { status: 500 },
    );
  }
}
