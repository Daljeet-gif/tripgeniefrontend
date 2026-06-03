import { useEffect, useRef, useState } from "react";
import { chatTripAPI } from "../services/api";

const SUGGESTIONS = [
  "Suggest dinner spots for day 1",
  "Make day 2 more relaxed",
  "What should I book in advance?",
  "Hidden gems near my hotel?",
];

export default function ChatAssistant({ tripId, seed = [] }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(seed);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, loading]);

  const send = async (text) => {
    const msg = (text ?? input).trim();
    if (!msg || loading || !tripId) return;

    const history = messages.slice(-10);
    setMessages((m) => [...m, { role: "user", content: msg }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await chatTripAPI(tripId, msg, history);
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "⚠️ Sorry, I couldn't reach the assistant. Try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full text-[#0d0d0d] text-2xl shadow-2xl flex items-center justify-center transition-transform hover:scale-105 print:hidden"
        title="Ask the AI assistant"
      >
        {open ? "✕" : "💬"}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-[400px] h-[540px] max-h-[75vh] bg-[#111] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden print:hidden">
          {/* Header */}
          <div className="px-5 py-4 border-b border-white/[0.08] flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold to-[#a87c3e] flex items-center justify-center text-[#0d0d0d]">
              ✨
            </div>
            <div>
              <p className="text-white font-body text-sm">Trip Assistant</p>
              <p className="text-white/35 text-[11px] font-body">Ask anything about this trip</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center mt-6">
                <p className="text-white/40 text-sm font-body mb-4">
                  👋 I know your full itinerary. Ask me to tweak days, find food, or plan logistics.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-[12px] px-3 py-1.5 rounded-full border border-white/10 text-white/60 font-body hover:border-gold/40 hover:text-white transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] font-body leading-relaxed whitespace-pre-wrap ${
                    m.role === "user"
                      ? "bg-gold/15 border border-gold/30 text-white rounded-br-sm"
                      : "bg-white/[0.05] border border-white/[0.08] text-white/85 rounded-bl-sm"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/[0.05] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:.15s]" />
                  <span className="w-1.5 h-1.5 bg-gold rounded-full animate-bounce [animation-delay:.3s]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-white/[0.08] flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about your trip…"
              className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3.5 py-2.5 text-[13px] text-white placeholder-white/25 outline-none font-body focus:border-gold/50"
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
              className="px-4 rounded-xl text-[#0d0d0d] text-sm font-medium font-body disabled:opacity-40 transition-opacity"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
