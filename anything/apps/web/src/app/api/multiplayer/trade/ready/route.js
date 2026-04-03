import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Mark yourself as ready, execute trade if both ready
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

    // Must be active
    if (trade.status !== "active") {
      return Response.json({ error: "Trade is not active" }, { status: 400 });
    }

    const isInitiator = trade.initiator_id === player.id;
    const isRecipient = trade.recipient_id === player.id;

    if (!isInitiator && !isRecipient) {
      return Response.json(
        { error: "You are not part of this trade" },
        { status: 403 },
      );
    }

    // Mark player as ready
    if (isInitiator) {
      await sql`
        UPDATE trade_sessions
        SET initiator_ready = TRUE
        WHERE id = ${trade_id}
      `;
    } else {
      await sql`
        UPDATE trade_sessions
        SET recipient_ready = TRUE
        WHERE id = ${trade_id}
      `;
    }

    // Fetch updated trade
    const updatedTradeRows =
      await sql`SELECT * FROM trade_sessions WHERE id = ${trade_id} LIMIT 1`;
    const updatedTrade = updatedTradeRows[0];

    // If both ready, execute trade
    if (updatedTrade.initiator_ready && updatedTrade.recipient_ready) {
      const initiatorOffer = updatedTrade.initiator_offer || [];
      const recipientOffer = updatedTrade.recipient_offer || [];

      // Execute trade in transaction
      await sql.transaction([
        // Remove items from initiator
        ...initiatorOffer.map(
          (item) => sql`
          UPDATE inventory
          SET quantity = quantity - ${item.quantity}
          WHERE player_id = ${updatedTrade.initiator_id}
            AND item_name = ${item.item_name}
        `,
        ),
        // Add items to recipient
        ...initiatorOffer.map(
          (item) => sql`
          INSERT INTO inventory (player_id, item_type, item_name, quantity)
          VALUES (${updatedTrade.recipient_id}, ${item.item_type}, ${item.item_name}, ${item.quantity})
          ON CONFLICT (player_id, item_name) 
          DO UPDATE SET quantity = inventory.quantity + ${item.quantity}
        `,
        ),
        // Remove items from recipient
        ...recipientOffer.map(
          (item) => sql`
          UPDATE inventory
          SET quantity = quantity - ${item.quantity}
          WHERE player_id = ${updatedTrade.recipient_id}
            AND item_name = ${item.item_name}
        `,
        ),
        // Add items to initiator
        ...recipientOffer.map(
          (item) => sql`
          INSERT INTO inventory (player_id, item_type, item_name, quantity)
          VALUES (${updatedTrade.initiator_id}, ${item.item_type}, ${item.item_name}, ${item.quantity})
          ON CONFLICT (player_id, item_name)
          DO UPDATE SET quantity = inventory.quantity + ${item.quantity}
        `,
        ),
        // Clean up zero quantity items
        sql`DELETE FROM inventory WHERE quantity <= 0`,
        // Mark trade complete
        sql`
          UPDATE trade_sessions
          SET status = 'completed', completed_at = NOW()
          WHERE id = ${trade_id}
        `,
      ]);

      return Response.json({
        success: true,
        completed: true,
        message: "Trade completed successfully!",
      });
    }

    return Response.json({
      success: true,
      completed: false,
      message: "Waiting for other player to accept...",
    });
  } catch (err) {
    console.error("POST /api/multiplayer/trade/ready error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
