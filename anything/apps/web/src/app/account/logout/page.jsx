"use client";
import useAuth from "@/utils/useAuth";

export default function LogoutPage() {
  const { signOut } = useAuth();
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/", redirect: true });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>
      <div className="text-center max-w-sm">
        <h1 className="font-playfair text-4xl font-bold text-white mb-2">
          Leave the Wilds?
        </h1>
        <p className="font-jetbrains text-xs text-neutral-400 mb-8">
          Your progress is saved. You can return anytime.
        </p>
        <button
          onClick={handleSignOut}
          className="w-full bg-white text-black font-jetbrains text-sm tracking-widest uppercase py-4 hover:bg-neutral-200 mb-4"
        >
          SIGN OUT
        </button>
        <a
          href="/game"
          className="font-jetbrains text-xs text-neutral-500 hover:text-white"
        >
          ← Return to Game
        </a>
      </div>
    </div>
  );
}
