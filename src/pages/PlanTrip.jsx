import { useState } from "react";
import { useTrip } from "../context/useTrip";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import InteractiveMap from "../components/InteractiveMap";
import ChatAssistant from "../components/ChatAssistant";
import { PackingList, LocalInfo, ShareExportBar } from "../components/TripExtras";
import { parseItinerary, SLOT_ICONS, SLOT_COLORS } from "../utils/parseItinerary";

// ── tiny helpers ──────────────────────────────────────────────
function Badge({ children, gold }) {
    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide font-body border ${gold
            ? "bg-gold/[0.14] border-gold/50 text-gold"
            : "bg-white/[0.05] border-white/10 text-white/50"
            }`}>
            {children}
        </span>
    );
}

function SectionTitle({ children, sub }) {
    return (
        <div className="mb-6">
            <p className="text-[10px] tracking-[.18em] uppercase text-white/35 font-medium font-body mb-1">{sub}</p>
            <h2 className="font-display text-2xl md:text-3xl font-light text-white">{children}</h2>
        </div>
    );
}

function Card({ children, className = "" }) {
    return (
        <div className={`bg-[#161616] border border-white/[0.08] rounded-2xl p-6 ${className}`}>
            {children}
        </div>
    );
}

// ── Weather card ──────────────────────────────────────────────
function WeatherCard({ data }) {
    if (!data) return null;
    if (data.error) return (
        <Card>
            <p className="text-white/30 text-sm font-body">{data.city} — weather unavailable</p>
        </Card>
    );
    return (
        <Card className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[11px] text-white/35 uppercase tracking-widest font-body">{data.city}</p>
                    <p className="font-display text-4xl font-light text-white mt-0.5">{data.current?.temp}°<span className="text-xl text-white/40">C</span></p>
                    <p className="text-sm text-white/50 font-body mt-1">{data.current?.condition}</p>
                </div>
                {data.current?.icon && (
                    <img src={`https:${data.current.icon}`} alt={data.current.condition} className="w-14 h-14 opacity-90" />
                )}
            </div>
            {data.forecast?.length > 0 && (
                <div className="border-t border-white/[0.07] pt-3 flex flex-wrap gap-2">
                    {data.forecast.map((day, i) => (
                        <div key={i} className="flex-1 min-w-[70px] text-center bg-white/[0.03] rounded-xl py-2 px-1">
                            <p className="text-[10px] text-white/30 font-body mb-1">{new Date(day.date).toLocaleDateString('en', { weekday: 'short' })}</p>
                            <img src={`https:${day.icon}`} alt={day.condition} className="w-6 h-6 mx-auto opacity-80" />
                            <p className="text-[11px] text-white/60 font-body mt-1">{day.maxTemp}° / {day.minTemp}°</p>
                        </div>
                    ))}
                </div>
            )}
        </Card>
    );
}

