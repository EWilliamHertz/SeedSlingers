"use client";
import { useEffect, useRef } from "react";
import useUser from "@/utils/useUser";

const FEATURES = [
  {
    icon: "⚔️",
    title: "Turn-Based Combat",
    desc: "CTB system inspired by Final Fantasy X. Speed determines turn order. Every decision counts.",
  },
  {
    icon: "🌿",
    title: "Sprout Collection",
    desc: "Capture wild Sprouts across elemental biomes. Build your party. Level them up. Make them yours.",
  },
  {
    icon: "🗺️",
    title: "Living World",
    desc: "Explore a post-collapse solarpunk Earth. Encounter rare species. Gather resources. Craft your path.",
  },
  {
    icon: "⚡",
    title: "Party System",
    desc: "Summon up to 3 Sprouts into battle. Combine elements. Overwhelm your enemies with synergy.",
  },
  {
    icon: "📈",
    title: "Deep Progression",
    desc: "Player and Sprout XP systems. Level up for stat gains. Unlock new abilities as you grow.",
  },
  {
    icon: "🌐",
    title: "Built for MMORPG",
    desc: "Architected for multiplayer. Guilds, trading, and PvP arenas are on the horizon.",
  },
];

const ELEMENTS = [
  { name: "Solar", color: "#fbbf24", bg: "#451a03", symbol: "☀" },
  { name: "Fungal", color: "#4ade80", bg: "#052e16", symbol: "🍄" },
  { name: "Aquatic", color: "#22d3ee", bg: "#083344", symbol: "🌊" },
  { name: "Mineral", color: "#a78bfa", bg: "#2e1065", symbol: "💎" },
  { name: "Data", color: "#38bdf8", bg: "#082f49", symbol: "<>" },
];

