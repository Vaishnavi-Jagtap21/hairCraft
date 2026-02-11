import { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);


  // LOAD APPOINTMENTS
  const fetchAppointments = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/admin/appointments");

      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load appointments", err);
      toast.error("Failed to load appointments");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // UPDATE STATUS
  const updateStatus = async (id, status) => {
    if (!window.confirm(`Are you sure you want to mark this as ${status}?`)) return;

    const toastId = toast.loading(`Updating status to ${status}...`);

    try {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, processing: true } : a))
      );

      await axios.put(
        `/api/admin/appointments/${id}/status`,
        {},
        {
          params: { status }
        }
      );

      toast.success("Status updated successfully", { id: toastId });
      fetchAppointments();
    } catch (err) {
      console.error("Status update failed", err);
      const msg = err.response?.data?.message || err.message || "Unknown error";
      toast.error(`Failed to update status: ${msg}`, { id: toastId });
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, processing: false } : a))
      );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return "bg-green-100 text-green-700 border border-green-200";
      case "IN_PROGRESS":
        return "bg-blue-100 text-blue-700 border border-blue-200 animate-pulse";
      case "CONFIRMED":
        return "bg-purple-100 text-purple-700 border border-purple-200";
      case "BOOKED":
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border border-yellow-200";
      case "REJECTED":
      case "CANCELLED":
      case "CANCELLED_BY_ADMIN":
      case "REFUNDED":
        return "bg-red-50 text-red-600 border border-red-100";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Appointments</h2>
          <p className="text-sm text-gray-500 mt-1">
            Manage your schedule and update client status
          </p>
        </div>
        <button
          onClick={fetchAppointments}
          className="p-2 bg-gray-50 rounded-full hover:bg-gray-100 transition"
          title="Refresh"
        >
          🔄
        </button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
        </div>
      )}

      {!loading && appointments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500">No appointments found</p>
        </div>
      )}

      {/* LIST */}
      <div className="grid gap-4">
        {appointments.map((a) => {
          const dateObj = a.appointmentDate ? new Date(a.appointmentDate) : null;
          const date = dateObj ? dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : "--";
          const time = dateObj
            ? dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : "--";

          const isProcessing = a.processing;

          return (
            <div key={a.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-200">
              {/* CONTENT */}
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">

                {/* INFO */}
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-gray-900">
                      {a.serviceName || "Service"}
                    </h3>
                    <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-full ${getStatusBadge(a.status)}`}>
                      {a.status === "REFUNDED" ? "CANCELLED" : a.status.replace(/_/g, " ")}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-600 gap-4">
                    <span className="flex items-center gap-1">
                      👤 {a.customerName || a.userName || "Guest"}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400">|</span>
                    <span className="flex items-center gap-1 font-medium text-gray-800">
                      📅 {date} at {time}
                    </span>
                  </div>

                  {a.amount && (
                    <div className="text-sm text-gray-500">
                      Payment: <span className={a.paymentStatus === "PAID" ? "text-green-600 font-bold" : "text-orange-600 font-bold"}>
                        {a.paymentStatus || "PENDING"} (₹{a.amount})
                      </span>
                    </div>
                  )}
                </div>

                {/* ACTION BUTTONS */}
                <div className="flex flex-wrap gap-2 items-center">

                  {/* PENDING / BOOKED ACTIONS */}
                  {(a.status === "BOOKED" || a.status === "PENDING") && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => updateStatus(a.id, "CONFIRMED")}
                        className="px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => updateStatus(a.id, "REJECTED")}
                        className="px-4 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {/* CONFIRMED ACTIONS */}
                  {a.status === "CONFIRMED" && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => updateStatus(a.id, "IN_PROGRESS")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                      >
                        Start Service
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => updateStatus(a.id, "CANCELLED_BY_ADMIN")}
                        className="px-4 py-2 text-red-600 text-sm font-medium hover:underline disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* IN PROGRESS ACTIONS */}
                  {a.status === "IN_PROGRESS" && (
                    <>
                      <button
                        disabled={isProcessing}
                        onClick={() => updateStatus(a.id, "COMPLETED")}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition shadow-lg shadow-green-200 disabled:opacity-50"
                      >
                        Complete Service
                      </button>
                      <button
                        disabled={isProcessing}
                        onClick={() => updateStatus(a.id, "CANCELLED_BY_ADMIN")}
                        className="px-3 py-2 text-gray-400 text-xs hover:text-red-600 transition disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {/* COMPLETED / CANCELLED STATES (Read Only or Undo?) */}
                  {(a.status === "COMPLETED" || a.status === "CANCELLED" || a.status === "CANCELLED_BY_ADMIN" || a.status === "REFUNDED" || a.status === "REJECTED") && (
                    <span className="text-xs text-gray-400 italic px-2">
                      No actions available
                    </span>
                  )}

                  {isProcessing && <span className="text-xs text-gray-500 animate-pulse">Processing...</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Appointments;
