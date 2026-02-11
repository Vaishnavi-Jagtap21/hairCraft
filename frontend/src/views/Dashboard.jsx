import React from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Dashboard/UDashboard/Sidebar";
import Booking from "../components/Dashboard/UDashboard/BookAppoiment";
import MyBooking from "../components/Dashboard/UDashboard/MyBookings";
import Profile from "../views/Profile"
import { useStore } from "../Store/Store";



const Dashboard = () => {
  const { openTabId } = useStore();

  return (
    <div className="min-h-screen w-screen bg-[#f9f7f4] overflow-x-hidden">
      {/* FIXED NAVBAR */}
      <Navbar />

      {/* PAGE CONTENT */}
      <main className="pt-24 pb-40 px-6">
        {openTabId === 1 && <Booking />}
        {openTabId === 2 && <MyBooking />}
        {openTabId === 3 && <Profile />}
      </main>

      {/* FIXED BOTTOM SIDEBAR */}
      <Sidebar />
    </div>
  );
};

export default Dashboard;

