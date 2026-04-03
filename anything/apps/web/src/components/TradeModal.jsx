"use client";
import { useState, useEffect } from "react";

export default function TradeModal({ trade, onClose, playerInventory }) {
  const [myOffer, setMyOffer] = useState([]);
  const [theirOffer, setTheirOffer] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [offerQuantity, setOfferQuantity] = useState(1);
  const [isReady, setIsReady] = useState(false);
  const [theirReady, setTheirReady] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Poll trade status
  useEffect(() => {
    if (!trade?.id) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/multiplayer/trade/status?trade_id=${trade.id}`,
        );
        if (res.ok) {
          const data = await res.json();
          if (data.trade.status === "completed") {
            setMessage("Trade completed successfully!");
            setTimeout(() => onClose(), 2000);
          } else if (
            data.trade.status === "cancelled" ||
            data.trade.status === "declined"
          ) {
            setMessage("Trade was cancelled");
            setTimeout(() => onClose(), 2000);
          } else {
            // Update offers and ready status
            setTheirOffer(
              trade.initiator_id === trade.my_player_id
                ? data.trade.recipient_offer || []
                : data.trade.initiator_offer || [],
            );
            setTheirReady(
              trade.initiator_id === trade.my_player_id
                ? data.trade.recipient_ready
                : data.trade.initiator_ready,
            );
          }
        }
      } catch (err) {
        console.error("Poll trade error:", err);
      }
    }, 2000);

    return () => clearInterval(pollInterval);
  }, [trade, onClose]);

  const addToOffer = () => {
    if (!selectedItem) return;

    const existing = myOffer.find(
      (i) => i.item_name === selectedItem.item_name,
    );
    const maxQuantity = selectedItem.quantity;

    if (existing) {
      const newQty = Math.min(existing.quantity + offerQuantity, maxQuantity);
      setMyOffer(
        myOffer.map((i) =>
          i.item_name === selectedItem.item_name
            ? { ...i, quantity: newQty }
            : i,
        ),
      );
    } else {
      setMyOffer([
        ...myOffer,
        {
          item_name: selectedItem.item_name,
          item_type: selectedItem.item_type,
          quantity: Math.min(offerQuantity, maxQuantity),
        },
      ]);
    }

    setSelectedItem(null);
    setOfferQuantity(1);
  };

  const removeFromOffer = (itemName) => {
    setMyOffer(myOffer.filter((i) => i.item_name !== itemName));
  };

  const updateOffer = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/trade/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trade_id: trade.id,
          items: myOffer,
        }),
      });

      if (res.ok) {
        setMessage("Offer updated");
        setIsReady(false);
        setTimeout(() => setMessage(null), 2000);
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to update offer");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const confirmTrade = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/trade/ready", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_id: trade.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setIsReady(true);
        setMessage(data.message);
        if (data.completed) {
          setTimeout(() => onClose(), 2000);
        } else {
          setTimeout(() => setMessage(null), 3000);
        }
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to confirm trade");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const cancelTrade = async () => {
    if (!confirm("Cancel this trade?")) return;

    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/trade/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_id: trade.id }),
      });

      if (res.ok) {
        setMessage("Trade cancelled");
        setTimeout(() => onClose(), 1000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      <div className="bg-black border-4 border-emerald-500 w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b-4 border-emerald-500 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-playfair text-3xl font-bold tracking-tighter text-emerald-400">
              Trading with {trade?.partner_username}
            </h2>
            <p className="font-jetbrains text-xs text-neutral-500">
              Add items and confirm when ready
            </p>
          </div>
          <button
            onClick={cancelTrade}
            disabled={loading}
            className="font-jetbrains text-xs tracking-widest uppercase border border-red-500 px-4 py-2 text-red-400 hover:bg-red-900 transition-colors"
          >
            CANCEL TRADE
          </button>
        </div>

        {message && (
          <div className="border-b border-emerald-900 bg-emerald-950 px-6 py-2 font-jetbrains text-xs text-emerald-400 shrink-0">
            {message}
          </div>
        )}

        {/* Trade window */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Your offer */}
            <div className="border-2 border-emerald-700 p-4">
              <h3 className="font-jetbrains text-sm tracking-widest uppercase text-emerald-400 mb-3">
                Your Offer{" "}
                {isReady && <span className="text-green-500">✓ READY</span>}
              </h3>

              {/* Inventory selector */}
              <div className="mb-4 space-y-2">
                <select
                  value={selectedItem?.item_name || ""}
                  onChange={(e) => {
                    const item = playerInventory.find(
                      (i) => i.item_name === e.target.value,
                    );
                    setSelectedItem(item);
                  }}
                  className="w-full bg-black border border-emerald-800 px-3 py-2 font-jetbrains text-xs text-emerald-300 focus:border-emerald-500 outline-none"
                >
                  <option value="">Select item...</option>
                  {playerInventory.map((item) => (
                    <option key={item.item_name} value={item.item_name}>
                      {item.item_name} (x{item.quantity})
                    </option>
                  ))}
                </select>

                {selectedItem && (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={offerQuantity}
                      onChange={(e) =>
                        setOfferQuantity(
                          Math.min(
                            Math.max(1, parseInt(e.target.value) || 1),
                            selectedItem.quantity,
                          ),
                        )
                      }
                      min="1"
                      max={selectedItem.quantity}
                      className="flex-1 bg-black border border-emerald-800 px-3 py-2 font-jetbrains text-xs text-emerald-300 focus:border-emerald-500 outline-none"
                    />
                    <button
                      onClick={addToOffer}
                      className="bg-emerald-700 text-white font-jetbrains text-xs tracking-widest uppercase px-4 py-2 hover:bg-emerald-600 transition-colors"
                    >
                      ADD
                    </button>
                  </div>
                )}
              </div>

              {/* Current offer */}
              <div className="space-y-2 mb-4 min-h-[150px]">
                {myOffer.length === 0 ? (
                  <p className="font-jetbrains text-xs text-neutral-600 text-center py-8">
                    No items offered yet
                  </p>
                ) : (
                  myOffer.map((item) => (
                    <div
                      key={item.item_name}
                      className="bg-emerald-950 border border-emerald-900 p-2 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-jetbrains text-xs text-emerald-300">
                          {item.item_name}
                        </p>
                        <p className="font-jetbrains text-[10px] text-neutral-500">
                          x{item.quantity}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromOffer(item.item_name)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>

              <button
                onClick={updateOffer}
                disabled={loading || myOffer.length === 0}
                className="w-full bg-emerald-700 text-white font-jetbrains text-xs tracking-widest uppercase px-4 py-2 hover:bg-emerald-600 transition-colors disabled:opacity-40"
              >
                UPDATE OFFER
              </button>
            </div>

            {/* Their offer */}
            <div className="border-2 border-blue-700 p-4">
              <h3 className="font-jetbrains text-sm tracking-widest uppercase text-blue-400 mb-3">
                Their Offer{" "}
                {theirReady && <span className="text-green-500">✓ READY</span>}
              </h3>

              <div className="space-y-2 min-h-[300px]">
                {theirOffer.length === 0 ? (
                  <p className="font-jetbrains text-xs text-neutral-600 text-center py-8">
                    Waiting for their offer...
                  </p>
                ) : (
                  theirOffer.map((item) => (
                    <div
                      key={item.item_name}
                      className="bg-blue-950 border border-blue-900 p-2"
                    >
                      <p className="font-jetbrains text-xs text-blue-300">
                        {item.item_name}
                      </p>
                      <p className="font-jetbrains text-[10px] text-neutral-500">
                        x{item.quantity}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t-4 border-emerald-500 px-6 py-4 shrink-0">
          <button
            onClick={confirmTrade}
            disabled={loading || isReady || myOffer.length === 0}
            className="w-full bg-emerald-600 text-white font-jetbrains text-sm tracking-widest uppercase px-6 py-4 hover:bg-emerald-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isReady ? "WAITING FOR PARTNER..." : "CONFIRM TRADE"}
          </button>
        </div>
      </div>
    </div>
  );
}
