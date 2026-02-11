import React from "react";
import Sidebar from "./Pages/Sidebar";
import Overview from "./Pages/Overview";
import Services from "./Pages/Services";
import History from "./Pages/History";
import Users from "./Pages/Users";
import { useStore } from "../../../Store/Store";
import Navbar from "../../Navbar";
import AdminContact from "./Pages/AdminContact";
import Appointments from "./Pages/Appointments";
import AdminOffers from "./Pages/AdminOffers";
import StylistSchedule from "./Pages/StylistSchedule";
import ManageStylists from "./Pages/ManageStylists";

const AdminDashboard = () => {
  const { openTabId } = useStore();

  return (
    <div className="min-h-screen bg-[#fffaf4] pt-20">
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <Navbar />
        {openTabId === 1 && <Overview />}
        {openTabId === 2 && <Services />}
        {openTabId === 3 && <History />}
        {openTabId === 4 && <Users />}
        {openTabId === 5 && <AdminContact />}
        {openTabId === 6 && <Appointments />}
        {openTabId === 7 && <AdminOffers />}
        {openTabId === 8 && <StylistSchedule />}
        {openTabId === 9 && <ManageStylists />}
      </div>

      <Sidebar />
    </div>
  );
};

export default AdminDashboard;
