import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get all pending notifications for the current player
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const playerRows = await sql`
      SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1
    `;
    if (playerRows.length === 0) {
      return Response.json({ error: "Player not found" }, { status: 404 });
    }
    const player = playerRows[0];

    // Get pending trades (where I'm the recipient)
    const trades = await sql`
      SELECT 
        t.id,
        t.status,
        t.created_at,
        p.username as initiator_username
      FROM trade_sessions t
      JOIN players p ON p.id = t.initiator_id
      WHERE t.recipient_id = ${player.id}
        AND t.status = 'pending'
      ORDER BY t.created_at DESC
    `;

    // Get pending duels (where I'm the opponent)
    const duels = await sql`
      SELECT 
        d.id,
        d.status,
        d.wager_currency,
        d.wager_amount,
        d.created_at,
        p.username as challenger_username
      FROM duel_challenges d
      JOIN players p ON p.id = d.challenger_id
      WHERE d.opponent_id = ${player.id}
        AND d.status = 'pending'
      ORDER BY d.created_at DESC
    `;

    // Get pending friend requests (where I'm the friend being requested)
    const friendRequests = await sql`
      SELECT 
        f.id,
        f.status,
        f.created_at,
        p.username as requester_username
      FROM friendships f
      JOIN players p ON p.id = f.player_id
      WHERE f.friend_id = ${player.id}
        AND f.status = 'pending'
      ORDER BY f.created_at DESC
    `;

    const totalCount = trades.length + duels.length + friendRequests.length;

    return Response.json({
      count: totalCount,
      notifications: {
        trades: trades.map((t) => ({
          id: t.id,
          type: "trade",
          from: t.initiator_username,
          created_at: t.created_at,
        })),
        duels: duels.map((d) => ({
          id: d.id,
          type: "duel",
          from: d.challenger_username,
          wager_currency: d.wager_currency,
          wager_amount: d.wager_amount,
          created_at: d.created_at,
        })),
        friendRequests: friendRequests.map((f) => ({
          id: f.id,
          type: "friend",
          from: f.requester_username,
          created_at: f.created_at,
        })),
      },
    });
  } catch (err) {
    console.error("GET /api/notifications error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
