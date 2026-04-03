import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get friends and pending friend requests
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get player
    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Get all friendships (sent and received)
    const friendships = await sql`
      SELECT 
        f.*,
        p1.username as player_username,
        p2.username as friend_username,
        p1.level as player_level,
        p2.level as friend_level
      FROM friendships f
      JOIN players p1 ON p1.id = f.player_id
      JOIN players p2 ON p2.id = f.friend_id
      WHERE (f.player_id = ${player.id} OR f.friend_id = ${player.id})
      ORDER BY f.created_at DESC
    `;

    // Categorize friendships
    const friends = [];
    const pending_sent = [];
    const pending_received = [];

    for (const f of friendships) {
      if (f.status === "accepted") {
        // Add as friend, determining which is the other person
        const isSender = f.player_id === player.id;
        friends.push({
          id: f.id,
          username: isSender ? f.friend_username : f.player_username,
          level: isSender ? f.friend_level : f.player_level,
          player_id: isSender ? f.friend_id : f.player_id,
        });
      } else if (f.status === "pending") {
        if (f.player_id === player.id) {
          // Sent by you
          pending_sent.push({
            id: f.id,
            username: f.friend_username,
            level: f.friend_level,
            player_id: f.friend_id,
          });
        } else {
          // Received by you
          pending_received.push({
            id: f.id,
            username: f.player_username,
            level: f.player_level,
            player_id: f.player_id,
          });
        }
      }
    }

    return Response.json({
      success: true,
      friends,
      pending_sent,
      pending_received,
    });
  } catch (err) {
    console.error("GET /api/multiplayer/friend/list error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
