import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Complete a duel and distribute winnings
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { duel_id, winner_id, battle_log } = body;

    if (!duel_id || !winner_id) {
      return Response.json(
        { error: "Duel ID and winner ID are required" },
        { status: 400 },
      );
    }

    // Get player
    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Get duel
    const duelRows =
      await sql`SELECT * FROM duel_challenges WHERE id = ${duel_id} LIMIT 1`;
    if (duelRows.length === 0)
      return Response.json({ error: "Duel not found" }, { status: 404 });
    const duel = duelRows[0];

    // Must be part of duel
    if (duel.challenger_id !== player.id && duel.opponent_id !== player.id) {
      return Response.json(
        { error: "You are not part of this duel" },
        { status: 403 },
      );
    }

    // Must be accepted
    if (duel.status !== "accepted") {
      return Response.json(
        { error: "Duel is not in accepted state" },
        { status: 400 },
      );
    }

    // Winner must be challenger or opponent
    if (winner_id !== duel.challenger_id && winner_id !== duel.opponent_id) {
      return Response.json({ error: "Invalid winner ID" }, { status: 400 });
    }

    const loser_id =
      winner_id === duel.challenger_id ? duel.opponent_id : duel.challenger_id;

    // Execute wager transfer and mark duel complete
    if (duel.wager_amount > 0) {
      const winnerField = duel.wager_currency;
      const totalWinnings = duel.wager_amount * 2; // Winner gets both wagers

      await sql.transaction([
        // Deduct wager from both players
        sql`
          UPDATE players
          SET ${sql(winnerField)} = ${sql(winnerField)} - ${duel.wager_amount}
          WHERE id IN (${duel.challenger_id}, ${duel.opponent_id})
        `,
        // Award total to winner
        sql`
          UPDATE players
          SET ${sql(winnerField)} = ${sql(winnerField)} + ${totalWinnings}
          WHERE id = ${winner_id}
        `,
        // Mark duel complete
        sql`
          UPDATE duel_challenges
          SET status = 'completed',
              winner_id = ${winner_id},
              battle_log = ${JSON.stringify(battle_log || {})},
              completed_at = NOW()
          WHERE id = ${duel_id}
        `,
      ]);
    } else {
      // No wager, just mark complete
      await sql`
        UPDATE duel_challenges
        SET status = 'completed',
            winner_id = ${winner_id},
            battle_log = ${JSON.stringify(battle_log || {})},
            completed_at = NOW()
        WHERE id = ${duel_id}
      `;
    }

    return Response.json({
      success: true,
      winner_id,
      message:
        duel.wager_amount > 0
          ? `Duel complete! Winner received ${duel.wager_amount * 2} ${duel.wager_currency}!`
          : "Duel complete!",
    });
  } catch (err) {
    console.error("POST /api/multiplayer/duel/complete error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
