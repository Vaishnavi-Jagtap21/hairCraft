import React, { useState, useEffect } from "react";
import api from "../../../../api/axios";
import { toast } from "sonner";

const ManageStylists = () => {
    const [stylists, setStylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newStylist, setNewStylist] = useState({
        name: "",
        specialization: "",
        capacity: 1,
        active: true
    });

    useEffect(() => {
        fetchStylists();
    }, []);

    const fetchStylists = async () => {
        setLoading(true);
        try {
            const res = await api.get("/api/stylists");
            setStylists(res.data);
        } catch (error) {
            console.error("Error fetching stylists:", error);
            toast.error("Failed to load stylists");
        } finally {
            setLoading(false);
        }
    };

    const handleAddStylist = async (e) => {
        e.preventDefault();
        try {
            await api.post("/api/stylists", newStylist);
            toast.success("Stylist added successfully");
            setShowAddForm(false);
            setNewStylist({ name: "", specialization: "", capacity: 1, active: true });
            fetchStylists();
        } catch (error) {
            console.error("Error adding stylist:", error);
            toast.error("Failed to add stylist");
        }
    };

    const toggleStatus = async (stylist) => {
        try {
            await api.post("/api/stylists", {
                ...stylist,
                active: !stylist.active
            });
            toast.success(`Stylist ${!stylist.active ? "activated" : "deactivated"}`);
            fetchStylists();
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    return (
        <div className="p-6 bg-white rounded-3xl shadow-sm border border-orange-100">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Manage Stylists</h2>
                    <p className="text-gray-500">Add or manage your salon team</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition"
                >
                    {showAddForm ? "Cancel" : "Add New Stylist"}
                </button>
            </div>

            {showAddForm && (
                <form onSubmit={handleAddStylist} className="mb-10 bg-orange-50 p-6 rounded-2xl border border-orange-100 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Stylist Name</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder="e.g. John Doe"
                                value={newStylist.name}
                                onChange={(e) => setNewStylist({ ...newStylist, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Specialization</label>
                            <input
                                type="text"
                                required
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                placeholder="e.g. Hair Coloring"
                                value={newStylist.specialization}
                                onChange={(e) => setNewStylist({ ...newStylist, specialization: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Daily Capacity</label>
                            <input
                                type="number"
                                required
                                min="1"
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                value={newStylist.capacity}
                                onChange={(e) => setNewStylist({ ...newStylist, capacity: parseInt(e.target.value) })}
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-black text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                    >
                        Save Stylist
                    </button>
                </form>
            )}

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 italic text-gray-400">
                                <th className="pb-4 font-normal">Name</th>
                                <th className="pb-4 font-normal">Specialization</th>
                                <th className="pb-4 font-normal text-center">Capacity</th>
                                <th className="pb-4 font-normal text-center">Status</th>
                                <th className="pb-4 font-normal text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {stylists.map((stylist) => (
                                <tr key={stylist.id} className="group hover:bg-orange-50/30 transition">
                                    <td className="py-4 font-medium text-gray-800">{stylist.name}</td>
                                    <td className="py-4 text-gray-600">{stylist.specialization}</td>
                                    <td className="py-4 text-center text-gray-600">{stylist.capacity}</td>
                                    <td className="py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs ${stylist.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                                            {stylist.active ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td className="py-4 text-right">
                                        <button
                                            onClick={() => toggleStatus(stylist)}
                                            className={`text-sm font-medium ${stylist.active ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"}`}
                                        >
                                            {stylist.active ? "Deactivate" : "Activate"}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {stylists.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            No stylists in the database.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ManageStylists;
