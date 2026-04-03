import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a party/guild
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { name } = body;

    if (!name || name.trim().length === 0) {
      return Response.json({ error: "Party name required" }, { status: 400 });
    }

    if (name.length > 50) {
      return Response.json(
        { error: "Party name too long (max 50 characters)" },
        { status: 400 },
      );
    }

    // Get player
    const playerRows =
      await sql`SELECT id, username FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Check if player is already in a party
    const existingMembership = await sql`
      SELECT p.id, p.name
      FROM parties p
      JOIN party_members pm ON pm.party_id = p.id
      WHERE pm.player_id = ${player.id}
    `;

    if (existingMembership.length > 0) {
      return Response.json(
        {
          error: `You are already in party "${existingMembership[0].name}". Leave first to create a new one.`,
        },
        { status: 400 },
      );
    }

    // Create party
    const party = await sql`
      INSERT INTO parties (name, leader_id)
      VALUES (${name.trim()}, ${player.id})
      RETURNING *
    `;

    // Add creator as member
    await sql`
      INSERT INTO party_members (party_id, player_id)
      VALUES (${party[0].id}, ${player.id})
    `;

    return Response.json({
      party_id: party[0].id,
      name: party[0].name,
      leader_id: party[0].leader_id,
      created_at: party[0].created_at,
    });
  } catch (err) {
    console.error("POST /api/multiplayer/party/create error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
