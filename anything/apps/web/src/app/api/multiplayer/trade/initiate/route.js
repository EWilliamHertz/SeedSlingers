import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Initiate a trade with another player
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { recipient_username } = body;

    if (!recipient_username) {
      return Response.json(
        { error: "Recipient username is required" },
        { status: 400 },
      );
    }

    // Get initiator player
    const initiatorRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (initiatorRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const initiator = initiatorRows[0];

    // Get recipient player
    const recipientRows =
      await sql`SELECT id, username FROM players WHERE username = ${recipient_username} LIMIT 1`;
    if (recipientRows.length === 0)
      return Response.json(
        { error: "Recipient player not found" },
        { status: 404 },
      );
    const recipient = recipientRows[0];

    // Can't trade with yourself
    if (initiator.id === recipient.id) {
      return Response.json(
        { error: "Cannot trade with yourself" },
        { status: 400 },
      );
    }

    // Check for existing pending/active trade
    const existingTrade = await sql`
      SELECT * FROM trade_sessions 
      WHERE (
        (initiator_id = ${initiator.id} AND recipient_id = ${recipient.id}) OR
        (initiator_id = ${recipient.id} AND recipient_id = ${initiator.id})
      )
      AND status IN ('pending', 'active')
      LIMIT 1
    `;

    if (existingTrade.length > 0) {
      return Response.json(
        { error: "A trade is already in progress with this player" },
        { status: 400 },
      );
    }

    // Create trade session
    const newTrade = await sql`
      INSERT INTO trade_sessions (initiator_id, recipient_id)
      VALUES (${initiator.id}, ${recipient.id})
      RETURNING *
    `;

    return Response.json({
      success: true,
      trade: newTrade[0],
      message: `Trade request sent to ${recipient.username}`,
    });
  } catch (err) {
    console.error("POST /api/multiplayer/trade/initiate error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
