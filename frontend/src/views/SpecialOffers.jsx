import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

export default function SpecialOffers() {
    const [offers, setOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`${SERVER_URL}/api/offers`)
            .then(res => setOffers(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    const handleBook = (offer) => {
        // Construct a service object with the discounted price
        const discountedService = {
            ...offer.service,
            price: offer.discountedPrice, // Override price
            name: `${offer.service.name} (Offer: ${offer.title})` // Optional: Tag the name
        };

        navigate("/booking", {
            state: { service: discountedService }
        });
    };

    return (
        <div className="min-h-screen bg-[#fffaf4]">
            <Navbar />

            <div className="pt-32 pb-20 px-6 max-w-7xl mx-auto">

                {/* HEADER */}
                {/* HEADER */}
                <div className="text-center mb-12">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-serif font-bold mb-4"
                    >
                        Trending Offers
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-500 text-lg"
                    >
                        Limited-time deals crafted for you
                    </motion.p>
                </div>

                {/* LOADING */}
                {loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-80 bg-gray-200 rounded-2xl animate-pulse" />
                        ))}
                    </div>
                )}

                {/* OFFERS GRID */}
                {!loading && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {offers.map((offer, idx) => (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-2xl transition duration-300"
                            >

                                {/* IMAGE */}
                                <div className="h-64 overflow-hidden relative">
                                    <img
                                        src={offer.image || offer.service?.image}
                                        alt={offer.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                    />
                                    <div className="absolute top-4 right-4 bg-black text-white px-3 py-1 rounded-full text-sm font-bold">
                                        Save {Math.round(((offer.originalPrice - offer.discountedPrice) / offer.originalPrice) * 100)}%
                                    </div>
                                </div>

                                {/* CONTENT */}
                                <div className="p-6">
                                    <h3 className="text-2xl font-bold mb-2">{offer.title}</h3>
                                    <p className="text-gray-500 mb-4 line-clamp-2">{offer.description}</p>

                                    <div className="flex items-end gap-3 mb-6">
                                        <span className="text-3xl font-bold">₹{offer.discountedPrice}</span>
                                        <span className="text-lg text-gray-400 line-through mb-1">₹{offer.originalPrice}</span>
                                    </div>

                                    <button
                                        onClick={() => handleBook(offer)}
                                        className="w-full py-3 rounded-xl bg-black text-white font-semibold hover:bg-gray-800 transition transform active:scale-95"
                                    >
                                        Book Now
                                    </button>
                                </div>

                            </motion.div>
                        ))}
                    </div>
                )}

                {!loading && offers.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed">
                        <p className="text-gray-400 text-lg">No trending offers at the moment.</p>
                        <p className="text-sm text-gray-400">Please check back later!</p>
                    </div>
                )}

            </div>
        </div>
    );
}
