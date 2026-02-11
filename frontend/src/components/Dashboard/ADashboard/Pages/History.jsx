import { useEffect, useState } from "react";
import axios from "../../../../api/axios";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const History = () => {
  const [stats, setStats] = useState({
    totalCompleted: 0,
    totalRevenue: 0,
    topService: "—",
    topCustomer: "—",
  });

  const [range, setRange] = useState("YEAR");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchStats(range);
  }, [range]);

  const fetchStats = async (selectedRange) => {
    try {
      setLoading(true);
      setMessage("");

      const res = await axios.get(
        "/api/admin/dashboard/stats/history",
        {
          params: { range: selectedRange }
        }
      );

      setStats({
        totalCompleted: res.data?.totalCompleted ?? 0,
        totalRevenue: res.data?.totalRevenue ?? 0,
        topService: res.data?.topService || "—",
        topCustomer: res.data?.topCustomer || "—",
        items: res.data?.items || [],
      });

    } catch {
      setMessage("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-black to-gray-700 text-white p-6 rounded-2xl shadow">
        <h2 className="text-3xl font-bold">Service History</h2>
        <p className="text-sm text-gray-300 mt-1">
          View completed appointments and business insights
        </p>
      </div>

      {/* MESSAGE */}
      {message && (
        <div className="bg-gray-100 text-gray-700 p-3 rounded">
          {message}
        </div>
      )}

      {/* DATE FILTER */}
      <div className="flex gap-3">
        {["TODAY", "MONTH", "YEAR"].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition
              ${range === r
                ? "bg-black text-white shadow"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
          >
            {r === "TODAY"
              ? "Today"
              : r === "MONTH"
                ? "This Month"
                : "This Year"}
          </button>
        ))}
      </div>

      {/* SUMMARY CARDS */}
      {loading ? (
        <p className="text-gray-500 animate-pulse">
          Loading statistics…
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Completed" value={stats.totalCompleted} />
          <StatCard title="Total Revenue" value={`₹${stats.totalRevenue}`} green />
          <StatCard title="Top Service" value={stats.topService} />
          <StatCard title="Top Customer" value={stats.topCustomer} />
        </div>
      )}

      {/* HISTORY TABLE */}
      <div className="bg-white rounded-2xl shadow overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="text-lg font-bold">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Service</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date & Time</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {stats.items?.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-gray-500">
                    No activity found for this period.
                  </td>
                </tr>
              ) : (
                stats.items?.map((item, idx) => {
                  const isRefund = item.status === "REFUNDED" || item.status === "CANCELLED_BY_ADMIN" || item.status === "CANCELLED" || item.status === "REJECTED";

                  return (
                    <tr key={idx} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === "COMPLETED"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                          }`}>
                          {item.status === "REFUNDED" ? "CANCELLED" : item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {item.serviceName || "Service Item"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {item.customerName || `User ID: ${item.appointmentId}`}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.appointmentDate} <br /> <span className="text-[10px]">{item.appointmentTime}</span>
                      </td>
                      <td className={`px-6 py-4 text-right font-bold ${isRefund ? "text-red-600" : "text-green-600"}`}>
                        {isRefund ? "-" : "+"}₹{item.amount || 0}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, green }) => (
  <div className="bg-white rounded-2xl shadow p-6">
    <p className="text-sm text-gray-500">{title}</p>
    <h3 className={`text-2xl font-bold mt-2 ${green ? "text-green-600" : ""}`}>
      {value}
    </h3>
  </div>
);

export default History;
