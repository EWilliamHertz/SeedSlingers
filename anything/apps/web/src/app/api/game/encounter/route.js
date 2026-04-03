import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("count") || "1", 10);
    const requestedCount = Math.min(Math.max(count, 1), 3); // Max 3 enemies

    // Get random Sprout species
    const sprouts = await sql`
      SELECT * FROM sprout_species
      ORDER BY RANDOM()
      LIMIT ${requestedCount}
    `;

    if (sprouts.length === 0) {
      return Response.json(
        { error: "No Sprout species found" },
        { status: 404 },
      );
    }

    return Response.json({
      sprouts: sprouts,
      count: sprouts.length,
    });
  } catch (error) {
    console.error("Error fetching encounter:", error);
    return Response.json(
      { error: "Failed to generate encounter" },
      { status: 500 },
    );
  }
}
