"use client";
import { useState, useEffect, useRef } from "react";

export default function ChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);
  const lastMessageTime = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Poll for new messages
  useEffect(() => {
    if (!isOpen) return;

    const fetchMessages = async () => {
      try {
        const params = new URLSearchParams({
          channel: "global",
          limit: "50",
        });
        if (lastMessageTime.current) {
          params.append("since", lastMessageTime.current);
        }

        const res = await fetch(`/api/multiplayer/chat?${params}`);
        if (res.ok) {
          const data = await res.json();
          if (data.messages && data.messages.length > 0) {
            setMessages((prev) => {
              const newMessages = [...prev];
              data.messages.forEach((msg) => {
                if (!newMessages.find((m) => m.id === msg.id)) {
                  newMessages.push(msg);
                }
              });
              return newMessages.slice(-100); // Keep last 100 messages
            });
            lastMessageTime.current =
              data.messages[data.messages.length - 1].timestamp;
          }
        }
      } catch (err) {
        console.error("Chat fetch error:", err);
      }
    };

    fetchMessages(); // Initial load
    const interval = setInterval(fetchMessages, 2000); // Poll every 2 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/multiplayer/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input.trim(),
          channel: "global",
        }),
      });

      if (res.ok) {
        setInput("");
        // Message will appear via polling
      } else {
        const err = await res.json();
        console.error("Send message error:", err.error);
      }
    } catch (err) {
      console.error("Send message error:", err);
    }
    setSending(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[500px] bg-black border-2 border-white flex flex-col z-50">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=JetBrains+Mono:wght@400;500;700&display=swap'); .font-playfair{font-family:'Playfair Display',serif;} .font-jetbrains{font-family:'JetBrains Mono',monospace;}`}</style>

      {/* Header */}
      <div className="border-b-2 border-white px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-playfair text-xl font-bold text-white">
            Global Chat
          </h2>
          <p className="font-jetbrains text-[9px] text-neutral-500">
            {messages.length} messages
          </p>
        </div>
        <button
          onClick={onClose}
          className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-3 py-1.5 text-neutral-400 hover:border-white hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="font-jetbrains text-xs text-neutral-600">
              No messages yet. Say hello!
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2">
                <span className="font-jetbrains text-xs font-bold text-cyan-400">
                  {msg.username}
                </span>
                <span className="font-jetbrains text-[9px] text-neutral-600">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="font-jetbrains text-xs text-neutral-200 pl-2">
                {msg.message}
              </p>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="border-t-2 border-white p-3 shrink-0 flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          maxLength={500}
          className="flex-1 bg-neutral-900 border border-neutral-700 px-3 py-2 text-white font-jetbrains text-xs focus:outline-none focus:border-white"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!input.trim() || sending}
          className="font-jetbrains text-xs tracking-widest uppercase border border-neutral-700 px-4 py-2 text-neutral-400 hover:border-white hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {sending ? "..." : "SEND"}
        </button>
      </form>
    </div>
  );
}
