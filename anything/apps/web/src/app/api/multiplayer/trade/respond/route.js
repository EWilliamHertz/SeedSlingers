import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Accept or decline a trade request
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { trade_id, action } = body;

    if (!trade_id || !action) {
      return Response.json(
        { error: "Trade ID and action are required" },
        { status: 400 },
      );
    }

    if (!["accept", "decline"].includes(action)) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
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

    // Must be the recipient
    if (trade.recipient_id !== player.id) {
      return Response.json(
        { error: "You are not the recipient of this trade" },
        { status: 403 },
      );
    }

    // Trade must be pending
    if (trade.status !== "pending") {
      return Response.json(
        { error: "Trade is no longer pending" },
        { status: 400 },
      );
    }

    if (action === "accept") {
      await sql`
        UPDATE trade_sessions
        SET status = 'active'
        WHERE id = ${trade_id}
      `;
      return Response.json({
        success: true,
        message: "Trade accepted! You can now add items.",
      });
    } else {
      await sql`
        UPDATE trade_sessions
        SET status = 'declined'
        WHERE id = ${trade_id}
      `;
      return Response.json({
        success: true,
        message: "Trade declined",
      });
    }
  } catch (err) {
    console.error("POST /api/multiplayer/trade/respond error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
