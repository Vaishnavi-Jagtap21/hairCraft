import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../Navbar";
import { useLocation, useNavigate } from "react-router-dom";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString("en-IN") : "--";

/* ================= STATUS PROGRESS ================= */
const statusSteps = ["BOOKED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"];

const getProgressWidth = (status) => {
  const index = statusSteps.indexOf(status);
  if (index === -1) return 0;
  return ((index + 1) / statusSteps.length) * 100;
};

const getStatusStyle = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-700";
    case "IN_PROGRESS":
      return "bg-purple-100 text-purple-700";
    case "COMPLETED":
      return "bg-gray-200 text-gray-700";
    case "REJECTED":
    case "CANCELLED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
};

const getStatusMessage = (status) => {
  switch (status) {
    case "CONFIRMED":
      return "Your appointment is confirmed ✅";
    case "IN_PROGRESS":
      return "Service is currently in progress ✂️";
    case "COMPLETED":
      return "Service completed successfully 🎉";
    case "REJECTED":
    case "CANCELLED":
      return "Appointment cancelled ❌";
    default:
      return "Waiting for salon confirmation";
  }
};

/* ================= COMPONENT ================= */
const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const [appointments, setAppointments] = useState([]);
  const [openId, setOpenId] = useState(null);

  const fetchAppointments = async () => {
    if (!user?.id || !token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      const res = await axios.get(
        `${SERVER_URL}/api/appointments/user/${user.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to load appointments");
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (location.state?.refresh) fetchAppointments();
  }, [location.state]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 pt-10 pb-6">
        <h2 className="text-3xl font-bold">My Appointments</h2>
        <p className="text-gray-500 mt-1">
          Email reminder is sent 1 hour before appointment
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-12 space-y-6">
        {appointments.length === 0 && (
          <p className="text-center text-gray-500">
            No appointments found
          </p>
        )}

        {appointments.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl p-6 shadow-sm">

            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{a.serviceName}</h3>
                <p className="text-sm text-gray-500 mt-2">
                  {formatDateTime(a.appointmentDate)}
                </p>

                <p className="text-sm mt-2 font-medium">
                  {getStatusMessage(a.status)}
                </p>
              </div>

              <span
                className={`px-4 py-1 text-xs rounded-full font-semibold ${getStatusStyle(
                  a.status
                )}`}
              >
                {a.status}
              </span>
            </div>

            {/* ===== PROGRESS BAR ===== */}
            {a.status !== "REJECTED" && a.status !== "CANCELLED" && (
              <div className="mt-6">
                <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black transition-all duration-700"
                    style={{ width: `${getProgressWidth(a.status)}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Booked</span>
                  <span>Confirmed</span>
                  <span>In Progress</span>
                  <span>Completed</span>
                </div>
              </div>
            )}

            {/* DETAILS */}
            {openId === a.id && (
              <div className="mt-6 grid grid-cols-2 gap-6">
                <Detail label="Status" value={a.status} />
                <Detail label="Payment" value={a.paymentStatus} />
                <Detail label="Amount" value={`₹${a.amount}`} />
              </div>
            )}

            <button
              onClick={() =>
                setOpenId(openId === a.id ? null : a.id)
              }
              className="text-sm underline mt-4"
            >
              {openId === a.id ? "Hide Details" : "View Details"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const Detail = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-400 uppercase">{label}</p>
    <p className="font-medium text-gray-800">{value || "--"}</p>
  </div>
);

export default UserDashboard;
