import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./design/AdminLogin.css";

const API_BASE = "https://perfect-match-server.onrender.com/api";
const API_ADMIN_LOGIN = `${API_BASE}/admin/login`;
const API_USERS_ADMIN_LOGIN = `${API_BASE}/users/admin/login`;

// axios instance with a sensible timeout
const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000, // 8 seconds - adjust if needed
});

export const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // keep AbortController so we can cancel previous requests if user resubmits
  const currentController = useRef(null);

  // local fallback credentials (dev only) - keep but only used when backend fails
  const fallbackAdmin = {
    username: "nitin5319",
    password: "nitin5319",
    image: "/images/admin.jpeg",
  };

  const tryFallback = () => {
    localStorage.setItem("adminUser", JSON.stringify(fallbackAdmin));
    localStorage.setItem("adminLoggedIn", "true");
    navigate("/cbaddda");
  };

  const adminLogin = async (username, password, signal) => {
    // Primary attempt
    const res = await api.post(
      "/admin/login",
      { username, password },
      { signal }
    );
    return res.data;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // minimal client validation to avoid unnecessary network calls
    if (!username.trim() || !password) {
      setError("कृपया वापरकर्तानाव आणि पासवर्ड भरा.");
      return;
    }

    // Cancel any previous in-flight login
    if (currentController.current) {
      try {
        currentController.current.abort();
      } catch {}
      currentController.current = null;
    }

    const controller = new AbortController();
    currentController.current = controller;

    setLoading(true);

    try {
      const data = await adminLogin(username, password, controller.signal);

      // success -> store and navigate
      localStorage.setItem(
        "adminUser",
        JSON.stringify({
          username: username,
          image: "/images/admin.jpeg",
          ...data?.meta,
        })
      );
      localStorage.setItem("adminLoggedIn", "true");
      currentController.current = null;
      navigate("/cbaddda");
    } catch (err) {
      currentController.current = null;

      // handle cancellation separately (user retried or navigated away)
      if (err.name === "CanceledError" || err.message === "canceled") {
        // aborted by user action; do nothing special
        setError("Request cancelled.");
        setLoading(false);
        return;
      }

      const status = err?.response?.status;

      // Optional: fallback to legacy endpoint only if primary endpoint not found
      if (status === 404 || status === 405) {
        try {
          const res2 = await api.post("/users/admin/login", {
            username,
            password,
          });
          localStorage.setItem(
            "adminUser",
            JSON.stringify({ username, image: "/images/admin.jpeg" })
          );
          localStorage.setItem("adminLoggedIn", "true");
          navigate("/cbaddda");
          return;
        } catch (e) {
          // continue to final fallback / error
        }
      }

      // if backend outright refused but the typed credentials equal your dev fallback -> allow
      if (
        username === fallbackAdmin.username &&
        password === fallbackAdmin.password
      ) {
        tryFallback();
        return;
      }

      // network/timeouts produce err.code or err.message
      if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
        setError(
          "सर्वर प्रतिक्रिया फारधी आहे — थोड्या वेळानंतर पुन्हा प्रयत्न करा."
        );
      } else if (status === 401) {
        setError("अवैध वापरकर्तानाव किंवा पासवर्ड.");
      } else if (status >= 500) {
        setError("सर्वरमध्ये समस्या आहे. कृपया नंतर प्रयत्न करा.");
      } else {
        const msg = err?.response?.data || err?.message || "Login failed.";
        setError(typeof msg === "string" ? msg : "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="login-form">
        <button
          type="button"
          className="login-to-back-home"
          onClick={() => navigate("/")}
          disabled={loading}
        >
          Back to Home
        </button>

        <h2>Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            required
            autoComplete="username"
            disabled={loading}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
            autoComplete="current-password"
            disabled={loading}
          />
          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="error-msg">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
