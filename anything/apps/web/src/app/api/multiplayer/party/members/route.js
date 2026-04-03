import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Get party members
export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get player
    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Get player's party
    const membership = await sql`
      SELECT pm.party_id, p.name, p.leader_id, p.created_at
      FROM party_members pm
      JOIN parties p ON p.id = pm.party_id
      WHERE pm.player_id = ${player.id}
      LIMIT 1
    `;

    if (membership.length === 0) {
      return Response.json({ party: null, members: [] });
    }

    const party = membership[0];

    // Get all members
    const members = await sql`
      SELECT pm.player_id, pm.joined_at, pl.username, pl.level, pl.hp, pl.max_hp
      FROM party_members pm
      JOIN players pl ON pl.id = pm.player_id
      WHERE pm.party_id = ${party.party_id}
      ORDER BY pm.joined_at ASC
    `;

    return Response.json({
      party: {
        id: party.party_id,
        name: party.name,
        leader_id: party.leader_id,
        created_at: party.created_at,
      },
      members: members.map((m) => ({
        player_id: m.player_id,
        username: m.username,
        level: m.level,
        hp: m.hp,
        max_hp: m.max_hp,
        joined_at: m.joined_at,
        is_leader: m.player_id === party.leader_id,
      })),
    });
  } catch (err) {
    console.error("GET /api/multiplayer/party/members error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

// Leave party
export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    // Get player
    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Remove from party
    const deleted = await sql`
      DELETE FROM party_members
      WHERE player_id = ${player.id}
      RETURNING party_id
    `;

    if (deleted.length === 0) {
      return Response.json(
        { error: "You are not in a party" },
        { status: 400 },
      );
    }

    const party_id = deleted[0].party_id;

    // Check if party is now empty
    const remaining = await sql`
      SELECT COUNT(*) as count FROM party_members WHERE party_id = ${party_id}
    `;

    if (parseInt(remaining[0].count) === 0) {
      // Delete empty party
      await sql`DELETE FROM parties WHERE id = ${party_id}`;
    }

    return Response.json({ success: true, message: "Left the party" });
  } catch (err) {
    console.error("DELETE /api/multiplayer/party/members error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
