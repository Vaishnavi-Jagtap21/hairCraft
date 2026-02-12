import React, { useEffect, useState } from "react";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const StylistSelector = ({ selectedStylist, onSelect }) => {
    const [stylists, setStylists] = useState([]);

    useEffect(() => {
        const fetchStylists = async () => {
            try {
                const res = await axios.get(`${SERVER_URL}/api/stylists`);
                setStylists(res.data);
            } catch (e) {
                console.error("Failed to fetch stylists");
            }
        }
        fetchStylists();
    }, []);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* ANY AVAILABLE OPTION */}
            {/* <button
                onClick={() => onSelect("ANY")}
                className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-24
          ${selectedStylist === "ANY"
                        ? "bg-black text-white border-black ring-2 ring-black ring-offset-2"
                        : "bg-white hover:bg-gray-50 border-gray-200"
                    }`}
            >
                {/* <span className="font-bold">Any Stylist</span>
                <span className="text-xs opacity-70">For faster booking</span> */}
            {/* </button> */} 

            {stylists.map((stylist) => (
                <button
                    key={stylist.id}
                    onClick={() => onSelect(stylist)}
                    className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-24
            ${selectedStylist?.id === stylist.id
                            ? "bg-black text-white border-black ring-2 ring-black ring-offset-2"
                            : "bg-white hover:bg-gray-50 border-gray-200"
                        }`}
                >
                    <span className="font-bold">{stylist.name}</span>
                    <span className="text-xs opacity-70">{stylist.specialization || "General"}</span>
                </button>
            ))}
        </div>
    );
};

export default StylistSelector;
