import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Update player position and get nearby players
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { position_x, position_y, current_activity } = body;

    // Get player
    const playerRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Update or insert online status
    const existing =
      await sql`SELECT * FROM online_players WHERE player_id = ${player.id}`;
    if (existing.length > 0) {
      await sql`
        UPDATE online_players
        SET position_x = ${position_x}, 
            position_y = ${position_y}, 
            current_activity = ${current_activity || "exploring"},
            last_heartbeat = NOW()
        WHERE player_id = ${player.id}
      `;
    } else {
      await sql`
        INSERT INTO online_players (player_id, position_x, position_y, current_activity)
        VALUES (${player.id}, ${position_x}, ${position_y}, ${current_activity || "exploring"})
      `;
    }

    // Clean up stale players (offline for > 30 seconds)
    await sql`
      DELETE FROM online_players 
      WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'
    `;

    // Get nearby players (within 15 tiles)
    const nearbyPlayers = await sql`
      SELECT 
        op.player_id,
        p.username,
        op.position_x,
        op.position_y,
        op.current_activity
      FROM online_players op
      JOIN players p ON p.id = op.player_id
      WHERE op.player_id != ${player.id}
        AND ABS(op.position_x - ${position_x}) <= 15
        AND ABS(op.position_y - ${position_y}) <= 15
    `;

    return Response.json({
      success: true,
      nearbyPlayers: nearbyPlayers.map((p) => ({
        id: p.player_id,
        username: p.username,
        x: p.position_x,
        y: p.position_y,
        activity: p.current_activity,
      })),
    });
  } catch (err) {
    console.error("POST /api/multiplayer/heartbeat error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
