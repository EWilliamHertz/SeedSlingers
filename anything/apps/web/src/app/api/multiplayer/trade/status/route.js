import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get trade status (for polling)
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const trade_id = url.searchParams.get("trade_id");

    if (!trade_id) {
      return Response.json({ error: "Trade ID is required" }, { status: 400 });
    }

    // Get player
    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Get trade
    const tradeRows = await sql`
      SELECT 
        ts.*,
        p1.username as initiator_username,
        p2.username as recipient_username
      FROM trade_sessions ts
      JOIN players p1 ON p1.id = ts.initiator_id
      JOIN players p2 ON p2.id = ts.recipient_id
      WHERE ts.id = ${trade_id}
      LIMIT 1
    `;

    if (tradeRows.length === 0)
      return Response.json({ error: "Trade not found" }, { status: 404 });

    const trade = tradeRows[0];

    // Must be part of trade
    if (trade.initiator_id !== player.id && trade.recipient_id !== player.id) {
      return Response.json(
        { error: "You are not part of this trade" },
        { status: 403 },
      );
    }

    return Response.json({
      success: true,
      trade,
    });
  } catch (err) {
    console.error("GET /api/multiplayer/trade/status error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
