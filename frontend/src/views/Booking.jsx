import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { toast } from "sonner";
import Login from "./Login";
import { motion } from "framer-motion";
import StylistSelector from "../components/StylistSelector";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const Booking = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedStylist, setSelectedStylist] = useState("ANY"); // 'ANY' or Stylist object
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [bookedSlots, setBookedSlots] = useState([]);

  const today = new Date().toISOString().split("T")[0];

  // ================= LOAD SERVICES =================
  useEffect(() => {
    if (state?.services) {
      setSelectedServices(state.services);
    } else if (state?.service) {
      setSelectedServices([state.service]);
    }
  }, [state]);

  // ================= FETCH BOOKED SLOTS =================
  useEffect(() => {
    if (!date) return;

    const params = { date };
    if (selectedStylist !== "ANY" && selectedStylist?.id) {
      params.stylistId = selectedStylist.id;
    }

    const fetchSlots = async () => {
      try {
        const res = await api.get(`/api/appointments/booked-slots`, {
          params,
        });
        setBookedSlots(res.data || []);
      } catch (err) {
        setBookedSlots([]);
      }
    };
    fetchSlots();
  }, [date, selectedStylist, token]);

  if (!user) return <Login />;

  const totalAmount = selectedServices.reduce(
    (sum, s) => sum + Number(s.price),
    0
  );

  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + (s.duration || 30),
    0
  );

  const generateTimeSlots = () => {
    const slots = [];
    for (let h = 9; h < 21; h++) {
      slots.push(`${h.toString().padStart(2, "0")}:00`);
      slots.push(`${h.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();


  const isSlotAvailable = (startSlot) => {
    // If we don't have duration info, fall back to simple check
    if (!totalDuration) return !bookedSlots.includes(startSlot);

    const startHour = parseInt(startSlot.split(":")[0]);
    const startMin = parseInt(startSlot.split(":")[1]);
    let currentMinutes = startHour * 60 + startMin;

    // Calculate how many 30-min chunks we need
    const chunksNeeded = Math.ceil(totalDuration / 30);

    for (let i = 0; i < chunksNeeded; i++) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;


      if (bookedSlots.includes(timeString)) return false;



      if (currentMinutes + 30 > 21 * 60) return false;

      currentMinutes += 30;
    }

    return true;
  };

  // ================= HANDLE BOOKING =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const toastId = toast.loading("Processing booking details...");

    const token = localStorage.getItem("token");
    if (!token || token === "undefined" || token === "null") {
      toast.error("Please login to book an appointment.", { id: toastId });
      navigate("/login");
      return;
    }

    if (!date || !time) {
      const msg = "Please select date and time";
      setErrorMessage(msg);
      toast.error(msg, { id: toastId });
      return;
    }

    // Basic validation re-check
    const startHour = parseInt(time.split(":")[0]);
    const startMin = parseInt(time.split(":")[1]);
    let currentMin = startHour * 60 + startMin;
    const endMin = currentMin + totalDuration;

    if (endMin > 21 * 60) {
      const msg = "Appointment exceeds working hours";
      setErrorMessage(msg);
      toast.error(msg, { id: toastId });
      return;
    }

    // Overlap check
    for (let m = currentMin; m < endMin; m += 30) {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      const slot = `${h.toString().padStart(2, "0")}:${mm.toString().padStart(2, "0")}`;
      if (bookedSlots.includes(slot)) {
        const msg = `Slot ${slot} is no longer available`;
        setErrorMessage(msg);
        toast.error(msg, { id: toastId });
        return;
      }
    }

    try {
      setLoading(true);

      const appointmentIds = [];

      for (const service of selectedServices) {
        const payload = {
          serviceId: service.id,
          userId: user.id,
          appointmentDate: date,
          appointmentTime: `${time}:00`,
          amount: service.price,
          status: "BOOKED",
          stylistId: (selectedStylist !== "ANY" ? selectedStylist.id : null)
        };

        const res = await api.post(
          `/api/appointments/book`,
          payload
        );

        appointmentIds.push(res.data.id);
      }

      const orderRes = await api.post(
        `/api/payments/create-order`,
        { amount: totalAmount * 100 }
      );

      const orderData = orderRes.data;

      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error("Payment gateway failed to load", { id: toastId });
        return;
      }

      toast.dismiss(toastId); // Dismiss loading before opening Razorpay

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "HairCraft Salon",
        description: selectedServices.map((s) => s.name).join(", "),
        order_id: orderData.id,
        handler: async function (response) {
          const verifyToast = toast.loading("Verifying payment...");
          try {
            await api.post(
              `/api/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentIds,
              }
            );

            setSuccess(true);
            toast.success("Booking confirmed!", { id: verifyToast });
            navigate("/booking/success");
          } catch (err) {
            toast.error("Payment verification failed!", { id: verifyToast });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#000000" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        toast.error("Payment failed: " + response.error.description);
      });
      rzp.open();

    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          toast.error("Session expired. Please login again.", { id: toastId });
          localStorage.clear();
          navigate("/login");
          return;
        } else if (status === 409) {
          const msg = err.response?.data?.message || "This time slot is no longer available.";
          setErrorMessage(msg);
          toast.error(msg, { id: toastId });
        } else {
          const msg = err.response?.data?.message || "Something went wrong";
          setErrorMessage(msg);
          toast.error(msg, { id: toastId });
        }
      } else {
        setErrorMessage("Network error. Please try again.");
        toast.error("Network error. Please try again.", { id: toastId });
      }
    } finally {
      setLoading(false);
      // Don't auto-dismiss toastId here if Razorpay is opening, handled above
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] pt-28 px-6">
      <Navbar />

      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold mb-6">
          Confirm Booking
        </h2>

        {errorMessage && (
          <p className="text-red-500 mb-4">{errorMessage}</p>
        )}

        {/* SERVICES */}
        <div className="mb-6">
          {selectedServices.map((s) => (
            <div key={s.id} className="flex justify-between mb-2">
              <span>{s.name}</span>
              <span>₹{s.price}</span>
            </div>
          ))}
        </div>

        {/* STYLIST SELECTOR */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Select Stylist</h3>
          <StylistSelector
            selectedStylist={selectedStylist}
            onSelect={setSelectedStylist}
          />
        </div>

        {/* DATE */}
        <input
          type="date"
          className="w-full border rounded-xl px-4 py-3 mb-4"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
        />

        {/* TIME SLOTS */}
        {selectedServices.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl mb-6 text-center">
            Please select a service first to view available time slots.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {timeSlots.map((slot) => {
              // Check availability using our new duration-aware function
              const available = isSlotAvailable(slot);

              // If not available, we can either hide it or show it disabled.
              // Requirement says "only available time slots will be displayed".
              // So we will HIDE unavailable slots or just show them as disabled but maybe visually distinct?
              // "Only available time slots will be displayed" usually means filter them out.
              // But a grid with missing holes looks weird. Let's start by disabling and dimming them heavily.
              // ACTUALLY, "displayed" means visible. If I hide them, the grid flows better.

              if (!available) return null; // OPTION A: Remove completely.

              return (
                <button
                  key={slot}
                  onClick={() => setTime(slot)}
                  className={`py-3 rounded-xl border transition
                  ${time === slot
                      ? "bg-black text-white"
                      : "bg-white hover:bg-gray-50"
                    }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}

        <div className="flex justify-between items-center mb-6">
          <span className="font-semibold">Total</span>
          <span className="text-xl font-bold">₹{totalAmount}</span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-black text-white py-4 rounded-full"
        >
          {loading ? "Processing..." : "Confirm Booking"}
        </button>
      </div>
    </div>
  );
};

export default Booking;
