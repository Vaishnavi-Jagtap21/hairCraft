import { useEffect, useState } from "react";
import axios from "../../../../api/axios";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;


export default function AdminOffers() {
    const [offers, setOffers] = useState([]);
    const [services, setServices] = useState([]);

    const [formData, setFormData] = useState({
        title: "",
        description: "",
        serviceId: "",
        discount: "20"
    });

    const [loading, setLoading] = useState(false);
    const token = localStorage.getItem("token");

    // ================= LOAD DATA =================
    useEffect(() => {
        fetchOffers();
        fetchServices();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await axios.get("/api/offers");
            setOffers(res.data);
        } catch {
            toast.error("Failed to load offers");
        }
    };

    const fetchServices = async () => {
        try {
            const res = await axios.get("/api/services");
            setServices(res.data);
        } catch {
            toast.error("Failed to load services");
        }
    };

    // ================= SUBMIT =================
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.serviceId) {
            toast.error("Please select a service");
            return;
        }

        try {
            setLoading(true);
            await axios.post(
                "/api/offers/admin/add",
                formData
            );
            toast.success("Offer added successfully");
            setFormData({ title: "", description: "", serviceId: "", discount: "20" });
            fetchOffers();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add offer");
        } finally {
            setLoading(false);
        }
    };

    // ================= DELETE =================
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this offer?")) return;

        try {
            await axios.delete(`/api/offers/admin/${id}`);
            setOffers(prev => prev.filter(o => o.id !== id));
            toast.success("Offer deleted");
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="p-6 space-y-8">

            {/* HEADER */}
            <div>
                <h2 className="text-2xl font-bold">Manage Special Offers</h2>
                <p className="text-gray-500">Create trending deals and discounts</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">

                {/* FORM */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border h-fit">
                    <h3 className="font-semibold mb-4">Create New Offer</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Offer Title</label>
                            <input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="e.g. Summer Glow"
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>

                        <div>
                            <label className="text-sm text-gray-600 block mb-1">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Short description..."
                                className="w-full border rounded-lg px-3 py-2"
                                required
                            />
                        </div>



                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Link Service</label>
                                <select
                                    value={formData.serviceId}
                                    onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 bg-white"
                                    required
                                >
                                    <option value="">Select Service</option>
                                    {services.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} (₹{s.price})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-600 block mb-1">Discount %</label>
                                <input
                                    type="number"
                                    value={formData.discount}
                                    onChange={e => setFormData({ ...formData, discount: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2"
                                />
                            </div>
                        </div>

                        <button
                            disabled={loading}
                            className="w-full bg-black text-white py-3 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Offer"}
                        </button>
                    </form>
                </div>

                {/* LIST */}
                <div className="space-y-4">
                    <h3 className="font-semibold">Active Offers</h3>

                    {offers.length === 0 && <p className="text-gray-500 italic">No active offers</p>}

                    {offers.map(offer => (
                        <div key={offer.id} className="bg-white p-4 rounded-xl shadow-sm border flex gap-4">
                            <img
                                src={offer.image || "https://via.placeholder.com/100"}
                                className="w-24 h-24 object-cover rounded-lg bg-gray-100"
                                alt=""
                            />

                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold">{offer.title}</h4>
                                        <p className="text-xs text-green-600 font-bold uppercase tracking-wide">
                                            {offer.service?.name}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(offer.id)}
                                        className="text-red-500 text-sm hover:underline"
                                    >
                                        Remove
                                    </button>
                                </div>

                                <p className="text-sm text-gray-500 mt-1 line-clamp-2">{offer.description}</p>

                                <div className="mt-2 flex items-baseline gap-2">
                                    <span className="font-bold text-lg">₹{offer.discountedPrice}</span>
                                    <span className="text-sm text-gray-400 line-through">₹{offer.originalPrice}</span>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
            </div>
        </div>
    );
}
