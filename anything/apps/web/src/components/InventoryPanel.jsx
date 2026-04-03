"use client";
import { useState, useEffect } from "react";

const TYPE_ICONS = {
  "Capture Device": "🌱",
  "Healing Item": "💊",
  "Crafting Material": "⚙️",
  "Staff Upgrade": "⚡",
  Trinket: "💎",
};
const TYPE_COLORS = {
  "Capture Device": "#4ade80",
  "Healing Item": "#f87171",
  "Crafting Material": "#fbbf24",
  "Staff Upgrade": "#a78bfa",
  Trinket: "#38bdf8",
};

export default function InventoryPanel({ onClose, onUseItem, playerData }) {
  const [inventory, setInventory] = useState([]);
  const [partySprouts, setPartySprouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("name"); // name | quantity | type
  const [searchQuery, setSearchQuery] = useState("");
  const [using, setUsing] = useState(null);
  const [message, setMessage] = useState(null);
  const [healTarget, setHealTarget] = useState(null);
  const [view, setView] = useState("inventory"); // "inventory" | "crafting"
  const [recipes, setRecipes] = useState([]);
  const [materials, setMaterials] = useState({});
  const [crafting, setCrafting] = useState(null);
  const [craftQuantities, setCraftQuantities] = useState({}); // Track quantity for each recipe
  const [craftInputValues, setCraftInputValues] = useState({}); // Track input display values

  useEffect(() => {
    fetchInventory();
    fetchPartySprouts();
    if (view === "crafting") fetchRecipes();
  }, [view]);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/game/inventory");
      if (res.ok) {
        const data = await res.json();
        setInventory(data.inventory || []);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const fetchPartySprouts = async () => {
    try {
      const res = await fetch("/api/game/sprouts");
      if (res.ok) {
        const data = await res.json();
        const party = (data.sprouts || []).filter((s) => s.party_slot);
        setPartySprouts(party);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRecipes = async () => {
    try {
      const res = await fetch("/api/game/craft");
      if (res.ok) {
        const data = await res.json();
        setRecipes(data.recipes || []);
        setMaterials(data.materials || {});
      }
    } catch (err) {
      console.error(err);
    }
  };

  const craftItem = async (recipeName) => {
    setCrafting(recipeName);
    const quantity = craftQuantities[recipeName] || 1;
    try {
      const res = await fetch("/api/game/craft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe_name: recipeName, quantity }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Crafted ${data.crafted} x${data.quantity}!`);
        setTimeout(() => setMessage(null), 2000);
        fetchRecipes();
        fetchInventory();
        setCraftQuantities((prev) => ({ ...prev, [recipeName]: 1 })); // Reset to 1
      } else {
        const err = await res.json();
        setMessage(err.error || "Crafting failed");
        setTimeout(() => setMessage(null), 2500);
      }
    } catch (err) {
      console.error(err);
    }
    setCrafting(null);
  };

  const updateCraftQuantity = (recipeName, delta) => {
    setCraftQuantities((prev) => {
      const current = prev[recipeName] || 1;
      const newValue = Math.max(1, Math.min(99, current + delta));
      setCraftInputValues((p) => ({ ...p, [recipeName]: String(newValue) }));
      return { ...prev, [recipeName]: newValue };
    });
  };

  const handleCraftInputChange = (recipeName, value) => {
    setCraftInputValues((p) => ({ ...p, [recipeName]: value }));
    if (value === "" || value === "0") {
      return; // Allow empty or zero temporarily
    }
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setCraftQuantities((prev) => ({
        ...prev,
        [recipeName]: Math.max(1, Math.min(99, numValue)),
      }));
    }
  };

  const handleCraftInputBlur = (recipeName) => {
    const value = craftInputValues[recipeName];
    if (value === "" || value === "0" || isNaN(parseInt(value))) {
      setCraftQuantities((p) => ({ ...p, [recipeName]: 1 }));
      setCraftInputValues((p) => ({ ...p, [recipeName]: "1" }));
    }
  };

  const setCraftQuantity = (recipeName, value) => {
    const numValue = parseInt(value) || 1;
    setCraftQuantities((prev) => ({
      ...prev,
      [recipeName]: Math.max(1, Math.min(99, numValue)),
    }));
  };

  const useItem = async (item, target = null) => {
    if (
      item.item_type === "Crafting Material" ||
      item.item_type === "Staff Upgrade"
    ) {
      setMessage("This item can only be used at a crafting station.");
      setTimeout(() => setMessage(null), 2500);
      return;
    }

    // If healing item, show target selection
    if (item.item_type === "Healing Item" && !target) {
      setUsing(item.id);
      return; // Wait for target selection
    }

    // Use the item on target
    setUsing(item.id);
    try {
      const res = await fetch("/api/game/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "use",
          item_id: item.id,
          target: target,
        }),
      });
      if (res.ok) {
        await fetchInventory();
        if (target !== "player") {
          await fetchPartySprouts(); // Refresh party HP
        }
        const effect =
          item.item_type === "Healing Item"
            ? { heal: item.item_name === "Mycelium Elixir" ? 80 : 30 }
            : null;
        setMessage(
          `Used ${item.item_name} on ${target === "player" ? "yourself" : "party member"}!`,
        );
        setTimeout(() => setMessage(null), 2000);
        if (onUseItem && effect && target === "player") onUseItem(item, effect);
      }
    } catch (err) {
      console.error(err);
    }
    setUsing(null);
    setHealTarget(null);
  };

  const types = [
    "All",
    "Healing Item",
    "Capture Device",
    "Crafting Material",
    "Staff Upgrade",
    "Trinket",
  ];

  // Enhanced filtering and sorting
  let filteredItems =
    filter === "All"
      ? inventory
      : inventory.filter((i) => i.item_type === filter);

  // Search filter
  if (searchQuery.trim()) {
    filteredItems = filteredItems.filter((item) =>
      item.item_name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }

  // Sorting
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (sortBy === "name") {
      return a.item_name.localeCompare(b.item_name);
    } else if (sortBy === "quantity") {
      return b.quantity - a.quantity;
    } else if (sortBy === "type") {
      return a.item_type.localeCompare(b.item_type);
    }
    return 0;
  });

  const totalItems = inventory.reduce((s, i) => s + i.quantity, 0);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.85)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      <div className="bg-black border-2 border-white w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="border-b-2 border-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-playfair text-3xl font-bold tracking-tighter text-white">
              {view === "inventory" ? "Pack" : "Crafting"}
            </h2>
            <p className="font-jetbrains text-xs text-neutral-400">
              {view === "inventory"
                ? `${totalItems} items total`
                : `${recipes.length} recipes`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-4 py-2 text-neutral-400 hover:border-white hover:text-white transition-colors"
          >
            CLOSE ✕
          </button>
        </div>

        {/* View tabs */}
        <div className="border-b-2 border-white flex shrink-0">
          <button
            onClick={() => setView("inventory")}
            className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-4 py-3 ${view === "inventory" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
          >
            📦 Inventory
          </button>
          <button
            onClick={() => setView("crafting")}
            className={`flex-1 font-jetbrains text-xs tracking-widest uppercase px-4 py-3 border-l-2 border-white ${view === "crafting" ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
          >
            🔨 Crafting
          </button>
        </div>

        {/* Resources strip */}
        {playerData && (
          <div className="border-b border-neutral-800 px-6 py-3 flex gap-4 shrink-0 bg-neutral-950 overflow-x-auto">
            {[
              {
                label: "Data-Seeds",
                value: playerData.data_seeds,
                icon: "🌱",
                color: "#4ade80",
              },
              {
                label: "Scrap Metal",
                value:
                  view === "crafting"
                    ? materials.scrap_metal
                    : playerData.scrap_metal,
                icon: "⚙️",
                color: "#fbbf24",
              },
              {
                label: "Bio-Resin",
                value:
                  view === "crafting"
                    ? materials.bio_resin
                    : playerData.bio_resin,
                icon: "🧪",
                color: "#a78bfa",
              },
            ].map((r) => (
              <div key={r.label} className="flex items-center gap-2 shrink-0">
                <span className="text-lg">{r.icon}</span>
                <div>
                  <p className="font-jetbrains text-[9px] text-neutral-500 uppercase tracking-wider">
                    {r.label}
                  </p>
                  <p
                    className="font-playfair text-xl font-bold"
                    style={{ color: r.color }}
                  >
                    {r.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {view === "inventory" && (
          <>
            {/* Filter tabs */}
            <div className="border-b border-neutral-900 flex shrink-0 overflow-x-auto">
              {types.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`font-jetbrains text-[10px] tracking-widest uppercase px-4 py-2.5 whitespace-nowrap border-r border-neutral-900 transition-colors ${filter === t ? "bg-white text-black" : "text-neutral-500 hover:text-white"}`}
                >
                  {t === "All" ? "All" : TYPE_ICONS[t] + " " + t.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Search and Sort Bar */}
            <div className="border-b border-neutral-900 bg-neutral-950 px-4 py-3 flex gap-3 shrink-0">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search items..."
                className="flex-1 bg-black border border-neutral-800 px-3 py-2 font-jetbrains text-xs text-white focus:border-white outline-none"
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-black border border-neutral-800 px-3 py-2 font-jetbrains text-xs text-white focus:border-white outline-none"
              >
                <option value="name">Sort: Name</option>
                <option value="quantity">Sort: Quantity</option>
                <option value="type">Sort: Type</option>
              </select>
            </div>

            {message && (
              <div className="border-b border-green-900 bg-green-950 px-6 py-2 font-jetbrains text-xs text-green-400 shrink-0">
                {message}
              </div>
            )}

            {/* Heal target selection */}
            {using && healTarget === null && (
              <div className="border-b border-blue-900 bg-blue-950 px-6 py-3 shrink-0">
                <p className="font-jetbrains text-xs text-blue-400 mb-2">
                  Select heal target:
                </p>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      const item = inventory.find((i) => i.id === using);
                      useItem(item, "player");
                    }}
                    className="font-jetbrains text-[10px] tracking-widest uppercase border border-blue-400 px-3 py-1.5 text-blue-400 hover:bg-blue-400 hover:text-black transition-colors"
                  >
                    YOURSELF ({playerData?.hp}/{playerData?.max_hp} HP)
                  </button>
                  {partySprouts.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        const item = inventory.find((i) => i.id === using);
                        useItem(item, s.id);
                      }}
                      className="font-jetbrains text-[10px] tracking-widest uppercase border border-green-400 px-3 py-1.5 text-green-400 hover:bg-green-400 hover:text-black transition-colors"
                    >
                      {(s.nickname || s.name).toUpperCase()} ({s.current_hp}/
                      {s.max_hp} HP)
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setUsing(null);
                      setHealTarget(null);
                    }}
                    className="font-jetbrains text-[10px] tracking-widest uppercase border border-neutral-700 px-3 py-1.5 text-neutral-500 hover:border-white hover:text-white transition-colors"
                  >
                    CANCEL
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <p className="font-jetbrains text-xs text-neutral-500">
                    LOADING...
                  </p>
                </div>
              ) : sortedItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-40 gap-3">
                  <p className="font-jetbrains text-sm text-neutral-500">
                    {searchQuery
                      ? "No items match your search."
                      : "Your pack is empty."}
                  </p>
                  {!searchQuery && (
                    <p className="font-jetbrains text-xs text-neutral-700">
                      Win battles to collect loot.
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  {sortedItems.map((item) => {
                    const color = TYPE_COLORS[item.item_type] || "#fff";
                    const icon = TYPE_ICONS[item.item_type] || "📦";
                    const canUse = item.item_type === "Healing Item";
                    return (
                      <div
                        key={item.id}
                        className="border border-neutral-800 hover:border-neutral-600 transition-colors flex items-center"
                      >
                        <div className="w-14 h-14 border-r border-neutral-800 flex items-center justify-center text-2xl shrink-0">
                          {icon}
                        </div>
                        <div className="flex-1 px-4 py-3">
                          <p className="font-jetbrains text-sm text-white font-bold">
                            {item.item_name}
                          </p>
                          <p
                            className="font-jetbrains text-[10px] tracking-widest uppercase mt-0.5"
                            style={{ color }}
                          >
                            {item.item_type}
                          </p>
                        </div>
                        <div className="px-4 text-right shrink-0">
                          <p className="font-playfair text-2xl font-bold text-white">
                            ×{item.quantity}
                          </p>
                        </div>
                        {canUse && (
                          <button
                            disabled={!!using}
                            onClick={() => useItem(item)}
                            className="border-l border-neutral-800 px-4 h-14 font-jetbrains text-xs tracking-widest uppercase text-neutral-400 hover:bg-white hover:text-black transition-colors disabled:opacity-40 shrink-0"
                          >
                            {using === item.id ? "..." : "USE"}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {view === "crafting" && (
          <>
            {message && (
              <div className="border-b border-green-900 bg-green-950 px-6 py-2 font-jetbrains text-xs text-green-400 shrink-0">
                {message}
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4">
              {recipes.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <p className="font-jetbrains text-xs text-neutral-500">
                    LOADING RECIPES...
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recipes.map((recipe) => {
                    const quantity = craftQuantities[recipe.name] || 1;
                    return (
                      <div
                        key={recipe.name}
                        className={`border ${recipe.canCraft ? "border-green-800" : "border-neutral-800"} p-4`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-jetbrains text-sm text-white font-bold">
                              {recipe.name}
                            </p>
                            <p className="font-jetbrains text-[10px] text-neutral-400 mt-1">
                              {recipe.description}
                            </p>
                          </div>
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className="font-jetbrains text-[10px] text-neutral-400 uppercase tracking-wider">
                            Quantity:
                          </span>
                          <button
                            onClick={() => updateCraftQuantity(recipe.name, -1)}
                            className="font-jetbrains text-xs border border-neutral-700 px-2 py-1 text-neutral-400 hover:border-white hover:text-white transition-colors"
                          >
                            −
                          </button>
                          <input
                            type="number"
                            min="1"
                            max="99"
                            value={craftInputValues[recipe.name] || quantity}
                            onChange={(e) =>
                              handleCraftInputChange(
                                recipe.name,
                                e.target.value,
                              )
                            }
                            onBlur={() => handleCraftInputBlur(recipe.name)}
                            className="w-16 bg-black border border-neutral-700 px-2 py-1 font-jetbrains text-xs text-white text-center focus:border-white outline-none"
                          />
                          <button
                            onClick={() => updateCraftQuantity(recipe.name, 1)}
                            className="font-jetbrains text-xs border border-neutral-700 px-2 py-1 text-neutral-400 hover:border-white hover:text-white transition-colors"
                          >
                            +
                          </button>
                          <button
                            disabled={
                              !recipe.canCraft || crafting === recipe.name
                            }
                            onClick={() => craftItem(recipe.name)}
                            className={`font-jetbrains text-xs tracking-widest uppercase px-4 py-2 ml-auto transition-colors ${recipe.canCraft ? "border border-green-400 text-green-400 hover:bg-green-400 hover:text-black" : "border border-neutral-800 text-neutral-700"} disabled:opacity-40`}
                          >
                            {crafting === recipe.name ? "..." : "CRAFT"}
                          </button>
                        </div>

                        <div className="flex gap-3 flex-wrap">
                          {Object.entries(recipe.materials).map(
                            ([mat, qty]) => {
                              const has = materials[mat] || 0;
                              const needed = qty * quantity;
                              const enough = has >= needed;
                              return (
                                <div
                                  key={mat}
                                  className={`font-jetbrains text-[10px] px-2 py-1 border ${enough ? "border-green-800 text-green-400" : "border-red-800 text-red-400"}`}
                                >
                                  {mat.replace(/_/g, " ").toUpperCase()}: {has}/
                                  {needed}
                                </div>
                              );
                            },
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        <div className="border-t border-neutral-900 px-6 py-3 shrink-0">
          <p className="font-jetbrains text-[10px] text-neutral-700">
            {view === "inventory"
              ? "Use search and sort to manage your inventory. Healing items restore HP for you or party members."
              : "Combine materials to craft powerful items. Collect rare materials from battles."}
          </p>
        </div>
      </div>
    </div>
  );
}
