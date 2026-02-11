import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import Navbar from "../components/Navbar";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const EditProfile = () => {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));

  const [name, setName] = useState("");
  const [preview, setPreview] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(""); // ✅ message state

  useEffect(() => {
    if (!storedUser) {
      navigate("/login");
      return;
    }

    setName(storedUser.name);
    setPreview(storedUser.image || "");
  }, [storedUser, navigate]);

  // 📷 Image select
  const handleImage = (e) => {
    const img = e.target.files[0];
    if (!img) return;

    setFile(img);
    setPreview(URL.createObjectURL(img));
  };

  // 💾 Save profile
  const handleSave = async () => {
    setMessage("");

    if (!name.trim()) {
      setMessage("Name cannot be empty");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("name", name);
      if (file) formData.append("image", file);

      const res = await axios.put(
        `/api/auth/${storedUser.id}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      localStorage.setItem("user", JSON.stringify(res.data));

      setMessage("Profile updated successfully ✅");

      setTimeout(() => {
        navigate("/profile");
      }, 1200);

    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile ❌");
    } finally {
      setLoading(false);
    }
  };

  if (!storedUser) return null;

  return (
    <div className="min-h-screen bg-[#fffaf4] pt-24 px-4">
      <Navbar />

      <div className="max-w-md mx-auto bg-white rounded-3xl shadow p-6 space-y-5">

        {/* 🔙 Back */}
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500"
        >
          ← Back
        </button>

        {/* 👤 IMAGE */}
        <div className="flex flex-col items-center">
          <img
            src={preview || "https://via.placeholder.com/120"}
            className="w-28 h-28 rounded-full object-cover border"
            alt="profile"
          />

          <label className="mt-2 text-sm text-blue-600 cursor-pointer">
            Change Photo
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleImage}
            />
          </label>
        </div>

        {/* MESSAGE */}
        {message && (
          <p className="text-center text-sm text-gray-700">
            {message}
          </p>
        )}

        {/* FORM */}
        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded-xl px-4 py-2 mt-1"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Email</label>
            <input
              value={storedUser.email}
              disabled
              className="w-full border rounded-xl px-4 py-2 mt-1 bg-gray-100 text-gray-500"
            />
          </div>
        </div>

        {/* SAVE */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-full disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