function ItineraryDay({ day, index }) {
    const [open, setOpen] = useState(index === 0);
    return (
        <div className="border border-white/[0.07] rounded-2xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-6 py-4 bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
                <div className="flex items-center gap-4">
                    <span className="font-display text-gold text-2xl font-bold min-w-[2rem] text-left">{day.dayNum}</span>
                    <div className="text-left">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-body">Day {day.dayNum}</p>
                        <p className="text-white font-body text-[15px]">{day.theme || "Itinerary"}</p>
                    </div>
                </div>
                <span className={`text-white/30 text-xl transition-transform duration-300 ${open ? "rotate-180" : ""}`}>
                    ↓
                </span>
            </button>

            {open && (
                <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
                    {day.slots.map((slot, si) => (
                        <div key={si} className={`rounded-xl border bg-gradient-to-br p-4 ${SLOT_COLORS[slot.label]}`}>
                            <p className="text-[11px] text-white/40 uppercase tracking-widest font-body mb-3">
                                {SLOT_ICONS[slot.label]} {slot.label}
                            </p>
                            <div className="flex flex-col gap-2">
                                {slot.items.map((item, ii) => {
                                    const parts = item.split(" — ");
                                    const place = parts[0]?.replace("📍", "").trim();
                                    const duration = parts[1]?.replace("⏱", "").trim();
                                    const tip = parts[2]?.replace("💡", "").trim();
                                    return (
                                        <div key={ii} className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-white font-body text-[14px] font-medium">📍 {place}</span>
                                                {duration && <Badge>⏱ {duration}</Badge>}
                                            </div>
                                            {tip && <p className="text-white/40 text-[12px] font-body pl-5">{tip}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Budget card ───────────────────────────────────────────────
function BudgetCard({ data }) {
    if (!data) return null;
    return (
        <Card>
            <SectionTitle sub="Estimated Costs">Budget Breakdown</SectionTitle>

            {data.route && (
                <div className="flex gap-4 mb-5 flex-wrap">
                    <div className="flex-1 min-w-[120px] bg-white/[0.03] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-body mb-1">Distance</p>
                        <p className="text-white font-display text-xl">{data.route.distanceKm}<span className="text-sm text-white/40"> km</span></p>
                    </div>
                    <div className="flex-1 min-w-[120px] bg-white/[0.03] rounded-xl p-3 text-center">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest font-body mb-1">Drive Time</p>
                        <p className="text-white font-display text-xl">{data.route.durationHrs}<span className="text-sm text-white/40"> hrs</span></p>
                    </div>
                </div>
            )}

            <div className="mb-4">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-body mb-2">Transport Options</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(data.transport || {}).map(([mode, cost]) => (
                        <div key={mode} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gold/[0.06] border border-gold/20">
                            <span className="text-gold text-xs capitalize font-body font-medium">{mode}</span>
                            <span className="text-white/60 text-xs font-body">{cost}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mb-5">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-body mb-2">Per Day</p>
                <div className="flex flex-wrap gap-2">
                    {Object.entries(data.perDay || {}).map(([type, cost]) => (
                        <div key={type} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                            <span className="text-white/50 text-xs capitalize font-body">{type}</span>
                            <span className="text-white/80 text-xs font-body font-medium">{cost}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-r from-gold/[0.1] to-gold/[0.04] border border-gold/25 rounded-xl p-4">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-body mb-1">
                    Total Estimate · {data.days} days
                </p>
                <p className="font-display text-2xl text-gold">
                    {data.totalEstimate?.min}
                    <span className="text-white/30 mx-2 text-xl">–</span>
                    {data.totalEstimate?.max}
                </p>
            </div>
        </Card>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function PlanTrip() {
    const { trip, loading, error } = useTrip();
    const navigate = useNavigate();
    const days = parseItinerary(trip?.itinerary);

    // Loading state
    if (loading) return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping" />
                <div className="absolute inset-2 rounded-full border-2 border-t-gold border-white/10 animate-spin" />
            </div>
            <div className="text-center">
                <p className="font-display text-2xl text-white font-light">Crafting your journey</p>
                <p className="text-white/35 text-sm font-body mt-1">AI is planning every detail…</p>
            </div>
        </div>
    );

    // Error state
    if (error) return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center max-w-sm">
                <p className="text-4xl mb-4">✈️</p>
                <p className="text-white font-display text-xl mb-2">Something went wrong</p>
                <p className="text-white/40 text-sm font-body mb-6">{error}</p>
                <button onClick={() => navigate("/")}
                    className="px-6 py-3 rounded-xl border border-white/10 text-white/70 font-body text-sm hover:border-gold/40 hover:text-white transition-all">
                    ← Try again
                </button>
            </div>
        </div>
    );

    // No trip yet
    if (!trip) return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center">
                <p className="text-white/30 font-body mb-4">No trip planned yet</p>
                <button onClick={() => navigate("/")}
                    className="px-6 py-3 rounded-xl border border-white/10 text-white/70 font-body text-sm hover:border-gold/40 hover:text-white transition-all">
                    ← Plan a trip
                </button>
            </div>
        </div>
    );

    return (
        <>
            <Navigation />
            <div className="font-body min-h-screen px-4 py-12 relative overflow-hidden md:ml-64 pt-20 md:pt-12">

            {/* Ambient blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(201,155,90,0.08) 0%, transparent 70%)" }} />
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full"
                    style={{ background: "radial-gradient(circle, rgba(80,140,170,0.07) 0%, transparent 70%)" }} />
            </div>

            <div className="relative z-10 max-w-[720px] mx-auto">

                {/* ── Header ── */}
                <div className="mb-10 animate-fadeUp">
                    <button onClick={() => navigate("/")}
                        className="text-[11px] text-white/30 uppercase tracking-widest font-body hover:text-gold transition-colors mb-6 flex items-center gap-2">
                        ← New Trip
                    </button>
                    <p className="text-[11px] tracking-[.18em] uppercase text-gold font-medium mb-2 font-body">
                        Your Itinerary
                    </p>
                    <h1 className="font-display text-[2.8rem] md:text-5xl font-light text-white leading-[1.1]">
                        {trip.location}
                    </h1>
                    <div className="flex flex-wrap gap-2 mt-4">
                        <Badge gold>{trip.days} days</Badge>
                        <Badge gold>₹{trip.budget}</Badge>
                        {trip.resolvedCities?.map(c => <Badge key={c}>{c}</Badge>)}
                        {trip.interests?.map(i => <Badge key={i}>{i}</Badge>)}
                    </div>
                </div>

                {/* ── Map ── */}
                {trip.mapData?.center && trip.mapData.markers?.length > 0 ? (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
                        <InteractiveMap center={trip.mapData.center} markers={trip.mapData.markers} />
                        <div className="px-5 py-3 bg-[#161616] border-t border-white/[0.06] flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] text-white/25 uppercase tracking-widest font-body">
                                {trip.mapData.markers?.length} locations mapped · tap a pin
                            </span>
                            <div className="flex flex-wrap gap-1 ml-auto">
                                {[...new Set(trip.mapData.markers?.map(m => m.city))].map(city => (
                                    <span key={city} className="text-[10px] px-2 py-0.5 rounded-full bg-gold/10 text-gold/70 font-body">{city}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : trip.mapData?.staticMapUrl && (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl">
                        <img
                            src={trip.mapData.staticMapUrl}
                            alt={`Map of ${trip.location}`}
                            className="w-full object-cover"
                            onError={(e) => e.currentTarget.parentElement.style.display = 'none'}
                        />
                    </div>
                )}

                {/* ── Share & Export ── */}
                <div className="mb-8">
                    <ShareExportBar trip={trip} />
                </div>

                {/* ── Itinerary ── */}
                <div className="mb-8">
                    <SectionTitle sub="Day by Day">Your Itinerary</SectionTitle>
                    <div className="flex flex-col gap-3">
                        {days.length > 0
                            ? days.map((day, i) => <ItineraryDay key={i} day={day} index={i} />)
                            : (
                                <Card>
                                    <pre className="text-white/60 text-sm font-body whitespace-pre-wrap leading-relaxed">
                                        {trip.itinerary}
                                    </pre>
                                </Card>
                            )
                        }
                    </div>
                </div>
               


                {/* ── Weather ── */}
                {trip.weather?.length > 0 && (
                    <div className="mb-8">
                        <SectionTitle sub="Forecast">Weather</SectionTitle>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {trip.weather.map((w, i) => <WeatherCard key={i} data={w} />)}
                        </div>
                    </div>
                )}

                {/* ── Budget ── */}
                {trip.budgetEstimate && (
                    <div className="mb-8">
                        <BudgetCard data={trip.budgetEstimate} />
                    </div>
                )}

                {/* ── Packing list ── */}
                {trip._id && (
                    <div className="mb-8">
                        <PackingList tripId={trip._id} />
                    </div>
                )}

                {/* ── Local info ── */}
                {trip._id && (
                    <div className="mb-8">
                        <LocalInfo tripId={trip._id} />
                    </div>
                )}

                {/* ── Footer ── */}
                <div className="text-center mt-10 pt-6 border-t border-white/[0.06]">
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate("/")}
                            style={{ background: "linear-gradient(135deg, #c99b5a 0%, #a87c3e 100%)" }}
                            className="px-8 py-3.5 rounded-2xl text-[14px] font-medium text-[#0d0d0d] font-body transition-all hover:-translate-y-0.5"
                        >
                            Plan Another Trip →
                        </button>
                        <button
                            onClick={() => navigate("/recent-trips")}
                            className="px-8 py-3.5 rounded-2xl border border-gold/30 bg-gold/5 text-gold/80 text-[14px] font-medium font-body transition-all hover:bg-gold/10 hover:text-gold"
                        >
                            View Saved Trips
                        </button>
                    </div>
                    <p className="text-center mt-4 text-[11px] text-white/20 font-light font-body">
                        Powered by Groq AI · TripGenie
                    </p>
                </div>

            </div>
            </div>

            {/* AI chat assistant */}
            {trip._id && <ChatAssistant tripId={trip._id} seed={trip.chat || []} />}
        </>
    );
}