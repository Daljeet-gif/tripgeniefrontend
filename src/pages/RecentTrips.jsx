import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";

export default function RecentTrips() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredTrips, setFilteredTrips] = useState([]);

  useEffect(() => {
    loadTrips();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = trips.filter(trip =>
        trip.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trip.interests?.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredTrips(filtered);
    } else {
      setFilteredTrips(trips);
    }
  }, [searchQuery, trips]);

  const loadTrips = () => {
    const savedTrips = localStorage.getItem("recentTrips");
    if (savedTrips) {
      const parsed = JSON.parse(savedTrips);
      setTrips(parsed);
      setFilteredTrips(parsed);
    }
  };

  const handleViewTrip = (trip) => {
    // Store the trip in context to view it
    navigate("/result", { state: { trip } });
  };

  const handleDeleteTrip = (tripId) => {
    const updated = trips.filter(t => t.id !== tripId);
    setTrips(updated);
    setFilteredTrips(updated);
    localStorage.setItem("recentTrips", JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all trip history?")) {
      setTrips([]);
      setFilteredTrips([]);
      localStorage.removeItem("recentTrips");
    }
  };

  return (
    <>
      <Navigation />
      <div className="font-body min-h-screen px-4 py-12 relative overflow-hidden md:ml-64 pt-20 md:pt-12">
      {/* Ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div className="absolute -top-32 -left-32 w-[520px] h-[520px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(201,155,90,0.11) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(80,140,170,0.09) 0%, transparent 70%)" }} />
      </div>

      <div className="relative z-10 max-w-[700px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/")}
            className="text-[11px] text-white/30 uppercase tracking-widest font-body hover:text-gold transition-colors mb-6 flex items-center gap-2"
          >
            ← Back
          </button>
          <p className="text-[11px] tracking-[.18em] uppercase text-gold font-medium mb-2 font-body">
            History
          </p>
          <h1 className="font-display text-[2.6rem] md:text-5xl font-light text-white leading-[1.1]">
            Recent Trips
          </h1>
          <p className="text-sm text-white/40 font-light mt-2 leading-relaxed font-body">
            View and search your past trip plans
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by destination or interests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-[14px] text-[15px] text-white placeholder-white/25 outline-none font-body transition-all duration-200 focus:border-gold/50 focus:bg-gold/[0.03]"
          />
        </div>

        {/* Trips List */}
        {filteredTrips.length === 0 ? (
          <div className="bg-[#161616] border border-white/[0.08] rounded-3xl p-8 md:p-10 shadow-2xl text-center">
            <p className="text-4xl mb-4">✈️</p>
            <p className="text-white/30 font-body mb-2">
              {searchQuery ? "No trips match your search" : "No recent trips yet"}
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-gold/80 hover:text-gold transition-colors font-body text-sm"
            >
              Plan your first trip →
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] text-white/30 font-body">
                {filteredTrips.length} trip{filteredTrips.length !== 1 ? "s" : ""} found
              </p>
              {trips.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-red-400/70 hover:text-red-400 transition-colors font-body"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-4">
              {filteredTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-[#161616] border border-white/[0.08] rounded-2xl p-6 hover:border-gold/30 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-xl text-white">{trip.location}</h3>
                        <span className="px-2 py-0.5 rounded-full bg-gold/10 text-gold/70 text-[11px] font-body">
                          {trip.days} days
                        </span>
                      </div>
                      <p className="text-[12px] text-white/40 font-body mb-3">
                        {new Date(trip.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {trip.interests?.slice(0, 4).map((interest, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/50 font-body"
                          >
                            {interest}
                          </span>
                        ))}
                        {trip.interests?.length > 4 && (
                          <span className="px-2 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[11px] text-white/50 font-body">
                            +{trip.interests.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewTrip(trip)}
                        className="px-3 py-2 rounded-lg border border-gold/30 bg-gold/5 text-gold/80 text-[12px] font-body transition-all hover:bg-gold/10 hover:text-gold"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleDeleteTrip(trip.id)}
                        className="px-3 py-2 rounded-lg border border-red-500/20 bg-red-500/5 text-red-400/70 text-[12px] font-body transition-all hover:bg-red-500/10 hover:text-red-400"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
