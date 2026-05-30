import { useState } from "react";
import { planTripAPI } from "../services/api";
import { TripContext } from "./tripContextValue";

export const TripProvider = ({ children }) => {
    // ✅ Load from sessionStorage on init
    const [trip, setTrip] = useState(() => {
        try {
            const saved = sessionStorage.getItem("tripgenie_trip");
            return saved ? JSON.parse(saved) : null;
        } catch {
            return null;
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateTrip = async (formData) => {
        setLoading(true);
        setError("");
        try {
            const res = await planTripAPI(formData);
            const tripData = res.data.trip;
            setTrip(tripData);
            // ✅ Save to sessionStorage so refresh works
            sessionStorage.setItem("tripgenie_trip", JSON.stringify(tripData));
        } catch {
            setError('Failed to generate Trip');
        } finally {
            setLoading(false);
        }
    };

    const clearTrip = () => {
        setTrip(null);
        sessionStorage.removeItem("tripgenie_trip");
    };

    return (
        <TripContext.Provider value={{ trip, loading, error, generateTrip, clearTrip }}>
            {children}
        </TripContext.Provider>
    );
};