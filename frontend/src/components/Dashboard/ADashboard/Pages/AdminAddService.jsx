import { useState, useEffect } from "react";
import axios from "../../../../api/axios";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const AdminAddService = () => {
  const [service, setService] = useState({
    name: "",
    category: "Hair",
    price: "",
    duration: "30",
    badge: "",
    image: "",
  });

  const [services, setServices] = useState([]);
  const [editingId, setEditingId] = useState(null);

  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Upload Image
  const uploadImage = async () => {
    if (!imageFile) return;

    const formData = new FormData();
    formData.append("file", imageFile);

    setUploading(true);
    setMessage("");

    try {
      const res = await axios.post(
        "/image/upload",
        formData
      );

      setService((prev) => ({
        ...prev,
        image: res.data,
      }));

      setMessage("Image uploaded successfully");
    } catch (err) {
      console.error(err);
      setMessage("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  // Load services
  const fetchServices = async () => {
    try {
      const res = await axios.get("/api/services");
      setServices(res.data);
    } catch (err) {
      console.error("Failed to load services");
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  // Save or Update
  const handleSave = async () => {
    if (!service.name || !service.price || !service.image) {
      setMessage("Please fill all required fields and upload an image");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      if (editingId) {
        await axios.put(
          `/api/services/${editingId}`,
          service
        );
        setMessage("Service updated successfully");
      } else {
        await axios.post(
          "/api/services/addservice",
          service
        );
        setMessage("Service added successfully");
      }

      setService({
        name: "",
        category: "Hair",
        price: "",
        duration: "30",
        badge: "",
        image: "",
      });

      setImageFile(null);
      setEditingId(null);
      fetchServices();
    } catch (err) {
      console.error(err);
      setMessage(
        editingId
          ? "Failed to update service"
          : "Failed to add service"
      );
    } finally {
      setSaving(false);
    }
  };

  // Edit
  const startEdit = (s) => {
    setService({
      name: s.name,
      category: s.category,
      price: s.price,
      duration: s.duration.toString(),
      badge: s.badge || "",
      image: s.image,
    });
    setEditingId(s.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;

    try {
      await axios.delete(`/api/services/${id}`);
      setMessage("Service deleted successfully");
      fetchServices();
    } catch (err) {
      console.error(err);
      setMessage("Failed to delete service");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 p-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-6">

        {/* LEFT : ADD SERVICE */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

          <div className="bg-gradient-to-r from-black via-gray-800 to-gray-600 text-white p-6">
            <h2 className="text-2xl font-bold">Salon Service Manager</h2>
            <p className="text-gray-300 text-sm">
              Add, edit and manage salon services
            </p>
          </div>

          <div className="p-6 space-y-4">

            {message && (
              <div className="bg-gray-100 text-gray-700 p-2 rounded-lg text-center">
                {message}
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-600">
                Service Name
              </label>
              <input
                type="text"
                placeholder="Hair Cut"
                className="mt-1 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                value={service.name}
                onChange={(e) =>
                  setService({ ...service, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Category
                </label>
                <select
                  className="mt-1 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  value={service.category}
                  onChange={(e) =>
                    setService({ ...service, category: e.target.value })
                  }
                >
                  <option>Hair</option>
                  <option>Makeup</option>
                  <option>Color</option>
                  <option>Spa</option>
                  <option>Facial</option>
                  <option>Nails</option>
                  <option>Grooming</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Price (₹)
                </label>
                <input
                  type="number"
                  placeholder="500"
                  className="mt-1 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  value={service.price}
                  onChange={(e) =>
                    setService({ ...service, price: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Duration (min)
                </label>
                <input
                  type="number"
                  step="5"
                  className="mt-1 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  value={service.duration}
                  onChange={(e) =>
                    setService({ ...service, duration: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Badge
                </label>
                <input
                  type="text"
                  placeholder="Popular"
                  className="mt-1 w-full border rounded-xl px-3 py-2 focus:ring-2 focus:ring-black outline-none"
                  value={service.badge}
                  onChange={(e) =>
                    setService({ ...service, badge: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="border rounded-2xl p-4 bg-gray-50">
              <label className="text-sm font-medium text-gray-600 block mb-2">
                Service Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
              />

              <button
                onClick={uploadImage}
                disabled={!imageFile || uploading}
                className="mt-3 w-full bg-gray-900 hover:bg-black text-white py-2 rounded-xl transition disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload Image"}
              </button>

              {service.image && (
                <div className="mt-4 flex justify-center">
                  <img
                    src={service.image}
                    alt="preview"
                    className="h-36 w-36 object-cover rounded-2xl shadow-lg border"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={!service.image || saving}
              className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-xl font-semibold transition disabled:opacity-50"
            >
              {saving
                ? "Processing..."
                : editingId
                  ? "Update Service"
                  : "Save Service"}
            </button>

            {editingId && (
              <button
                onClick={() => {
                  setEditingId(null);
                  setService({
                    name: "",
                    category: "Hair",
                    price: "",
                    duration: "30",
                    badge: "",
                    image: "",
                  });
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 py-3 rounded-xl font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>

        {/* RIGHT : SERVICE LIST */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-800 to-black text-white p-6">
            <h2 className="text-2xl font-bold">Existing Services</h2>
          </div>

          <div className="p-6 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-gray-600 text-sm">
                  <th className="pb-3 text-left">Service</th>
                  <th className="pb-3 text-left">Category</th>
                  <th className="pb-3 text-left">Price</th>
                  <th className="pb-3 text-left">Duration</th>
                  <th className="pb-3 text-left">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={s.image}
                          className="w-12 h-12 rounded-xl object-cover shadow"
                          alt=""
                        />
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>

                    <td>{s.category}</td>
                    <td className="font-semibold">₹{s.price}</td>
                    <td>{s.duration} min</td>

                    <td>
                      <div className="flex gap-3">
                        <button
                          onClick={() => startEdit(s)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
                          className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminAddService;
