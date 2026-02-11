import { useEffect, useState } from "react";
import axios from "../../../../api/axios";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [history, setHistory] = useState([]);


  // Load users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  // Block user
  const blockUser = async (id) => {
    try {
      await axios.put(
        `/api/admin/users/${id}/deactivate`,
        {}
      );
      fetchUsers();
    } catch (err) {
      console.error("Block failed");
    }
  };

  // Unblock user
  const unblockUser = async (id) => {
    try {
      await axios.put(
        `/api/admin/users/${id}/activate`,
        {}
      );
      fetchUsers();
    } catch (err) {
      console.error("Unblock failed");
    }
  };

  // Fetch history
  const fetchHistory = async (user) => {
    try {
      setSelectedUser(user);

      const res = await axios.get(`/api/appointments/user/${user.id}`);
      // Store all appointments, we can filter or just show them all as history
      setHistory(res.data);
    } catch (err) {
      console.error("History fetch failed");
      setHistory([]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-black to-gray-500 text-white p-6 rounded-2xl shadow">
        <h2 className="text-3xl font-bold">Manage Users</h2>
        <p className="text-sm text-gray-300 mt-1">
          View user profiles, status, and activity history
        </p>
      </div>

      {/* Users Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white rounded-2xl shadow p-6 space-y-5 hover:shadow-lg transition"
          >
            <div className="flex items-center gap-4">
              <img
                src={u.image || "https://i.pravatar.cc/100"}
                alt={u.name}
                className="w-16 h-16 rounded-full object-cover"
              />

              <div className="flex-1">
                <h3 className="font-semibold text-lg">{u.name}</h3>
                <p className="text-sm text-gray-500">{u.email}</p>
                <p className="text-sm text-gray-500">{u.phone}</p>
              </div>

              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold ${u.status === "ACTIVE"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                  }`}
              >
                {u.status}
              </span>
            </div>



            <div className="flex justify-between items-center pt-2 border-t">
              <button
                onClick={() => fetchHistory(u)}
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                View History
              </button>

              {u.status === "ACTIVE" ? (
                <button
                  onClick={() => blockUser(u.id)}
                  className="text-sm font-medium text-red-600 hover:underline"
                >
                  Block
                </button>
              ) : (
                <button
                  onClick={() => unblockUser(u.id)}
                  className="text-sm font-medium text-green-600 hover:underline"
                >
                  Unblock
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* History Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {selectedUser.name}'s History
              </h3>

              <button
                onClick={() => {
                  setSelectedUser(null);
                  setHistory([]);
                }}
                className="text-gray-400 hover:text-black text-xl"
              >
                ✕
              </button>
            </div>

            <div className="divide-y text-sm max-h-60 overflow-y-auto pr-2">
              {history.length === 0 ? (
                <p className="text-gray-500 py-4 text-center">
                  No appointments found
                </p>
              ) : (
                history.map((h) => {
                  const dateObj = h.appointmentDate ? new Date(h.appointmentDate) : null;
                  const formattedDate = dateObj ? dateObj.toLocaleDateString() : h.appointmentDate;
                  const formattedTime = dateObj
                    ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : h.appointmentTime;

                  return (
                    <div key={h.id} className="py-3 flex flex-col gap-1">
                      <div className="flex justify-between font-medium">
                        <span>{h.serviceName || "Service Item"}</span>
                        <span className={
                          h.status === "REFUNDED" || h.status === "CANCELLED" || h.status === "REJECTED" || h.status === "CANCELLED_BY_ADMIN"
                            ? "text-red-500"
                            : ""
                        }>
                          {h.status === "REFUNDED" || h.status === "CANCELLED" || h.status === "REJECTED" || h.status === "CANCELLED_BY_ADMIN"
                            ? `-₹${h.amount || 0}`
                            : `₹${h.amount || 0}`
                          }
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 uppercase tracking-wide">
                        <span>
                          {formattedDate} • {formattedTime}
                        </span>
                        <span
                          className={
                            h.status === "COMPLETED"
                              ? "text-green-600 font-bold"
                              : h.status === "CANCELLED" || h.status === "REJECTED" || h.status === "REFUNDED"
                                ? "text-red-600"
                                : "text-blue-600"
                          }
                        >
                          {h.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => {
                setSelectedUser(null);
                setHistory([]);
              }}
              className="w-full mt-4 py-2 bg-black text-white rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
