import { useState, useRef } from "react";
import { useTrip } from "../context/useTrip";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

const INTERESTS = [
    { id: "beaches", label: "Beaches", icon: "🏖️" },
    { id: "hiking", label: "Hiking", icon: "🥾" },
    { id: "food", label: "Food & Dining", icon: "🍜" },
    { id: "culture", label: "Culture", icon: "🏛️" },
    { id: "nightlife", label: "Nightlife", icon: "🎶" },
    { id: "shopping", label: "Shopping", icon: "🛍️" },
    { id: "adventure", label: "Adventure", icon: "🪂" },
    { id: "wildlife", label: "Wildlife", icon: "🦁" },
    { id: "photography", label: "Photography", icon: "📷" },
    { id: "wellness", label: "Wellness", icon: "🧘" },
];

function SectionLabel({ children }) {
    return (
        <p className="text-[11px] tracking-[.1em] uppercase text-white/50 font-medium mb-2 font-body">
            {children}
        </p>
    );
}

function Divider() {
    return <div className="h-px bg-white/[0.07] my-6" />;
}

export default function Home() {
    const [form, setForm] = useState({ location: "", days: 3, budget: "", interests: [], fromCity: "" });
    const [customInterests, setCustomInterests] = useState([]);
    const [customInput, setCustomInput] = useState("");
    const customInputRef = useRef(null);

    const toggleInterest = (id) =>
        setForm((p) => ({
            ...p,
            interests: p.interests.includes(id)
                ? p.interests.filter((i) => i !== id)
                : [...p.interests, id],
        }));

    const addCustomInterest = () => {
        const val = customInput.trim();
        if (!val) return;
        if (customInterests.find((c) => c.label.toLowerCase() === val.toLowerCase())) {
            setCustomInput("");
            return;
        }
        const newId = "custom_" + Date.now();
        setCustomInterests((p) => [...p, { id: newId, label: val, icon: "✨" }]);
        setForm((p) => ({ ...p, interests: [...p.interests, newId] }));
        setCustomInput("");
        customInputRef.current?.focus();
    };

    const removeCustomInterest = (id) => {
        setCustomInterests((p) => p.filter((c) => c.id !== id));
        setForm((p) => ({ ...p, interests: p.interests.filter((i) => i !== id) }));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") { e.preventDefault(); addCustomInterest(); }
    };

    const allInterests = [...INTERESTS, ...customInterests];
    const selectedLabels = form.interests
        .map((id) => allInterests.find((i) => i.id === id)?.label)
        .filter(Boolean);


    const navigate = useNavigate();

const { generateTrip, loading, error, clearTrip } = useTrip();

const handleSubmit = async () => {
    if (!form.location.trim()) return;
    clearTrip(); // ✅ clear old trip before generating new one
    const payload = {
        location: form.location,
        days: form.days,
        budget: form.budget,
        interests: selectedLabels,
        fromCity: form.fromCity,
    };
    await generateTrip(payload);
    
    // Save trip to localStorage for recent trips
    const tripData = {
        id: Date.now(),
        location: form.location,
        days: form.days,
        budget: form.budget,
        interests: selectedLabels,
        fromCity: form.fromCity,
        createdAt: new Date().toISOString()
    };
    
    const existingTrips = JSON.parse(localStorage.getItem("recentTrips") || "[]");
    const updatedTrips = [tripData, ...existingTrips].slice(0, 20); // Keep last 20 trips
    localStorage.setItem("recentTrips", JSON.stringify(updatedTrips));
    
    navigate("/result");
};

    return (
        <>
            <Navigation />
            <div className="font-body min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden md:ml-64 pt-20 md:pt-12">

            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(201,155,90,0.11) 0%, transparent 70%)" }} />
                <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(80,140,170,0.09) 0%, transparent 70%)" }} />
            </div>

            {/* Card */}
            <div className="animate-fadeUp relative z-10 w-full max-w-[600px] bg-[#161616] border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl">

                {/* Header */}
                <p className="text-[11px] tracking-[.18em] uppercase text-gold font-medium mb-2 font-body">
                    AI Travel Planner
                </p>
                <h1 className="font-display text-[2.6rem] md:text-5xl font-light text-white leading-[1.1] mb-2">
                    Plan your<br />perfect trip
                </h1>
                <p className="text-sm text-white/40 font-light mb-8 leading-relaxed font-body">
                    Tell us where you&apos;re headed — we&apos;ll handle the rest.
                </p>

                {/* ── Destination ── */}
                <SectionLabel>Destination</SectionLabel>
                <input
                    type="text"
                    placeholder="e.g. Bali, Tokyo, Paris..."
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-[14px] text-[15px] text-white placeholder-white/25 outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03]"
                />

                <Divider />

                {/* ── Trip Duration ── */}
                <SectionLabel>Trip Duration</SectionLabel>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setForm((p) => ({ ...p, days: Math.max(1, p.days - 1) }))}
                        className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-white text-xl flex items-center justify-center transition-all duration-150 hover:bg-gold/10 hover:border-gold/40"
                    >−</button>

                    <span className="font-display text-[2.4rem] font-bold text-gold min-w-[2.5rem] text-center leading-none">
                        {form.days}
                    </span>

                    <button
                        onClick={() => setForm((p) => ({ ...p, days: Math.min(30, p.days + 1) }))}
                        className="w-10 h-10 rounded-xl border border-white/10 bg-white/[0.04] text-white text-xl flex items-center justify-center transition-all duration-150 hover:bg-gold/10 hover:border-gold/40"
                    >+</button>

                    <span className="text-[13px] text-white/35 font-light font-body">
                        {form.days === 1 ? "day" : "days"}
                    </span>
                </div>

                <Divider />

                {/* ── Budget ── */}
                <SectionLabel>Budget</SectionLabel>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-[15px] font-body pointer-events-none">
                        ₹
                    </span>
                    <input
                        type="text"
                        placeholder="e.g. 1000/day, 5000 total, luxury..."
                        value={form.budget}
                        onChange={(e) => setForm({ ...form, budget: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-8 pr-4 py-[14px] text-[15px] text-white placeholder-white/25 outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03]"
                    />
                </div>
                <p className="text-[11px] text-white/25 mt-2 font-light font-body">
                    Enter a daily amount, total budget, or describe it (e.g. &quot;backpacker&quot;, &quot;luxury&quot;)
                </p>

                <Divider />

                {/* ── Interests ── */}
                <div className="flex items-center justify-between mb-3">
                    <SectionLabel>Interests</SectionLabel>
                    {form.interests.length > 0 && (
                        <span className="text-xs text-gold font-medium font-body -mt-2">
                            {form.interests.length} selected
                        </span>
                    )}
                </div>

                {/* Preset pills */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {INTERESTS.map((interest) => (
                        <button
                            key={interest.id}
                            onClick={() => toggleInterest(interest.id)}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-[13px] font-light font-body transition-all duration-150 ${form.interests.includes(interest.id)
                                    ? "bg-gold/[0.14] border-gold/75 text-white"
                                    : "border-white/10 text-white/55 hover:border-gold/35 hover:text-white/85"
                                }`}
                        >
                            <span className="text-sm">{interest.icon}</span>
                            {interest.label}
                        </button>
                    ))}

                    {/* Custom interest pills */}
                    {customInterests.map((c) => (
                        <span
                            key={c.id}
                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gold/75 bg-gold/[0.14] text-white text-[13px] font-light font-body"
                        >
                            <span className="text-sm">{c.icon}</span>
                            {c.label}
                            <button
                                onClick={() => removeCustomInterest(c.id)}
                                className="ml-1 text-white/40 hover:text-white transition-colors leading-none text-base"
                                title="Remove interest"
                            >×</button>
                        </span>
                    ))}
                </div>

                {/* Custom interest input */}
                <div className="flex gap-2">
                    <input
                        ref={customInputRef}
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add your own interest..."
                        maxLength={32}
                        className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-[14px] text-white placeholder-white/25 outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03]"
                    />
                    <button
                        onClick={addCustomInterest}
                        disabled={!customInput.trim()}
                        className="px-4 py-3 rounded-xl border border-white/10 bg-white/[0.04] text-white text-[13px] font-medium font-body whitespace-nowrap transition-all duration-150 hover:bg-gold/10 hover:border-gold/40 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        + Add
                    </button>
                </div>
                <p className="text-[11px] text-white/25 mt-2 font-light font-body">
                    Press Enter or click Add — custom interests are included in your itinerary
                </p>

                <Divider />

                {/* ── Current City (for budget estimate) ── */}
                <SectionLabel>Your Current City <span className="normal-case text-white/25 tracking-normal">(optional)</span></SectionLabel>
                <input
                    type="text"
                    placeholder="e.g. Delhi, Mumbai, Ludhiana..."
                    value={form.fromCity}
                    onChange={(e) => setForm({ ...form, fromCity: e.target.value })}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-[14px] text-[15px] text-white placeholder-white/25 outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03]"
                />
                <p className="text-[11px] text-white/25 mt-2 font-light font-body">
                    Used to estimate travel cost &amp; distance from your location
                </p>

                <Divider />

                {/* Error */}
                {error && (
                    <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] font-body">
                        {error}
                    </div>
                )}

                {/* Submit */}
                <button
                    onClick={handleSubmit}
                    disabled={loading || !form.location.trim()}
                    style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
                    className="w-full py-4 rounded-2xl text-[15px] font-medium tracking-wide text-[#0d0d0d] font-body transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0"
                >
                    <span className="flex items-center justify-center gap-2">
                        {loading && (
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-black/20 border-t-black rounded-full" />
                        )}
                        {loading ? "Generating your itinerary..." : "Generate Itinerary →"}
                    </span>
                </button>

                <p className="text-center mt-4 text-[11px] text-white/20 font-light font-body">
                    Powered by Claude AI · TripGenie
                </p>
            </div>
        </div>
        </>
    );
}