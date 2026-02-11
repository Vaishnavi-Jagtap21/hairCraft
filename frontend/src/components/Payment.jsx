
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { useEffect } from "react";

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

const Payment = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // ✅ Get data from state OR localStorage
  const savedPayment = JSON.parse(localStorage.getItem("paymentData"));

  const appointmentId =
    state?.appointmentId || savedPayment?.appointmentId;

  const amount = state?.amount || savedPayment?.amount;

  const user = state?.user || savedPayment?.user;

  // ✅ Save data for refresh safety
  useEffect(() => {
    if (state) {
      localStorage.setItem("paymentData", JSON.stringify(state));
    }
  }, [state]);

  const handlePayment = async () => {
    if (!appointmentId || !amount) {
      toast.error("Invalid payment data");
      navigate("/dashboard");
      return;
    }

    const loaded = await loadRazorpay();

    if (!loaded) {
      toast.error("Payment service failed to load");
      return;
    }

    try {
      const orderRes = await axios.post(
        `${SERVER_URL}/api/payments/create-order`,
        {
          appointmentId,
          amount,
        }
      );

      const { id: orderId, currency } = orderRes.data;

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount: amount * 100,
        currency,
        name: "HairCraft",
        description: "Service Payment",
        order_id: orderId,

        handler: async function () {
          await axios.post(
            `${SERVER_URL}/api/payments/payment/success`,
            { appointmentId }
          );

          localStorage.removeItem("paymentData");

          toast.success("Payment successful");
          navigate("/booking/success");
        },

        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "",
        },

        theme: { color: "#000000" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      toast.error("Payment failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-10 text-center">
        <h2 className="text-3xl font-bold mb-2">Complete Payment</h2>
        <p className="text-gray-500 mb-8">
          Secure payment powered by Razorpay 🔒
        </p>

        <div className="bg-gray-50 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-500">Amount to Pay</p>
          <p className="text-4xl font-extrabold mt-2">
            ₹{amount || 0}
          </p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full bg-black text-white py-4 rounded-full text-lg font-semibold"
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

export default Payment;
