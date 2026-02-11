import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const CustomerReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await axios.get(`${SERVER_URL}/api/reviews`);
            setReviews(res.data);
        } catch (err) {
            console.error("Failed to fetch reviews");
        } finally {
            setLoading(false);
        }
    };

    const [showModal, setShowModal] = useState(false);
    const [newRating, setNewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [newComment, setNewComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const token = localStorage.getItem("token");

    const handleSubmitReview = async (e) => {
        e.preventDefault();
        if (!token) {
            toast.error("Please login to write a review");
            return;
        }
        try {
            setSubmitting(true);
            await axios.post(`${SERVER_URL}/api/reviews/add`, {
                rating: newRating,
                comment: newComment
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Review submitted successfully!");
            setShowModal(false);
            setNewComment("");
            setNewRating(5);
            fetchReviews();
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data || "Failed to submit review");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="py-20 bg-white relative">
            <div className="max-w-7xl mx-auto px-6">

                {/* HEADER */}
                <div className="text-center mb-16 relative">
                    <h2 className="text-4xl font-serif font-bold mb-4">What Our Clients Say</h2>
                    <p className="text-gray-500 text-lg mb-8">Real stories from our happy customers</p>

                    {token && (
                        <button
                            onClick={() => setShowModal(true)}
                            className="bg-black text-white px-6 py-3 rounded-full hover:bg-gray-800 transition shadow-lg"
                        >
                            Write a Review
                        </button>
                    )}
                </div>

                {/* REVIEWS GRID */}
                {loading ? (
                    <p className="text-center text-gray-500">Loading reviews...</p>
                ) : reviews.length === 0 ? (
                    <div className="text-center">
                        <p className="text-gray-500 italic mb-4">No reviews yet. Be the first to share!</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {reviews.map((review, index) => (
                            <motion.div
                                key={review.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-[#fffaf4] p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full"
                            >
                                {/* STARS */}
                                <div className="flex gap-1 mb-4 text-yellow-400 text-lg">
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            className={i < review.rating ? "ri-star-fill" : "ri-star-line text-gray-300"}
                                        ></i>
                                    ))}
                                </div>

                                {/* COMMENT */}
                                <p className="text-gray-600 mb-6 flex-1 italic">"{review.comment}"</p>

                                {/* USER INFO */}
                                <div className="flex items-center gap-4 mt-auto">
                                    <img
                                        src={review.user?.image || "https://via.placeholder.com/150"}
                                        alt={review.user?.name || "User"}
                                        className="w-12 h-12 rounded-full object-cover bg-gray-200"
                                    />
                                    <div>
                                        <h4 className="font-bold text-sm">{review.user?.name || "Anonymous"}</h4>
                                        <p className="text-xs text-gray-400">Verified Customer</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* REVIEW MODAL */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 w-full max-w-lg relative shadow-2xl"
                    >
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-black"
                        >
                            <i className="ri-close-line text-2xl"></i>
                        </button>

                        <h3 className="text-2xl font-bold mb-6 text-center">Share Your Experience</h3>

                        <form onSubmit={handleSubmitReview} className="space-y-6">
                            {/* RATING INPUT */}
                            <div className="flex flex-col items-center gap-2">
                                <label className="text-sm font-medium text-gray-600">Your Rating</label>
                                <div className="flex gap-2 text-3xl text-yellow-400 cursor-pointer" onMouseLeave={() => setHoverRating(0)}>
                                    {[...Array(5)].map((_, i) => (
                                        <i
                                            key={i}
                                            onClick={() => setNewRating(i + 1)}
                                            onMouseEnter={() => setHoverRating(i + 1)}
                                            className={i < (hoverRating || newRating) ? "ri-star-fill hover:scale-110 transition" : "ri-star-line text-gray-300 hover:text-yellow-200 transition"}
                                        ></i>
                                    ))}
                                </div>
                            </div>

                            {/* COMMENT INPUT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Tell us about your experience..."
                                    rows="4"
                                    className="w-full border border-gray-200 rounded-xl p-4 focus:ring-2 focus:ring-black outline-none resize-none"
                                    required
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-black text-white py-3 rounded-full font-medium hover:bg-gray-800 transition disabled:opacity-50"
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                        </form>
                    </motion.div>
                </div>
            )}
        </section>
    );
};

export default CustomerReviews;
