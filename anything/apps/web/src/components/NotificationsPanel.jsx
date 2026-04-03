"use client";
import { useState, useEffect } from "react";

export default function NotificationsPanel({
  onClose,
  onAcceptTrade,
  onAcceptDuel,
}) {
  const [notifications, setNotifications] = useState({
    trades: [],
    duels: [],
    friendRequests: [],
  });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
    setLoading(false);
  };

  const handleAcceptTrade = async (tradeId) => {
    try {
      const res = await fetch("/api/multiplayer/trade/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_id: tradeId, action: "accept" }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage("Trade accepted! Opening trade window...");
        setTimeout(() => setMessage(null), 2000);
        if (onAcceptTrade) {
          onAcceptTrade(data.trade);
        }
        fetchNotifications();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to accept trade");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Accept trade error:", err);
    }
  };

  const handleDeclineTrade = async (tradeId) => {
    try {
      const res = await fetch("/api/multiplayer/trade/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trade_id: tradeId, action: "decline" }),
      });

      if (res.ok) {
        setMessage("Trade declined");
        setTimeout(() => setMessage(null), 2000);
        fetchNotifications();
      }
    } catch (err) {
      console.error("Decline trade error:", err);
    }
  };

  const handleAcceptDuel = async (duelId) => {
    try {
      const res = await fetch("/api/multiplayer/duel/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duel_id: duelId, action: "accept" }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage("Duel accepted! Starting battle...");
        setTimeout(() => setMessage(null), 2000);
        if (onAcceptDuel) {
          onAcceptDuel(data.duel);
        }
        fetchNotifications();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to accept duel");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Accept duel error:", err);
    }
  };

  const handleDeclineDuel = async (duelId) => {
    try {
      const res = await fetch("/api/multiplayer/duel/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duel_id: duelId, action: "decline" }),
      });

      if (res.ok) {
        setMessage("Duel declined");
        setTimeout(() => setMessage(null), 2000);
        fetchNotifications();
      }
    } catch (err) {
      console.error("Decline duel error:", err);
    }
  };

  const handleAcceptFriend = async (friendshipId) => {
    try {
      const res = await fetch("/api/multiplayer/friend/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendship_id: friendshipId, action: "accept" }),
      });

      if (res.ok) {
        setMessage("Friend request accepted!");
        setTimeout(() => setMessage(null), 2000);
        fetchNotifications();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to accept friend request");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error("Accept friend error:", err);
    }
  };

  const handleDeclineFriend = async (friendshipId) => {
    try {
      const res = await fetch("/api/multiplayer/friend/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendship_id: friendshipId,
          action: "decline",
        }),
      });

      if (res.ok) {
        setMessage("Friend request declined");
        setTimeout(() => setMessage(null), 2000);
        fetchNotifications();
      }
    } catch (err) {
      console.error("Decline friend error:", err);
    }
  };

  const totalCount =
    notifications.trades.length +
    notifications.duels.length +
    notifications.friendRequests.length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-end p-4"
      onClick={onClose}
    >
      <div
        className="bg-black border-4 border-yellow-500 w-full max-w-md max-h-[80vh] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b-4 border-yellow-500 px-4 py-3 flex items-center justify-between shrink-0 bg-yellow-950">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❗</span>
            <div>
              <h2 className="font-jetbrains text-lg font-bold tracking-tighter text-yellow-400">
                Notifications
              </h2>
              <p className="font-jetbrains text-xs text-yellow-600">
                {totalCount} pending request{totalCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="font-jetbrains text-xs tracking-widest uppercase border border-yellow-700 px-3 py-1.5 text-yellow-400 hover:bg-yellow-900 transition-colors"
          >
            ✕
          </button>
        </div>

        {message && (
          <div className="border-b border-yellow-900 bg-yellow-950 px-4 py-2 font-jetbrains text-xs text-yellow-400 shrink-0">
            {message}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {loading ? (
            <p className="font-jetbrains text-xs text-neutral-500 text-center py-8">
              Loading...
            </p>
          ) : totalCount === 0 ? (
            <div className="text-center py-12">
              <p className="text-5xl mb-3">📭</p>
              <p className="font-jetbrains text-sm text-neutral-600">
                No pending notifications
              </p>
            </div>
          ) : (
            <>
              {/* Trade Requests */}
              {notifications.trades.length > 0 && (
                <div>
                  <h3 className="font-jetbrains text-xs tracking-widest uppercase text-emerald-400 mb-2">
                    Trade Requests ({notifications.trades.length})
                  </h3>
                  <div className="space-y-2">
                    {notifications.trades.map((trade) => (
                      <div
                        key={trade.id}
                        className="bg-emerald-950 border-2 border-emerald-700 p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-jetbrains text-sm text-emerald-300 font-bold">
                              🤝 Trade Request
                            </p>
                            <p className="font-jetbrains text-xs text-neutral-400">
                              from {trade.from}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptTrade(trade.id)}
                            className="flex-1 bg-emerald-600 text-white font-jetbrains text-xs tracking-widest uppercase px-3 py-2 hover:bg-emerald-500 transition-colors"
                          >
                            ACCEPT
                          </button>
                          <button
                            onClick={() => handleDeclineTrade(trade.id)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 text-neutral-400 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 hover:bg-neutral-800 transition-colors"
                          >
                            DECLINE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duel Challenges */}
              {notifications.duels.length > 0 && (
                <div>
                  <h3 className="font-jetbrains text-xs tracking-widest uppercase text-red-400 mb-2">
                    Duel Challenges ({notifications.duels.length})
                  </h3>
                  <div className="space-y-2">
                    {notifications.duels.map((duel) => (
                      <div
                        key={duel.id}
                        className="bg-red-950 border-2 border-red-700 p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-jetbrains text-sm text-red-300 font-bold">
                              ⚔️ Duel Challenge
                            </p>
                            <p className="font-jetbrains text-xs text-neutral-400">
                              from {duel.from}
                            </p>
                            {duel.wager_amount > 0 && (
                              <p className="font-jetbrains text-xs text-red-400 mt-1">
                                Wager: {duel.wager_amount}{" "}
                                {duel.wager_currency.replace(/_/g, " ")}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptDuel(duel.id)}
                            className="flex-1 bg-red-600 text-white font-jetbrains text-xs tracking-widest uppercase px-3 py-2 hover:bg-red-500 transition-colors"
                          >
                            ACCEPT
                          </button>
                          <button
                            onClick={() => handleDeclineDuel(duel.id)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 text-neutral-400 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 hover:bg-neutral-800 transition-colors"
                          >
                            DECLINE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Friend Requests */}
              {notifications.friendRequests.length > 0 && (
                <div>
                  <h3 className="font-jetbrains text-xs tracking-widest uppercase text-blue-400 mb-2">
                    Friend Requests ({notifications.friendRequests.length})
                  </h3>
                  <div className="space-y-2">
                    {notifications.friendRequests.map((friend) => (
                      <div
                        key={friend.id}
                        className="bg-blue-950 border-2 border-blue-700 p-3"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-jetbrains text-sm text-blue-300 font-bold">
                              👥 Friend Request
                            </p>
                            <p className="font-jetbrains text-xs text-neutral-400">
                              from {friend.from}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptFriend(friend.id)}
                            className="flex-1 bg-blue-600 text-white font-jetbrains text-xs tracking-widest uppercase px-3 py-2 hover:bg-blue-500 transition-colors"
                          >
                            ACCEPT
                          </button>
                          <button
                            onClick={() => handleDeclineFriend(friend.id)}
                            className="flex-1 bg-neutral-900 border border-neutral-700 text-neutral-400 font-jetbrains text-xs tracking-widest uppercase px-3 py-2 hover:bg-neutral-800 transition-colors"
                          >
                            DECLINE
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
