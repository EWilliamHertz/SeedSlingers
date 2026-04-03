import sql from "@/app/api/utils/sql";
import { auth } from "@/auth";

// Crafting recipes
const RECIPES = {
  "Health Potion": {
    materials: { bio_resin: 3, scrap_metal: 1 },
    output: {
      item_name: "Health Potion",
      item_type: "Healing Item",
      quantity: 1,
    },
    description: "Restores 30 HP",
  },
  "Mycelium Elixir": {
    materials: { bio_resin: 8, scrap_metal: 3, fungal_spore: 2 },
    output: {
      item_name: "Mycelium Elixir",
      item_type: "Healing Item",
      quantity: 1,
    },
    description: "Restores 80 HP",
  },
  "Solar Tonic": {
    materials: { bio_resin: 5, solar_essence: 3 },
    output: {
      item_name: "Solar Tonic",
      item_type: "Healing Item",
      quantity: 1,
    },
    description: "Restores 50 HP + 20 MP",
  },
  "Aqua Salve": {
    materials: { bio_resin: 6, aqua_crystal: 2 },
    output: { item_name: "Aqua Salve", item_type: "Healing Item", quantity: 1 },
    description: "Restores 60 HP",
  },
  "Reinforced Armor": {
    materials: { scrap_metal: 10, mineral_shard: 5 },
    output: {
      item_name: "Reinforced Armor",
      item_type: "Trinket",
      quantity: 1,
    },
    description: "+10 Defense",
  },
  "Data Core Processor": {
    materials: { scrap_metal: 8, data_core: 3 },
    output: {
      item_name: "Data Core Processor",
      item_type: "Trinket",
      quantity: 1,
    },
    description: "+15 Attack",
  },
  "Speed Boots": {
    materials: { bio_resin: 7, aqua_crystal: 2, scrap_metal: 5 },
    output: { item_name: "Speed Boots", item_type: "Trinket", quantity: 1 },
    description: "+5 Speed",
  },
};

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const playerRows =
      await sql`SELECT * FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];

    // Get inventory to check material items
    const inventory =
      await sql`SELECT * FROM inventory WHERE player_id = ${player.id}`;

    // Build available materials from player resources + inventory
    const materials = {
      scrap_metal: player.scrap_metal || 0,
      bio_resin: player.bio_resin || 0,
    };

    // Add special materials from inventory
    inventory.forEach((item) => {
      if (item.item_type === "Crafting Material") {
        materials[item.item_name.toLowerCase().replace(/\s+/g, "_")] =
          item.quantity || 0;
      }
    });

    // Check which recipes are craftable
    const recipesWithStatus = Object.entries(RECIPES).map(([name, recipe]) => {
      const canCraft = Object.entries(recipe.materials).every(
        ([mat, required]) => (materials[mat] || 0) >= required,
      );
      return {
        name,
        ...recipe,
        canCraft,
      };
    });

    return Response.json({ recipes: recipesWithStatus, materials });
  } catch (err) {
    console.error("GET /api/game/craft error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return Response.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { recipe_name, quantity = 1 } = body;

    // Validate quantity
    const craftQuantity = Math.max(1, Math.min(quantity, 99)); // Between 1 and 99

    const playerRows =
      await sql`SELECT * FROM players WHERE auth_user_id = ${session.user.id} LIMIT 1`;
    if (playerRows.length === 0)
      return Response.json({ error: "Player not found" }, { status: 404 });
    const player = playerRows[0];
    const playerId = player.id;

    const recipe = RECIPES[recipe_name];
    if (!recipe)
      return Response.json({ error: "Recipe not found" }, { status: 404 });

    // Get inventory for material items
    const inventory =
      await sql`SELECT * FROM inventory WHERE player_id = ${playerId}`;

    // Build current materials
    const materials = {
      scrap_metal: player.scrap_metal || 0,
      bio_resin: player.bio_resin || 0,
    };
    inventory.forEach((item) => {
      if (item.item_type === "Crafting Material") {
        materials[item.item_name.toLowerCase().replace(/\s+/g, "_")] =
          item.quantity || 0;
      }
    });

    // Check if player has enough materials for the quantity
    for (const [mat, required] of Object.entries(recipe.materials)) {
      const totalRequired = required * craftQuantity;
      if ((materials[mat] || 0) < totalRequired) {
        return Response.json(
          {
            error: `Not enough ${mat.replace(/_/g, " ")} (need ${totalRequired}, have ${materials[mat] || 0})`,
          },
          { status: 400 },
        );
      }
    }

    // Consume materials (multiply by quantity)
    const playerUpdates = {};
    for (const [mat, required] of Object.entries(recipe.materials)) {
      const totalRequired = required * craftQuantity;
      if (mat === "scrap_metal" || mat === "bio_resin") {
        playerUpdates[mat] = materials[mat] - totalRequired;
      } else {
        // Deduct from inventory
        const invItem = inventory.find(
          (i) =>
            i.item_name.toLowerCase().replace(/\s+/g, "_") === mat &&
            i.item_type === "Crafting Material",
        );
        if (invItem) {
          if (invItem.quantity <= totalRequired) {
            await sql`DELETE FROM inventory WHERE id = ${invItem.id}`;
          } else {
            await sql`UPDATE inventory SET quantity = quantity - ${totalRequired} WHERE id = ${invItem.id}`;
          }
        }
      }
    }

    // Update player resources
    if (playerUpdates.scrap_metal !== undefined) {
      await sql`UPDATE players SET scrap_metal = ${playerUpdates.scrap_metal} WHERE id = ${playerId}`;
    }
    if (playerUpdates.bio_resin !== undefined) {
      await sql`UPDATE players SET bio_resin = ${playerUpdates.bio_resin} WHERE id = ${playerId}`;
    }

    // Add crafted items to inventory (multiply output by quantity)
    const totalOutput = (recipe.output.quantity || 1) * craftQuantity;
    const existing =
      await sql`SELECT * FROM inventory WHERE player_id = ${playerId} AND item_name = ${recipe.output.item_name} LIMIT 1`;
    if (existing.length > 0) {
      await sql`UPDATE inventory SET quantity = quantity + ${totalOutput} WHERE id = ${existing[0].id}`;
    } else {
      await sql`
        INSERT INTO inventory (player_id, item_type, item_name, quantity)
        VALUES (${playerId}, ${recipe.output.item_type}, ${recipe.output.item_name}, ${totalOutput})
      `;
    }

    return Response.json({
      success: true,
      crafted: recipe.output.item_name,
      quantity: totalOutput,
    });
  } catch (err) {
    console.error("POST /api/game/craft error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}
