import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import Navbar from "../components/Navbar";
import axios from "axios";
import { toast } from "sonner";

const SERVER_URL = import.meta.env.VITE_JAVA_SERVER;

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // ================= LOGIN SUCCESS =================
  const handleLoginSuccess = (user, token) => {
    const role =
      user?.role?.includes("ADMIN") ? "ADMIN" : "USER";

    if (!token) {
      alert("Login failed: No token received from server");
      return;
    }

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("user", JSON.stringify(user));

    setMessage("");

    // If there's a redirect path, go there, otherwise go to default
    if (from) {
      navigate(from, { replace: true });
    } else {
      navigate(role === "ADMIN" ? "/admin" : "/dashboard", {
        replace: true,
      });
    }
  };

  // ================= EMAIL LOGIN =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // setMessage(""); // Keeping local message for UI box if user wants

    // START TOAST
    const toastId = toast.loading("Logging in...");

    try {
      const res = await axios.post(
        `${SERVER_URL}/api/auth/login`,
        { email, password }
      );

      if (res.data.status !== "success") {
        setMessage(res.data.message || "Login failed");
        toast.error(res.data.message || "Login failed", { id: toastId });
        return;
      }

      toast.success("Welcome back!", { id: toastId });
      handleLoginSuccess(res.data.user, res.data.token);

    } catch (err) {
      console.error("Login error:", err);
      const msg = err.response?.data?.message || "Invalid email or password";
      setMessage(msg);
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  // ================= GOOGLE LOGIN =================
  const handleGoogleLogin = async (credentialResponse) => {
    setMessage("");
    const toastId = toast.loading("Verifying Google account...");

    if (!credentialResponse?.credential) {
      const msg = "Google authentication failed";
      setMessage(msg);
      toast.error(msg, { id: toastId });
      return;
    }

    try {
      const res = await axios.post(
        `${SERVER_URL}/api/auth/google/login`,
        { googleToken: credentialResponse.credential }
      );

      if (res.data.status !== "success") {
        const msg = res.data.message || "Google login failed";
        setMessage(msg);
        toast.error(msg, { id: toastId });
        return;
      }

      toast.success("Google login successful!", { id: toastId });
      handleLoginSuccess(res.data.user, res.data.token);

    } catch (err) {
      console.error("Google login error:", err);
      const msg = "Google login failed. Please try again.";
      setMessage(msg);
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-[#fffaf4] flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-lg w-full max-w-md p-10">
        <Navbar />

        <h1 className="text-3xl text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Login to your HairCraft account
        </p>

        {/* MESSAGE */}
        {message && (
          <div className="bg-red-100 text-red-600 p-3 rounded-lg text-center mb-4">
            {message}
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email Address"
            className="w-full border rounded-xl px-4 py-3"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setMessage("");
            }}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-xl px-4 py-3"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setMessage("");
            }}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-full disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="flex items-center my-6">
          <hr className="flex-grow" />
          <span className="px-3 text-sm text-gray-500">OR</span>
          <hr className="flex-grow" />
        </div>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() => setMessage("Google login failed")}
          />
        </div>

        <p className="text-center text-gray-600 mt-6">
          Don’t have an account?{" "}
          <Link to="/register" className="font-semibold text-black">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
