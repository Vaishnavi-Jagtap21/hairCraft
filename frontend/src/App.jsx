import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./views/Home";
import Booking from "./views/Booking";
import BookingSuccess from "./views/BookingSuccess";
import Contact from "./views/Contact";
import Login from "./views/Login";
import Register from "./views/Register";
import Dashboard from "./views/Dashboard";
import Profile from "./views/Profile";
import EditProfile from "./views/EditProfile";
import Payment from "./components/Payment";
import Admin from "./components/Dashboard/ADashboard/Admin";
import ChatCircle from "./components/HairCraftXAI/ChatCircle";
import ServiceDetails from "./components/ServiceDetailsModal";
import SpecialOffers from "./views/SpecialOffers";
import ProtectedRoute from "./components/ProtectedRoute";

import { Toaster } from "sonner";
import "./App.css";

const App = () => {
  const [dark, setDark] = useState(
    localStorage.getItem("dark") === "true"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("dark", dark);
  }, [dark]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/offers" element={<SpecialOffers />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/service/:id" element={<ServiceDetails />} />

        {/* PROTECTED ROUTES */}
        <Route element={<ProtectedRoute allowedRoles={['USER', 'ADMIN']} />}>
          <Route path="/booking" element={<Booking />} />
          <Route path="/booking/success" element={<BookingSuccess />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/edit-profile" element={<EditProfile />} />
          <Route path="/payment" element={<Payment />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
      </Routes>

      {/* Floating components */}
      <ChatCircle />
      <Toaster theme={dark ? "dark" : "light"} />
    </BrowserRouter>
  );
};

export default App;
