import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0) return Response.json({ inventory: [] });

    const playerId = playerRows[0].id;
    const inventory = await sql`
      SELECT * FROM inventory WHERE player_id = ${playerId} ORDER BY item_type, item_name
    `;
    return Response.json({ inventory });
  } catch (err) {
    console.error("GET /api/game/inventory error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { action, item_name, item_type, quantity, metadata } = body;

    const playerRows =
      await sql`SELECT id FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const playerId = playerRows[0].id;

    if (action === "add") {
      // Check if item already exists
      const existing =
        await sql`SELECT * FROM inventory WHERE player_id = ${playerId} AND item_name = ${item_name} LIMIT 1`;
      if (existing.length > 0) {
        const updated = await sql`
          UPDATE inventory SET quantity = quantity + ${quantity || 1} WHERE id = ${existing[0].id} RETURNING *
        `;
        return Response.json({ item: updated[0] });
      }
      const newItem = await sql`
        INSERT INTO inventory (player_id, item_type, item_name, quantity, metadata)
        VALUES (${playerId}, ${item_type}, ${item_name}, ${quantity || 1}, ${metadata ? JSON.stringify(metadata) : null})
        RETURNING *
      `;
      return Response.json({ item: newItem[0] });
    }

    if (action === "use") {
      const { item_id, target } = body; // target = 'player' or sprout.id
      const itemRows =
        await sql`SELECT * FROM inventory WHERE id = ${item_id} AND player_id = ${playerId}`;
      if (itemRows.length === 0)
        return Response.json({ error: "Item not found" }, { status: 404 });
      const item = itemRows[0];

      // Apply healing effect if healing item
      if (item.item_type === "Healing Item" && target) {
        const healAmount = item.item_name === "Mycelium Elixir" ? 80 : 30;

        if (target === "player") {
          // Heal player
          await sql`UPDATE players SET hp = LEAST(hp + ${healAmount}, max_hp) WHERE id = ${playerId}`;
        } else {
          // Heal party sprout
          await sql`
            UPDATE player_sprouts 
            SET current_hp = LEAST(current_hp + ${healAmount}, max_hp) 
            WHERE id = ${target} AND player_id = ${playerId}
          `;
        }
      }

      // Consume item
      if (item.quantity <= 1) {
        await sql`DELETE FROM inventory WHERE id = ${item_id}`;
      } else {
        await sql`UPDATE inventory SET quantity = quantity - 1 WHERE id = ${item_id}`;
      }
      return Response.json({ success: true, item_name: item.item_name });
    }

    return Response.json({ error: "Unknown action" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/game/inventory error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
