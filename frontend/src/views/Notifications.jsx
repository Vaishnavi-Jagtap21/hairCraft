import { useEffect, useState } from "react";
import axios from "axios";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

export default function Notifications() {

  const [notifications, setNotifications] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    axios.get(`${SERVER_URL}/api/notifications`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => setNotifications(res.data));
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>

      {notifications.map(n => (
        <div key={n.id} className="bg-white p-4 rounded shadow mb-3">
          <p>{n.message}</p>
          <span className="text-xs text-gray-500">
            {new Date(n.createdAt).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}
