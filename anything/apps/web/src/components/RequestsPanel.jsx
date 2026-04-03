"use client";
import { useState, useEffect } from "react";

export default function RequestsPanel({ onClose, onAcceptTrade }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [pendingTrades, setPendingTrades] = useState([]);
  const [pendingDuels, setPendingDuels] = useState([]);
  const [pendingFriends, setPendingFriends] = useState([]);
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    loadRequests();
    const interval = setInterval(loadRequests, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadRequests = async () => {
    try {
      // Load friend requests and friends list
      const friendRes = await fetch("/api/multiplayer/friend/list");
      if (friendRes.ok) {
        const friendData = await friendRes.json();
        setPendingFriends(friendData.pending_received || []);
        setFriends(friendData.friends || []);
      }

      // Note: Trade and duel requests would need polling endpoints
      // For now, they're initiated directly via player interaction
    } catch (err) {
      console.error("Failed to load requests:", err);
    }
  };

  const respondToFriend = async (friendshipId, action) => {
    setLoading(true);
    try {
      const res = await fetch("/api/multiplayer/friend/respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendship_id: friendshipId,
          action,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessage(data.message);
        setTimeout(() => setMessage(null), 2000);
        loadRequests();
      } else {
        const err = await res.json();
        setMessage(err.error || "Failed to respond");
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

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
              Requests & Friends
            </h2>
            <p className="font-jetbrains text-xs text-neutral-400">
              Manage your social connections
            </p>
          </div>
          <button
            onClick={onClose}
            className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-4 py-2 text-neutral-400 hover:border-white hover:text-white transition-colors"
          >
            CLOSE ✕
          </button>
        </div>

        {message && (
          <div className="border-b border-blue-900 bg-blue-950 px-6 py-2 font-jetbrains text-xs text-blue-400 shrink-0">
            {message}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Pending Friend Requests */}
          <div className="mb-6">
            <h3 className="font-jetbrains text-sm tracking-widest uppercase text-white mb-3">
              Friend Requests ({pendingFriends.length})
            </h3>
            {pendingFriends.length === 0 ? (
              <p className="font-jetbrains text-xs text-neutral-500 text-center py-4 border border-neutral-800">
                No pending friend requests
              </p>
            ) : (
              <div className="space-y-2">
                {pendingFriends.map((req) => (
                  <div
                    key={req.id}
                    className="bg-blue-950 border border-blue-800 p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-jetbrains text-sm text-blue-300">
                        {req.username}
                      </p>
                      <p className="font-jetbrains text-[10px] text-neutral-500">
                        Level {req.level}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => respondToFriend(req.id, "accept")}
                        disabled={loading}
                        className="bg-green-700 text-white font-jetbrains text-xs tracking-widest uppercase px-3 py-1.5 hover:bg-green-600 transition-colors disabled:opacity-40"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => respondToFriend(req.id, "decline")}
                        disabled={loading}
                        className="bg-red-700 text-white font-jetbrains text-xs tracking-widest uppercase px-3 py-1.5 hover:bg-red-600 transition-colors disabled:opacity-40"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Friends List */}
          <div>
            <h3 className="font-jetbrains text-sm tracking-widest uppercase text-white mb-3">
              Friends ({friends.length})
            </h3>
            {friends.length === 0 ? (
              <p className="font-jetbrains text-xs text-neutral-500 text-center py-4 border border-neutral-800">
                No friends yet. Find players in the world!
              </p>
            ) : (
              <div className="space-y-2">
                {friends.map((friend) => (
                  <div
                    key={friend.id}
                    className="bg-neutral-900 border border-neutral-800 p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-jetbrains text-sm text-white">
                        {friend.username}
                      </p>
                      <p className="font-jetbrains text-[10px] text-neutral-500">
                        Level {friend.level}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="bg-neutral-800 text-neutral-400 font-jetbrains text-xs tracking-widest uppercase px-3 py-1.5 hover:bg-neutral-700 transition-colors"
                        title="Coming soon"
                      >
                        MESSAGE
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-900 px-6 py-3 shrink-0">
          <p className="font-jetbrains text-[10px] text-neutral-700">
            Click on players in the world to send trade, duel, or friend
            requests!
          </p>
        </div>
      </div>
    </div>
  );
}
