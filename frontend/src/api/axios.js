import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_JAVA_SERVER,
});

// ================= REQUEST INTERCEPTOR =================
// Automatically attach token in every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token && token !== "undefined" && token !== "null" && token.trim() !== "") {
      const authValue = `Bearer ${token}`;

      // Axios recommended way (works in all versions)
      config.headers["Authorization"] = authValue;

      // Also try the .set() method if it exists for newer Axios versions
      if (config.headers.set) {
        config.headers.set("Authorization", authValue);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================= RESPONSE INTERCEPTOR =================
// Handle session expiration globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // If backend returns Unauthorized (401) or Forbidden (403)
      // Only logout on 401 (Unauthorized)
      if (error.response.status === 401) {
        console.log("Session expired or unauthorized request. (Auto-logout disabled by user request)");
        // localStorage.clear();
        // window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
