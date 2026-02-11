import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";

const BookingSuccess = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#fffaf4] flex flex-col">
            <Navbar />

            <div className="flex-grow flex items-center justify-center px-6">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full text-center"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                        <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                    </motion.div>

                    <h1 className="text-4xl font-black mb-4 text-gray-900 tracking-tight">Booking Confirmed!</h1>
                    <p className="text-gray-500 mb-10 text-lg max-w-sm mx-auto leading-relaxed">
                        Your beauty journey with <span className="text-black font-bold">HairCraft</span> has officially begun. We've sent the receipt and details to your email.
                    </p>

                    <div className="space-y-4">
                        <button
                            onClick={() => navigate("/profile")}
                            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-gray-800 transition-all shadow-xl hover:shadow-black/20 flex items-center justify-center gap-2 group"
                        >
                            View My Appointments
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </button>
                        <button
                            onClick={() => navigate("/")}
                            className="w-full bg-white border-2 border-gray-100 text-gray-600 py-4 rounded-2xl font-bold hover:bg-gray-50 transition-all"
                        >
                            Return to Homepage
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default BookingSuccess;
