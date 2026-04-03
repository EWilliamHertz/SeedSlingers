import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Send a friend request
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { friend_username } = body;

    if (!friend_username) {
      return Response.json(
        { error: "Friend username is required" },
        { status: 400 },
      );
    }

    // Get player
    const playerRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Get friend
    const friendRows =
      await sql`SELECT id, username FROM players WHERE username = ${friend_username} LIMIT 1`;
    if (friendRows.length === 0)
      return Response.json(
        { error: "Friend player not found" },
        { status: 404 },
      );
    const friend = friendRows[0];

    // Can't befriend yourself
    if (player.id === friend.id) {
      return Response.json(
        { error: "Cannot add yourself as a friend" },
        { status: 400 },
      );
    }

    // Check for existing friendship
    const existingFriendship = await sql`
      SELECT * FROM friendships
      WHERE (
        (player_id = ${player.id} AND friend_id = ${friend.id}) OR
        (player_id = ${friend.id} AND friend_id = ${player.id})
      )
      LIMIT 1
    `;

    if (existingFriendship.length > 0) {
      const status = existingFriendship[0].status;
      if (status === "accepted") {
        return Response.json(
          { error: "You are already friends" },
          { status: 400 },
        );
      } else if (status === "pending") {
        return Response.json(
          { error: "A friend request is already pending" },
          { status: 400 },
        );
      } else if (status === "blocked") {
        return Response.json(
          { error: "Cannot send friend request" },
          { status: 400 },
        );
      }
    }

    // Create friend request
    const newFriendship = await sql`
      INSERT INTO friendships (player_id, friend_id, status)
      VALUES (${player.id}, ${friend.id}, 'pending')
      RETURNING *
    `;

    return Response.json({
      success: true,
      friendship: newFriendship[0],
      message: `Friend request sent to ${friend.username}`,
    });
  } catch (err) {
    console.error("POST /api/multiplayer/friend/request error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
