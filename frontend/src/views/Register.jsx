import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [message, setMessage] = useState("");

  // ================= INPUT CHANGE =================
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ================= IMAGE SELECT =================
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= IMAGE UPLOAD =================
  const uploadImage = async () => {
    if (!imageFile) return "";

    const data = new FormData();
    data.append("file", imageFile);

    const res = await axios.post(
      `${SERVER_URL}/image/upload`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    return res.data;
  };

  // ================= REGISTER =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match");
      toast.error("Passwords do not match");
      return;
    }

    const toastId = toast.loading("Creating account...");

    try {
      let imageUrl = "";
      if (imageFile) imageUrl = await uploadImage();

      await axios.post(
        `${SERVER_URL}/api/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          image: imageUrl,
        }
      );

      setMessage("Account created successfully");
      toast.success("Account created successfully! Redirecting...", { id: toastId });
      setTimeout(() => navigate("/login"), 1000);

    } catch (err) {
      const msg = err.response?.data || "Registration failed";
      setMessage(msg);
      toast.error(msg, { id: toastId });
    }
  };

  // ================= GOOGLE REGISTER =================
  const handleGoogleRegister = async (credentialResponse) => {
    const toastId = toast.loading("Verifying Google account...");
    try {
      const res = await axios.post(
        `${SERVER_URL}/api/auth/google`,
        { token: credentialResponse.credential }
      );

      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);

      toast.success("Registration successful!", { id: toastId });
      navigate("/dashboard");
    } catch {
      setMessage("Google registration failed");
      toast.error("Google registration failed", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#fffaf4]">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl px-6 py-4">

        <Navbar />

        <h1 className="text-xl text-center mb-4 font-semibold">
          Join HairCraft
        </h1>

        {/* MESSAGE */}
        {message && (
          <div className="bg-red-100 text-red-600 p-2 rounded-lg text-center mb-3 text-sm">
            {message}
          </div>
        )}

        {/* PROFILE IMAGE */}
        <div className="flex justify-center mb-3">
          <label className="cursor-pointer group">
            <input type="file" hidden accept="image/*" onChange={handleImageSelect} />
            <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden group-hover:border-black transition">
              {preview ? (
                <img
                  src={preview}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-xs text-gray-400 group-hover:text-black">
                  Add photo
                </span>
              )}
            </div>
          </label>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-2">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-sm"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2 text-sm"
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-full text-sm hover:bg-gray-800 transition"
          >
            Register
          </button>
        </form>

        {/* OR */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-3 text-xs text-gray-500">OR</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* GOOGLE REGISTER */}
        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleRegister}
            onError={() => setMessage("Google registration failed")}
          />
        </div>

        <p className="text-center text-xs mt-3">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-black hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
