import { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import StatsCard from "../../../../views/StatsCard";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/dashboard/stats");

        setStats(res.data);
        setError("");
      } catch {
        setError("Failed to load dashboard data");
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-40">
        <p className="text-gray-500 animate-pulse">
          Loading dashboard data...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gray-200 text-black rounded-2xl p-6 shadow">
        <h2 className="text-3xl font-bold">Dashboard Overview</h2>
        <p className="text-sm text-gray-600 mt-1">
          Quick snapshot of platform activity
        </p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Users" value={stats.users} />
        <StatsCard title="Appointments" value={stats.appointments} />
        <StatsCard title="Pending" value={stats.pending} />
        <StatsCard title="Completed" value={stats.completed} />
      </div>
    </div>
  );
};

export default Overview;
