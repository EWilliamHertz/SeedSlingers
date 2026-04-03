import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Invite player to party
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { party_id, target_username } = body;

    // Get current player
    const playerRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Check if current player is in the party
    const membership = await sql`
      SELECT * FROM party_members
      WHERE party_id = ${party_id} AND player_id = ${player.id}
    `;

    if (membership.length === 0) {
      return Response.json(
        { error: "You are not in this party" },
        { status: 403 },
      );
    }

    // Find target player
    const targetRows =
      await sql`SELECT id, username FROM players WHERE LOWER(username) = LOWER(${target_username}) LIMIT 1`;
    if (targetRows.length === 0) {
      return Response.json(
        { error: `Player "${target_username}" not found` },
        { status: 404 },
      );
    }
    const target = targetRows[0];

    // Check if target is already in a party
    const targetMembership = await sql`
      SELECT pm.party_id, p.name
      FROM party_members pm
      JOIN parties p ON p.id = pm.party_id
      WHERE pm.player_id = ${target.id}
    `;

    if (targetMembership.length > 0) {
      return Response.json(
        {
          error: `${target.username} is already in party "${targetMembership[0].name}"`,
        },
        { status: 400 },
      );
    }

    // Add to party
    await sql`
      INSERT INTO party_members (party_id, player_id)
      VALUES (${party_id}, ${target.id})
    `;

    return Response.json({
      success: true,
      message: `${target.username} joined the party!`,
    });
  } catch (err) {
    console.error("POST /api/multiplayer/party/invite error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
