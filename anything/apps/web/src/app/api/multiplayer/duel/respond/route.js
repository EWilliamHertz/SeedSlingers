import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Accept or decline a duel challenge
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { duel_id, action } = body;

    if (!duel_id || !action) {
      return Response.json(
        { error: "Duel ID and action are required" },
        { status: 400 },
      );
    }

    if (!["accept", "decline"].includes(action)) {
      return Response.json({ error: "Invalid action" }, { status: 400 });
    }

    // Get player
    const playerRows =
      await sql`SELECT * FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Get duel
    const duelRows =
      await sql`SELECT * FROM duel_challenges WHERE id = ${duel_id} LIMIT 1`;
    if (duelRows.length === 0)
      return Response.json({ error: "Duel not found" }, { status: 404 });
    const duel = duelRows[0];

    // Must be the opponent
    if (duel.opponent_id !== player.id) {
      return Response.json(
        { error: "You are not the opponent of this duel" },
        { status: 403 },
      );
    }

    // Duel must be pending
    if (duel.status !== "pending") {
      return Response.json(
        { error: "Duel is no longer pending" },
        { status: 400 },
      );
    }

    if (action === "decline") {
      await sql`
        UPDATE duel_challenges
        SET status = 'declined'
        WHERE id = ${duel_id}
      `;
      return Response.json({
        success: true,
        message: "Duel declined",
      });
    }

    // Accept - check if opponent has enough currency for wager
    if (duel.wager_amount > 0) {
      const opponentAmount = player[duel.wager_currency] || 0;
      if (opponentAmount < duel.wager_amount) {
        return Response.json(
          {
            error: `You don't have enough ${duel.wager_currency} for this wager`,
          },
          { status: 400 },
        );
      }

      // Also recheck challenger has enough
      const challengerRows =
        await sql`SELECT * FROM players WHERE id = ${duel.challenger_id} LIMIT 1`;
      const challenger = challengerRows[0];
      const challengerAmount = challenger[duel.wager_currency] || 0;
      if (challengerAmount < duel.wager_amount) {
        return Response.json(
          { error: "Challenger no longer has enough currency for the wager" },
          { status: 400 },
        );
      }
    }

    // Update to accepted (battle can start)
    await sql`
      UPDATE duel_challenges
      SET status = 'accepted'
      WHERE id = ${duel_id}
    `;

    return Response.json({
      success: true,
      duel_id: duel_id,
      message: "Duel accepted! Battle will begin shortly.",
    });
  } catch (err) {
    console.error("POST /api/multiplayer/duel/respond error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
