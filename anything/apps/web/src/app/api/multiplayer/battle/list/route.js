import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// List available battles
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get waiting battles with participant count
    const battles = await sql`
      SELECT 
        mb.id,
        mb.battle_type,
        mb.status,
        mb.created_at,
        COUNT(bp.player_id) as player_count
      FROM multiplayer_battles mb
      LEFT JOIN battle_participants bp ON bp.battle_id = mb.id
      WHERE mb.status = 'waiting'
        AND mb.created_at > NOW() - INTERVAL '10 minutes'
      GROUP BY mb.id, mb.battle_type, mb.status, mb.created_at
      ORDER BY mb.created_at DESC
      LIMIT 20
    `;

    return Response.json({
      battles: battles.map((b) => ({
        id: b.id,
        battle_type: b.battle_type,
        player_count: parseInt(b.player_count),
        created_at: b.created_at,
      })),
    });
  } catch (err) {
    console.error("GET /api/multiplayer/battle/list error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
