import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/userService";
import "./design/AdminLogin.css";

export const AdminLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Optional local fallback creds (dev only)
  const fallbackAdmin = {
    username: "123",
    password: "345",
    image: "/images/admin.jpeg",
  };
   
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Try backend login first (expects admin/admin123 unless configured)
      await adminLogin(username, password);

      localStorage.setItem(
        "adminUser",
        JSON.stringify({ username, image: "/images/admin.jpeg" })
      );
      localStorage.setItem("adminLoggedIn", "true");
      navigate("/cbaddda");
    } catch (err) {
      // Fallback to local creds (if backend rejects)
      if (
        username === fallbackAdmin.username &&
        password === fallbackAdmin.password
      ) {
        localStorage.setItem("adminUser", JSON.stringify(fallbackAdmin));
        localStorage.setItem("adminLoggedIn", "true");
        navigate("/cbaddda");
      } else {
        const msg =
          err?.response?.data ||
          err?.message ||
          "Invalid username or password.";
        setError(
          typeof msg === "string" ? msg : "Invalid username or password."
        );
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
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            required
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
