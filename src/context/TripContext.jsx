import { useState } from "react";
import { createContext } from "react";
import { planTripAPI } from "../services/api";
import { useContext } from "react";



const TripContext = createContext();

export const TripProvider = ({ childer }) => {
    const [trip, setTrip] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    const generateTrip = async (formData) => {
        setLoading(true);
        setError("");

        try {
            const res = await planTripAPI(formData);
            setTrip(res.data.trip);

        } catch (error) {
            setError('Failed to generate Trip');

        } finally {
            setLoading(false)
        }
    };

    return (
        <TripContext.Provider value={{ trip, loading, error, generateTrip }}>
            {childer}
        </TripContext.Provider>
    )


}

export const useTrip = () => useContext(TripContext);
