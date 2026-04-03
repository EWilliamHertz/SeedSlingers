import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Accept or decline a friend request
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { friendship_id, action } = body;

    if (!friendship_id || !action) {
      return Response.json(
        { error: "Friendship ID and action are required" },
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

    // Get friendship
    const friendshipRows =
      await sql`SELECT * FROM friendships WHERE id = ${friendship_id} LIMIT 1`;
    if (friendshipRows.length === 0)
      return Response.json(
        { error: "Friend request not found" },
        { status: 404 },
      );
    const friendship = friendshipRows[0];

    // Must be the recipient
    if (friendship.friend_id !== player.id) {
      return Response.json(
        { error: "You are not the recipient of this friend request" },
        { status: 403 },
      );
    }

    // Must be pending
    if (friendship.status !== "pending") {
      return Response.json(
        { error: "Friend request is no longer pending" },
        { status: 400 },
      );
    }

    if (action === "accept") {
      await sql`
        UPDATE friendships
        SET status = 'accepted'
        WHERE id = ${friendship_id}
      `;
      return Response.json({
        success: true,
        message: "Friend request accepted!",
      });
    } else {
      // Decline - delete the friendship
      await sql`
        DELETE FROM friendships
        WHERE id = ${friendship_id}
      `;
      return Response.json({
        success: true,
        message: "Friend request declined",
      });
    }
  } catch (err) {
    console.error("POST /api/multiplayer/friend/respond error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
