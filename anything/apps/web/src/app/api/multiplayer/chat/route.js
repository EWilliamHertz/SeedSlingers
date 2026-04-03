import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get recent chat messages
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const url = new URL(request.url);
    const channel = url.searchParams.get("channel") || "global";
    const limit = parseInt(url.searchParams.get("limit") || "50");
    const since = url.searchParams.get("since"); // ISO timestamp

    let messages;
    if (since) {
      messages = await sql`
        SELECT id, sender_id, sender_username, channel, message, created_at
        FROM chat_messages
        WHERE channel = ${channel}
          AND created_at > ${since}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      messages = await sql`
        SELECT id, sender_id, sender_username, channel, message, created_at
        FROM chat_messages
        WHERE channel = ${channel}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return Response.json({
      messages: messages.reverse().map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        username: m.sender_username,
        message: m.message,
        timestamp: m.created_at,
      })),
    });
  } catch (err) {
    console.error("GET /api/multiplayer/chat error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// Send a chat message
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { message, channel } = body;

    if (!message || message.trim().length === 0) {
      return Response.json(
        { error: "Message cannot be empty" },
        { status: 400 },
      );
    }

    if (message.length > 500) {
      return Response.json(
        { error: "Message too long (max 500 characters)" },
        { status: 400 },
      );
    }

    // Get player
    const playerRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Insert message
    const newMessage = await sql`
      INSERT INTO chat_messages (sender_id, sender_username, channel, message)
      VALUES (${player.id}, ${player.username}, ${channel || "global"}, ${message.trim()})
      RETURNING *
    `;

    // Clean up old messages (keep last 1000 per channel)
    await sql`
      DELETE FROM chat_messages
      WHERE id IN (
        SELECT id FROM chat_messages
        WHERE channel = ${channel || "global"}
        ORDER BY created_at DESC
        OFFSET 1000
      )
    `;

    return Response.json({
      success: true,
      message: {
        id: newMessage[0].id,
        senderId: newMessage[0].sender_id,
        username: newMessage[0].sender_username,
        message: newMessage[0].message,
        timestamp: newMessage[0].created_at,
      },
    });
  } catch (err) {
    console.error("POST /api/multiplayer/chat error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