export default function LandingPage() {
  const { data: user } = useUser();
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let raf;
    let particles = [];
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.5 + 0.5,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
      }));
    };
    resize();
    window.addEventListener("resize", resize);
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.alpha})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .font-playfair{font-family:'Playfair Display',serif;}
        .font-jetbrains{font-family:'JetBrains Mono',monospace;}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes pulseglow{0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0.1)}50%{box-shadow:0 0 30px 10px rgba(255,255,255,0.05)}}
        .animate-fadeup{animation:fadeUp 0.8s ease forwards;}
        .animate-fadeup2{animation:fadeUp 0.8s ease 0.3s forwards;opacity:0;}
        .animate-fadeup3{animation:fadeUp 0.8s ease 0.6s forwards;opacity:0;}
        .pulse-glow{animation:pulseglow 4s ease-in-out infinite;}
      `}</style>

      {/* Nav */}
      <nav className="border-b border-neutral-900 px-6 py-4 flex items-center justify-between sticky top-0 z-50 bg-black/90 backdrop-blur">
        <span className="font-playfair text-xl font-bold tracking-tighter">
          SEEDSLINGERS
        </span>
        <div className="flex gap-3 items-center">
          <a
            href="/account/profile"
            className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400 hover:text-white transition-colors hidden md:block"
          >
            Profile
          </a>
          {user ? (
            <a
              href="/game"
              className="font-jetbrains text-xs tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-neutral-200 transition-colors"
            >
              PLAY NOW
            </a>
          ) : (
            <>
              <a
                href="/account/signin"
                className="font-jetbrains text-xs tracking-widest uppercase text-neutral-400 hover:text-white transition-colors"
              >
                Sign In
              </a>
              <a
                href="/account/signup"
                className="font-jetbrains text-xs tracking-widest uppercase bg-white text-black px-4 py-2 hover:bg-neutral-200 transition-colors"
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        />
        <div className="relative z-10 max-w-4xl mx-auto">
          <p className="font-jetbrains text-xs tracking-[0.5em] uppercase text-neutral-500 mb-6 animate-fadeup">
            Solarpunk MMORPG
          </p>
          <h1 className="font-playfair text-7xl md:text-9xl font-black tracking-tighter leading-none mb-6 animate-fadeup">
            SEED
            <br />
            SLINGERS
          </h1>
          <p className="font-jetbrains text-sm md:text-base text-neutral-300 max-w-xl mx-auto mb-12 leading-relaxed animate-fadeup2">
            A post-collapse world overgrown with sentient flora. Capture wild
            Sprouts, build your party, and battle across elemental biomes in a
            turn-based RPG built for the modern era.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeup3">
            {user ? (
              <a
                href="/game"
                className="bg-white text-black font-jetbrains text-sm tracking-widest uppercase px-10 py-5 hover:bg-neutral-200 transition-colors pulse-glow"
              >
                ENTER THE WILDS →
              </a>
            ) : (
              <>
                <a
                  href="/account/signup"
                  className="bg-white text-black font-jetbrains text-sm tracking-widest uppercase px-10 py-5 hover:bg-neutral-200 transition-colors pulse-glow"
                >
                  BEGIN YOUR JOURNEY →
                </a>
                <a
                  href="/account/signin"
                  className="border border-neutral-700 font-jetbrains text-sm tracking-widest uppercase px-10 py-5 hover:border-white transition-colors text-neutral-400 hover:text-white"
                >
                  SIGN IN
                </a>
              </>
            )}
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 font-jetbrains text-[10px] tracking-widest text-neutral-600 uppercase">
          Scroll to explore
        </div>
      </section>

      {/* Elements strip */}
      <section className="border-y border-neutral-900 overflow-x-auto">
        <div className="flex">
          {ELEMENTS.map((el) => (
            <div
              key={el.name}
              className="flex-1 min-w-[120px] border-r border-neutral-900 last:border-r-0 px-6 py-5 text-center"
              style={{ backgroundColor: el.bg + "40" }}
            >
              <div className="text-2xl mb-1" style={{ color: el.color }}>
                {el.symbol}
              </div>
              <p
                className="font-jetbrains text-xs tracking-widest uppercase"
                style={{ color: el.color }}
              >
                {el.name}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-24 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="font-jetbrains text-xs tracking-[0.4em] uppercase text-neutral-500 mb-3">
            What is SeedSlingers
          </p>
          <h2 className="font-playfair text-5xl md:text-6xl font-bold tracking-tighter">
            Built Different
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-l border-t border-neutral-900">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="border-r border-b border-neutral-900 p-8 hover:bg-neutral-950 transition-colors"
            >
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="font-playfair text-xl font-bold mb-2">
                {f.title}
              </h3>
              <p className="font-jetbrains text-xs text-neutral-400 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Combat preview */}
      <section className="border-y border-neutral-900 px-6 py-24 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="font-jetbrains text-xs tracking-[0.4em] uppercase text-neutral-500 mb-3">
                Final Fantasy X meets Pokemon
              </p>
              <h2 className="font-playfair text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                Strategic Party Combat
              </h2>
              <div className="space-y-4 font-jetbrains text-xs text-neutral-400">
                {[
                  "CTB turn system — speed determines order, action changes the future",
                  "Summon party Sprouts mid-battle. Switch tactics on the fly",
                  "Elemental matchups — Solar crushes Mineral, Data disrupts everything",
                  "Steal, Capture, and Flee — choose your approach every fight",
                ].map((t) => (
                  <div key={t} className="flex gap-3 items-start">
                    <span className="text-white mt-0.5">▸</span>
                    <p>{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-2 border-neutral-800 p-6 bg-black font-jetbrains text-xs space-y-2">
              <div className="text-neutral-500 mb-3 tracking-widest uppercase text-[10px]">
                CTB Turn Order
              </div>
              {[
                { name: "YOU", speed: 19, active: true },
                { name: "LUMINA DRIFTER", speed: 16, ally: true },
                { name: "NULL BLOOM", speed: 25, active: false },
                { name: "IRONROOT", speed: 14, active: false },
                { name: "TIDE SPECTER", speed: 12, active: false },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 border flex justify-between ${c.active ? "bg-white text-black border-white" : c.ally ? "border-green-700 text-green-400" : "border-neutral-800 text-neutral-500"}`}
                >
                  <span className="uppercase tracking-wider">
                    {c.name}
                    {c.ally ? " ♦" : ""}
                  </span>
                  <span>SPD {c.speed}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-32 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-playfair text-6xl md:text-7xl font-bold tracking-tighter mb-6">
            The Wilds
            <br />
            Await
          </h2>
          <p className="font-jetbrains text-sm text-neutral-400 mb-12">
            Join the Reclaimed World. Free to play. No downloads.
          </p>
          {user ? (
            <a
              href="/game"
              className="inline-block bg-white text-black font-jetbrains text-sm tracking-widest uppercase px-16 py-6 hover:bg-neutral-200 transition-colors"
            >
              RETURN TO GAME →
            </a>
          ) : (
            <a
              href="/account/signup"
              className="inline-block bg-white text-black font-jetbrains text-sm tracking-widest uppercase px-16 py-6 hover:bg-neutral-200 transition-colors"
            >
              CREATE FREE ACCOUNT →
            </a>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-playfair text-lg font-bold tracking-tighter">
          SEEDSLINGERS
        </span>
        <div className="flex gap-6">
          <a
            href="/account/profile"
            className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-600 hover:text-white"
          >
            Profile
          </a>
          <a
            href="/report"
            className="font-jetbrains text-[10px] tracking-widest uppercase text-neutral-600 hover:text-white"
          >
            Dev Report
          </a>
        </div>
        <span className="font-jetbrains text-[10px] text-neutral-800">
          2026 SeedSlingers
        </span>
      </footer>
    </div>
  );
}
