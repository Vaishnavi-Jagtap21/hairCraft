import React, { useState, useEffect } from "react";
import axios from "../../../../api/axios";
const StylistSchedule = () => {
    const [stylists, setStylists] = useState([]);
    const [utilization, setUtilization] = useState(null);
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetchData();
    }, [selectedDate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [scheduleRes, utilizationRes] = await Promise.all([
                axios.get(`/api/admin/stylists/schedule?date=${selectedDate}`),
                axios.get("/api/admin/stylists/utilization"),
            ]);

            setStylists(scheduleRes.data);
            setUtilization(utilizationRes.data);
        } catch (error) {
            console.error("Error fetching stylist data:", error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "AVAILABLE":
                return "bg-green-100 text-green-800 border-green-300";
            case "BUSY":
                return "bg-yellow-100 text-yellow-800 border-yellow-300";
            case "FULLY_BOOKED":
                return "bg-red-100 text-red-800 border-red-300";
            case "INACTIVE":
                return "bg-gray-100 text-gray-800 border-gray-300";
            default:
                return "bg-gray-100 text-gray-800 border-gray-300";
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "AVAILABLE":
                return "✅";
            case "BUSY":
                return "⚠️";
            case "FULLY_BOOKED":
                return "🔴";
            case "INACTIVE":
                return "💤";
            default:
                return "❓";
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading stylist schedules...</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Stylist Schedule Manager
                </h1>
                <p className="text-gray-600">
                    Monitor stylist availability and manage appointments
                </p>
            </div>

            {/* Date Selector */}
            <div className="mb-6 flex items-center gap-4">
                <label className="font-medium text-gray-700">Select Date:</label>
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Utilization Summary */}
            {utilization && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-blue-500">
                        <div className="text-2xl font-bold text-gray-800">
                            {utilization.totalStylists}
                        </div>
                        <div className="text-sm text-gray-600">Total Stylists</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-green-500">
                        <div className="text-2xl font-bold text-green-600">
                            {utilization.availableToday}
                        </div>
                        <div className="text-sm text-gray-600">Available Today</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-red-500">
                        <div className="text-2xl font-bold text-red-600">
                            {utilization.fullyBookedToday}
                        </div>
                        <div className="text-sm text-gray-600">Fully Booked</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-md border-l-4 border-gray-500">
                        <div className="text-2xl font-bold text-gray-600">
                            {utilization.activeStylists}
                        </div>
                        <div className="text-sm text-gray-600">Active Stylists</div>
                    </div>
                </div>
            )}

            {/* Stylist Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {stylists.map((stylist) => {
                    const utilRate =
                        stylist.capacity > 0
                            ? Math.round((stylist.todayAppointments / stylist.capacity) * 100)
                            : 0;

                    return (
                        <div
                            key={stylist.stylistId}
                            className={`bg-white rounded-xl shadow-lg border-2 overflow-hidden transition-transform hover:scale-105 ${getStatusColor(
                                stylist.status
                            )}`}
                        >
                            {/* Card Header */}
                            <div className="p-5 bg-gradient-to-r from-gray-50 to-white">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                                            {stylist.stylistName}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            {stylist.specialization}
                                        </p>
                                    </div>
                                    <div className="text-3xl">{getStatusIcon(stylist.status)}</div>
                                </div>

                                {/* Status Badge */}
                                <div
                                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                        stylist.status
                                    )}`}
                                >
                                    {stylist.status.replace("_", " ")}
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="p-5 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <div className="text-2xl font-bold text-gray-800">
                                            {stylist.todayAppointments}/{stylist.capacity}
                                        </div>
                                        <div className="text-xs text-gray-600">Today's Bookings</div>
                                    </div>

                                    <div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {stylist.upcomingAppointments}
                                        </div>
                                        <div className="text-xs text-gray-600">Upcoming (7d)</div>
                                    </div>
                                </div>

                                {/* Utilization Bar */}
                                <div className="mb-3">
                                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                                        <span>Capacity Usage</span>
                                        <span className="font-semibold">{utilRate}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${utilRate >= 100
                                                ? "bg-red-500"
                                                : utilRate >= 70
                                                    ? "bg-yellow-500"
                                                    : "bg-green-500"
                                                }`}
                                            style={{ width: `${Math.min(utilRate, 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Today's Schedule */}
                                {stylist.todaysSchedule && stylist.todaysSchedule.length > 0 && (
                                    <div className="mt-4">
                                        <div className="text-xs font-semibold text-gray-700 mb-2">
                                            Today's Schedule:
                                        </div>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {stylist.todaysSchedule.map((apt) => (
                                                <div
                                                    key={apt.id}
                                                    className="text-xs bg-gray-50 p-2 rounded border border-gray-200"
                                                >
                                                    <div className="font-medium text-gray-800">
                                                        {apt.appointmentTime} - {apt.userName}
                                                    </div>
                                                    <div className="text-gray-600">
                                                        {apt.serviceName}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {stylists.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No stylists found
                </div>
            )}
        </div>
    );
};

export default StylistSchedule;
