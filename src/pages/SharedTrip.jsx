import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import InteractiveMap from "../components/InteractiveMap";
import { getSharedTripAPI } from "../services/api";
import { parseItinerary, SLOT_ICONS, SLOT_COLORS } from "../utils/parseItinerary";

function Badge({ children, gold }) {
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-medium tracking-wide font-body border ${gold
      ? "bg-gold/[0.14] border-gold/50 text-gold"
      : "bg-white/[0.05] border-white/10 text-white/50"}`}>
      {children}
    </span>
  );
}

export default function SharedTrip() {
  const { shareId } = useParams();
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getSharedTripAPI(shareId);
        setTrip(data.trip);
        setStatus("ok");
      } catch {
        setStatus("notfound");
      }
    })();
  }, [shareId]);

  if (status === "loading")
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-2 border-gold/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-t-gold border-white/10 animate-spin" />
        </div>
      </div>
    );

  if (status === "notfound")
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-4xl mb-4">🧭</p>
          <p className="text-white font-display text-xl mb-2">Trip not found</p>
          <p className="text-white/40 text-sm font-body mb-6">This trip is private or the link is invalid.</p>
          <Link to="/" className="px-6 py-3 rounded-xl border border-white/10 text-white/70 font-body text-sm hover:border-gold/40 hover:text-white transition-all">
            Go to TripGenie →
          </Link>
        </div>
      </div>
    );

  const days = parseItinerary(trip.itinerary);

  return (
    <div className="font-body min-h-screen px-4 py-12 relative overflow-hidden">
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,155,90,0.08) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-[720px] mx-auto">
        <div className="mb-10">
          <p className="text-[11px] tracking-[.18em] uppercase text-gold font-medium mb-2 font-body">Shared Itinerary</p>
          <h1 className="font-display text-[2.8rem] md:text-5xl font-light text-white leading-[1.1]">{trip.location}</h1>
          <div className="flex flex-wrap gap-2 mt-4">
            <Badge gold>{trip.days} days</Badge>
            <Badge gold>₹{trip.budget}</Badge>
            {trip.resolvedCities?.map((c) => <Badge key={c}>{c}</Badge>)}
            {trip.interests?.map((i) => <Badge key={i}>{i}</Badge>)}
          </div>
        </div>

        {trip.mapData?.center && trip.mapData.markers?.length > 0 && (
          <div className="mb-8">
            <InteractiveMap center={trip.mapData.center} markers={trip.mapData.markers} />
          </div>
        )}

        <div className="flex flex-col gap-3 mb-10">
          {days.length > 0 ? (
            days.map((day) => (
              <div key={day.dayNum} className="border border-white/[0.07] rounded-2xl overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-4 bg-white/[0.02]">
                  <span className="font-display text-gold text-2xl font-bold min-w-[2rem]">{day.dayNum}</span>
                  <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-body">Day {day.dayNum}</p>
                    <p className="text-white font-body text-[15px]">{day.theme || "Itinerary"}</p>
                  </div>
                </div>
                <div className="px-6 pb-6 pt-4 flex flex-col gap-4">
                  {day.slots.map((slot, si) => (
                    <div key={si} className={`rounded-xl border bg-gradient-to-br p-4 ${SLOT_COLORS[slot.label]}`}>
                      <p className="text-[11px] text-white/40 uppercase tracking-widest font-body mb-3">
                        {SLOT_ICONS[slot.label]} {slot.label}
                      </p>
                      <div className="flex flex-col gap-2">
                        {slot.items.map((item, ii) => (
                          <p key={ii} className="text-white/75 text-[14px] font-body">📍 {item}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <pre className="text-white/60 text-sm font-body whitespace-pre-wrap leading-relaxed bg-[#161616] border border-white/[0.08] rounded-2xl p-6">
              {trip.itinerary}
            </pre>
          )}
        </div>

        <div className="text-center pt-6 border-t border-white/[0.06]">
          <Link to="/" className="text-gold/80 hover:text-gold font-body text-sm">Plan your own trip with TripGenie →</Link>
          <p className="mt-3 text-[11px] text-white/20 font-light font-body">Powered by Groq AI · TripGenie</p>
        </div>
      </div>
    </div>
  );
}
