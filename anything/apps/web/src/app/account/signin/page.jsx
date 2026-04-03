"use client";
import { useState } from "react";
import useAuth from "@/utils/useAuth";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { signInWithCredentials } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      await signInWithCredentials({
        email,
        password,
        callbackUrl: "/game",
        redirect: true,
      });
    } catch (err) {
      setError("Incorrect email or password. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-playfair text-5xl font-bold tracking-tighter text-white mb-2">
            SEEDSLINGERS
          </h1>
          <p className="font-jetbrains text-xs tracking-[0.3em] uppercase text-neutral-500">
            Solarpunk MMORPG
          </p>
        </div>

        <form onSubmit={onSubmit} className="border-2 border-white bg-black">
          <div className="border-b-2 border-white px-6 py-4">
            <h2 className="font-playfair text-2xl font-bold text-white tracking-tight">
              Sign In
            </h2>
            <p className="font-jetbrains text-xs text-neutral-400 mt-1">
              Return to the Reclaimed Wilds
            </p>
          </div>

          <div className="p-6 space-y-4">
            <div>
              <label className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400 block mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full bg-neutral-900 border-2 border-neutral-700 text-white font-jetbrains text-sm px-4 py-3 focus:border-white outline-none placeholder-neutral-600"
              />
            </div>
            <div>
              <label className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400 block mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full bg-neutral-900 border-2 border-neutral-700 text-white font-jetbrains text-sm px-4 py-3 focus:border-white outline-none placeholder-neutral-600"
              />
            </div>

            {error && (
              <div className="border border-red-500 bg-red-950 px-4 py-3">
                <p className="font-jetbrains text-xs text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-jetbrains text-sm tracking-widest uppercase py-4 hover:bg-neutral-200 transition-colors disabled:opacity-40"
            >
              {loading ? "CONNECTING..." : "ENTER WORLD"}
            </button>

            <p className="font-jetbrains text-xs text-neutral-500 text-center">
              New to the Wilds?{" "}
              <a
                href="/account/signup"
                className="text-white underline hover:no-underline"
              >
                Create Account
              </a>
            </p>
          </div>
        </form>

        <p className="font-jetbrains text-xs text-neutral-700 text-center mt-6">
          <a href="/" className="hover:text-neutral-400">
            ← Back to Landing
          </a>
        </p>
      </div>
    </div>
  );
}
