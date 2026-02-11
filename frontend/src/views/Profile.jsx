import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import { motion } from "framer-motion";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentForReview, setSelectedAppointmentForReview] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  /* ================= SUBMIT REVIEW ================= */
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error("Please add a comment");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const serviceName = selectedAppointmentForReview?.serviceName || "";
      const finalComment = selectedAppointmentForReview
        ? `[${serviceName}] ${comment}`
        : comment;

      await axios.post(
        "/api/reviews/add",
        {
          userId: storedUser.id,
          rating,
          comment: finalComment,
        }
      );

      toast.success("Review submitted! Thank you.");
      setComment("");
      setRating(5);
      setShowReviewModal(false);
      setSelectedAppointmentForReview(null);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  /* ================= LOAD DATA ================= */
  const loadData = () => {
    setLoading(true);

    axios
      .get(`/api/appointments/user/${storedUser.id}`)
      .then((res) =>
        setAppointments(Array.isArray(res.data) ? res.data : [])
      )
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!storedUser?.id) {
      navigate("/login");
      return;
    }
    loadData();
  }, [storedUser?.id]);

  /* ✅ AUTO REFRESH AFTER PAYMENT */
  useEffect(() => {
    if (location.state?.refresh) {
      loadData();
    }
  }, [location.state]);

  if (!storedUser) return null;

  const upcoming = appointments.filter(
    (a) =>
      a.status !== "COMPLETED" &&
      a.status !== "CANCELLED" &&
      a.status !== "REFUNDED" &&
      a.status !== "CANCELLED_BY_ADMIN"
  );

  const past = appointments.filter(
    (a) =>
      a.status === "COMPLETED" ||
      a.status === "CANCELLED" ||
      a.status === "REFUNDED" ||
      a.status === "CANCELLED_BY_ADMIN"
  );

  /* ================= TIMELINE STEP ================= */
  const getStep = (status) => {
    if (status === "BOOKED") return 1;
    if (status === "CONFIRMED") return 2;
    if (status === "COMPLETED" || status === "REFUNDED") return 3;
    if (status === "CANCELLED_BY_ADMIN") return 2;
    return 1;
  };

  const openRating = (apt) => {
    setSelectedAppointmentForReview(apt);
    setShowReviewModal(true);
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] pt-24 px-4 pb-20">
      <Navbar />

      <div className="max-w-md mx-auto space-y-4">

        {/* PROFILE HEADER */}
        <div className="backdrop-blur-md bg-white/60 border border-white/40 rounded-3xl shadow-sm p-5 flex items-center gap-5">
          <img
            src={storedUser.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-sm"
            alt="profile"
          />

          <div className="space-y-0.5">
            <h2 className="font-bold text-xl text-gray-900 leading-tight">
              {storedUser.name}
            </h2>
            <p className="text-sm text-gray-400 font-medium">
              {storedUser.email}
            </p>
          </div>
        </div>

        {/* APPOINTMENTS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-bold text-gray-800">Upcoming Appointments</h3>
            <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">{upcoming.length}</span>
          </div>

          {/* SKELETON LOADING */}
          {loading &&
            [1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse bg-white/40 rounded-2xl p-4 h-28 border border-white/20"
              />
            ))}

          {/* UPCOMING CARDS */}
          {!loading &&
            upcoming.map((a, index) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-bold text-lg text-gray-900">{a.serviceName || "Service"}</p>
                    <p className="text-sm text-gray-500 font-medium">
                      {new Date(a.appointmentDate).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-black tracking-widest border ${a.status === 'CONFIRMED' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'
                    }`}>
                    {a.status}
                  </span>
                </div>

                {/* TIMELINE */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-300 uppercase tracking-tighter">
                    <span className={getStep(a.status) >= 1 ? "text-black" : ""}>Booked</span>
                    <span className={getStep(a.status) >= 2 ? "text-black" : ""}>Confirmed</span>
                    <span className={getStep(a.status) >= 3 ? "text-black" : ""}>Ready</span>
                  </div>

                  <div className="relative h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{
                        width: `${(getStep(a.status) / 3) * 100}%`,
                      }}
                      transition={{ duration: 1, ease: "circOut" }}
                      className="h-full bg-black rounded-full shadow-[0_0_10px_rgba(0,0,0,0.2)]"
                    />
                  </div>
                </div>
              </motion.div>
            ))}

          {!loading && upcoming.length === 0 && (
            <div className="text-center bg-white/40 border border-dashed border-gray-200 rounded-3xl py-10 px-6">
              <p className="text-sm text-gray-400 font-medium">No upcoming glow-ups scheduled</p>
            </div>
          )}

          {/* PAST APPOINTMENTS */}
          {!loading && past.length > 0 && (
            <div className="pt-4 space-y-3">
              <h3 className="font-bold text-gray-800 px-1">Past Appointments</h3>
              <div className="space-y-3">
                {past.map((a, index) => (
                  <div
                    key={a.id}
                    className="bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 flex justify-between items-center group"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{a.serviceName || "Service"}</p>
                      <p className="text-xs text-gray-400 font-medium italic">
                        {new Date(a.appointmentDate).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {a.status === "COMPLETED" && (
                        <button
                          onClick={() => openRating(a)}
                          className="bg-black text-white text-[10px] px-3 py-1.5 rounded-full font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-transform shadow-xl"
                        >
                          Rate Us
                        </button>
                      )}
                      {!["COMPLETED", "CONFIRMED", "BOOKED"].includes(a.status) && (
                        <span className="text-[10px] bg-red-50 text-red-500 px-2 py-1 rounded-full font-black uppercase tracking-tighter">
                          {a.status}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ACCOUNT BUTTONS */}
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm grid grid-cols-2 gap-3">
          {storedUser.role === "ADMIN" && (
            <button
              onClick={() => navigate("/admin")}
              className="col-span-2 bg-black text-white py-3.5 rounded-2xl font-bold hover:shadow-xl transition-all mb-1"
            >
              Admin Controls
            </button>
          )}

          <button
            onClick={() => navigate("/edit-profile")}
            className="border-2 border-gray-50 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-all text-sm"
          >
            Edit Profile
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="bg-red-50 text-red-500 py-3.5 rounded-2xl font-bold hover:bg-red-100 transition-all text-sm"
          >
            Logout
          </button>
        </div>

        {/* GENERAL FEEDBACK (Keep this for overall app rating) */}
        {!loading && (
          <div className="p-6 bg-gradient-to-br from-orange-50 to-white rounded-3xl border border-orange-100 shadow-sm">
            <h4 className="font-black text-lg text-gray-900 mb-1">Overall Experience?</h4>
            <p className="text-xs text-gray-500 mb-4">Help us improve the HairCraft experience.</p>
            <button
              onClick={() => openRating(null)}
              className="w-full bg-white border border-orange-200 text-orange-600 py-3 rounded-2xl font-bold text-sm hover:shadow-md transition-shadow"
            >
              Leave Appraisal
            </button>
          </div>
        )}
      </div>

      {/* RATING MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowReviewModal(false)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="bg-white w-full max-w-sm rounded-[40px] p-10 relative z-10 shadow-2xl border border-gray-100"
          >
            <div className="text-center space-y-6">
              <div className="space-y-2">
                <h3 className="text-2xl font-black text-gray-900">How'd we do?</h3>
                <p className="text-sm text-gray-500 font-medium">
                  {selectedAppointmentForReview
                    ? `How was your ${selectedAppointmentForReview.serviceName}?`
                    : "Tell us about your overall experience!"}
                </p>
              </div>

              {/* Stars */}
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="text-4xl transition-transform active:scale-90"
                  >
                    <span className={star <= rating ? "text-yellow-400" : "text-gray-200"}>★</span>
                  </button>
                ))}
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Your thoughts..."
                className="w-full bg-gray-50 border-none rounded-3xl p-5 text-sm focus:ring-2 ring-black transition-all outline-none"
                rows="4"
              />

              <button
                disabled={submitting}
                onClick={handleReviewSubmit}
                className="w-full bg-black text-white py-5 rounded-3xl font-black uppercase tracking-widest text-sm hover:shadow-2xl transition-all disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Submit Review"}
              </button>

              <button
                onClick={() => setShowReviewModal(false)}
                className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-black transition-colors"
              >
                Not now
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Profile;
