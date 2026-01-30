// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Hardcoded admin credentials
  const ADMIN_EMAIL = "admin@dyptc.edu";
  const ADMIN_PASSWORD = "dyptcadmin123";

  const handleAdminLogin = (e) => {
    e.preventDefault();

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem("admin", "true");

      // Notify Navbar and other components
      window.dispatchEvent(new Event("storage"));

      navigate("/admin-dashboard");
      return;
    }

    alert("Invalid admin credentials!");
  };

  return (
    <div className="admin-login-container">
      <h2>Admin Login</h2>

      <form className="admin-login-form" onSubmit={handleAdminLogin}>
        <input
          type="email"
          placeholder="admin@dyptc.edu"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button className="btn-admin-login" type="submit">
          Login
        </button>
      </form>
    </div>
  );
}
