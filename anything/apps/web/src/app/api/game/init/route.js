import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const { username } = await request.json();

    // Check if player already exists
    const existingPlayer = await sql`
      SELECT * FROM players WHERE username = ${username}
    `;

    if (existingPlayer.length > 0) {
      return Response.json({ player: existingPlayer[0] });
    }

    // Create new player with default stats
    const newPlayer = await sql`
      INSERT INTO players (
        username,
        email,
        hp,
        max_hp,
        xp,
        level,
        position_x,
        position_y,
        scrap_metal,
        bio_resin,
        data_seeds
      )
      VALUES (
        ${username},
        ${username.toLowerCase() + "@seedslingers.world"},
        100,
        100,
        0,
        1,
        5,
        5,
        0,
        0,
        5
      )
      RETURNING *
    `;

    return Response.json({ player: newPlayer[0] });
  } catch (error) {
    console.error("Error initializing player:", error);
    return Response.json(
      { error: "Failed to initialize player" },
      { status: 500 },
    );
  }
}
