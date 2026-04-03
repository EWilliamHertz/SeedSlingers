import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Cancel a trade
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { trade_id } = body;

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
    const tradeRows =
      await sql`SELECT * FROM trade_sessions WHERE id = ${trade_id} LIMIT 1`;
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

    // Can't cancel completed trades
    if (trade.status === "completed") {
      return Response.json(
        { error: "Cannot cancel completed trade" },
        { status: 400 },
      );
    }

    await sql`
      UPDATE trade_sessions
      SET status = 'cancelled'
      WHERE id = ${trade_id}
    `;

    return Response.json({
      success: true,
      message: "Trade cancelled",
    });
  } catch (err) {
    console.error("POST /api/multiplayer/trade/cancel error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
