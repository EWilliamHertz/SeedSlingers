import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Create a duel challenge
export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { opponent_username, wager_currency, wager_amount } = body;

    if (!opponent_username) {
      return Response.json(
        { error: "Opponent username is required" },
        { status: 400 },
      );
    }

    const wagerAmt = parseInt(wager_amount) || 0;
    const wagerCur = wager_currency || "scrap_metal";

    if (wagerAmt < 0) {
      return Response.json(
        { error: "Wager amount cannot be negative" },
        { status: 400 },
      );
    }

    // Get challenger
    const challengerRows =
      await sql`SELECT * FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (challengerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const challenger = challengerRows[0];

    // Get opponent
    const opponentRows =
      await sql`SELECT * FROM players WHERE username = ${opponent_username} LIMIT 1`;
    if (opponentRows.length === 0)
      return Response.json(
        { error: "Opponent player not found" },
        { status: 404 },
      );
    const opponent = opponentRows[0];

    // Can't duel yourself
    if (challenger.id === opponent.id) {
      return Response.json({ error: "Cannot duel yourself" }, { status: 400 });
    }

    // Check if challenger has enough currency for wager
    if (wagerAmt > 0) {
      const challengerAmount = challenger[wagerCur] || 0;
      if (challengerAmount < wagerAmt) {
        return Response.json(
          { error: `You don't have enough ${wagerCur} for this wager` },
          { status: 400 },
        );
      }
    }

    // Check for existing pending duel
    const existingDuel = await sql`
      SELECT * FROM duel_challenges
      WHERE (
        (challenger_id = ${challenger.id} AND opponent_id = ${opponent.id}) OR
        (challenger_id = ${opponent.id} AND opponent_id = ${challenger.id})
      )
      AND status = 'pending'
      LIMIT 1
    `;

    if (existingDuel.length > 0) {
      return Response.json(
        { error: "A duel challenge is already pending with this player" },
        { status: 400 },
      );
    }

    // Create duel challenge
    const newDuel = await sql`
      INSERT INTO duel_challenges (
        challenger_id, 
        opponent_id, 
        wager_currency, 
        wager_amount
      )
      VALUES (
        ${challenger.id}, 
        ${opponent.id}, 
        ${wagerCur}, 
        ${wagerAmt}
      )
      RETURNING *
    `;

    return Response.json({
      success: true,
      duel: newDuel[0],
      message: `Duel challenge sent to ${opponent.username}${wagerAmt > 0 ? ` with a wager of ${wagerAmt} ${wagerCur}` : ""}!`,
    });
  } catch (err) {
    console.error("POST /api/multiplayer/duel/challenge error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
