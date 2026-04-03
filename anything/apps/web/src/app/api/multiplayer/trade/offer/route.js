import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Add or update items in your trade offer
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { trade_id, items } = body;

    if (!trade_id || !Array.isArray(items)) {
      return Response.json(
        { error: "Trade ID and items array are required" },
        { status: 400 },
      );
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

    // Must be active
    if (trade.status !== "active") {
      return Response.json({ error: "Trade is not active" }, { status: 400 });
    }

    // Determine if player is initiator or recipient
    const isInitiator = trade.initiator_id === player.id;
    const isRecipient = trade.recipient_id === player.id;

    if (!isInitiator && !isRecipient) {
      return Response.json(
        { error: "You are not part of this trade" },
        { status: 403 },
      );
    }

    // Validate items belong to player
    for (const item of items) {
      const inventoryRows = await sql`
        SELECT quantity FROM inventory
        WHERE player_id = ${player.id}
          AND item_name = ${item.item_name}
        LIMIT 1
      `;

      if (
        inventoryRows.length === 0 ||
        inventoryRows[0].quantity < item.quantity
      ) {
        return Response.json(
          { error: `You don't have enough ${item.item_name}` },
          { status: 400 },
        );
      }
    }

    // Update offer and reset ready status
    if (isInitiator) {
      await sql`
        UPDATE trade_sessions
        SET initiator_offer = ${JSON.stringify(items)},
            initiator_ready = FALSE,
            recipient_ready = FALSE
        WHERE id = ${trade_id}
      `;
    } else {
      await sql`
        UPDATE trade_sessions
        SET recipient_offer = ${JSON.stringify(items)},
            initiator_ready = FALSE,
            recipient_ready = FALSE
        WHERE id = ${trade_id}
      `;
    }

    return Response.json({
      success: true,
      message: "Offer updated",
    });
  } catch (err) {
    console.error("POST /api/multiplayer/trade/offer error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
