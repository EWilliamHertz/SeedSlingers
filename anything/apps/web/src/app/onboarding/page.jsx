"use client";
import { useState, useEffect } from "react";
import useUser from "@/utils/useUser";

export default function OnboardingPage() {
  const { data: user, loading } = useUser();
  const [username, setUsername] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [readyToCheck, setReadyToCheck] = useState(false);

  useEffect(() => {
    // Wait 1 second before checking auth to let session fully establish
    const timer = setTimeout(() => setReadyToCheck(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const pending = localStorage.getItem("pendingUsername");
      if (pending) setUsername(pending);
    }
  }, []);

  useEffect(() => {
    // Only redirect if we're ready to check AND loading is done AND no user
    if (readyToCheck && !loading && !user) {
      window.location.href = "/account/signin";
    }
  }, [user, loading, readyToCheck]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const name = username.trim();
    if (name.length < 3) {
      setError("Username must be at least 3 characters");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/game/player", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "Username taken")
          setError("That callsign is already taken. Choose another.");
        else setError(data.error || "Something went wrong");
        setSubmitting(false);
        return;
      }
      if (typeof window !== "undefined")
        localStorage.removeItem("pendingUsername");
      window.location.href = "/game";
    } catch (err) {
      console.error(err);
      setError("Connection failed. Try again.");
      setSubmitting(false);
    }
  };

  // Show loading while auth establishes or we're waiting to check
  if (loading || !readyToCheck) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <style>{`@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap'); .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>
        <p className="font-jetbrains text-white text-xs tracking-widest uppercase">
          LOADING...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-5xl font-bold tracking-tighter text-white mb-2">
            SEEDSLINGERS
          </h1>
          <p className="font-jetbrains text-xs tracking-[0.3em] uppercase text-neutral-500">
            Choose Your Callsign
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="border-2 border-white bg-black"
        >
          <div className="border-b-2 border-white px-6 py-4">
            <h2 className="font-playfair text-2xl font-bold text-white tracking-tight">
              Enter the Wilds
            </h2>
            <p className="font-jetbrains text-xs text-neutral-400 mt-1">
              Your callsign is your identity in the Reclaimed World
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div className="text-center py-8 border border-neutral-800">
              <div className="text-6xl mb-4">🌿</div>
              <p className="font-jetbrains text-xs text-neutral-400">
                A new Slinger awakens...
              </p>
            </div>

            <div>
              <label className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400 block mb-1">
                Your Callsign
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength={20}
                placeholder="e.g. VineRunner, SolarFox..."
                className="w-full bg-neutral-900 border-2 border-neutral-700 text-white font-jetbrains text-sm px-4 py-3 focus:border-white outline-none placeholder-neutral-600"
              />
              <p className="font-jetbrains text-[10px] text-neutral-600 mt-1">
                Letters, numbers, and underscores only. Shown to other players.
              </p>
            </div>

            {error && (
              <div className="border border-red-500 bg-red-950 px-4 py-3">
                <p className="font-jetbrains text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-white text-black font-jetbrains text-sm tracking-widest uppercase py-4 hover:bg-neutral-200 transition-colors disabled:opacity-40"
            >
              {submitting ? "INITIALIZING..." : "BEGIN JOURNEY"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
